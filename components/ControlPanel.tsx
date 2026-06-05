"use client";

import { useState } from "react";
import { MODES } from "@/lib/voices";
import type { ModeKey } from "@/lib/voices";
import type { PlayStatus } from "@/hooks/usePlayback";
import type { Bookmark } from "@/lib/db";

interface Props {
  mode: ModeKey;
  rate: number;
  pitch: number;
  pauseMs: number;
  status: PlayStatus;
  progress: number;
  statusMsg: string;
  charCount: number;
  hasApiKey: boolean;
  bookmarks: Bookmark[];
  currentPage: number;
  onModeChange: (m: ModeKey) => void;
  onRateChange: (v: number) => void;
  onPitchChange: (v: number) => void;
  onPauseChange: (v: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onGoToBookmark: (page: number) => void;
  onDeleteBookmark: (id: string) => void;
}

export default function ControlPanel({
  mode,
  rate,
  pitch,
  pauseMs,
  bookmarks,
  currentPage,
  onGoToBookmark,
  onDeleteBookmark,
  status,
  progress,
  statusMsg,
  charCount,
  hasApiKey,
  onModeChange,
  onRateChange,
  onPitchChange,
  onPauseChange,
  onPlay,
  onPause,
  onStop,
}: Props) {
  const isPlaying = status === "speaking" || status === "loading";
  const isPaused = status === "paused";
  const modeObj = MODES.find((m) => m.key === mode)!;
  const [bmOpen, setBmOpen] = useState(true);

  function SliderRow({
    label,
    id,
    min,
    max,
    step,
    value,
    display,
    onChange,
  }: {
    label: string;
    id: string;
    min: number;
    max: number;
    step: number;
    value: number;
    display: string;
    onChange: (v: number) => void;
  }) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label htmlFor={id} className="text-xs" style={{ color: "#7a7080" }}>
            {label}
          </label>
          <span
            className="text-xs font-semibold tabular-nums px-2 py-0.5 rounded"
            style={{ color: "#8a6018", background: "rgba(212,168,67,0.12)" }}
          >
            {display}
          </span>
        </div>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1 rounded cursor-pointer appearance-none"
          style={{
            background: `linear-gradient(90deg, #d4a843 0%, #d4a843 ${((value - min) / (max - min)) * 100}%, #e5ddd0 ${((value - min) / (max - min)) * 100}%, #e5ddd0 100%)`,
            WebkitAppearance: "none",
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Reading Mode */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: "linear-gradient(145deg, #ffffff, #fdf9f3)",
          border: "1px solid #e8e0d0",
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        }}
      >
        <h3
          className="text-xs font-bold uppercase mb-3"
          style={{ color: "#b8922e", letterSpacing: "0.12em" }}
        >
          Reading Mode
        </h3>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {MODES.map((m) => {
            const active = m.key === mode;
            return (
              <button
                key={m.key}
                onClick={() => onModeChange(m.key)}
                className="py-2.5 px-2 rounded-xl text-xs text-center transition-all leading-tight"
                style={{
                  border: `1.5px solid ${active ? m.border : "#e5ddd0"}`,
                  background: active ? m.bg : "#f5f0e8",
                  color: active ? m.color : "#7a7080",
                  transform: active ? "translateY(-1px)" : "translateY(0)",
                  boxShadow: active ? `0 3px 10px ${m.color}18` : "none",
                }}
              >
                <span className="block text-lg mb-1">{m.icon}</span>
                {m.label}
              </button>
            );
          })}
        </div>
        <div
          className="text-xs p-3 rounded-lg leading-relaxed"
          style={{
            background: "#faf6ee",
            borderLeft: `2.5px solid ${modeObj.color}`,
            color: "#7a7080",
          }}
        >
          {modeObj.desc}
        </div>
      </div>

      {/* Pace & Tone */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: "linear-gradient(145deg, #ffffff, #fdf9f3)",
          border: "1px solid #e8e0d0",
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        }}
      >
        <h3
          className="text-xs font-bold uppercase mb-4"
          style={{ color: "#b8922e", letterSpacing: "0.12em" }}
        >
          Pace &amp; Tone
        </h3>
        <div className="flex flex-col gap-4">
          <SliderRow
            label="Speed"
            id="rate"
            min={0.25}
            max={4.0}
            step={0.05}
            value={rate}
            display={`${rate.toFixed(2)}×`}
            onChange={onRateChange}
          />
          <SliderRow
            label="Pitch"
            id="pitch"
            min={-10}
            max={10}
            step={1}
            value={pitch}
            display={`${pitch > 0 ? "+" : ""}${pitch} st`}
            onChange={onPitchChange}
          />
          <SliderRow
            label="Pause between sentences"
            id="pause"
            min={0}
            max={3000}
            step={100}
            value={pauseMs}
            display={`${pauseMs}ms`}
            onChange={onPauseChange}
          />
        </div>
      </div>

