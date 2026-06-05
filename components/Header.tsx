"use client";

export default function Header() {
  return (
    <header className="relative text-center py-8 pb-6 overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% -10%, rgba(212,168,67,0.18) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="text-3xl">📖</span>
        </div>
        <h1
          className="font-serif font-normal tracking-tight"
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            lineHeight: 1.15,
          }}
        >
          <span
            style={{
              background: "linear-gradient(135deg, #c49530 0%, #d4a843 50%, #c8680a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            PDF Narrator
          </span>
        </h1>
        <p className="mt-2 text-sm tracking-wider uppercase" style={{ color: "#9a9088", letterSpacing: "0.12em" }}>
          Indian English · Hindi · Telugu — reads at your pace, not a machine&apos;s
        </p>
      </div>

      {/* Bottom border with gradient */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px"
        style={{
          width: "80%",
          background:
            "linear-gradient(90deg, transparent, rgba(212,168,67,0.5), transparent)",
        }}
      />
    </header>
  );
}
