"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ApiKeyCard from "@/components/ApiKeyCard";
import DropZone from "@/components/DropZone";
import PdfViewer from "@/components/PdfViewer";
import ControlPanel from "@/components/ControlPanel";
import SessionPanel from "@/components/SessionPanel";
import BookmarkPrompt from "@/components/BookmarkPrompt";
import { usePdfReader } from "@/hooks/usePdfReader";
import { usePlayback } from "@/hooks/usePlayback";
import { VOICES, MODES } from "@/lib/voices";
import type { Voice, ModeKey } from "@/lib/voices";
import { detectLanguageFromText, detectLanguageFromFonts } from "@/lib/langDetect";
import { savePrefLang, loadPrefLang, saveSessionVoice, loadSessionVoice } from "@/lib/prefs";
import {
  saveSession,
  updateSessionPage,
  getAllSessions,
  getSessionPdf,
  deleteSession,
  addBookmark,
  getBookmarksForSession,
  deleteBookmark,
  makeSessionId,
  pinSession,
  unpinSession,
  requestPersistentStorage,
} from "@/lib/db";
import type { SessionMeta, Bookmark } from "@/lib/db";
import { needsOCR, visionOCR } from "@/lib/ocr";
import { getOcrCache, setOcrCache } from "@/lib/ocrCache";

interface PdfTab {
  id: string;
  fileName: string;
  buf: ArrayBuffer;
  page: number;
  totalPages: number;
}