      {/* Playback */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: "linear-gradient(145deg, #ffffff, #fdf9f3)",
          border: "1px solid #e8e0d0",
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        }}
      >
        <h3
          className="text-xs font-bold uppercase mb-3"
          style={{ color: "#b8922e", letterSpacing: "0.12em" }}
        >
          Playback
        </h3>

        {/* Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={onPlay}
            disabled={status === "loading"}
            className="flex-1 py-2.5 rounded-full text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background:
                status === "loading"
                  ? "#c49530"
                  : "linear-gradient(135deg, #d4a843, #e07a3a)",
              color: "#fff8ec",
              boxShadow: isPlaying ? "0 4px 14px rgba(212,168,67,0.3)" : "none",
            }}
            onMouseEnter={(e) => {
              if (status !== "loading")
                e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {status === "loading"
              ? "⟳ Loading…"
              : isPaused
              ? "▶ Resume"
              : "▶ Read Page"}
          </button>
          <button
            onClick={onPause}
            disabled={!isPlaying}
            className="px-4 py-2.5 rounded-full text-sm font-medium transition-all disabled:opacity-30"
            style={{
              background: "#f5f0e8",
              border: "1px solid #e5ddd0",
              color: "#1a1a2e",
            }}
            title="Pause"
          >
            ⏸
          </button>
          <button
            onClick={onStop}
            className="px-4 py-2.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: "#f5f0e8",
              border: "1px solid #e5ddd0",
              color: "#9a9088",
            }}
            title="Stop"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#dc2626";
              e.currentTarget.style.color = "#dc2626";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5ddd0";
              e.currentTarget.style.color = "#9a9088";
            }}
          >
            ■
          </button>
        </div>

        {/* Progress bar */}
        <div
          className="h-1 rounded-full overflow-hidden mb-2"
          style={{ background: "#e8e0d0" }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #d4a843, #e07a3a)",
              boxShadow:
                progress > 0 && progress < 100
                  ? "0 0 6px rgba(212,168,67,0.4)"
                  : "none",
            }}
          />
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 min-h-[20px]">
          {isPlaying && (
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: "#d4a843",
                boxShadow: "0 0 5px rgba(212,168,67,0.6)",
                animation: "pulse 1.1s infinite",
              }}
            />
          )}
          <p
            className="text-xs"
            style={{
              color:
                status === "done"
                  ? "#16a34a"
                  : status === "error"
                  ? "#dc2626"
                  : status === "paused"
                  ? "#e07a3a"
                  : isPlaying
                  ? "#b8922e"
                  : "#9a9088",
            }}
          >
            {statusMsg}
          </p>
        </div>

        {/* Char cost info */}
        {charCount > 0 && (
          <div
            className="mt-3 pt-3 flex items-center justify-between text-xs"
            style={{ borderTop: "1px solid #e8e0d0", color: "#b0a898" }}
          >
            <span>
              {charCount.toLocaleString()} chars
              {!hasApiKey && (
                <span className="ml-1" style={{ color: "#cec4b4" }}>
                  · browser voice
                </span>
              )}
            </span>
            {hasApiKey && (
              <span>
                est.{" "}
                <span style={{ color: "#8a6018", fontWeight: 600 }}>
                  ${(charCount * 0.000004).toFixed(4)}
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Keyboard shortcuts */}
      <div
        className="rounded-xl px-4 py-3 text-xs"
        style={{
          background: "#f0ebe2",
          border: "1px solid #e5ddd0",
          color: "#b0a898",
        }}
      >
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>
            <kbd
              className="px-1.5 py-0.5 rounded text-[0.65rem]"
              style={{
                background: "#ffffff",
                color: "#7a7080",
                border: "1px solid #e5ddd0",
                boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
              }}
            >
              Space
            </kbd>{" "}
            play / pause
          </span>
          <span>
            <kbd
              className="px-1.5 py-0.5 rounded text-[0.65rem]"
              style={{
                background: "#ffffff",
                color: "#7a7080",
                border: "1px solid #e5ddd0",
                boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
              }}
            >
              Esc
            </kbd>{" "}
            stop
          </span>
          <span>
            <kbd
              className="px-1.5 py-0.5 rounded text-[0.65rem]"
              style={{
                background: "#ffffff",
                color: "#7a7080",
                border: "1px solid #e5ddd0",
                boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
              }}
            >
              ←→
            </kbd>{" "}
            pages
          </span>
        </div>
      </div>

      {/* Bookmarks */}
      {bookmarks.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #ffffff, #fdf9f3)",
            border: "1px solid #e8e0d0",
            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
          }}
        >
          <button
            className="w-full flex items-center justify-between px-4 py-3"
            onClick={() => setBmOpen((o) => !o)}
          >
            <h3
              className="text-xs font-bold uppercase"
              style={{ color: "#b8922e", letterSpacing: "0.12em" }}
            >
              🔖 Bookmarks ({bookmarks.length})
            </h3>
            <span className="text-xs" style={{ color: "#cec4b4" }}>
              {bmOpen ? "▲" : "▼"}
            </span>
          </button>

          {bmOpen && (
            <div
              className="px-3 pb-3 flex flex-col gap-1"
              style={{ borderTop: "1px solid #f0ebe2" }}
            >
              {bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="flex items-center gap-2 group rounded-lg px-2 py-1.5 transition-colors"
                  style={{
                    background:
                      bm.page === currentPage
                        ? "rgba(212,168,67,0.08)"
                        : "transparent",
                  }}
                >
                  <button
                    onClick={() => onGoToBookmark(bm.page)}
                    className="flex-1 text-left min-w-0"
                  >
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: bm.page === currentPage ? "#8a6018" : "#1a1a2e",
                      }}
                    >
                      {bm.label}
                    </span>
                    <span
                      className="ml-2 text-[0.65rem]"
                      style={{ color: "#9a9088" }}
                    >
                      p.{bm.page}
                    </span>
                  </button>
                  <button
                    onClick={() => onDeleteBookmark(bm.id)}
                    className="text-xs opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    style={{ color: "#cec4b4" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#dc2626")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#cec4b4")
                    }
                    title="Delete bookmark"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
