import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <svg
        width="32"
        height="32"
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle cx="26" cy="26" r="26" fill="#1a1a2e" />

        {/* Document body — white fill so it pops off the dark circle */}
        <path
          d="M6 8 L24 8 L30 14 L30 44 L6 44 Z"
          fill="#ffffff"
          stroke="#e8b84b"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Fold ear — solid gold */}
        <path
          d="M24 8 L24 14 L30 14 Z"
          fill="#e8b84b"
          stroke="#e8b84b"
          strokeWidth="1"
        />
        {/* Text lines — visible amber */}
        <line x1="10" y1="21" x2="22" y2="21" stroke="#b8721a" strokeWidth="2" strokeLinecap="round" />
        <line x1="10" y1="27" x2="22" y2="27" stroke="#b8721a" strokeWidth="2" strokeLinecap="round" />
        <line x1="10" y1="33" x2="17" y2="33" stroke="#b8721a" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6" />

        {/* Sound waves — bright gold on dark bg */}
        <path d="M34 22 Q38 26 34 30" stroke="#e8b84b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M38 17 Q45 26 38 35" stroke="#e8b84b" strokeWidth="2" strokeLinecap="round" fill="none" strokeOpacity="0.65" />
      </svg>
    ),
    { ...size }
  );
}
