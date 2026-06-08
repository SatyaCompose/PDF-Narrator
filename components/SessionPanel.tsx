"use client";

import { relativeTime, formatBytes } from "@/lib/db";
import type { SessionMeta } from "@/lib/db";

interface Props {
  sessions: SessionMeta[];
  onResume: (session: SessionMeta) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
}

function progressPct(s: SessionMeta) {
  if (!s.totalPages) return 0;
  return Math.round(((s.lastPage - 1) / s.totalPages) * 100);
}

function PinButton({ pinned, onClick }: { pinned: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={pinned ? "Unpin (allow auto-removal)" : "Pin to My Library (keep forever)"}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "1rem",
        lineHeight: 1,
        padding: "2px",
        opacity: pinned ? 1 : 0.35,
        transition: "opacity 0.15s, transform 0.15s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1.2)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = pinned ? "1" : "0.35"; e.currentTarget.style.transform = "scale(1)"; }}
    >
      📌
    </button>
  );
}

export default function SessionPanel({ sessions, onResume, onDelete, onPin, onUnpin }: Props) {
  if (sessions.length === 0) return null;

  const pinned = sessions.filter((s) => s.pinned);
  const recent = sessions.filter((s) => !s.pinned);

  return (
    <div className="mb-4" style={{ animation: "slideUp 0.35s ease-out" }}>

      {/* ── My Library (pinned) ── */}
      {pinned.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <p
              className="text-xs font-bold uppercase"
              style={{ color: "#b8922e", letterSpacing: "0.1em" }}
            >
              📌 My Library
            </p>
            <span
              className="text-[0.6rem] px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(212,168,67,0.15)", color: "#9a7020" }}
            >
              Saved permanently
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {pinned.map((s) => (
              <div
                key={s.id}
                className="rounded-xl overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #fffbf0, #fdf5e0)",
                  border: "1.5px solid rgba(212,168,67,0.4)",
                  boxShadow: "0 2px 10px rgba(212,168,67,0.1)",
                }}
              >
                <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #d4a843, #e07a3a)" }} />
                <div className="p-3">
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5 flex-shrink-0">📖</span>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => onResume(s)}
                        className="text-left w-full"
                      >
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: "#1a1a2e" }}
                          title={s.fileName}
                        >
                          {s.fileName}
                        </p>
                        <p className="text-[0.65rem] mt-0.5" style={{ color: "#9a9088" }}>
                          Page {s.lastPage} / {s.totalPages}
                          <span className="mx-1.5" style={{ color: "#cec4b4" }}>·</span>
                          {formatBytes(s.fileSize)}
                          <span className="mx-1.5" style={{ color: "#cec4b4" }}>·</span>
                          {relativeTime(s.lastRead)}
                        </p>
                        <div
                          className="mt-1.5 h-1 rounded-full overflow-hidden"
                          style={{ background: "#e8e0d0" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${progressPct(s)}%`,
                              background: "linear-gradient(90deg, #d4a843, #e07a3a)",
                            }}
                          />
                        </div>
                        <p className="text-[0.6rem] mt-0.5" style={{ color: "#b0a898" }}>
                          {progressPct(s)}% read
                        </p>
                      </button>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <PinButton pinned onClick={() => onUnpin(s.id)} />
                      <button
                        onClick={() => onResume(s)}
                        className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all"
                        style={{ background: "linear-gradient(135deg, #d4a843, #e07a3a)", color: "#fff8ec" }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                      >
                        ▶ Open
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent (unpinned) ── */}
      {recent.length > 0 && (
        <div>
          {pinned.length > 0 && (
            <p
              className="text-xs font-bold uppercase mb-2"
              style={{ color: "#b0a898", letterSpacing: "0.1em" }}
            >
              Recent
            </p>
          )}

          {/* First recent item gets the resume banner if nothing is pinned */}
          {pinned.length === 0 && recent.length > 0 && (() => {
            const [latest, ...rest] = recent;
            return (
              <>
                <div
                  className="rounded-2xl overflow-hidden mb-3"
                  style={{
                    background: "linear-gradient(135deg, #fffbf0, #fdf5e0)",
                    border: "1.5px solid rgba(212,168,67,0.45)",
                    boxShadow: "0 2px 16px rgba(212,168,67,0.12)",
                  }}
                >
                  <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #d4a843, #e07a3a)" }} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-2xl mt-0.5 flex-shrink-0">📖</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#b8922e" }}>
                            Continue Reading
                          </p>
                          <p
                            className="font-serif text-base font-normal truncate"
                            style={{ color: "#1a1a2e", maxWidth: "220px" }}
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
                          <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "#e8e0d0", width: "200px", maxWidth: "100%" }}>
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${progressPct(latest)}%`, background: "linear-gradient(90deg, #d4a843, #e07a3a)" }}
                            />
                          </div>
                          <p className="text-[0.65rem] mt-1" style={{ color: "#b0a898" }}>
                            {progressPct(latest)}% read
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <PinButton pinned={false} onClick={() => onPin(latest.id)} />
                        <button
                          onClick={() => onResume(latest)}
                          className="px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap"
                          style={{ background: "linear-gradient(135deg, #d4a843, #e07a3a)", color: "#fff8ec" }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                        >
                          ▶ Resume
                        </button>
                        <button
                          onClick={() => onDelete(latest.id)}
                          className="px-4 py-1.5 rounded-full text-xs transition-all"
                          style={{ background: "transparent", border: "1px solid #e5ddd0", color: "#9a9088" }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#dc2626"; e.currentTarget.style.color = "#dc2626"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5ddd0"; e.currentTarget.style.color = "#9a9088"; }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {rest.length > 0 && (
                  <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                    {rest.map((s) => (
                      <RecentCard key={s.id} s={s} onResume={onResume} onDelete={onDelete} onPin={onPin} />
                    ))}
                  </div>
                )}
              </>
            );
          })()}

          {/* When pinned PDFs exist, show all recent as small cards */}
          {pinned.length > 0 && (
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
              {recent.map((s) => (
                <RecentCard key={s.id} s={s} onResume={onResume} onDelete={onDelete} onPin={onPin} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RecentCard({
  s, onResume, onDelete, onPin,
}: {
  s: SessionMeta;
  onResume: (s: SessionMeta) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
}) {
  return (
    <div
      className="rounded-xl p-3 group"
      style={{ background: "#ffffff", border: "1px solid #e8e0d0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <button onClick={() => onResume(s)} className="text-left min-w-0 flex-1">
          <p className="text-xs font-medium truncate" style={{ color: "#1a1a2e" }} title={s.fileName}>
            📄 {s.fileName}
          </p>
          <p className="text-[0.65rem] mt-1" style={{ color: "#9a9088" }}>
            p.{s.lastPage}/{s.totalPages}
            <span className="mx-1" style={{ color: "#cec4b4" }}>·</span>
            {relativeTime(s.lastRead)}
          </p>
          <div className="mt-1.5 h-0.5 rounded-full overflow-hidden" style={{ background: "#e8e0d0" }}>
            <div className="h-full rounded-full" style={{ width: `${progressPct(s)}%`, background: "#d4a843" }} />
          </div>
        </button>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <PinButton pinned={false} onClick={() => onPin(s.id)} />
          <button
            onClick={() => onDelete(s.id)}
            className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "#cec4b4" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#cec4b4")}
            title="Remove"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
