"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cleanPageTextFromItems } from "@/lib/ssml";
import type { PdfTextItem } from "@/lib/ssml";

export interface PdfState {
  pdfDoc: unknown | null;
  curPage: number;
  totalPages: number;
  fileName: string;
  pageTexts: Record<number, string>;
}

export function usePdfReader() {
  const [state, setState] = useState<PdfState>({
    pdfDoc: null,
    curPage: 1,
    totalPages: 0,
    fileName: "",
    pageTexts: {},
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<{ cancel: () => void; promise: Promise<void> } | null>(null);
  const pendingRenderRef = useRef<{ doc: unknown; page: number } | null>(null);
  const pdfDocRef = useRef<unknown>(null);

  // Word highlighting state
  const wordMapRef = useRef<(HTMLElement | null)[]>([]);
  const lastHlRef = useRef<HTMLElement | null>(null);
  const wordClickCbRef = useRef<((idx: number) => void) | null>(null);
  // Latest cleaned words — stored so the delayed text-layer render can build the map
  const latestWordsRef = useRef<string[]>([]);

  const setWordClickCallback = useCallback((fn: ((idx: number) => void) | null) => {
    wordClickCbRef.current = fn;
  }, []);

  // Scale the text-layer overlay to match the CSS-displayed canvas size
  const syncTextLayerScale = useCallback(() => {
    const canvas = canvasRef.current;
    const tl = textLayerRef.current;
    if (!canvas || !tl || canvas.width === 0) return;
    const displayWidth = canvas.getBoundingClientRect().width;
    const scale = displayWidth / canvas.width;
    tl.style.transform = `scale(${scale})`;
    tl.style.transformOrigin = "0 0";
  }, []);

  useEffect(() => {
    window.addEventListener("resize", syncTextLayerScale);
    return () => window.removeEventListener("resize", syncTextLayerScale);
  }, [syncTextLayerScale]);

  // Internal: match cleaned words to text-layer spans and wire the click handler
  function buildWordMapInternal(cleanedWords: string[], tl: HTMLDivElement) {
    const spans = Array.from(tl.querySelectorAll("span")) as HTMLElement[];
    if (!spans.length) { wordMapRef.current = []; return; }

    const tlWords: { word: string; el: HTMLElement }[] = [];
    for (const sp of spans) {
      for (const w of (sp.textContent ?? "").split(/\s+/).filter(Boolean)) {
        tlWords.push({ word: w, el: sp });
      }
    }

    const norm = (w: string) => w.toLowerCase().replace(/[^\w-]/g, "");
    const map: (HTMLElement | null)[] = new Array(cleanedWords.length).fill(null);
    let j = 0;
    for (let i = 0; i < cleanedWords.length; i++) {
      const cw = norm(cleanedWords[i]);
      if (!cw) continue;
      for (let k = j; k < Math.min(tlWords.length, j + 20); k++) {
        if (norm(tlWords[k].word) === cw) {
          map[i] = tlWords[k].el;
          j = k + 1;
          break;
        }
      }
    }
    wordMapRef.current = map;

    const reverseMap = new Map<HTMLElement, number>();
    for (let i = 0; i < map.length; i++) {
      const el = map[i];
      if (el && !reverseMap.has(el)) reverseMap.set(el, i);
    }

    tl.onclick = (e) => {
      let target = e.target as HTMLElement | null;
      while (target && target !== tl) {
        const idx = reverseMap.get(target);
        if (idx !== undefined) { wordClickCbRef.current?.(idx); return; }
        target = target.parentElement;
      }
    };
  }

  // Public — called by reader/page.tsx when cleaned words change.
  // Builds immediately if the text layer is already rendered, otherwise
  // the map will be built by renderTextLayerOverlay when the layer finishes.
  const buildWordMap = useCallback((cleanedWords: string[]) => {
    latestWordsRef.current = cleanedWords;
    const tl = textLayerRef.current;
    if (!tl || !cleanedWords.length) { wordMapRef.current = []; return; }
    if (tl.querySelectorAll("span").length > 0) {
      buildWordMapInternal(cleanedWords, tl);
    }
  }, []);

  // Apply / remove highlight class on the matching text-layer span
  const highlightWord = useCallback((idx: number) => {
    if (lastHlRef.current) {
      lastHlRef.current.classList.remove("pdf-word-hl");
      lastHlRef.current = null;
    }
    if (idx < 0) return;
    const map = wordMapRef.current;
    if (!map.length || idx >= map.length) return;
    const sp = map[idx];
    if (!sp) return;
    sp.classList.add("pdf-word-hl");
    lastHlRef.current = sp;
    sp.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);

  async function renderTextLayerOverlay(page: unknown, viewport: unknown) {
    const tl = textLayerRef.current;
    if (!tl) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vp = viewport as any;
    tl.innerHTML = "";
    tl.style.width = `${vp.width}px`;
    tl.style.height = `${vp.height}px`;

    try {
      const pdfjs = await import("pdfjs-dist");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const textContent = await (page as any).getTextContent();
      const textDivs: HTMLElement[] = [];

      const task = pdfjs.renderTextLayer({
        textContentSource: textContent,
        container: tl,
        viewport: vp,
        textDivs,
        isOffscreenCanvasSupported: false,
      });
      await task.promise;

      // Reset any stale highlight then rebuild the word map if we have cleaned words
      lastHlRef.current = null;
      wordMapRef.current = [];
      if (latestWordsRef.current.length > 0) {
        buildWordMapInternal(latestWordsRef.current, tl);
      }
    } catch {
      // Text layer is optional; the canvas still shows the PDF correctly
    }
  }

  const renderPage = useCallback(async (doc: unknown, pageNum: number) => {
    if (!canvasRef.current) return;

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      try { await renderTaskRef.current.promise; } catch { /* cancelled */ }
      renderTaskRef.current = null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = await (doc as any).getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const task = page.render({ canvasContext: ctx, viewport });
    renderTaskRef.current = task;
    try {
      await task.promise;
    } finally {
      renderTaskRef.current = null;
    }

    // Render the text layer overlay and sync its scale
    await renderTextLayerOverlay(page, viewport);
    setTimeout(syncTextLayerScale, 0);
  }, [syncTextLayerScale]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (pendingRenderRef.current && canvasRef.current) {
      const { doc, page } = pendingRenderRef.current;
      pendingRenderRef.current = null;
      renderPage(doc, page);
    }
  }, [state.pdfDoc, renderPage]);

  const extractText = useCallback(
    async (
      doc: unknown,
      pageNum: number,
      existing: Record<number, string>
    ): Promise<string> => {
      if (existing[pageNum]) return existing[pageNum];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const page = await (doc as any).getPage(pageNum);
      const content = await page.getTextContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items = (content.items as any[]).map((i): PdfTextItem => ({
        str: i.str ?? "",
        transform: i.transform ?? [1, 0, 0, 1, 0, 0],
        width: i.width ?? 0,
        height: i.height ?? 0,
      }));
      return cleanPageTextFromItems(items);
    },
    []
  );

  async function initPdfjs() {
    const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
    GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    return getDocument;
  }

  const loadPDF = useCallback(
    async (file: File, startPage = 1): Promise<{ text: string; buf: ArrayBuffer; totalPages: number }> => {
      const getDocument = await initPdfjs();
      const buf = await file.arrayBuffer();
      const doc = await getDocument({ data: buf.slice(0) }).promise;
      const total = doc.numPages;
      const name = file.name.replace(/\.pdf$/i, "");
      const page = Math.min(Math.max(startPage, 1), total);

      const text = await extractText(doc, page, {});
      pdfDocRef.current = doc;
      pendingRenderRef.current = { doc, page };

      setState({
        pdfDoc: doc,
        curPage: page,
        totalPages: total,
        fileName: name,
        pageTexts: { [page]: text },
      });

      return { text, buf, totalPages: total };
    },
    [extractText]
  );

  const loadPDFFromData = useCallback(
    async (
      data: ArrayBuffer,
      name: string,
      startPage = 1
    ): Promise<string> => {
      const getDocument = await initPdfjs();
      const doc = await getDocument({ data: data.slice(0) }).promise;
      const total = doc.numPages;
      const page = Math.min(Math.max(startPage, 1), total);

      const text = await extractText(doc, page, {});
      pdfDocRef.current = doc;
      pendingRenderRef.current = { doc, page };

      setState({
        pdfDoc: doc,
        curPage: page,
        totalPages: total,
        fileName: name,
        pageTexts: { [page]: text },
      });

      return text;
    },
    [extractText]
  );

  // Renders the given page to an off-screen canvas at 2× scale and returns
  // a base64 JPEG string suitable for Google Vision API OCR.
  // Returns the actual font family names embedded in the page via content.styles.
  // Used for font-based language detection which is more reliable than Unicode analysis
  // for Indian PDFs with custom-encoded glyphs.
  const getPageFontFamilies = useCallback(async (pageNum: number): Promise<string[]> => {
    const doc = pdfDocRef.current;
    if (!doc) return [];
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const page = await (doc as any).getPage(pageNum);
      const content = await page.getTextContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const styles = (content.styles ?? {}) as Record<string, { fontFamily?: string }>;
      return Object.values(styles)
        .map((s) => s.fontFamily ?? "")
        .filter(Boolean);
    } catch {
      return [];
    }
  }, []);

  const capturePageImage = useCallback(async (pageNum: number): Promise<string> => {
    const doc = pdfDocRef.current;
    if (!doc) return "";
    try {
      const offscreen = document.createElement("canvas");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const page = await (doc as any).getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      offscreen.width = viewport.width;
      offscreen.height = viewport.height;
      const ctx = offscreen.getContext("2d");
      if (!ctx) return "";
      await page.render({ canvasContext: ctx, viewport }).promise;
      return offscreen.toDataURL("image/jpeg", 0.92).split(",")[1];
    } catch {
      return "";
    }
  }, []);

  const goToPage = useCallback(
    async (pageNum: number): Promise<string> => {
      const { pdfDoc, pageTexts } = state;
      if (!pdfDoc) return "";

      await renderPage(pdfDoc, pageNum);
      const text = await extractText(pdfDoc, pageNum, pageTexts);

      setState((prev) => ({
        ...prev,
        curPage: pageNum,
        pageTexts: { ...prev.pageTexts, [pageNum]: text },
      }));

      return text;
    },
    [state, renderPage, extractText]
  );

  const resetPdf = useCallback(() => {
    pdfDocRef.current = null;
    latestWordsRef.current = [];
    wordMapRef.current = [];
    lastHlRef.current = null;
    if (textLayerRef.current) textLayerRef.current.innerHTML = "";
    setState({
      pdfDoc: null,
      curPage: 1,
      totalPages: 0,
      fileName: "",
      pageTexts: {},
    });
  }, []);

  return {
    state,
    canvasRef,
    textLayerRef,
    loadPDF,
    loadPDFFromData,
    goToPage,
    resetPdf,
    capturePageImage,
    getPageFontFamilies,
    buildWordMap,
    highlightWord,
    setWordClickCallback,
  };
}
