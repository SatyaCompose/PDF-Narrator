"use client";

import { RefObject, useState, useEffect, useRef } from "react";

interface PdfTabMeta {
  id: string;
  fileName: string;
}

interface Props {
  canvasRef: RefObject<HTMLCanvasElement>;
  fileName: string;
  curPage: number;
  totalPages: number;
  words: string[];
  activeWordIdx: number;
  startWordIdx: number;
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
  onWordClick: (idx: number) => void;
  onNewFile: (file: File) => void;
}

export default function PdfViewer({
  canvasRef,
  fileName,
  curPage,
  totalPages,
  words,
  activeWordIdx,
  startWordIdx,
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
  onWordClick,
  onNewFile,
}: Props) {
  const [pageInput, setPageInput] = useState(String(curPage));
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPageInput(String(curPage));
  }, [curPage]);

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
            onClick={() => (document.querySelector<HTMLInputElement>("[data-open-pdf]") as HTMLInputElement)?.click()}
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
        className="flex items-center justify-between px-4 py-3 flex-wrap gap-3"
        style={{
          background: "linear-gradient(180deg, #faf6ee, #f5f0e8)",
          borderBottom: "1px solid #e8e0d0",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: "#d4a843", boxShadow: "0 0 5px rgba(212,168,67,0.5)" }}
          />
          <span
            className="text-sm font-medium truncate max-w-[200px] lg:max-w-[280px]"
            style={{ color: "#1a1a2e" }}
          >
            {fileName || "—"}
          </span>
          <button
            onClick={() => fileRef.current?.click()}
            className="text-xs px-2 py-1 rounded-lg transition-all"
            style={{ border: "1px solid #e5ddd0", background: "#fff", color: "#7a7080" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#d4a843"; e.currentTarget.style.color = "#b8922e"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5ddd0"; e.currentTarget.style.color = "#7a7080"; }}
            title="Open a different PDF"
          >
            📂 Open PDF
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

        <div className="flex items-center gap-2">
          {/* Bookmark toggle */}
          <button
            onClick={onBookmarkToggle}
            title={isPageBookmarked ? "Remove bookmark" : "Bookmark this page"}
            className="px-2 py-1.5 rounded-lg text-base transition-all"
            style={{
              background: isPageBookmarked ? "rgba(212,168,67,0.15)" : "transparent",
              border: `1px solid ${isPageBookmarked ? "#d4a843" : "#e5ddd0"}`,
              color: isPageBookmarked ? "#b8922e" : "#cec4b4",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#d4a843";
              e.currentTarget.style.color = "#b8922e";
            }}
            onMouseLeave={(e) => {
              if (!isPageBookmarked) {
                e.currentTarget.style.borderColor = "#e5ddd0";
                e.currentTarget.style.color = "#cec4b4";
              }
            }}
          >
            {isPageBookmarked ? "🔖" : "🏷️"}
          </button>

          <button
            onClick={onPrev}
            disabled={curPage <= 1}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30"
            style={{
              background: "#ffffff",
              border: "1px solid #e5ddd0",
              color: "#1a1a2e",
            }}
            onMouseEnter={(e) => {
              if (curPage > 1) {
                e.currentTarget.style.borderColor = "#d4a843";
                e.currentTarget.style.color = "#8a6018";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5ddd0";
              e.currentTarget.style.color = "#1a1a2e";
            }}
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
              className="w-8 text-center bg-transparent outline-none tabular-nums"
              style={{ color: "#1a1a2e", MozAppearance: "textfield" } as React.CSSProperties}
            />
            <span>/ {totalPages}</span>
          </div>
          <button
            onClick={onNext}
            disabled={curPage >= totalPages}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30"
            style={{
              background: "#ffffff",
              border: "1px solid #e5ddd0",
              color: "#1a1a2e",
            }}
            onMouseEnter={(e) => {
              if (curPage < totalPages) {
                e.currentTarget.style.borderColor = "#d4a843";
                e.currentTarget.style.color = "#8a6018";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5ddd0";
              e.currentTarget.style.color = "#1a1a2e";
            }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="flex justify-center overflow-y-auto p-4"
        style={{ maxHeight: "55vh", background: "#f0ebe2" }}
      >
        <canvas
          ref={canvasRef}
          className="rounded max-w-full h-auto"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}
        />
      </div>

      {/* Word highlight strip / OCR status */}
      {(ocrLoading || ocrError || words.length > 0) && (
        <div
          className="px-4 py-3 overflow-y-auto text-sm leading-loose"
          style={{
            maxHeight: "140px",
            background: "#faf8f4",
            borderTop: "1px solid #e8e0d0",
          }}
        >
          {ocrLoading ? (
            <span className="text-xs animate-pulse" style={{ color: "#8a6018" }}>
              🔍 Reading page via Vision AI…
            </span>
          ) : ocrError ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <span className="text-xs" style={{ color: "#dc2626" }}>
                  {ocrError === "no-key"
                    ? "⚠ Add a Google API key to use Vision OCR for this language."
                    : ocrError.includes("not been used") || ocrError.includes("disabled") || ocrError.includes("403")
                    ? "⚠ Vision API not enabled — go to console.cloud.google.com → APIs & Services → enable \"Cloud Vision API\"."
                    : `⚠ Vision OCR failed: ${ocrError}`}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onRetryOCR}
                  className="text-xs px-2.5 py-1 rounded-lg transition-all"
                  style={{
                    background: "rgba(212,168,67,0.12)",
                    border: "1px solid #d4a843",
                    color: "#8a6018",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,168,67,0.22)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(212,168,67,0.12)"; }}
                >
                  ↺ Retry OCR
                </button>
                {words.length > 0 && (
                  <span className="text-xs self-center" style={{ color: "#9a9088" }}>
                    (showing raw pdf.js text below)
                  </span>
                )}
              </div>
              {words.length > 0 && (
                <div className="overflow-x-auto">
                  {words.map((w, i) => {
                    const isActive = i === activeWordIdx;
                    const isStart = i === startWordIdx && activeWordIdx === -1;
                    return (
                      <span
                        key={i}
                        onClick={() => onWordClick(i)}
                        className="inline transition-all duration-75 rounded px-0.5 mr-0.5 cursor-pointer"
                        style={
                          isActive
                            ? { background: "#d4a843", color: "#fff", fontWeight: 600 }
                            : isStart
                            ? { background: "rgba(212,168,67,0.18)", color: "#7a5010", fontWeight: 600, borderBottom: "2px solid #d4a843" }
                            : { color: "#2a2040" }
                        }
                      >
                        {w}{" "}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs select-none" style={{ color: "#7a7080" }}>
                  Click any word to start from there →
                </span>
                <button
                  onClick={onForceOCR}
                  className="text-xs px-2 py-0.5 rounded transition-all flex-shrink-0"
                  style={{
                    border: "1px solid #e5ddd0",
                    color: "#9a9088",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#d4a843"; e.currentTarget.style.color = "#8a6018"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5ddd0"; e.currentTarget.style.color = "#9a9088"; }}
                  title="Re-read this page using Vision AI (useful if words look garbled)"
                >
                  🔍 Use Vision OCR
                </button>
              </div>
              {words.map((w, i) => {
                const isActive = i === activeWordIdx;
                const isStart = i === startWordIdx && activeWordIdx === -1;
                return (
                  <span
                    key={i}
                    onClick={() => onWordClick(i)}
                    className="inline transition-all duration-75 rounded px-0.5 mr-0.5 cursor-pointer"
                    title="Click to start reading from here"
                    style={
                      isActive
                        ? { background: "#d4a843", color: "#ffffff", fontWeight: 600 }
                        : isStart
                        ? { background: "rgba(212,168,67,0.18)", color: "#7a5010", fontWeight: 600, borderBottom: "2px solid #d4a843" }
                        : { color: "#2a2040" }
                    }
                  >
                    {w}{" "}
                  </span>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