export default function ReaderPage() {
  // ── API key ──────────────────────────────────────────────────────────────
  const [apiKey, setApiKey] = useState("");
  const [apiKeyReady, setApiKeyReady] = useState(false);

  // ── Voice ────────────────────────────────────────────────────────────────
  const [selLang, setSelLang] = useState("en-IN");
  const [selVoice, setSelVoice] = useState<Voice>(VOICES["en-IN"][0]);

  // ── Reading controls ──────────────────────────────────────────────────────
  const [mode, setMode] = useState<ModeKey>("teaching");
  const [rate, setRate] = useState(MODES[0].rate);
  const [pitch, setPitch] = useState(0);
  const [pauseMs, setPauseMs] = useState(MODES[0].pause);

  // ── Page text ─────────────────────────────────────────────────────────────
  const [pageText, setPageText] = useState("");
  const [words, setWords] = useState<string[]>([]);
  const [startWordIdx, setStartWordIdx] = useState(0);

  // ── Session ───────────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const sessionIdRef = useRef<string | null>(null);

  // ── Tabs (up to 5 open PDFs) ──────────────────────────────────────────────
  const [tabs, setTabs] = useState<PdfTab[]>([]);
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  // ── Bookmarks ─────────────────────────────────────────────────────────────
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showBookmarkPrompt, setShowBookmarkPrompt] = useState(false);
  // track whether user has made reading progress (to decide if prompt is worth showing)
  const hasReadRef = useRef(false);

  // ── Language auto-detect ──────────────────────────────────────────────────
  // Prevents auto-detect from overriding a manual language selection for the
  // currently open PDF. Reset to false whenever a new PDF is loaded.
  const langManualRef = useRef(false);

  const {
    state: pdfState, canvasRef, textLayerRef,
    loadPDF, loadPDFFromData, goToPage, resetPdf, capturePageImage,
    getPageFontFamilies, buildWordMap, highlightWord, setWordClickCallback,
  } = usePdfReader();

  // ── OCR state ─────────────────────────────────────────────────────────────
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  // Stores the last raw (pdf.js-extracted) text so "Retry OCR" can re-attempt
  const rawPageTextRef = useRef("");
  const { state: playState, speakPage, hardStop, pause, resume, currentStatusRef, monthlyChars, updateLiveSettings } =
    usePlayback();

  // ── Init: load API key + sessions ─────────────────────────────────────────
  useEffect(() => {
    try {
      const match = document.cookie.match(/(?:^|;\s*)gcp_key=([^;]*)/);
      setApiKey(match ? atob(decodeURIComponent(match[1])) : "");
    } catch {
      setApiKey("");
    }
    // Load persisted language preference (cookie-based)
    try {
      const prefLang = loadPrefLang();
      if (prefLang && VOICES[prefLang]) {
        setSelLang(prefLang);
        setSelVoice(VOICES[prefLang][0]);
      } else {
        // Fallback: check legacy localStorage keys from settings page
        const lsLang = localStorage.getItem("ls_lang");
        if (lsLang && VOICES[lsLang]) {
          setSelLang(lsLang);
          const lsVoice = localStorage.getItem("ls_voice");
          if (lsVoice) {
            try { setSelVoice(JSON.parse(lsVoice) as Voice); } catch { /* ignore */ }
          } else {
            setSelVoice(VOICES[lsLang][0]);
          }
        }
      }
    } catch {
      // ignore
    }
    getAllSessions().then(setSessions).catch(console.error);
    setApiKeyReady(true);
  }, []);

  // ── Pending session from landing page ─────────────────────────────────────
  // When navigating from the landing page or library, a pendingSessionId is
  // set in sessionStorage. Pick it up on mount and auto-load that session.
  const pendingHandledRef = useRef(false);
  useEffect(() => {
    if (pendingHandledRef.current) return;
    const sid = sessionStorage.getItem("pendingSessionId");
    if (!sid) return;
    pendingHandledRef.current = true;
    sessionStorage.removeItem("pendingSessionId");

    // Wait briefly for sessions to load, then trigger resume
    getAllSessions().then(async (allSessions) => {
      setSessions(allSessions);
      const session = allSessions.find((s) => s.id === sid);
      if (!session) return;
      await handleResumeById(session);
    }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save API key ──────────────────────────────────────────────────────────
  function handleSaveKey(k: string) {
    const encoded = encodeURIComponent(btoa(k));
    document.cookie = `gcp_key=${encoded}; path=/; SameSite=Strict; max-age=2592000`;
    setApiKey(k);
  }

  // ── Voice helpers ─────────────────────────────────────────────────────────
  function handleVoiceChange(v: Voice) {
    const s = currentStatusRef.current;
    if (s === "speaking" || s === "paused" || s === "loading") {
      if (playState.activeWordIdx >= 0) setStartWordIdx(playState.activeWordIdx);
      hardStop();
    }
    setSelVoice(v);
    // Persist voice per-session
    const sid = sessionIdRef.current;
    if (sid) saveSessionVoice(sid, v.name);
  }

  function handleLangChange(lang: string) {
    const s = currentStatusRef.current;
    if (s === "speaking" || s === "paused" || s === "loading") {
      if (playState.activeWordIdx >= 0) setStartWordIdx(playState.activeWordIdx);
      hardStop();
    }
    langManualRef.current = true;
    setSelLang(lang);
    setSelVoice(VOICES[lang][0]);
    savePrefLang(lang);
  }

  // Apply a detected/saved language + optional saved voice name without
  // triggering a manual-override flag.
  function applyLanguageAndVoice(lang: string, savedVoiceName?: string | null) {
    setSelLang(lang);
    const voices = VOICES[lang] ?? [];
    if (savedVoiceName) {
      const match = voices.find((v) => v.name === savedVoiceName);
      if (match) { setSelVoice(match); return; }
    }
    if (voices.length > 0) setSelVoice(voices[0]);
  }

  // Run language auto-detection (font-based first, Unicode fallback) and apply preferences.
  async function detectAndApplyLanguage(text: string, sid: string, pageNum: number) {
    if (langManualRef.current) {
      // Language was manually set — only restore the session-saved voice
      const savedVoice = loadSessionVoice(sid);
      if (savedVoice) {
        const match = (VOICES[selLang] ?? []).find((v) => v.name === savedVoice);
        if (match) setSelVoice(match);
      }
      return;
    }

    // Try font-based detection first — more reliable for custom-encoded Indian PDFs
    const fonts = await getPageFontFamilies(pageNum);
    const detected = detectLanguageFromFonts(fonts) ?? detectLanguageFromText(text);

    const targetLang = detected ?? selLang;
    const savedVoice = loadSessionVoice(sid);
    applyLanguageAndVoice(targetLang, savedVoice);
    if (detected) savePrefLang(detected);
  }

  function handleModeChange(m: ModeKey) {
    const cfg = MODES.find((x) => x.key === m)!;
    setMode(m);
    setRate(cfg.rate);
    setPauseMs(cfg.pause);
  }

  // Keep live settings ref in sync so the running speakPage loop picks up changes
  useEffect(() => {
    updateLiveSettings({ mode, rate, pitch, pauseMs });
  }, [mode, rate, pitch, pauseMs, updateLiveSettings]);

  // Rebuild the text-layer word map whenever the page words change
  useEffect(() => {
    buildWordMap(words);
  }, [words, buildWordMap]);

  // Drive word highlight in the PDF text layer
  useEffect(() => {
    highlightWord(playState.activeWordIdx);
  }, [playState.activeWordIdx, highlightWord]);

  // Register word-click callback so clicking a word in the PDF text layer seeks there.
  // Re-registers whenever any value captured by handleWordClick changes.
  useEffect(() => {
    setWordClickCallback(handleWordClick);
    return () => setWordClickCallback(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setWordClickCallback, pageText, words, apiKey, selLang, selVoice, mode, rate, pitch, pauseMs, speakPage]);

  // ── Session helpers ───────────────────────────────────────────────────────
  async function refreshSessions() {
    setSessions(await getAllSessions());
  }

  async function persistSession(
    meta: Omit<SessionMeta, "lastRead">,
    pdfData: ArrayBuffer
  ) {
    const full: SessionMeta = { ...meta, lastRead: Date.now() };
    sessionIdRef.current = full.id;
    await saveSession(full, pdfData);
    // Ask browser to keep IndexedDB data permanently (first PDF triggers the prompt)
    requestPersistentStorage().catch(() => {});
    await refreshSessions();
  }

  async function handlePinSession(id: string) {
    await pinSession(id);
    await refreshSessions();
  }

  async function handleUnpinSession(id: string) {
    await unpinSession(id);
    await refreshSessions();
  }

  async function loadBookmarks(sid: string) {
    const bms = await getBookmarksForSession(sid);
    setBookmarks(bms);
  }

  // ── OCR resolver ─────────────────────────────────────────────────────────
  async function resolveText(rawText: string, pageNum: number): Promise<string> {
    rawPageTextRef.current = rawText;
    setOcrError(null);

    if (!needsOCR(rawText, selLang)) return rawText;

    const sid = sessionIdRef.current;
    if (sid) {
      const cached = getOcrCache(sid, pageNum);
      if (cached) return cached;
    }

    if (!apiKey) {
      setOcrError("no-key");
      return rawText;
    }

    setOcrLoading(true);
    try {
      const base64 = await capturePageImage(pageNum);
      if (!base64) return rawText;
      const ocrText = await visionOCR(base64, apiKey);
      if (sid && ocrText) setOcrCache(sid, pageNum, ocrText);
      return ocrText || rawText;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Vision API error";
      setOcrError(msg);
      return rawText;
    } finally {
      setOcrLoading(false);
    }
  }

  async function handleRetryOCR() {
    const sid = sessionIdRef.current;
    const page = pdfState.curPage;
    if (sid) {
      const { clearOcrCache } = await import("@/lib/ocrCache");
      clearOcrCache(sid);
    }
    if (!apiKey) return;
    setOcrLoading(true);
    setOcrError(null);
    try {
      const base64 = await capturePageImage(page);
      if (!base64) return;
      const ocrText = await visionOCR(base64, apiKey);
      if (sid && ocrText) {
        const { setOcrCache: set } = await import("@/lib/ocrCache");
        set(sid, page, ocrText);
      }
      setPageText(ocrText);
      setWords(ocrText.split(/\s+/).filter(Boolean));
    } catch (e) {
      setOcrError(e instanceof Error ? e.message : "Vision API error");
    } finally {
      setOcrLoading(false);
    }
  }

  async function handleForceOCR() {
    const sid = sessionIdRef.current;
    const page = pdfState.curPage;
    if (!apiKey) { setOcrError("no-key"); return; }
    setOcrLoading(true);
    setOcrError(null);
    try {
      const base64 = await capturePageImage(page);
      if (!base64) return;
      const ocrText = await visionOCR(base64, apiKey);
      if (sid && ocrText) setOcrCache(sid, page, ocrText);
      setPageText(ocrText);
      setWords(ocrText.split(/\s+/).filter(Boolean));
    } catch (e) {
      setOcrError(e instanceof Error ? e.message : "Vision API error");
    } finally {
      setOcrLoading(false);
    }
  }

  // ── Tab helpers ───────────────────────────────────────────────────────────
  async function doSwitchTab(idx: number) {
    if (idx === activeTabIdx && pdfState.pdfDoc) return;
    hardStop();
    setShowBookmarkPrompt(false);
    setStartWordIdx(0);

    setTabs((prev) =>
      prev.map((t, i) => (i === activeTabIdx ? { ...t, page: pdfState.curPage } : t))
    );
    setActiveTabIdx(idx);

    const tab = tabs[idx];
    sessionIdRef.current = tab.id;
    const raw = await loadPDFFromData(tab.buf, tab.fileName, tab.page);
    const text = await resolveText(raw, tab.page);
    setPageText(text);
    setWords(text.split(/\s+/).filter(Boolean));
    await loadBookmarks(tab.id);
    await updateSessionPage(tab.id, tab.page);
    await refreshSessions();
  }

  async function closeTab(idx: number) {
    const newTabs = tabs.filter((_, i) => i !== idx);

    if (newTabs.length === 0) {
      hardStop();
      resetPdf();
      setTabs([]);
      setActiveTabIdx(0);
      sessionIdRef.current = null;
      setBookmarks([]);
      setPageText("");
      setWords([]);
      return;
    }

    const newActiveIdx =
      idx > activeTabIdx
        ? activeTabIdx
        : idx < activeTabIdx
        ? activeTabIdx - 1
        : Math.min(idx, newTabs.length - 1);

    setTabs(newTabs);

    if (idx === activeTabIdx) {
      hardStop();
      setShowBookmarkPrompt(false);
      setStartWordIdx(0);
      setActiveTabIdx(newActiveIdx);
      const tab = newTabs[newActiveIdx];
      sessionIdRef.current = tab.id;
      const raw = await loadPDFFromData(tab.buf, tab.fileName, tab.page);
      const text = await resolveText(raw, tab.page);
      setPageText(text);
      setWords(text.split(/\s+/).filter(Boolean));
      await loadBookmarks(tab.id);
    } else {
      setActiveTabIdx(newActiveIdx);
    }
  }

  function addTabToState(newTab: PdfTab) {
    const updatedCurrent = tabs.map((t, i) =>
      i === activeTabIdx ? { ...t, page: pdfState.curPage } : t
    );
    const trimmed = updatedCurrent.length >= 5 ? updatedCurrent.slice(1) : updatedCurrent;
    const newTabs = [...trimmed, newTab];
    setTabs(newTabs);
    setActiveTabIdx(newTabs.length - 1);
  }

  // ── Load new PDF from file drop ───────────────────────────────────────────
  async function handleFile(file: File) {
    hardStop();
    hasReadRef.current = false;
    langManualRef.current = false;
    setShowBookmarkPrompt(false);
    setStartWordIdx(0);

    const sid = makeSessionId(file.name.replace(/\.pdf$/i, ""), file.size);

    const existingTabIdx = tabs.findIndex((t) => t.id === sid);
    if (existingTabIdx !== -1) {
      await doSwitchTab(existingTabIdx);
      return;
    }

    const existing = sessions.find((s) => s.id === sid);
    const targetPage = existing?.lastPage ?? 1;

    const { text: rawText, buf, totalPages } = await loadPDF(file, targetPage);

    await persistSession(
      {
        id: sid,
        fileName: file.name.replace(/\.pdf$/i, ""),
        fileSize: file.size,
        lastPage: targetPage,
        totalPages,
      },
      buf
    );
    await loadBookmarks(sid);
    sessionIdRef.current = sid;

    const text = await resolveText(rawText, targetPage);
    setPageText(text);
    setWords(text.split(/\s+/).filter(Boolean));
    await detectAndApplyLanguage(text, sid, targetPage);
    addTabToState({ id: sid, fileName: file.name.replace(/\.pdf$/i, ""), buf, page: targetPage, totalPages });
  }

  // ── Resume session (internal helper used by both panel and pendingSession) ─
  async function handleResumeById(session: SessionMeta) {
    hardStop();
    hasReadRef.current = false;
    langManualRef.current = false;
    setShowBookmarkPrompt(false);
    setStartWordIdx(0);

    const existingTabIdx = tabs.findIndex((t) => t.id === session.id);
    if (existingTabIdx !== -1) {
      await doSwitchTab(existingTabIdx);
      return;
    }

    const data = await getSessionPdf(session.id);
    if (!data) return;

    const rawText = await loadPDFFromData(data, session.fileName, session.lastPage);
    sessionIdRef.current = session.id;
    await loadBookmarks(session.id);
    await updateSessionPage(session.id, session.lastPage);
    await refreshSessions();

    const text = await resolveText(rawText, session.lastPage);
    setPageText(text);
    setWords(text.split(/\s+/).filter(Boolean));
    await detectAndApplyLanguage(text, session.id, session.lastPage);
    addTabToState({ id: session.id, fileName: session.fileName, buf: data, page: session.lastPage, totalPages: session.totalPages });
  }

  // ── Resume session from panel ──────────────────────────────────────────────
  async function handleResume(session: SessionMeta) {
    await handleResumeById(session);
  }

  // ── Delete session ────────────────────────────────────────────────────────
  async function handleDeleteSession(id: string) {
    await deleteSession(id);
    await refreshSessions();
    if (sessionIdRef.current === id) {
      sessionIdRef.current = null;
      setBookmarks([]);
    }
  }

  // ── Page navigation ───────────────────────────────────────────────────────
  async function handlePageChange(delta: number): Promise<{ text: string; words: string[] } | undefined> {
    hardStop();
    setShowBookmarkPrompt(false);
    setStartWordIdx(0);
    const next = pdfState.curPage + delta;
    if (next < 1 || next > pdfState.totalPages) return;

    const rawText = await goToPage(next);
    const text = await resolveText(rawText, next);
    const newWords = text.split(/\s+/).filter(Boolean);
    setPageText(text);
    setWords(newWords);
    setTabs((prev) => prev.map((t, i) => (i === activeTabIdx ? { ...t, page: next } : t)));

    if (sessionIdRef.current) {
      await updateSessionPage(sessionIdRef.current, next);
      await refreshSessions();
    }
    return { text, words: newWords };
  }

  async function handleGoToPage(n: number) {
    hardStop();
    setShowBookmarkPrompt(false);
    setStartWordIdx(0);
    if (n < 1 || n > pdfState.totalPages) return;

    const rawText = await goToPage(n);
    const text = await resolveText(rawText, n);
    setPageText(text);
    setWords(text.split(/\s+/).filter(Boolean));
    setTabs((prev) => prev.map((t, i) => (i === activeTabIdx ? { ...t, page: n } : t)));

    if (sessionIdRef.current) {
      await updateSessionPage(sessionIdRef.current, n);
      await refreshSessions();
    }
  }

  function handleWordClick(idx: number) {
    setStartWordIdx(idx);
    const s = currentStatusRef.current;
    if (s === "speaking" || s === "paused" || s === "loading") {
      speakPage({
        text: pageText,
        words,
        apiKey,
        lang: selLang,
        voice: selVoice,
        mode,
        rate,
        pitch,
        pauseMs,
        startWordIdx: idx,
      });
    }
  }

  // ── Bookmarks ─────────────────────────────────────────────────────────────
  async function handleBookmarkToggle() {
    const sid = sessionIdRef.current;
    if (!sid) return;
    const page = pdfState.curPage;
    const existing = bookmarks.find((b) => b.page === page);

    if (existing) {
      await deleteBookmark(existing.id);
    } else {
      await addBookmark({
        id: `${sid}-${page}-${Date.now()}`,
        sessionId: sid,
        page,
        label: `Page ${page}`,
        createdAt: Date.now(),
      });
    }
    await loadBookmarks(sid);
  }

  async function handleAddBookmark(label: string) {
    const sid = sessionIdRef.current;
    if (!sid) return;
    const page = pdfState.curPage;
    const existing = bookmarks.find((b) => b.page === page);
    if (!existing) {
      await addBookmark({
        id: `${sid}-${page}-${Date.now()}`,
        sessionId: sid,
        page,
        label: label || `Page ${page}`,
        createdAt: Date.now(),
      });
      await loadBookmarks(sid);
    }
    setShowBookmarkPrompt(false);
  }

  async function handleDeleteBookmark(id: string) {
    await deleteBookmark(id);
    if (sessionIdRef.current) await loadBookmarks(sessionIdRef.current);
  }

  async function handleGoToBookmark(page: number) {
    hardStop();
    setStartWordIdx(0);
    const rawText = await goToPage(page);
    const text = await resolveText(rawText, page);
    setPageText(text);
    setWords(text.split(/\s+/).filter(Boolean));
    setTabs((prev) => prev.map((t, i) => (i === activeTabIdx ? { ...t, page } : t)));
    if (sessionIdRef.current) {
      await updateSessionPage(sessionIdRef.current, page);
    }
  }

  // ── Playback ──────────────────────────────────────────────────────────────
  async function handlePause() {
    if (playState.activeWordIdx >= 0) setStartWordIdx(playState.activeWordIdx);
    pause();
    const sid = sessionIdRef.current;
    if (!sid) return;
    const page = pdfState.curPage;
    const existing = bookmarks.find((b) => b.page === page);
    if (!existing) {
      await addBookmark({
        id: `${sid}-${page}-${Date.now()}`,
        sessionId: sid,
        page,
        label: `Page ${page}`,
        createdAt: Date.now(),
      });
      await loadBookmarks(sid);
    }
  }

  const handlePlay = useCallback(() => {
    const liveStatus = currentStatusRef.current;
    if (liveStatus === "paused") {
      resume();
      return;
    }
    if (liveStatus === "speaking" || liveStatus === "loading") return;
    speakPage({
      text: pageText,
      words,
      apiKey,
      lang: selLang,
      voice: selVoice,
      mode,
      rate,
      pitch,
      pauseMs,
      startWordIdx,
    });
  }, [
    currentStatusRef, resume, speakPage, pageText, words,
    apiKey, selLang, selVoice, mode, rate, pitch, pauseMs, startWordIdx,
  ]);

  // Track reading progress and trigger bookmark prompt on stop
  useEffect(() => {
    if (playState.status === "done") hasReadRef.current = true;
  }, [playState.status]);

  // ── Auto-advance (production mode only) ───────────────────────────────────
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_APP_MODE !== "production") return;
    if (playState.status !== "done") return;
    if (pdfState.curPage >= pdfState.totalPages) return;

    handlePageChange(1).then((result) => {
      if (!result) return;
      speakPage({
        text: result.text,
        words: result.words,
        apiKey,
        lang: selLang,
        voice: selVoice,
        mode,
        rate,
        pitch,
        pauseMs,
        startWordIdx: 0,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playState.status]);

  function handleStop() {
    const wasSpeaking =
      playState.status === "speaking" ||
      playState.status === "loading" ||
      playState.status === "paused" ||
      playState.status === "done";
    if (playState.activeWordIdx >= 0) setStartWordIdx(playState.activeWordIdx);
    hardStop();
    if (wasSpeaking && hasReadRef.current && sessionIdRef.current) {
      const alreadyBookmarked = bookmarks.some(
        (b) => b.page === pdfState.curPage
      );
      if (!alreadyBookmarked) setShowBookmarkPrompt(true);
    }
  }

  function handleRetry() {
    hardStop();
    setStartWordIdx(0);
    setShowBookmarkPrompt(false);
    speakPage({
      text: pageText,
      words,
      apiKey,
      lang: selLang,
      voice: selVoice,
      mode,
      rate,
      pitch,
      pauseMs,
      startWordIdx: 0,
    });
  }

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!pdfState.pdfDoc) return;
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (playState.status === "paused") resume();
        else if (playState.status === "speaking" || playState.status === "loading") handlePause();
        else handlePlay();
      }
      if (e.code === "Escape") handleStop();
      const idle = playState.status === "idle" || playState.status === "done";
      if (e.code === "ArrowRight" && idle) handlePageChange(1);
      if (e.code === "ArrowLeft" && idle) handlePageChange(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pdfState.pdfDoc, playState.status, resume, pause, handlePlay]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const hasPdf = !!pdfState.pdfDoc;
  const isPageBookmarked = bookmarks.some((b) => b.page === pdfState.curPage);

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,168,67,0.14) 0%, transparent 60%), #faf8f4",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 pb-12 pt-6">
        {/* ── No PDF: full-width settings + drop zone ── */}
        {!hasPdf && (
          <>
            <ApiKeyCard
              apiKey={apiKey}
              ready={apiKeyReady}

              selectedLang={selLang}
              selectedVoice={selVoice}
              onLangChange={handleLangChange}
              onVoiceChange={handleVoiceChange}
            />
            <SessionPanel
              sessions={sessions}
              onResume={handleResume}
              onDelete={handleDeleteSession}
              onPin={handlePinSession}
              onUnpin={handleUnpinSession}
            />
            <DropZone onFile={handleFile} />
          </>
        )}

        {/* ── PDF open: PDF left, sticky sidebar right ── */}
        {hasPdf && (
          <div
            className="reader-grid grid gap-4"
            style={{
              gridTemplateColumns: "minmax(0, 1fr) 320px",
              animation: "slideUp 0.4s ease-out",
              alignItems: "start",
            }}
          >
            <PdfViewer
              canvasRef={canvasRef}
              textLayerRef={textLayerRef}
              fileName={pdfState.fileName}
              curPage={pdfState.curPage}
              totalPages={pdfState.totalPages}
              activeWordIdx={playState.activeWordIdx}
              isPageBookmarked={isPageBookmarked}
              ocrLoading={ocrLoading}
              ocrError={ocrError}
              onRetryOCR={handleRetryOCR}
              onForceOCR={handleForceOCR}
              tabs={tabs}
              activeTabIdx={activeTabIdx}
              onSwitchTab={doSwitchTab}
              onCloseTab={closeTab}
              onPrev={() => handlePageChange(-1)}
              onNext={() => handlePageChange(1)}
              onBookmarkToggle={handleBookmarkToggle}
              onGoToPage={handleGoToPage}
              onNewFile={handleFile}
            />

            {/* Sticky scrollable sidebar — all settings + playback */}
            <div
              className="reader-sidebar"
              style={{
                position: "sticky",
                top: "1rem",
                maxHeight: "calc(100vh - 2rem)",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                paddingBottom: "0.5rem",
              }}
            >
              <ApiKeyCard
                apiKey={apiKey}
                ready={apiKeyReady}
  
                selectedLang={selLang}
                selectedVoice={selVoice}
                onLangChange={handleLangChange}
                onVoiceChange={handleVoiceChange}
              />
              <ControlPanel
                mode={mode}
                rate={rate}
                pitch={pitch}
                pauseMs={pauseMs}
                status={playState.status}
                progress={playState.progress}
                statusMsg={playState.statusMsg}
                charCount={pageText.length}
                monthlyChars={monthlyChars}
                hasApiKey={!!apiKey}
                bookmarks={bookmarks}
                currentPage={pdfState.curPage}
                onModeChange={handleModeChange}
                onRateChange={setRate}
                onPitchChange={setPitch}
                onPauseChange={setPauseMs}
                onSettingsChange={() => {}}
                onPlay={handlePlay}
                onPause={handlePause}
                onStop={handleStop}
                onRetry={handleRetry}
                onGoToBookmark={handleGoToBookmark}
                onDeleteBookmark={handleDeleteBookmark}
              />
            </div>
          </div>
        )}
      </div>

      <BookmarkPrompt
        page={pdfState.curPage}
        fileName={pdfState.fileName}
        visible={showBookmarkPrompt}
        onBookmark={handleAddBookmark}
        onDismiss={() => setShowBookmarkPrompt(false)}
      />
    </div>
  );
}
