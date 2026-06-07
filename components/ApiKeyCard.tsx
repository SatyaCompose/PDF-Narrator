"use client";

import { useState, useEffect } from "react";
import { testApiKey } from "@/lib/tts";
import { LANGUAGES, VOICES } from "@/lib/voices";
import type { Voice } from "@/lib/voices";

interface Props {
  apiKey: string;
  onSave: (key: string) => void;
  selectedLang: string;
  selectedVoice: Voice;
  onLangChange: (lang: string) => void;
  onVoiceChange: (voice: Voice) => void;
}

export default function ApiKeyCard({
  apiKey,
  onSave,
  selectedLang,
  selectedVoice,
  onLangChange,
  onVoiceChange,
}: Props) {
  const [input, setInput] = useState(apiKey);
  const [msg, setMsg] = useState<{ text: string; type: "ok" | "err" | "neutral" }>(
    apiKey
      ? { text: "✓ Key loaded. Indian Standard voices ready.", type: "ok" }
      : { text: "No key — paste your API key above to activate Indian voices", type: "neutral" }
  );
  const [testing, setTesting] = useState(false);
  const [showHelp, setShowHelp] = useState(!apiKey);

  useEffect(() => {
    if (apiKey) {
      setInput(apiKey);
      setMsg({ text: "✓ Key loaded. Indian Standard voices ready.", type: "ok" });
      setShowHelp(false);
    }
  }, [apiKey]);

  async function handleSave() {
    const k = input.trim();
    if (!k) {
      setMsg({ text: "Please paste your API key.", type: "err" });
      return;
    }
    setTesting(true);
    setMsg({ text: "Testing key…", type: "neutral" });
    try {
      await testApiKey(k);
      onSave(k);
      setMsg({ text: "✓ Works! Standard Indian voices are active.", type: "ok" });
      setShowHelp(false);
    } catch (e) {
      setMsg({
        text: "✗ " + (e instanceof Error ? e.message : "Invalid key"),
        type: "err",
      });
    } finally {
      setTesting(false);
    }
  }

  const msgColor =
    msg.type === "ok" ? "#16a34a" : msg.type === "err" ? "#dc2626" : "#9a9088";

  return (
    <div
      className="rounded-xl border p-5 mb-4"
      style={{
        background: "linear-gradient(145deg, #ffffff, #fdf9f3)",
        borderColor: "rgba(212,168,67,0.4)",
        boxShadow: "0 1px 12px rgba(212,168,67,0.1), 0 4px 20px rgba(0,0,0,0.04)",
      }}
    >
      {/* API Row */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className="text-xs font-bold whitespace-nowrap"
          style={{ color: "#b8922e", letterSpacing: "0.06em", textTransform: "uppercase" }}
        >
          🔑 Google Cloud API Key
        </span>
        <input
          type="password"
          className="flex-1 min-w-[160px] px-3 py-2 rounded-lg text-sm font-mono outline-none transition-all"
          placeholder="AIzaSy…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          autoComplete="off"
          style={{
            background: "#f5f0e8",
            border: "1.5px solid #e5ddd0",
            color: "#1a1a2e",
            fontSize: "0.82rem",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#d4a843")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#e5ddd0")}
        />
        <button
          onClick={handleSave}
          disabled={testing}
          className="px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap disabled:opacity-50"
          style={{
            background: testing
              ? "#c49530"
              : "linear-gradient(135deg, #d4a843, #c49535)",
            color: "#fff8ec",
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

      {/* Status message */}
      <p className="mt-2 text-xs" style={{ color: msgColor }}>
        {msg.text}
      </p>

      {/* Help toggle */}
      <button
        onClick={() => setShowHelp((s) => !s)}
        className="mt-3 text-xs transition-colors"
        style={{ color: "#9a9088" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#b8922e")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#9a9088")}
      >
        {showHelp ? "▼ Hide setup guide" : "▶ How to get a free API key"}
      </button>

      {showHelp && (
        <div
          className="mt-3 text-xs rounded-lg p-3 leading-relaxed"
          style={{
            background: "#faf6ee",
            borderLeft: "3px solid #d4a843",
            color: "#7a7080",
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
            className="rounded px-1"
            style={{ background: "rgba(212,168,67,0.12)", fontFamily: "monospace", color: "#8a6018" }}
          >
            Cloud Text-to-Speech API
          </code>{" "}
          → <strong>Enable</strong>
          <br />
          3. <strong>APIs &amp; Services → Credentials → Create API Key</strong> → paste above
          <br />
          <span className="mt-1 block" style={{ color: "#b0a898" }}>
            Free tier:{" "}
            <strong style={{ color: "#7a7080" }}>4 million Standard chars/month</strong>
          </span>
        </div>
      )}

      {/* Language & Voice selection */}
      <div className="mt-4 pt-4" style={{ borderTop: "1px solid #e8e0d0" }}>
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
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      border: `1.5px solid ${active ? "#d4a843" : "#e5ddd0"}`,
                      background: active ? "rgba(212,168,67,0.1)" : "#f5f0e8",
                      color: active ? "#8a6018" : "#7a7080",
                    }}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice chips */}
          <div className="flex flex-col gap-2">
            <span
              className="text-xs font-bold uppercase"
              style={{ color: "#9a9088", letterSpacing: "0.08em" }}
            >
              Voice
            </span>
            <div className="flex gap-2 flex-wrap">
              {VOICES[selectedLang]?.map((v) => {
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
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
