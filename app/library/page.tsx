"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAllSessions,
  deleteSession,
  relativeTime,
  formatBytes,
} from "@/lib/db";
import type { SessionMeta } from "@/lib/db";

function progressPct(session: SessionMeta): number {
  if (!session.totalPages) return 0;
  return Math.round(((session.lastPage - 1) / session.totalPages) * 100);
}

export default function LibraryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllSessions()
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    await deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  function handleResume(s: SessionMeta) {
    sessionStorage.setItem("pendingSessionId", s.id);
    router.push("/reader");
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,168,67,0.10) 0%, transparent 60%), #faf8f4",
      }}
    >
      <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "2rem 1rem" }}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                fontWeight: 700,
                margin: 0,
                background: "linear-gradient(135deg, #c49530 0%, #d4a843 50%, #c8680a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Library
            </h1>
            <p style={{ color: "#9a9088", fontSize: "0.875rem", margin: "4px 0 0" }}>
              Your reading history
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            style={{
              padding: "8px 18px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #d4a843, #c49535)",
              color: "#fff8ec",
              border: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            + Open PDF
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <p style={{ color: "#9a9088", textAlign: "center", padding: "3rem 0" }}>
            Loading…
          </p>
        )}

        {/* Empty state */}
        {!loading && sessions.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
            <p style={{ color: "#9a9088", marginBottom: "1rem" }}>
              No reading history yet
            </p>
            <Link
              href="/"
              style={{
                color: "#b8922e",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              Open your first PDF →
            </Link>
          </div>
        )}

        {/* Sessions grid */}
        {!loading && sessions.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            {sessions.map((s) => (
              <div
                key={s.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(212,168,67,0.3)",
                  borderRadius: "12px",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {/* File name */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    minWidth: 0,
                  }}
                >
                  <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>📄</span>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 500,
                      fontSize: "0.9rem",
                      color: "#1a1a2e",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={s.fileName}
                  >
                    {s.fileName}
                  </p>
                </div>

                {/* Meta */}
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#9a9088" }}>
                  Page {s.lastPage} of {s.totalPages}
                  <span style={{ margin: "0 6px", color: "#cec4b4" }}>·</span>
                  {relativeTime(s.lastRead)}
                  <span style={{ margin: "0 6px", color: "#cec4b4" }}>·</span>
                  {formatBytes(s.fileSize)}
                </p>

                {/* Progress bar */}
                <div
                  style={{
                    height: "4px",
                    borderRadius: "2px",
                    background: "#e8e0d0",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: "2px",
                      width: `${progressPct(s)}%`,
                      background: "linear-gradient(90deg, #d4a843, #e07a3a)",
                    }}
                  />
                </div>
                <p style={{ margin: 0, fontSize: "0.65rem", color: "#b0a898" }}>
                  {progressPct(s)}% read
                </p>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <button
                    onClick={() => handleResume(s)}
                    style={{
                      flex: 1,
                      padding: "7px 12px",
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #d4a843, #c49535)",
                      color: "#fff8ec",
                      border: "none",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "transform 0.15s",
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
                    onClick={() => handleDelete(s.id)}
                    style={{
                      padding: "7px 12px",
                      borderRadius: "8px",
                      background: "transparent",
                      border: "1px solid #e5ddd0",
                      color: "#9a9088",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      transition: "color 0.15s, border-color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#dc2626";
                      e.currentTarget.style.borderColor = "#dc2626";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#9a9088";
                      e.currentTarget.style.borderColor = "#e5ddd0";
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
