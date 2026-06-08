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
      style={{
        position: "relative",
        borderRadius: "16px",
        cursor: "pointer",
        overflow: "hidden",
        border: `2px dashed ${over ? "#d4a843" : "#cec4b4"}`,
        background: over
          ? "linear-gradient(145deg, #fffbf3, #fdf6e8)"
          : "linear-gradient(145deg, #ffffff, #faf6ee)",
        boxShadow: over
          ? "0 0 40px rgba(212,168,67,0.15), inset 0 0 40px rgba(212,168,67,0.04)"
          : "0 2px 12px rgba(0,0,0,0.04)",
        transform: over ? "scale(1.005)" : "scale(1)",
        transition: "border-color 0.3s, background 0.3s, box-shadow 0.3s, transform 0.3s",
      }}
    >
      {/* Dot pattern overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: "radial-gradient(circle at 2px 2px, rgba(212,168,67,0.12) 1px, transparent 0)",
          backgroundSize: "32px 32px",
          opacity: over ? 1 : 0.6,
          transition: "opacity 0.3s",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "4rem 2rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "3rem",
            marginBottom: "1.25rem",
            lineHeight: 1,
            transition: "transform 0.3s",
            transform: over ? "scale(1.15) rotate(-5deg)" : "scale(1) rotate(0deg)",
          }}
        >
          📖
        </div>

        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 400,
            fontSize: "1.4rem",
            margin: "0 0 8px",
            color: over ? "#8a6018" : "#1a1a2e",
            transition: "color 0.2s",
          }}
        >
          {over ? "Release to open" : "Drop your PDF here"}
        </h2>

        <p style={{ margin: 0, fontSize: "0.875rem", color: "#9a9088" }}>
          or click to choose a file
        </p>

        <div
          style={{
            marginTop: "1.5rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "999px",
            background: "rgba(212,168,67,0.1)",
            border: "1px solid rgba(212,168,67,0.3)",
            fontSize: "0.75rem",
            fontWeight: 500,
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
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
