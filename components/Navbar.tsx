"use client";

import { useState, useEffect, useRef } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  // Close drawer on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Close on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
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
            style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}
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

          {/* Desktop nav links */}
          <div
            className="desktop-nav"
            style={{ display: "flex", alignItems: "center", gap: "4px" }}
          >
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

          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              display: "none",
              flexDirection: "column",
              gap: "5px",
            }}
          >
            <span style={{ display: "block", width: "22px", height: "2px", background: "#b8922e", borderRadius: "2px" }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: "#b8922e", borderRadius: "2px" }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: "#b8922e", borderRadius: "2px" }} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.35)",
          }}
        />
      )}

      {/* Mobile side drawer */}
      <div
        ref={drawerRef}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 101,
          width: "240px",
          background: "#faf8f4",
          borderLeft: "1px solid rgba(212,168,67,0.25)",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Drawer header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid rgba(212,168,67,0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
          <button
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.3rem",
              color: "#9a9088",
              lineHeight: 1,
              padding: "2px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Drawer nav links */}
        <nav style={{ padding: "12px 12px", flex: 1 }}>
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "block",
                  textDecoration: "none",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  fontSize: "0.95rem",
                  fontWeight: active ? 600 : 400,
                  color: active ? "#b8922e" : "#6b6462",
                  background: active ? "rgba(212,168,67,0.1)" : "transparent",
                  marginBottom: "4px",
                  borderLeft: active ? "3px solid #d4a843" : "3px solid transparent",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
