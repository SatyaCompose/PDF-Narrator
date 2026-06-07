interface Props {
  size?: number;
}

export default function Logo({ size = 32 }: Props) {
  const height = Math.round(size * 44 / 52);

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 52 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="PDF Narrator logo"
    >
      <defs>
        <linearGradient id="lgg" x1="0" y1="0" x2="52" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d4a843" />
          <stop offset="100%" stopColor="#c8680a" />
        </linearGradient>
      </defs>

      {/* Document body */}
      <path
        d="M2 2 L26 2 L32 8 L32 42 L2 42 Z"
        fill="rgba(212,168,67,0.10)"
        stroke="url(#lgg)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Fold ear */}
      <path
        d="M26 2 L26 8 L32 8 Z"
        fill="rgba(212,168,67,0.30)"
        stroke="url(#lgg)"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Text line 1 */}
      <line
        x1="7" y1="17" x2="25" y2="17"
        stroke="url(#lgg)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.70"
      />
      {/* Text line 2 */}
      <line
        x1="7" y1="23" x2="25" y2="23"
        stroke="url(#lgg)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.70"
      />
      {/* Text line 3 (shorter) */}
      <line
        x1="7" y1="29" x2="17" y2="29"
        stroke="url(#lgg)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.50"
      />

      {/* Sound wave 1 (closest) */}
      <path
        d="M37 18 Q41 22 37 26"
        stroke="url(#lgg)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Sound wave 2 */}
      <path
        d="M41 14 Q48 22 41 30"
        stroke="url(#lgg)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.65"
      />
      {/* Sound wave 3 (farthest) */}
      <path
        d="M45 10 Q54 22 45 34"
        stroke="url(#lgg)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.35"
      />
    </svg>
  );
}
