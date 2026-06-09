import type { ModeKey } from "./voices";

// ─── PDF item type (mirrors pdfjs TextItem) ───────────────────────────────────
export interface PdfTextItem {
  str: string;
  transform: number[]; // [a, b, c, d, x, y]
  width: number;
  height: number;
}

// ─── Filter patterns ──────────────────────────────────────────────────────────

// Standalone page numbers: "12", "— 12 —", "Page 12", "12 of 45"
const PAGE_NUM_RE =
  /^(?:[-–—•]\s*)?\d+\s*(?:of\s*\d+)?(?:\s*[-–—•])?$|^\bpage\b\s*\d+$/i;

// Copyright / URL noise
const NOISE_RE =
  /^(?:https?:\/\/|www\.)|©|copyright|\ball rights reserved\b|^\s*[ivxlcdm]+\s*$/i;

// Figure / table / image captions
const CAPTION_RE =
  /^(?:fig(?:ure)?|table|chart|diagram|image|img|photo|illustration|exhibit|eq(?:uation)?|note|source)[.\s:]*\d*/i;

function isBoilerplate(str: string): boolean {
  const t = str.trim();
  if (!t) return true;
  if (PAGE_NUM_RE.test(t)) return true;
  if (NOISE_RE.test(t)) return true;
  // Lone symbols / numbers with < 4 chars
  if (t.length <= 3 && /^[\d\s\-–—•|/\\]+$/.test(t)) return true;
  return false;
}

// ─── Coordinate-aware page text cleaner ───────────────────────────────────────
// Filters: page-number patterns, header/footer zones (top+bottom 7%),
// image captions, and very small text (font height < 40% of page average).

