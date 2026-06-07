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
  const renderTaskRef = useRef<{ cancel: () => void; promise: Promise<void> } | null>(null);
  const pendingRenderRef = useRef<{ doc: unknown; page: number } | null>(null);
  // Ref so capturePageImage always sees the current doc without stale closures
  const pdfDocRef = useRef<unknown>(null);

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
  }, []);

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

  // Load from a File (new drop)
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
    [renderPage, extractText]
  );

  // Load from stored ArrayBuffer (resume from IndexedDB)
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
    [renderPage, extractText]
  );

  // Renders the given page to an off-screen canvas at 2× scale and returns
  // a base64 JPEG string suitable for Google Vision API OCR.
  // Uses an independent canvas so it never conflicts with the display render.
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
      // JPEG at 0.92 quality is ~4× smaller than PNG with negligible OCR quality loss
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
    setState({
      pdfDoc: null,
      curPage: 1,
      totalPages: 0,
      fileName: "",
      pageTexts: {},
    });
  }, []);

  return { state, canvasRef, loadPDF, loadPDFFromData, goToPage, resetPdf, capturePageImage };
}
