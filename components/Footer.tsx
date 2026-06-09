"use client";

import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(212,168,67,0.18)",
        background: "#ffffff",
        marginTop: "auto",
      }}
    >
      <div
        className="grid grid-cols-2 sm:grid-cols-4"
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "2rem 1rem",
          gap: "2rem",
        }}
      >
        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <Logo size={22} />
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 600,
                fontSize: "1rem",
                background: "linear-gradient(135deg, #c49530 0%, #d4a843 50%, #c8680a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              PDF Narrator
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "#9a9088", lineHeight: 1.6 }}>
            Reads PDFs aloud in Indian English, Hindi, and Telugu with natural pacing.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <p
            style={{
              margin: "0 0 10px",
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#b8922e",
            }}
          >
            Navigation
          </p>
          <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              { href: "/", label: "Home" },
              { href: "/reader", label: "Reader" },
              { href: "/library", label: "Library" },
              { href: "/settings", label: "Settings" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontSize: "0.82rem",
                  color: "#7a7080",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#b8922e")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#7a7080")}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Tech */}
        <div>
          <p
            style={{
              margin: "0 0 10px",
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#b8922e",
            }}
          >
            Powered by
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              "Google Cloud Text-to-Speech",
              "Google Cloud Vision API",
              "pdf.js — Mozilla",
              "Next.js 14",
            ].map((item) => (
              <span key={item} style={{ fontSize: "0.78rem", color: "#9a9088" }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <p
            style={{
              margin: "0 0 10px",
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#b8922e",
            }}
          >
            Languages
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {[
              "English (IN)", "हिन्दी", "తెలుగు", "বাংলা",
              "ગુજરાતી", "ಕನ್ನಡ", "മലയാളം", "मराठी", "தமிழ்", "ਪੰਜਾਬੀ",
            ].map((label) => (
              <span key={label} style={{ fontSize: "0.82rem", color: "#7a7080" }}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid #f0ebe2",
          padding: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "#b0a898" }}>
          © {new Date().getFullYear()} PDF Narrator · Built with
        </span>
        <span style={{ fontSize: "0.75rem", color: "#d4a843" }}>♥</span>
        <span style={{ fontSize: "0.75rem", color: "#b0a898" }}>for Indian readers</span>
      </div>
    </footer>
  );
}
