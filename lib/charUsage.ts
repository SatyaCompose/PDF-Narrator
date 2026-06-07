const KEY = "tts_usage";
export const FREE_LIMIT = 4_000_000;
export const WARN_THRESHOLD = 0.8;   // 80% → yellow
export const DANGER_THRESHOLD = 0.95; // 95% → red

interface Record { month: string; chars: number }

function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthlyUsage(): number {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return 0;
    const rec = JSON.parse(raw) as Record & { v?: number };
    // v:2 = text-only counting; discard older inflated SSML counts
    if (rec.v !== 2) { localStorage.removeItem(KEY); return 0; }
    return rec.month === thisMonth() ? rec.chars : 0;
  } catch { return 0; }
}

export function addMonthlyUsage(chars: number): number {
  try {
    const prev = getMonthlyUsage();
    const next = prev + chars;
    localStorage.setItem(KEY, JSON.stringify({ month: thisMonth(), chars: next, v: 2 }));
    return next;
  } catch { return 0; }
}

export function resetUsage(): void {
  try { localStorage.removeItem(KEY); } catch { /* */ }
}
