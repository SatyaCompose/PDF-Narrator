import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF Narrator — Indian Voices",
  description:
    "Read PDFs aloud in Indian English, Hindi, and Telugu with natural pacing and word-level highlighting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#0d0d0f",
          minHeight: "100vh",
          color: "#ddd8f0",
        }}
      >
        {children}
      </body>
    </html>
  );
}
