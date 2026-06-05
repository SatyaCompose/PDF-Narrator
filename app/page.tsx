"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Header from "@/components/Header";
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
} from "@/lib/db";
import type { SessionMeta, Bookmark } from "@/lib/db";

export default function Home() {
  // ── API key ──────────────────────────────────────────────────────────────
  const [apiKey, setApiKey] = useState("");

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

  // ── Session ───────────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const sessionIdRef = useRef<string | null>(null);

  // ── Bookmarks ─────────────────────────────────────────────────────────────
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showBookmarkPrompt, setShowBookmarkPrompt] = useState(false);
  // track whether user has made reading progress (to decide if prompt is worth showing)
  const hasReadRef = useRef(false);

  const { state: pdfState, canvasRef, loadPDF, loadPDFFromData, goToPage } =
    usePdfReader();
  const { state: playState, speakPage, hardStop, pause, resume } =
    usePlayback();

  // ── Init: load API key + sessions ─────────────────────────────────────────
  useEffect(() => {
    setApiKey(localStorage.getItem("gcp_key") ?? "");
    getAllSessions().then(setSessions).catch(console.error);
  }, []);

  // ── Save API key ──────────────────────────────────────────────────────────
  function handleSaveKey(k: string) {
    localStorage.setItem("gcp_key", k);
    setApiKey(k);
  }

  // ── Voice helpers ─────────────────────────────────────────────────────────
  function handleLangChange(lang: string) {
    setSelLang(lang);
    setSelVoice(VOICES[lang][0]);
  }

  function handleModeChange(m: ModeKey) {
    const cfg = MODES.find((x) => x.key === m)!;
    setMode(m);
    setRate(cfg.rate);
    setPauseMs(cfg.pause);
  }

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
    await refreshSessions();
  }

  async function loadBookmarks(sid: string) {
    const bms = await getBookmarksForSession(sid);
    setBookmarks(bms);
  }

  // ── Load new PDF from file drop ───────────────────────────────────────────
  async function handleFile(file: File) {
    hardStop();
    hasReadRef.current = false;
    setShowBookmarkPrompt(false);

    const { text, buf } = await loadPDF(file);
    const sid = makeSessionId(file.name.replace(/\.pdf$/i, ""), file.size);

    // Check if we already have this PDF — if so, resume from saved page
    const existing = sessions.find((s) => s.id === sid);
    if (existing && existing.lastPage > 1) {
      // Re-load to the saved page
      const resumeText = await loadPDFFromData(buf, existing.fileName, existing.lastPage);
      setPageText(resumeText);
      setWords(resumeText.split(/\s+/).filter(Boolean));
    } else {
      setPageText(text);
      setWords(text.split(/\s+/).filter(Boolean));
    }

    const pdfDoc = await import("pdfjs-dist").then(({ getDocument, GlobalWorkerOptions }) => {
      GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      return getDocument({ data: buf.slice(0) }).promise;
    });

    await persistSession(
      {
        id: sid,
        fileName: file.name.replace(/\.pdf$/i, ""),
        fileSize: file.size,
        lastPage: existing?.lastPage ?? 1,
        totalPages: pdfDoc.numPages,
      },
      buf
    );
    await loadBookmarks(sid);
  }

  // ── Resume session from panel ──────────────────────────────────────────────
  async function handleResume(session: SessionMeta) {
    hardStop();
    hasReadRef.current = false;
    setShowBookmarkPrompt(false);

    const data = await getSessionPdf(session.id);
    if (!data) return;

    const text = await loadPDFFromData(data, session.fileName, session.lastPage);
    sessionIdRef.current = session.id;
    setPageText(text);
    setWords(text.split(/\s+/).filter(Boolean));
    await loadBookmarks(session.id);
    // Bump lastRead
    await updateSessionPage(session.id, session.lastPage);
    await refreshSessions();
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
  async function handlePageChange(delta: number) {
    hardStop();
    setShowBookmarkPrompt(false);
    const next = pdfState.curPage + delta;
    if (next < 1 || next > pdfState.totalPages) return;

    const text = await goToPage(next);
    setPageText(text);
    setWords(text.split(/\s+/).filter(Boolean));

    // Persist page position
    if (sessionIdRef.current) {
      await updateSessionPage(sessionIdRef.current, next);
      await refreshSessions();
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
    const text = await goToPage(page);
    setPageText(text);
    setWords(text.split(/\s+/).filter(Boolean));
    if (sessionIdRef.current) {
      await updateSessionPage(sessionIdRef.current, page);
    }
  }

  // ── Playback ──────────────────────────────────────────────────────────────
  const handlePlay = useCallback(() => {
    if (playState.status === "paused") {
      resume();
      return;
    }
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
    });
  }, [
    playState.status, resume, speakPage, pageText, words,
    apiKey, selLang, selVoice, mode, rate, pitch, pauseMs,
  ]);

  // Track reading progress and trigger bookmark prompt on stop
  useEffect(() => {
    if (playState.status === "done") hasReadRef.current = true;
  }, [playState.status]);

  function handleStop() {
    const wasSpeaking =
      playState.status === "speaking" ||
      playState.status === "loading" ||
      playState.status === "paused" ||
      playState.status === "done";
    hardStop();
    if (wasSpeaking && hasReadRef.current && sessionIdRef.current) {
      const alreadyBookmarked = bookmarks.some(
        (b) => b.page === pdfState.curPage
      );
      if (!alreadyBookmarked) setShowBookmarkPrompt(true);
    }
  }

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!pdfState.pdfDoc) return;
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (playState.status === "paused") resume();
        else if (playState.status === "speaking" || playState.status === "loading") pause();
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
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <Header />

        <ApiKeyCard
          apiKey={apiKey}
          onSave={handleSaveKey}
          selectedLang={selLang}
          selectedVoice={selVoice}
          onLangChange={handleLangChange}
          onVoiceChange={setSelVoice}
        />

        {!hasPdf && (
          <>
            <SessionPanel
              sessions={sessions}
              onResume={handleResume}
              onDelete={handleDeleteSession}
            />
            <DropZone onFile={handleFile} />
          </>
        )}

        {hasPdf && (
          <div
            className="reader-grid grid gap-4"
            style={{
              gridTemplateColumns: "minmax(0, 1fr) 300px",
              animation: "slideUp 0.4s ease-out",
            }}
          >
            <PdfViewer
              canvasRef={canvasRef}
              fileName={pdfState.fileName}
              curPage={pdfState.curPage}
              totalPages={pdfState.totalPages}
              words={words}
              activeWordIdx={playState.activeWordIdx}
              isPageBookmarked={isPageBookmarked}
              onPrev={() => handlePageChange(-1)}
              onNext={() => handlePageChange(1)}
              onBookmarkToggle={handleBookmarkToggle}
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
              hasApiKey={!!apiKey}
              bookmarks={bookmarks}
              currentPage={pdfState.curPage}
              onModeChange={handleModeChange}
              onRateChange={setRate}
              onPitchChange={setPitch}
              onPauseChange={setPauseMs}
              onPlay={handlePlay}
              onPause={pause}
              onStop={handleStop}
              onGoToBookmark={handleGoToBookmark}
              onDeleteBookmark={handleDeleteBookmark}
            />
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

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 5px rgba(212,168,67,0.5); }
          50% { opacity: 0.4; box-shadow: 0 0 2px rgba(212,168,67,0.3); }
        }
      `}</style>
    </div>
  );
}
