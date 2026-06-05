"use client";

import { RefObject } from "react";

interface Props {
  canvasRef: RefObject<HTMLCanvasElement>;
  fileName: string;
  curPage: number;
  totalPages: number;
  words: string[];
  activeWordIdx: number;
  isPageBookmarked: boolean;
  onPrev: () => void;
  onNext: () => void;
  onBookmarkToggle: () => void;
}

export default function PdfViewer({
  canvasRef,
  fileName,
  curPage,
  totalPages,
  words,
  activeWordIdx,
  isPageBookmarked,
  onPrev,
  onNext,
  onBookmarkToggle,
}: Props) {
  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: "#ffffff",
        border: "1px solid #e5ddd0",
        boxShadow: "0 2px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
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
          <span
            className="text-xs px-2 py-1 rounded"
            style={{ color: "#7a7080", background: "#ede8df" }}
          >
            {curPage} / {totalPages}
          </span>
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

      {/* Word highlight strip */}
      {words.length > 0 && (
        <div
          className="px-4 py-3 overflow-y-auto text-sm leading-loose"
          style={{
            maxHeight: "120px",
            background: "#faf8f4",
            borderTop: "1px solid #e8e0d0",
          }}
        >
          {words.map((w, i) => (
            <span
              key={i}
              className="inline transition-all duration-75 rounded px-0.5 mr-0.5"
              style={
                i === activeWordIdx
                  ? {
                      background: "#d4a843",
                      color: "#ffffff",
                      fontWeight: 600,
                    }
                  : { color: "#1a1a2e" }
              }
            >
              {w}{" "}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
