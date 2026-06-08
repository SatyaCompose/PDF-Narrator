"use client";

import { RefObject, useState, useEffect, useRef } from "react";

interface PdfTabMeta {
  id: string;
  fileName: string;
}

interface Props {
  canvasRef: RefObject<HTMLCanvasElement>;
  textLayerRef: RefObject<HTMLDivElement>;
  fileName: string;
  curPage: number;
  totalPages: number;
  activeWordIdx: number;
  isPageBookmarked: boolean;
  ocrLoading: boolean;
  ocrError: string | null;
  onRetryOCR: () => void;
  onForceOCR: () => void;
  tabs: PdfTabMeta[];
  activeTabIdx: number;
  onSwitchTab: (idx: number) => void;
  onCloseTab: (idx: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onBookmarkToggle: () => void;
  onGoToPage: (n: number) => void;
  onNewFile: (file: File) => void;
}

export default function PdfViewer({
  canvasRef,
  textLayerRef,
  fileName,
  curPage,
  totalPages,
  activeWordIdx,
  isPageBookmarked,
  ocrLoading,
  ocrError,
  onRetryOCR,
  onForceOCR,
  tabs,
  activeTabIdx,
  onSwitchTab,
  onCloseTab,
  onPrev,
  onNext,
  onBookmarkToggle,
  onGoToPage,
  onNewFile,
}: Props) {
  const [pageInput, setPageInput] = useState(String(curPage));
  const fileRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPageInput(String(curPage));
  }, [curPage]);

  // Keep text layer scaled to match the CSS-displayed canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    const tl = textLayerRef.current;
    if (!canvas || !tl) return;

    const sync = () => {
      if (canvas.width === 0) return;
      const scale = canvas.getBoundingClientRect().width / canvas.width;
      tl.style.transform = `scale(${scale})`;
      tl.style.transformOrigin = "0 0";
    };

    sync();
    const obs = new ResizeObserver(sync);
    obs.observe(canvas);
    return () => obs.disconnect();
  }, [canvasRef, textLayerRef, curPage]);

  function commitPageInput() {
    const n = parseInt(pageInput, 10);
    if (!isNaN(n) && n >= 1 && n <= totalPages) {
      onGoToPage(n);
    } else {
      setPageInput(String(curPage));
    }
  }

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: "#ffffff",
        border: "1px solid #e5ddd0",
        boxShadow: "0 2px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Tab bar — only shown when multiple PDFs are open */}
      {tabs.length > 1 && (
        <div
          className="flex items-center gap-1 px-3 py-2 overflow-x-auto"
          style={{ background: "#f5f0e8", borderBottom: "1px solid #e8e0d0" }}
        >
          {tabs.map((tab, i) => (
            <div
              key={tab.id}
              className="flex items-center gap-1 flex-shrink-0 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer select-none"
              style={{
                background: i === activeTabIdx ? "#ffffff" : "transparent",
                border: `1px solid ${i === activeTabIdx ? "#d4a843" : "transparent"}`,
                color: i === activeTabIdx ? "#8a6018" : "#7a7080",
                fontWeight: i === activeTabIdx ? 600 : 400,
                boxShadow: i === activeTabIdx ? "0 1px 4px rgba(212,168,67,0.15)" : "none",
              }}
              onClick={() => onSwitchTab(i)}
            >
              <span className="max-w-[110px] truncate">{tab.fileName}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onCloseTab(i); }}
                className="ml-1 w-4 h-4 flex items-center justify-center rounded transition-colors flex-shrink-0"
                style={{ color: i === activeTabIdx ? "#b8922e" : "#9a9088" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#dc2626"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = i === activeTabIdx ? "#b8922e" : "#9a9088"; }}
                title="Close tab"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-shrink-0 ml-1 px-2 py-1 rounded-lg text-xs transition-all"
            style={{ border: "1px dashed #d4a843", color: "#b8922e", background: "transparent" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,168,67,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            title="Open another PDF (max 5)"
          >
            + PDF
          </button>
        </div>
      )}

      {/* Page header */}
      <div
        className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 flex-wrap gap-2"
        style={{
          background: "linear-gradient(180deg, #faf6ee, #f5f0e8)",
          borderBottom: "1px solid #e8e0d0",
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: "#d4a843", boxShadow: "0 0 5px rgba(212,168,67,0.5)" }}
          />
          <span
            className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-[200px] lg:max-w-[280px]"
            style={{ color: "#1a1a2e" }}
          >
            {fileName || "—"}
          </span>
          <button
            onClick={() => fileRef.current?.click()}
            className="text-xs px-2 py-1 rounded-lg transition-all flex-shrink-0"
            style={{ border: "1px solid #e5ddd0", background: "#fff", color: "#7a7080" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#d4a843"; e.currentTarget.style.color = "#b8922e"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5ddd0"; e.currentTarget.style.color = "#7a7080"; }}
            title="Open a different PDF"
          >
            📂 Open
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            data-open-pdf
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { onNewFile(f); e.target.value = ""; }
            }}
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Bookmark toggle */}
          <button
            onClick={onBookmarkToggle}
            title={isPageBookmarked ? "Remove bookmark" : "Bookmark this page"}
            className="px-2 py-1.5 rounded-lg text-sm transition-all"
            style={{
              background: isPageBookmarked ? "rgba(212,168,67,0.15)" : "transparent",
              border: `1px solid ${isPageBookmarked ? "#d4a843" : "#e5ddd0"}`,
              color: isPageBookmarked ? "#b8922e" : "#cec4b4",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#d4a843"; e.currentTarget.style.color = "#b8922e"; }}
            onMouseLeave={(e) => {
              if (!isPageBookmarked) { e.currentTarget.style.borderColor = "#e5ddd0"; e.currentTarget.style.color = "#cec4b4"; }
            }}
          >
            {isPageBookmarked ? "🔖" : "🏷️"}
          </button>

          <button
            onClick={onPrev}
            disabled={curPage <= 1}
            className="px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30"
            style={{ background: "#ffffff", border: "1px solid #e5ddd0", color: "#1a1a2e" }}
            onMouseEnter={(e) => { if (curPage > 1) { e.currentTarget.style.borderColor = "#d4a843"; e.currentTarget.style.color = "#8a6018"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5ddd0"; e.currentTarget.style.color = "#1a1a2e"; }}
          >
            ← Prev
          </button>

          <div
            className="flex items-center gap-1 px-2 py-1 rounded text-xs"
            style={{ color: "#7a7080", background: "#ede8df" }}
          >
            <input
              type="number"
              min={1}
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={commitPageInput}
              onKeyDown={(e) => { if (e.key === "Enter") { e.currentTarget.blur(); commitPageInput(); } }}
              className="w-7 text-center bg-transparent outline-none tabular-nums"
              style={{ color: "#1a1a2e", MozAppearance: "textfield" } as React.CSSProperties}
            />
            <span>/ {totalPages}</span>
          </div>

          <button
            onClick={onNext}
            disabled={curPage >= totalPages}
            className="px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30"
            style={{ background: "#ffffff", border: "1px solid #e5ddd0", color: "#1a1a2e" }}
            onMouseEnter={(e) => { if (curPage < totalPages) { e.currentTarget.style.borderColor = "#d4a843"; e.currentTarget.style.color = "#8a6018"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5ddd0"; e.currentTarget.style.color = "#1a1a2e"; }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* OCR status bar (compact, only visible when needed) */}
      {(ocrLoading || ocrError) && (
        <div
          className="px-3 py-2 flex items-center gap-2 flex-wrap text-xs"
          style={{ background: "#fffbf0", borderBottom: "1px solid #e8e0d0" }}
        >
          {ocrLoading ? (
            <span className="animate-pulse" style={{ color: "#8a6018" }}>
              🔍 Reading page via Vision AI…
            </span>
          ) : (
            <>
              <span style={{ color: "#dc2626" }}>
                {ocrError === "no-key"
                  ? "⚠ Add a Google API key to enable Vision OCR."
                  : ocrError?.includes("not been used") || ocrError?.includes("disabled") || ocrError?.includes("403")
                  ? "⚠ Vision API not enabled — enable it in Google Cloud Console."
                  : `⚠ Vision OCR failed: ${ocrError}`}
              </span>
              <button
                onClick={onRetryOCR}
                className="px-2 py-0.5 rounded transition-all"
                style={{ background: "rgba(212,168,67,0.12)", border: "1px solid #d4a843", color: "#8a6018" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,168,67,0.22)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(212,168,67,0.12)"; }}
              >
                ↺ Retry OCR
              </button>
            </>
          )}
        </div>
      )}

      {/* PDF canvas + text layer overlay */}
      <div
        className="flex justify-center overflow-y-auto p-3 sm:p-4"
        style={{ background: "#f0ebe2", maxHeight: "calc(100vh - 220px)", minHeight: "300px" }}
      >
        {/* Wrapper keeps canvas + text layer aligned; canvas controls the displayed width */}
        <div ref={wrapperRef} style={{ position: "relative", display: "inline-block", lineHeight: 0 }}>
          <canvas
            ref={canvasRef}
            className="rounded"
            style={{
              maxWidth: "100%",
              height: "auto",
              display: "block",
              boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            }}
          />
          {/* pdf.js text layer — transparent text spans positioned over canvas */}
          <div
            ref={textLayerRef}
            className="pdf-text-layer"
            title="Click any word to start reading from there"
          />
          {/* Reading-tip badge — visible only when not playing */}
          {activeWordIdx < 0 && (
            <div
              style={{
                position: "absolute",
                bottom: 8,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(26,26,46,0.72)",
                color: "#ede0c8",
                fontSize: "0.68rem",
                padding: "3px 10px",
                borderRadius: 999,
                whiteSpace: "nowrap",
                pointerEvents: "none",
                backdropFilter: "blur(4px)",
              }}
            >
              Click any word · Space to play
            </div>
          )}
        </div>
      </div>

      {/* Force-OCR button row (always available when PDF is loaded) */}
      <div
        className="px-3 py-2 flex items-center gap-2"
        style={{ borderTop: "1px solid #e8e0d0", background: "#faf8f4" }}
      >
        <button
          onClick={onForceOCR}
          className="text-xs px-2.5 py-1 rounded-lg transition-all"
          style={{ border: "1px solid #e5ddd0", color: "#9a9088", background: "transparent" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#d4a843"; e.currentTarget.style.color = "#8a6018"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5ddd0"; e.currentTarget.style.color = "#9a9088"; }}
          title="Re-read this page using Vision AI (useful for scanned/image PDFs)"
        >
          🔍 Use Vision OCR
        </button>
        <span className="text-xs" style={{ color: "#cec4b4" }}>
          for scanned or image-based PDFs
        </span>
      </div>
    </div>
  );
}
