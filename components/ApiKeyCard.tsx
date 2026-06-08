"use client";

import Link from "next/link";
import { LANGUAGES, VOICES } from "@/lib/voices";
import type { Voice, VoiceTier } from "@/lib/voices";

// English names shown as sublabels on each language tile
const LANG_EN: Record<string, string> = {
  "en-IN": "India",
  "hi-IN": "Hindi",
  "te-IN": "Telugu",
  "bn-IN": "Bengali",
  "gu-IN": "Gujarati",
  "kn-IN": "Kannada",
  "ml-IN": "Malayalam",
  "mr-IN": "Marathi",
  "ta-IN": "Tamil",
  "pa-IN": "Punjabi",
};

const TIER_META: Record<string, { label: string; badge: string; badgeColor: string; badgeBg: string }> = {
  Standard:  { label: "Standard",      badge: "",     badgeColor: "",        badgeBg: "" },
  Wavenet:   { label: "WaveNet · HD",  badge: "HD",   badgeColor: "#7c3aed", badgeBg: "rgba(139,92,246,0.12)" },
  Neural2:   { label: "Neural2 · AI",  badge: "AI",   badgeColor: "#0891b2", badgeBg: "rgba(6,182,212,0.12)" },
  Chirp3HD:  { label: "Chirp3 · HD+",  badge: "HD+",  badgeColor: "#c2410c", badgeBg: "rgba(234,88,12,0.12)" },
};

interface Props {
  apiKey: string;
  ready: boolean;
  onSave: (key: string) => void;
  selectedLang: string;
  selectedVoice: Voice;
  onLangChange: (lang: string) => void;
  onVoiceChange: (voice: Voice) => void;
}

export default function ApiKeyCard({
  apiKey,
  ready,
  selectedLang,
  selectedVoice,
  onLangChange,
  onVoiceChange,
}: Props) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        background: "linear-gradient(145deg, #ffffff, #fdf9f3)",
        borderColor: "rgba(212,168,67,0.4)",
        boxShadow: "0 1px 12px rgba(212,168,67,0.1), 0 4px 20px rgba(0,0,0,0.04)",
      }}
    >
      {/* API key status row */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="text-xs" style={{ color: ready && apiKey ? "#16a34a" : "#9a9088" }}>
          {ready ? (apiKey ? "🔑 API key active" : "🔑 No API key") : ""}
        </span>
        <Link
          href="/settings"
          className="text-xs font-medium"
          style={{ color: "#b8922e" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#8a6018")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#b8922e")}
        >
          Manage in Settings →
        </Link>
      </div>

      {/* ── Language ── */}
      <div className="mb-4">
        <p
          className="text-[0.6rem] font-bold uppercase mb-2"
          style={{ color: "#b8922e", letterSpacing: "0.1em" }}
        >
          Language
        </p>
        {/* 3-column uniform grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
          {LANGUAGES.map((lang) => {
            const active = selectedLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => onLangChange(lang.code)}
                className="transition-all"
                style={{
                  padding: "8px 4px 6px",
                  borderRadius: "10px",
                  border: `1.5px solid ${active ? "#d4a843" : "#e5ddd0"}`,
                  background: active ? "rgba(212,168,67,0.12)" : "#f5f0e8",
                  boxShadow: active ? "0 2px 8px rgba(212,168,67,0.2)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                  cursor: "pointer",
                }}
              >
                {/* Native script */}
                <span
                  style={{
                    fontSize: "1rem",
                    lineHeight: 1.2,
                    fontWeight: active ? 700 : 500,
                    color: active ? "#7a5010" : "#3a3050",
                  }}
                >
                  {lang.label}
                </span>
                {/* English sublabel */}
                <span
                  style={{
                    fontSize: "0.58rem",
                    color: active ? "#b8922e" : "#a09098",
                    letterSpacing: "0.02em",
                  }}
                >
                  {LANG_EN[lang.code] ?? ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Voice ── */}
      <div style={{ borderTop: "1px solid #e8e0d0", paddingTop: "12px" }}>
        <p
          className="text-[0.6rem] font-bold uppercase mb-3"
          style={{ color: "#b8922e", letterSpacing: "0.1em" }}
        >
          Voice
        </p>
        <div className="flex flex-col gap-3">
          {(["Standard", "Wavenet", "Neural2", "Chirp3HD"] as VoiceTier[]).map((tier) => {
            const tierVoices = (VOICES[selectedLang] ?? []).filter((v) =>
              tier === "Standard" ? !v.tier || v.tier === "Standard" : v.tier === tier
            );
            if (!tierVoices.length) return null;
            const meta = TIER_META[tier];
            const isChirp = tier === "Chirp3HD";

            return (
              <div key={tier}>
                {/* Tier header */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    style={{
                      fontSize: "0.58rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      color: "#9a9088",
                    }}
                  >
                    {meta.label}
                  </span>
                  <div style={{ flex: 1, height: 1, background: "#e8e0d0" }} />
                </div>

                {/* Voice chip grid — 4-col for Chirp3HD (lots of voices), 3-col otherwise */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isChirp ? "repeat(4, 1fr)" : "repeat(3, 1fr)",
                    gap: "5px",
                  }}
                >
                  {tierVoices.map((v) => {
                    const active = selectedVoice.name === v.name;
                    const isFemale = v.g === "FEMALE";
                    return (
                      <button
                        key={v.name}
                        onClick={() => onVoiceChange(v)}
                        className="transition-all"
                        style={{
                          padding: isChirp ? "5px 3px" : "6px 4px",
                          borderRadius: "8px",
                          border: `1.5px solid ${active ? "#d4a843" : "#e5ddd0"}`,
                          background: active ? "rgba(212,168,67,0.12)" : "#f5f0e8",
                          boxShadow: active ? "0 2px 6px rgba(212,168,67,0.18)" : "none",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "3px",
                          cursor: "pointer",
                        }}
                      >
                        {/* Name */}
                        <span
                          style={{
                            fontSize: isChirp ? "0.62rem" : "0.72rem",
                            fontWeight: active ? 600 : 400,
                            color: active ? "#8a6018" : "#4a4060",
                            lineHeight: 1,
                          }}
                        >
                          {v.label}
                        </span>
                        {/* Gender + tier badges */}
                        <span style={{ display: "flex", gap: "2px", alignItems: "center" }}>
                          <span
                            style={{
                              fontSize: "0.52rem",
                              fontWeight: 700,
                              padding: "1px 3px",
                              borderRadius: "3px",
                              background: isFemale ? "rgba(219,39,119,0.1)" : "rgba(37,99,235,0.1)",
                              color: isFemale ? "#be185d" : "#1d4ed8",
                              lineHeight: 1,
                            }}
                          >
                            {isFemale ? "F" : "M"}
                          </span>
                          {meta.badge && (
                            <span
                              style={{
                                fontSize: "0.5rem",
                                fontWeight: 700,
                                padding: "1px 3px",
                                borderRadius: "3px",
                                background: meta.badgeBg,
                                color: meta.badgeColor,
                                lineHeight: 1,
                              }}
                            >
                              {meta.badge}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
