"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import DropZone from "@/components/DropZone";
import {
  getAllSessions,
  saveSession,
  makeSessionId,
  relativeTime,
  formatBytes,
} from "@/lib/db";
import type { SessionMeta } from "@/lib/db";

function progressPct(session: SessionMeta): number {
  if (!session.totalPages) return 0;
  return Math.round(((session.lastPage - 1) / session.totalPages) * 100);
}

export default function LandingPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllSessions()
      .then((all) => setSessions(all.slice(0, 3)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleFile(file: File) {
    const buf = await file.arrayBuffer();

    // Load pdfjs-dist to get page count
    const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
    GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const doc = await getDocument({ data: buf.slice(0) }).promise;
    const totalPages = doc.numPages;
    await doc.destroy();

    const fileName = file.name.replace(/\.pdf$/i, "");
    const sid = makeSessionId(fileName, file.size);

    // Check for existing session to resume from last page
    const allSessions = await getAllSessions();
    const existing = allSessions.find((s) => s.id === sid);
    const targetPage = existing?.lastPage ?? 1;

    await saveSession(
      {
        id: sid,
        fileName,
        fileSize: file.size,
        lastPage: targetPage,
        totalPages,
        lastRead: Date.now(),
      },
      buf
    );

    sessionStorage.setItem("pendingSessionId", sid);
    router.push("/reader");
  }

  function handleResume(s: SessionMeta) {
    sessionStorage.setItem("pendingSessionId", s.id);
    router.push("/reader");
  }

  const FEATURES = [
    {
      icon: "🎙️",
      title: "Indian Voices",
      desc: "Standard voices in English, Hindi & Telugu from Google Cloud TTS",
    },
    {
      icon: "✨",
      title: "Natural Pacing",
      desc: "SSML-driven modes: Teaching, Fast, Story, Conversational",
    },
    {
      icon: "👁️",
      title: "OCR Support",
      desc: "Falls back to Google Vision API for scanned/image-based PDFs",
    },
  ];

  return (
    <div
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,168,67,0.18) 0%, transparent 60%), #faf8f4",
      }}
    >
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{ textAlign: "center", paddingTop: "4rem", paddingBottom: "3rem" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <Logo size={72} />
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.15,
            background: "linear-gradient(135deg, #c49530 0%, #d4a843 50%, #c8680a 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          PDF Narrator
        </h1>

        <p
          style={{
            marginTop: "0.6rem",
            fontSize: "0.95rem",
            color: "#9a9088",
            maxWidth: "480px",
            margin: "0.6rem auto 0",
            lineHeight: 1.6,
          }}
        >
          Reads PDFs aloud in 10 Indian languages · Natural pacing
          · Word-level highlighting
        </p>

        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => {
              document
                .getElementById("drop-zone-anchor")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #d4a843, #c49535)",
              color: "#fff8ec",
              border: "none",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "transform 0.15s, box-shadow 0.15s",
              boxShadow: "0 2px 12px rgba(212,168,67,0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(212,168,67,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(212,168,67,0.3)";
            }}
          >
            Open PDF
          </button>

          <button
            onClick={() => router.push("/library")}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              background: "transparent",
              color: "#b8922e",
              border: "1.5px solid rgba(212,168,67,0.5)",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s, transform 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(212,168,67,0.08)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            My Library
          </button>
        </div>
      </section>

      {/* ── Recent Sessions ───────────────────────────────────────────────── */}
      {!loading && sessions.length > 0 && (
        <section
          style={{
            maxWidth: "40rem",
            margin: "0 auto 2rem",
            padding: "0 1rem",
          }}
        >
          <p
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#b8922e",
              marginBottom: "0.75rem",
            }}
          >
            Continue Reading
          </p>

          <div
            style={{
              display: "flex",
              gap: "10px",
              overflowX: "auto",
              paddingBottom: "4px",
            }}
          >
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => handleResume(s)}
                style={{
                  flexShrink: 0,
                  width: "200px",
                  textAlign: "left",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#ffffff",
                  border: "1px solid rgba(212,168,67,0.25)",
                  cursor: "pointer",
                  transition: "box-shadow 0.15s, transform 0.15s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(212,168,67,0.15)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    color: "#1a1a2e",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={s.fileName}
                >
                  📄 {s.fileName}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "0.68rem", color: "#9a9088" }}>
                  p.{s.lastPage}/{s.totalPages}
                  <span style={{ margin: "0 4px", color: "#cec4b4" }}>·</span>
                  {relativeTime(s.lastRead)}
                </p>
                <div
                  style={{
                    marginTop: "6px",
                    height: "3px",
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
                      background: "#d4a843",
                    }}
                  />
                </div>
              </button>
            ))}
          </div>

          <div style={{ textAlign: "right", marginTop: "8px" }}>
            <Link
              href="/library"
              style={{ fontSize: "0.78rem", color: "#b8922e", textDecoration: "none" }}
            >
              View all →
            </Link>
          </div>
        </section>
      )}

      {/* ── Drop Zone ─────────────────────────────────────────────────────── */}
      <section
        id="drop-zone-anchor"
        style={{
          maxWidth: "40rem",
          margin: "0 auto 4rem",
          padding: "0 1rem",
        }}
      >
        <DropZone onFile={handleFile} />
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: "56rem",
          margin: "0 auto",
          padding: "0 1rem 3rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "1rem",
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                background: "#ffffff",
                border: "1px solid rgba(212,168,67,0.2)",
                borderRadius: "12px",
                padding: "1rem",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>{f.icon}</div>
              <p
                style={{
                  margin: "0 0 4px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: "#1a1a2e",
                }}
              >
                {f.title}
              </p>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#9a9088", lineHeight: 1.5 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
