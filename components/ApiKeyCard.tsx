"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LANGUAGES, VOICES } from "@/lib/voices";
import type { Voice, VoiceTier } from "@/lib/voices";

interface Props {
  apiKey: string;
  ready: boolean; // true once parent's init useEffect has run
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
  // Suppress unused-variable warning — onSave kept in Props for caller compatibility
  useEffect(() => {}, []);

  return (
    <div
      className="rounded-xl border p-5"
      style={{
        background: "linear-gradient(145deg, #ffffff, #fdf9f3)",
        borderColor: "rgba(212,168,67,0.4)",
        boxShadow: "0 1px 12px rgba(212,168,67,0.1), 0 4px 20px rgba(0,0,0,0.04)",
      }}
    >
      {/* API key status row — compact link to Settings */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs" style={{ color: ready && apiKey ? "#16a34a" : "#9a9088" }}>
          {ready
            ? apiKey
              ? "🔑 API key active"
              : "🔑 No API key"
            : ""}
        </span>
        <Link
          href="/settings"
          className="text-xs font-medium transition-colors"
          style={{ color: "#b8922e" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#8a6018")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#b8922e")}
        >
          Manage in Settings →
        </Link>
      </div>

      {/* Language & Voice selection */}
      <div className="mt-3 pt-3" style={{ borderTop: "1px solid #e8e0d0" }}>
        <div className="flex gap-4 flex-wrap">
          {/* Language tabs */}
          <div className="flex flex-col gap-2">
            <span
              className="text-xs font-bold uppercase"
              style={{ color: "#9a9088", letterSpacing: "0.08em" }}
            >
              Language
            </span>
            <div className="flex gap-2 flex-wrap">
              {LANGUAGES.map((lang) => {
                const active = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => onLangChange(lang.code)}
                    className="font-medium transition-all"
                    style={{
                      padding: "7px 14px",
                      borderRadius: "10px",
                      fontSize: "0.92rem",
                      lineHeight: 1.3,
                      border: `1.5px solid ${active ? "#d4a843" : "#e5ddd0"}`,
                      background: active ? "rgba(212,168,67,0.1)" : "#f5f0e8",
                      color: active ? "#8a6018" : "#7a7080",
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice chips — grouped by tier */}
          <div className="flex flex-col gap-3">
            <span
              className="text-xs font-bold uppercase"
              style={{ color: "#9a9088", letterSpacing: "0.08em" }}
            >
              Voice
            </span>
            {(["Standard", "Wavenet", "Neural2", "Chirp3HD"] as VoiceTier[]).map((tier) => {
              const tierVoices = (VOICES[selectedLang] ?? []).filter((v) =>
                tier === "Standard"
                  ? !v.tier || v.tier === "Standard"
                  : v.tier === tier
              );
              if (!tierVoices.length) return null;

              const tierLabel =
                tier === "Wavenet" ? "WaveNet · HD"
                : tier === "Neural2" ? "Neural2 · AI"
                : tier === "Chirp3HD" ? "Chirp3 · HD"
                : "Standard";

              return (
                <div key={tier}>
                  {/* Tier header */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="text-[0.6rem] font-bold uppercase"
                      style={{ color: "#9a9088", letterSpacing: "0.07em" }}
                    >
                      {tierLabel}
                    </span>
                    <div style={{ flex: 1, height: 1, background: "#e8e0d0" }} />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {tierVoices.map((v) => {
                      const active = selectedVoice.name === v.name;
                      return (
                        <button
                          key={v.name}
                          onClick={() => onVoiceChange(v)}
                          className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all"
                          style={{
                            border: `1.5px solid ${active ? "#d4a843" : "#e5ddd0"}`,
                            background: active ? "rgba(212,168,67,0.1)" : "#f5f0e8",
                            color: active ? "#8a6018" : "#7a7080",
                          }}
                        >
                          {v.label}
                          <span
                            className="text-[0.6rem] font-bold px-1 rounded"
                            style={{
                              background:
                                v.g === "FEMALE"
                                  ? "rgba(219,39,119,0.1)"
                                  : "rgba(37,99,235,0.1)",
                              color: v.g === "FEMALE" ? "#be185d" : "#1d4ed8",
                            }}
                          >
                            {v.g === "FEMALE" ? "F" : "M"}
                          </span>
                          {tier === "Wavenet" && (
                            <span
                              className="text-[0.55rem] font-bold px-1 rounded"
                              style={{ background: "rgba(139,92,246,0.12)", color: "#7c3aed" }}
                            >
                              HD
                            </span>
                          )}
                          {tier === "Neural2" && (
                            <span
                              className="text-[0.55rem] font-bold px-1 rounded"
                              style={{ background: "rgba(6,182,212,0.12)", color: "#0891b2" }}
                            >
                              AI
                            </span>
                          )}
                          {tier === "Chirp3HD" && (
                            <span
                              className="text-[0.55rem] font-bold px-1 rounded"
                              style={{ background: "rgba(234,88,12,0.12)", color: "#c2410c" }}
                            >
                              HD+
                            </span>
                          )}
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
    </div>
  );
}
