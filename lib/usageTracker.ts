export const FREE_TIER = {
  Standard:  4_000_000,  // chars/month
  Wavenet:   1_000_000,  // chars/month
  Neural2:   1_000_000,  // chars/month
  Chirp3HD:  1_000_000,  // chars/month
  Vision:    1_000,      // requests/month
} as const;

export type TierId = "Standard" | "Wavenet" | "Neural2" | "Chirp3HD";

export interface UsageRecord {
  month: string; // "YYYY-MM"
  Standard: number;
  Wavenet: number;
  Neural2: number;
  Chirp3HD: number;
  Vision: number;
}

export interface UsageWarning {
  id: string;
  label: string;
  pct: number;     // 0–1+
  exceeded: boolean;
}

const LS_KEY = "pdfn_usage";

function monthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const EMPTY = (): UsageRecord => ({
  month: monthKey(),
  Standard: 0,
  Wavenet: 0,
  Neural2: 0,
  Chirp3HD: 0,
  Vision: 0,
});

export function getUsage(): UsageRecord {
  if (typeof window === "undefined") return EMPTY();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const rec = JSON.parse(raw) as UsageRecord;
      if (rec.month === monthKey()) return rec;
    }
  } catch {}
  return EMPTY();
}

function save(rec: UsageRecord): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(rec)); } catch {}
}

export function trackTTS(tier: TierId, chars: number): void {
  const rec = getUsage();
  rec[tier] = (rec[tier] ?? 0) + chars;
  save(rec);
}

export function trackVision(): void {
  const rec = getUsage();
  rec.Vision = (rec.Vision ?? 0) + 1;
  save(rec);
}

export function getWarnings(): UsageWarning[] {
  const rec = getUsage();
  const out: UsageWarning[] = [];

  const tts: { id: TierId; label: string }[] = [
    { id: "Standard", label: "Standard voices" },
    { id: "Wavenet",  label: "WaveNet voices" },
    { id: "Neural2",  label: "Neural2 voices" },
    { id: "Chirp3HD", label: "Chirp3-HD voices" },
  ];

  for (const { id, label } of tts) {
    if (!rec[id]) continue;
    const pct = rec[id] / FREE_TIER[id];
    if (pct >= 0.8) out.push({ id, label, pct, exceeded: pct >= 1 });
  }

  if (rec.Vision) {
    const pct = rec.Vision / FREE_TIER.Vision;
    if (pct >= 0.8) out.push({ id: "Vision", label: "Vision OCR", pct, exceeded: pct >= 1 });
  }

  return out;
}
