"use client";

import { useState, useEffect } from "react";
import { testApiKey } from "@/lib/tts";
import { LANGUAGES, VOICES } from "@/lib/voices";
import type { Voice } from "@/lib/voices";
import {
  getUsage,
  getWarnings,
  FREE_TIER,
} from "@/lib/usageTracker";
import type { UsageRecord, UsageWarning } from "@/lib/usageTracker";

export default function SettingsPage() {
  // ── API Key state ─────────────────────────────────────────────────────────
  const [apiInput, setApiInput] = useState("");
  const [apiMsg, setApiMsg] = useState<{ text: string; type: "ok" | "err" | "neutral" }>({
    text: "No key loaded yet.",
    type: "neutral",
  });
  const [testing, setTesting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // ── Usage state ───────────────────────────────────────────────────────────
  const [usage, setUsage] = useState<UsageRecord | null>(null);
  const [warnings, setWarnings] = useState<UsageWarning[]>([]);

  // ── Voice & Language state ────────────────────────────────────────────────
  const [selLang, setSelLang] = useState("en-IN");
  const [selVoice, setSelVoice] = useState<Voice>(VOICES["en-IN"][0]);
  const [voiceSaved, setVoiceSaved] = useState(false);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Load API key from cookie
    try {
      const match = document.cookie.match(/(?:^|;\s*)gcp_key=([^;]*)/);
      if (match) {
        const k = atob(decodeURIComponent(match[1]));
        setApiInput(k);
        setApiMsg({ text: "✓ Key loaded from saved settings.", type: "ok" });
        setShowHelp(false);
      } else {
        setShowHelp(true);
      }
    } catch {
      setShowHelp(true);
    }

    // Load usage
    const u = getUsage();
    setUsage(u);
    setWarnings(getWarnings());

    // Load voice/lang from localStorage
    try {
      const lsLang = localStorage.getItem("ls_lang");
      if (lsLang) setSelLang(lsLang);
      const lsVoice = localStorage.getItem("ls_voice");
      if (lsVoice) {
        const v = JSON.parse(lsVoice) as Voice;
        setSelVoice(v);
      }
    } catch {
      // ignore
    }
  }, []);

  // ── API key save & test ───────────────────────────────────────────────────
  async function handleSaveKey() {
    const k = apiInput.trim();
    if (!k) {
      setApiMsg({ text: "Please paste your API key.", type: "err" });
      return;
    }
    setTesting(true);
    setApiMsg({ text: "Testing key…", type: "neutral" });
    try {
      await testApiKey(k);
      const encoded = encodeURIComponent(btoa(k));
      document.cookie = `gcp_key=${encoded}; path=/; SameSite=Strict; max-age=2592000`;
      setApiMsg({ text: "✓ Works! Key saved. Indian Standard voices are active.", type: "ok" });
      setShowHelp(false);
    } catch (e) {
      setApiMsg({
        text: "✗ " + (e instanceof Error ? e.message : "Invalid key"),
        type: "err",
      });
    } finally {
      setTesting(false);
    }
  }

  // ── Voice & Lang save ─────────────────────────────────────────────────────
  function handleSaveVoice() {
    try {
      localStorage.setItem("ls_lang", selLang);
      localStorage.setItem("ls_voice", JSON.stringify(selVoice));
      setVoiceSaved(true);
      setTimeout(() => setVoiceSaved(false), 2000);
    } catch {
      // ignore
    }
  }

  function handleLangChange(lang: string) {
    setSelLang(lang);
    setSelVoice(VOICES[lang][0]);
    setVoiceSaved(false);
  }

  const msgColor =
    apiMsg.type === "ok" ? "#16a34a" : apiMsg.type === "err" ? "#dc2626" : "#9a9088";

  const cardStyle: React.CSSProperties = {
    background: "linear-gradient(145deg, #ffffff, #fdf9f3)",
    border: "1px solid rgba(212,168,67,0.3)",
    borderRadius: "12px",
    padding: "1.25rem",
    marginBottom: "1rem",
    boxShadow: "0 1px 12px rgba(212,168,67,0.08), 0 4px 20px rgba(0,0,0,0.04)",
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,168,67,0.10) 0%, transparent 60%), #faf8f4",
      }}
    >
      <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "2rem 1rem" }}>
        {/* Page heading */}
        <div style={{ marginBottom: "1.5rem" }}>
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
            Settings
          </h1>
          <p style={{ color: "#9a9088", fontSize: "0.875rem", margin: "4px 0 0" }}>
            API key, language, and voice preferences
          </p>
        </div>

        {/* Warning banners */}
        {warnings.map((w) => (
          <div
            key={w.id}
            style={{
              marginBottom: "0.75rem",
              padding: "10px 14px",
              borderRadius: "10px",
              background: w.exceeded ? "rgba(224,85,85,0.08)" : "rgba(224,122,58,0.08)",
              border: `1.5px solid ${w.exceeded ? "#e05555" : "#e07a3a"}`,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.82rem",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>{w.exceeded ? "🚨" : "⚠️"}</span>
            <span style={{ color: w.exceeded ? "#c0392b" : "#b85a1a", fontWeight: 600 }}>
              {w.exceeded
                ? `${w.label} free tier exceeded (${Math.round(w.pct * 100)}%) — you may be charged.`
                : `${w.label} at ${Math.round(w.pct * 100)}% of free tier — approaching the monthly limit.`}
            </span>
          </div>
        ))}

        {/* Section 1 — API Key */}
        <div style={cardStyle}>
          <p
            style={{
              margin: "0 0 0.75rem",
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#b8922e",
            }}
          >
            🔑 Google Cloud API Key
          </p>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="password"
              placeholder="AIzaSy…"
              value={apiInput}
              onChange={(e) => setApiInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveKey()}
              autoComplete="off"
              style={{
                flex: 1,
                minWidth: "160px",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1.5px solid #e5ddd0",
                background: "#f5f0e8",
                color: "#1a1a2e",
                fontSize: "0.82rem",
                fontFamily: "monospace",
                outline: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#d4a843")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e5ddd0")}
            />
            <button
              onClick={handleSaveKey}
              disabled={testing}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: testing ? "#c49530" : "linear-gradient(135deg, #d4a843, #c49535)",
                color: "#fff8ec",
                border: "none",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: testing ? "not-allowed" : "pointer",
                opacity: testing ? 0.7 : 1,
                whiteSpace: "nowrap",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!testing) e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {testing ? "Testing…" : "Save & Test"}
            </button>
          </div>

          <p style={{ margin: "8px 0 0", fontSize: "0.75rem", color: msgColor }}>
            {apiMsg.text}
          </p>

          <button
            onClick={() => setShowHelp((s) => !s)}
            style={{
              marginTop: "10px",
              background: "none",
              border: "none",
              fontSize: "0.75rem",
              color: "#9a9088",
              cursor: "pointer",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#b8922e")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9a9088")}
          >
            {showHelp ? "▼ Hide setup guide" : "▶ How to get a free API key"}
          </button>

          {showHelp && (
            <div
              style={{
                marginTop: "10px",
                padding: "12px",
                borderRadius: "8px",
                background: "#faf6ee",
                borderLeft: "3px solid #d4a843",
                fontSize: "0.75rem",
                color: "#7a7080",
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: "#1a1a2e" }}>Free key in 3 minutes:</strong>
              <br />
              1.{" "}
              <a
                href="https://console.cloud.google.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#b8922e" }}
              >
                console.cloud.google.com
              </a>{" "}
              → Create a project
              <br />
              2. Search{" "}
              <code
                style={{
                  background: "rgba(212,168,67,0.12)",
                  fontFamily: "monospace",
                  color: "#8a6018",
                  borderRadius: "3px",
                  padding: "1px 4px",
                }}
              >
                Cloud Text-to-Speech API
              </code>{" "}
              → <strong>Enable</strong>
              <br />
              3. <strong>APIs &amp; Services → Credentials → Create API Key</strong> → paste above
              <br />
              <span style={{ color: "#b0a898", marginTop: "4px", display: "block" }}>
                Free tier:{" "}
                <strong style={{ color: "#7a7080" }}>4 million Standard chars/month</strong>
              </span>
            </div>
          )}
        </div>

        {/* Section 2 — Voice & Language */}
        <div style={cardStyle}>
          <p
            style={{
              margin: "0 0 0.75rem",
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#b8922e",
            }}
          >
            🎙️ Voice &amp; Language
          </p>

          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            {/* Language tabs */}
            <div>
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#9a9088",
                }}
              >
                Language
              </p>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {LANGUAGES.map((lang) => {
                  const active = selLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleLangChange(lang.code)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: `1.5px solid ${active ? "#d4a843" : "#e5ddd0"}`,
                        background: active ? "rgba(212,168,67,0.1)" : "#f5f0e8",
                        color: active ? "#8a6018" : "#7a7080",
                        fontSize: "0.78rem",
                        fontWeight: active ? 600 : 400,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {lang.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Voice chips */}
            <div>
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#9a9088",
                }}
              >
                Voice
              </p>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {VOICES[selLang]?.map((v) => {
                  const active = selVoice.name === v.name;
                  return (
                    <button
                      key={v.name}
                      onClick={() => {
                        setSelVoice(v);
                        setVoiceSaved(false);
                      }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: `1.5px solid ${active ? "#d4a843" : "#e5ddd0"}`,
                        background: active ? "rgba(212,168,67,0.1)" : "#f5f0e8",
                        color: active ? "#8a6018" : "#7a7080",
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.15s",
                      }}
                    >
                      {v.label}
                      <span
                        style={{
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          padding: "1px 4px",
                          borderRadius: "3px",
                          background:
                            v.g === "FEMALE"
                              ? "rgba(219,39,119,0.1)"
                              : "rgba(37,99,235,0.1)",
                          color: v.g === "FEMALE" ? "#be185d" : "#1d4ed8",
                        }}
                      >
                        {v.g === "FEMALE" ? "F" : "M"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={handleSaveVoice}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #d4a843, #c49535)",
                color: "#fff8ec",
                border: "none",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              Save Defaults
            </button>
            {voiceSaved && (
              <span style={{ fontSize: "0.78rem", color: "#16a34a" }}>
                ✓ Saved as default
              </span>
            )}
          </div>
          <p style={{ margin: "6px 0 0", fontSize: "0.72rem", color: "#b0a898" }}>
            These become the default voice in the Reader. You can still change them per session.
          </p>
        </div>
        {/* Section 3 — Usage This Month */}
        {usage && (
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1rem" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#b8922e",
                }}
              >
                📊 Usage This Month
              </p>
              <span style={{ fontSize: "0.68rem", color: "#b0a898" }}>
                Resets on the 1st · {usage.month}
              </span>
            </div>

            {/* TTS rows */}
            {(
              [
                { id: "Standard",  label: "Standard voices",  limit: FREE_TIER.Standard,  used: usage.Standard  },
                { id: "Wavenet",   label: "WaveNet voices",   limit: FREE_TIER.Wavenet,   used: usage.Wavenet   },
                { id: "Neural2",   label: "Neural2 voices",   limit: FREE_TIER.Neural2,   used: usage.Neural2   },
                { id: "Chirp3HD",  label: "Chirp3-HD voices", limit: FREE_TIER.Chirp3HD,  used: usage.Chirp3HD  },
              ] as { id: string; label: string; limit: number; used: number }[]
            ).map(({ id, label, limit, used }) => {
              const pct = Math.min(used / limit, 1);
              const over = used > limit;
              const warn = pct >= 0.8;
              const barColor = over
                ? "#e05555"
                : warn
                ? "#e07a3a"
                : "#d4a843";
              return (
                <div key={id} style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.78rem", color: warn ? (over ? "#c0392b" : "#b85a1a") : "#5a5060", fontWeight: warn ? 600 : 400 }}>
                      {label}
                      {over && <span style={{ marginLeft: "6px", fontSize: "0.65rem", background: "#e05555", color: "#fff", borderRadius: "3px", padding: "1px 5px" }}>EXCEEDED</span>}
                      {!over && warn && <span style={{ marginLeft: "6px", fontSize: "0.65rem", background: "#e07a3a", color: "#fff", borderRadius: "3px", padding: "1px 5px" }}>NEAR LIMIT</span>}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#9a9088" }}>
                      {used.toLocaleString()} / {(limit / 1_000_000).toFixed(0)}M chars
                    </span>
                  </div>
                  <div style={{ height: "6px", borderRadius: "3px", background: "#e8e0d0", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct * 100}%`, borderRadius: "3px", background: barColor, transition: "width 0.4s" }} />
                  </div>
                </div>
              );
            })}

            {/* Vision row */}
            {(() => {
              const used = usage.Vision;
              const limit = FREE_TIER.Vision;
              const pct = Math.min(used / limit, 1);
              const over = used > limit;
              const warn = pct >= 0.8;
              const barColor = over ? "#e05555" : warn ? "#e07a3a" : "#4a8fff";
              return (
                <div style={{ marginBottom: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.78rem", color: warn ? (over ? "#c0392b" : "#b85a1a") : "#5a5060", fontWeight: warn ? 600 : 400 }}>
                      Vision OCR (scanned PDFs)
                      {over && <span style={{ marginLeft: "6px", fontSize: "0.65rem", background: "#e05555", color: "#fff", borderRadius: "3px", padding: "1px 5px" }}>EXCEEDED</span>}
                      {!over && warn && <span style={{ marginLeft: "6px", fontSize: "0.65rem", background: "#e07a3a", color: "#fff", borderRadius: "3px", padding: "1px 5px" }}>NEAR LIMIT</span>}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#9a9088" }}>
                      {used.toLocaleString()} / {limit.toLocaleString()} pages
                    </span>
                  </div>
                  <div style={{ height: "6px", borderRadius: "3px", background: "#e8e0d0", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct * 100}%`, borderRadius: "3px", background: barColor, transition: "width 0.4s" }} />
                  </div>
                </div>
              );
            })()}

            <p style={{ margin: "10px 0 0", fontSize: "0.68rem", color: "#b0a898", lineHeight: 1.5 }}>
              Character counts include SSML markup. Vision OCR only triggers for scanned/image PDFs.
              <br />
              Free tier limits: Standard 4M · WaveNet / Neural2 / Chirp3-HD 1M chars · Vision 1K pages per month.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
