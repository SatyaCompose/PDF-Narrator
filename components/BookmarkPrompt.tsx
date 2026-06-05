"use client";

import { useEffect, useState } from "react";

interface Props {
  page: number;
  fileName: string;
  visible: boolean;
  onBookmark: (label: string) => void;
  onDismiss: () => void;
}

export default function BookmarkPrompt({
  page,
  fileName,
  visible,
  onBookmark,
  onDismiss,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(`Page ${page}`);

  // Reset label whenever the prompt opens for a new page
  useEffect(() => {
    setLabel(`Page ${page}`);
    setEditing(false);
  }, [page, visible]);

  // Auto-dismiss after 12 seconds if user ignores it
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDismiss, 12000);
    return () => clearTimeout(t);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      style={{ animation: "slideUp 0.3s ease-out" }}
    >
      <div
        className="rounded-2xl px-5 py-4 flex items-center gap-4 flex-wrap"
        style={{
          background: "#ffffff",
          border: "1.5px solid rgba(212,168,67,0.4)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(212,168,67,0.12)",
          minWidth: "320px",
          maxWidth: "480px",
        }}
      >
        <span className="text-xl flex-shrink-0">📌</span>

        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              autoFocus
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onBookmark(label || `Page ${page}`);
                if (e.key === "Escape") setEditing(false);
              }}
              className="w-full text-sm rounded-lg px-3 py-1.5 outline-none"
              style={{
                background: "#f5f0e8",
                border: "1.5px solid #d4a843",
                color: "#1a1a2e",
              }}
              placeholder={`Page ${page}`}
            />
          ) : (
            <div>
              <p className="text-sm font-medium" style={{ color: "#1a1a2e" }}>
                Save your spot?
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "#9a9088" }}>
                {fileName} · page {page}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {editing ? (
            <button
              onClick={() => onBookmark(label || `Page ${page}`)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, #d4a843, #e07a3a)",
                color: "#fff8ec",
              }}
            >
              Save
            </button>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: "linear-gradient(135deg, #d4a843, #e07a3a)",
                  color: "#fff8ec",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-1px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                🔖 Bookmark
              </button>
              <button
                onClick={onDismiss}
                className="px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  background: "#f5f0e8",
                  border: "1px solid #e5ddd0",
                  color: "#9a9088",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "#1a1a2e")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#9a9088")
                }
              >
                Not now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