export function cleanPageTextFromItems(items: PdfTextItem[]): string {
  if (items.length === 0) return "";

  // Compute y range to detect header/footer bands
  const ys = items.map((i) => i.transform[5]);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const yRange = maxY - minY;
  const edgeMargin = yRange * 0.07;

  // Average font height for small-text filter
  const heights = items.map((i) => i.height).filter((h) => h > 0);
  const avgH =
    heights.length > 0
      ? heights.reduce((s, h) => s + h, 0) / heights.length
      : 0;

  const kept = items.filter((item) => {
    const t = item.str.trim();
    if (!t) return false;

    // Always strip boilerplate patterns regardless of position
    if (isBoilerplate(t)) return false;

    // Strip figure/table captions
    if (CAPTION_RE.test(t)) return false;

    // Strip tiny text: footnote numbers, image labels, superscripts
    if (avgH > 0 && item.height > 0 && item.height < avgH * 0.45) return false;

    // Strip header/footer zone items that are clearly noise (very short, near edge)
    if (yRange > 20) {
      const y = item.transform[5];
      const nearEdge = y <= minY + edgeMargin || y >= maxY - edgeMargin;
      if (nearEdge && t.length < 10) return false;
    }

    return true;
  });

  // Sort top-to-bottom (PDF y=0 is bottom, so higher y = higher on page),
  // then left-to-right within the same line, so reading order is preserved
  // regardless of the internal PDF item sequence.
  const sorted = kept.slice().sort((a, b) => {
    const ya = a.transform[5], yb = b.transform[5];
    if (Math.abs(ya - yb) > 4) return yb - ya;          // different lines
    return a.transform[4] - b.transform[4];              // same line: left → right
  });

  return sorted
    .map((i) => i.str)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── XML escape ───────────────────────────────────────────────────────────────
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ─── Heading / topic classifier ───────────────────────────────────────────────
function classifyLine(line: string): "title" | "subtitle" | "body" {
  const t = line.trim();
  const words = t.split(/\s+/).length;

  if (words <= 8 && t === t.toUpperCase() && /[A-Z]/.test(t)) return "title";
  if (/^\d+(?:\.\d+)*\.?\s+[A-Z]/.test(t) && words <= 10) return "subtitle";
  if (words <= 7 && /^[A-Z]/.test(t) && !/[.!?।]$/.test(t)) return "subtitle";
  return "body";
}

// ─── Sentence splitter ────────────────────────────────────────────────────────
// Splits ONLY on:
//   • danda (।), !, ? — always sentence-ending in any language
//   • newlines — paragraph / line breaks in the source
//   • period ONLY when followed by a space + uppercase letter (English sentence end)
// Does NOT split on periods in: numbered items ("1."), abbreviations ("రూ.", "Mr."),
// decimal numbers, or any non-Latin-uppercase context (Telugu, Hindi, etc.)
export function splitSentences(text: string): string[] {
  let s = text.replace(/ {2,}/g, " ").trim();
  // \x00 (null byte) is a safe split marker — never appears in PDF text
  s = s.replace(/([।!?])\s*/g, "$1\x00");    // danda, !, ? always end sentences
  s = s.replace(/\n+/g, "\x00");              // newlines split too
  s = s.replace(/\.\s+(?=[A-Z])/g, ".\x00"); // period + space + capital (English only)
  return s.split("\x00").map((x) => x.trim()).filter(Boolean);
}

// ─── Word-to-sentence mapping ─────────────────────────────────────────────────
export function wordIdxToSentence(
  text: string,
  wordIdx: number
): { sentIdx: number; wordOffset: number } {
  const sentences = splitSentences(text);
  let offset = 0;
  for (let i = 0; i < sentences.length; i++) {
    const wc = sentences[i].trim().split(/\s+/).filter(Boolean).length;
    if (wordIdx < offset + wc) return { sentIdx: i, wordOffset: offset };
    offset += wc;
  }
  return { sentIdx: sentences.length - 1, wordOffset: offset };
}

// ─── SSML builder ─────────────────────────────────────────────────────────────
// Called once per sentence (speakPage splits via splitSentences first).
// Inserts <break> tags only at genuine sentence boundaries — danda/!/?,
// and period-before-capital — never at abbreviation dots or numbered items.
export function buildSSML(
  raw: string,
  mode: ModeKey,
  rate: number,
  pitchSt: number,
  pauseMs: number
): string {
  const kind = classifyLine(raw.trim());
  const escaped = esc(raw);
  let body: string;

  if (kind === "title") {
    const pre = Math.round(pauseMs * 1.8);
    const post = Math.round(pauseMs * 1.2);
    body =
      `<break time="${pre}ms"/>` +
      `<prosody rate="0.78" pitch="+1st"><emphasis level="strong">${escaped}</emphasis></prosody>` +
      `<break time="${post}ms"/>`;
  } else if (kind === "subtitle") {
    const pre = Math.round(pauseMs * 1.2);
    const post = Math.round(pauseMs * 0.8);
    body =
      `<break time="${pre}ms"/>` +
      `<prosody rate="0.84" pitch="+0.5st"><emphasis level="moderate">${escaped}</emphasis></prosody>` +
      `<break time="${post}ms"/>`;
  } else {
    let t = escaped;

    // Insert explicit breaks only at danda/!/? — genuine sentence ends across all
    // Indian languages. Periods are intentionally excluded: the pattern ". Capital"
    // causes false breaks on "Mr. Smith", "No. 5", "Fig. 1", etc., and the TTS
    // engine's own prosody handles actual English sentence ends correctly.
    t = t.replace(/([।!?])\s+([^\s])/g, `$1<break time="${pauseMs}ms"/> $2`);

    if (mode === "teaching") {
      const cp = Math.round(pauseMs * 0.3);
      t = t.replace(/,\s+/g, `, <break time="${cp}ms"/>`);
      t = t.replace(
        /(Note that|Important|Remember|For example|In other words|Therefore|However|First|Second|Finally)/gi,
        `<break time="300ms"/><emphasis level="moderate">$1</emphasis><break time="130ms"/>`
      );
    } else if (mode === "conversational") {
      t = t.replace(
        /,\s+/g,
        `, <break time="${Math.round(pauseMs * 0.2)}ms"/>`
      );
    } else if (mode === "story") {
      t = t.replace(
        /,\s+/g,
        `, <break time="${Math.round(pauseMs * 0.4)}ms"/>`
      );
      t = t.replace(
        /:\s+/g,
        `: <break time="${Math.round(pauseMs * 0.5)}ms"/>`
      );
    }
    body = t;
  }

  return `<speak><prosody rate="${rate}" pitch="${pitchSt}st">${body}</prosody></speak>`;
}
