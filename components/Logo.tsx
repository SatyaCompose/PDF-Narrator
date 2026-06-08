interface Props {
  size?: number;
}

export default function Logo({ size = 32 }: Props) {
  const h = Math.round(size * 44 / 52);
  const id = `lg-${size}`;

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 52 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="PDF Narrator logo"
    >
      <defs>
        <linearGradient id={`${id}-g1`} x1="0" y1="0" x2="52" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e8b84b" />
          <stop offset="100%" stopColor="#d4620a" />
        </linearGradient>
        <linearGradient id={`${id}-g2`} x1="0" y1="0" x2="52" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f0c85a" />
          <stop offset="100%" stopColor="#e07020" />
        </linearGradient>
        <filter id={`${id}-sh`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#c8880a" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Document body — solid white so it's always visible on any background */}
      <path
        d="M2 2 L26 2 L32 8 L32 42 L2 42 Z"
        fill="#ffffff"
        stroke={`url(#${id}-g1)`}
        strokeWidth="1.8"
        strokeLinejoin="round"
        filter={`url(#${id}-sh)`}
      />

      {/* Fold ear — solid gold accent */}
      <path
        d="M26 2 L26 8 L32 8 Z"
        fill={`url(#${id}-g2)`}
        stroke={`url(#${id}-g1)`}
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Text lines — dark amber, clearly visible */}
      <line x1="7" y1="17" x2="24" y2="17" stroke="#9a6010" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="7" y1="23" x2="24" y2="23" stroke="#9a6010" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="7" y1="29" x2="16" y2="29" stroke="#9a6010" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.6" />

      {/* Sound wave 1 (nearest) */}
      <path
        d="M37 18 Q41.5 22 37 26"
        stroke={`url(#${id}-g1)`}
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Sound wave 2 */}
      <path
        d="M41 13 Q48.5 22 41 31"
        stroke={`url(#${id}-g1)`}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.7"
      />
      {/* Sound wave 3 (farthest) */}
      <path
        d="M45 9 Q54.5 22 45 35"
        stroke={`url(#${id}-g1)`}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.35"
      />
    </svg>
  );
}
