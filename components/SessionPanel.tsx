"use client";

import { relativeTime, formatBytes } from "@/lib/db";
import type { SessionMeta } from "@/lib/db";

interface Props {
  sessions: SessionMeta[];
  onResume: (session: SessionMeta) => void;
  onDelete: (id: string) => void;
}

function progressPct(session: SessionMeta) {
  if (!session.totalPages) return 0;
  return Math.round(((session.lastPage - 1) / session.totalPages) * 100);
}

export default function SessionPanel({ sessions, onResume, onDelete }: Props) {
  if (sessions.length === 0) return null;

  const [latest, ...rest] = sessions;

  return (
    <div className="mb-4 space-y-3" style={{ animation: "slideUp 0.35s ease-out" }}>
      {/* ── Resume banner ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #fffbf0, #fdf5e0)",
          border: "1.5px solid rgba(212,168,67,0.45)",
          boxShadow: "0 2px 16px rgba(212,168,67,0.12)",
        }}
      >
        {/* Gold accent bar */}
        <div
          className="h-0.5 w-full"
          style={{ background: "linear-gradient(90deg, #d4a843, #e07a3a)" }}
        />

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <span className="text-2xl mt-0.5 flex-shrink-0">📖</span>
              <div className="min-w-0">
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-1"
                  style={{ color: "#b8922e" }}
                >
                  Continue Reading
                </p>
                <p
                  className="font-serif text-base font-normal truncate"
                  style={{ color: "#1a1a2e", maxWidth: "320px" }}
                  title={latest.fileName}
                >
                  {latest.fileName}
                </p>
                <p className="text-xs mt-1" style={{ color: "#9a9088" }}>
                  Page {latest.lastPage} of {latest.totalPages}
                  <span className="mx-1.5" style={{ color: "#cec4b4" }}>·</span>
                  {relativeTime(latest.lastRead)}
                  <span className="mx-1.5" style={{ color: "#cec4b4" }}>·</span>
                  {formatBytes(latest.fileSize)}
                </p>

                {/* Progress bar */}
                <div
                  className="mt-2 h-1 rounded-full overflow-hidden"
                  style={{ background: "#e8e0d0", width: "200px", maxWidth: "100%" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${progressPct(latest)}%`,
                      background: "linear-gradient(90deg, #d4a843, #e07a3a)",
                    }}
                  />
                </div>
                <p className="text-[0.65rem] mt-1" style={{ color: "#b0a898" }}>
                  {progressPct(latest)}% read
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={() => onResume(latest)}
                className="px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap"
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
                ▶ Resume
              </button>
              <button
                onClick={() => onDelete(latest.id)}
                className="px-4 py-1.5 rounded-full text-xs transition-all"
                style={{
                  background: "transparent",
                  border: "1px solid #e5ddd0",
                  color: "#9a9088",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#dc2626";
                  e.currentTarget.style.color = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5ddd0";
                  e.currentTarget.style.color = "#9a9088";
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent files grid ── */}
      {rest.length > 0 && (
        <div>
          <p
            className="text-xs font-bold uppercase mb-2"
            style={{ color: "#b0a898", letterSpacing: "0.1em" }}
          >
            Recent
          </p>
          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
            {rest.map((s) => (
              <div
                key={s.id}
                className="rounded-xl p-3 group"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e8e0d0",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => onResume(s)}
                    className="text-left min-w-0 flex-1"
                  >
                    <p
                      className="text-xs font-medium truncate"
                      style={{ color: "#1a1a2e" }}
                      title={s.fileName}
                    >
                      📄 {s.fileName}
                    </p>
                    <p className="text-[0.65rem] mt-1" style={{ color: "#9a9088" }}>
                      p.{s.lastPage}/{s.totalPages}
                      <span className="mx-1" style={{ color: "#cec4b4" }}>·</span>
                      {relativeTime(s.lastRead)}
                    </p>
                    {/* Mini progress */}
                    <div
                      className="mt-1.5 h-0.5 rounded-full overflow-hidden"
                      style={{ background: "#e8e0d0" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${progressPct(s)}%`,
                          background: "#d4a843",
                        }}
                      />
                    </div>
                  </button>
                  <button
                    onClick={() => onDelete(s.id)}
                    className="text-xs flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "#cec4b4" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#cec4b4")}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
