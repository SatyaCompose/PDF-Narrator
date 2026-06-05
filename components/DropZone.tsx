"use client";

import { useRef, useState } from "react";

interface Props {
  onFile: (file: File) => void;
}

export default function DropZone({ onFile }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  function handleFile(f: File | null) {
    if (f && f.type === "application/pdf") onFile(f);
  }

  return (
    <div
      onClick={() => fileRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        handleFile(e.dataTransfer.files[0]);
      }}
      className="relative rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden"
      style={{
        border: `2px dashed ${over ? "#d4a843" : "#cec4b4"}`,
        background: over
          ? "linear-gradient(145deg, #fffbf3, #fdf6e8)"
          : "linear-gradient(145deg, #ffffff, #faf6ee)",
        boxShadow: over
          ? "0 0 40px rgba(212,168,67,0.15), inset 0 0 40px rgba(212,168,67,0.04)"
          : "0 2px 12px rgba(0,0,0,0.04)",
        transform: over ? "scale(1.005)" : "scale(1)",
      }}
    >
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212,168,67,0.12) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
          opacity: over ? 1 : 0.6,
          transition: "opacity 0.3s",
        }}
      />

      <div className="relative z-10 py-16 px-8 text-center">
        <div
          className="text-5xl mb-5 transition-transform duration-300"
          style={{ transform: over ? "scale(1.15) rotate(-5deg)" : "scale(1) rotate(0deg)" }}
        >
          📖
        </div>
        <h2
          className="font-serif font-normal mb-2"
          style={{
            fontSize: "1.4rem",
            color: over ? "#8a6018" : "#1a1a2e",
          }}
        >
          {over ? "Release to open" : "Drop your PDF here"}
        </h2>
        <p className="text-sm" style={{ color: "#9a9088" }}>
          or click to choose a file
        </p>

        <div
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
          style={{
            background: "rgba(212,168,67,0.1)",
            border: "1px solid rgba(212,168,67,0.3)",
            color: "#b8922e",
          }}
        >
          <span>PDF files only</span>
          <span style={{ color: "#cec4b4" }}>·</span>
          <span>Any size</span>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
