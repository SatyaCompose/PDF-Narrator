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

        {/* Document body */}
        <path
          d="M6 8 L24 8 L30 14 L30 44 L6 44 Z"
          fill="rgba(212,168,67,0.15)"
          stroke="#d4a843"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
        {/* Fold ear */}
        <path
          d="M24 8 L24 14 L30 14 Z"
          fill="rgba(212,168,67,0.40)"
          stroke="#d4a843"
          stroke-width="1"
        />
        {/* Text lines */}
        <line x1="10" y1="21" x2="23" y2="21" stroke="#d4a843" stroke-width="2" stroke-linecap="round" stroke-opacity="0.8" />
        <line x1="10" y1="27" x2="23" y2="27" stroke="#d4a843" stroke-width="2" stroke-linecap="round" stroke-opacity="0.8" />
        <line x1="10" y1="33" x2="18" y2="33" stroke="#d4a843" stroke-width="2" stroke-linecap="round" stroke-opacity="0.5" />

        {/* Sound waves */}
        <path d="M35 22 Q38 26 35 30" stroke="#d4a843" stroke-width="2.5" stroke-linecap="round" fill="none" />
        <path d="M39 18 Q45 26 39 34" stroke="#d4a843" stroke-width="2" stroke-linecap="round" fill="none" stroke-opacity="0.6" />
      </svg>
    ),
    { ...size }
  );
}
