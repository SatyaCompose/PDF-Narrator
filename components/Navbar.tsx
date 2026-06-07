"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/reader", label: "Reader" },
  { href: "/library", label: "Library" },
  { href: "/settings", label: "Settings" },
];

export default function Navbar() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: "56px",
        background: "rgba(250,248,244,0.96)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(212,168,67,0.2)",
      }}
    >
      <div
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "0 1rem",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo + brand name */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <Logo size={28} />
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 600,
              fontSize: "1.1rem",
              background: "linear-gradient(135deg, #c49530 0%, #d4a843 50%, #c8680a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            PDF Narrator
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  textDecoration: "none",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: active ? 600 : 400,
                  color: active ? "#b8922e" : "#9a9088",
                  background: active ? "rgba(212,168,67,0.1)" : "transparent",
                  transition: "color 0.15s, background 0.15s",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
