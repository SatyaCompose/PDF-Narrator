# PDF Narrator — Indian Voices

A Next.js 14 app that reads PDF documents aloud using **Google Cloud Text-to-Speech**, with authentic Indian voices across 10 languages. Features SSML-driven natural pacing, three reading modes, real-time word highlighting directly on the PDF, session persistence, bookmarks, and Vision OCR for scanned documents.

---

## Features

- **10 Indian languages** — English (IN), Hindi, Telugu, Bengali, Gujarati, Kannada, Malayalam, Marathi, Tamil, Punjabi
- **Three voice tiers** — Standard, WaveNet (HD), Neural2 (AI) where available per language
- **Three reading modes** — Teaching, Conversational, Story (each with tuned rate, pause, and SSML rules)
- **Word highlighting on the PDF** — active word lights up directly on the page using the pdf.js text layer overlay
- **Click-to-seek** — click any word on the PDF to start reading from that point
- **Language auto-detection** — detects the dominant script (Devanagari, Telugu, Bengali, etc.) from PDF text and switches language automatically
- **Preference persistence** — language saved to a 30-day cookie; voice saved per-session in localStorage
- **Session library** — last-read page is saved; resume any previously opened PDF
- **Multi-tab PDF** — up to 5 PDFs open simultaneously with tab switching
- **Bookmarks** — bookmark pages and jump back; prompted automatically when you stop reading
- **Vision OCR** — re-reads scanned or image-based PDFs via Google Cloud Vision API
- **Pace & tone controls** — speed (0.25×–4×), pitch (±10 semitones), inter-sentence pause (0–3 s)
- **Browser fallback** — works without an API key using the browser's built-in `SpeechSynthesis`
- **Drag-and-drop upload** — or click to open any PDF
- **Keyboard shortcuts** — `Space` play/pause, `Esc` stop, `←` `→` page navigation

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Cloud account (free tier covers 4 million Standard characters/month)

### Install

```bash
git clone <your-repo-url>
cd pdf-narrator
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Get a Google Cloud API Key (3 minutes)

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and create a project
2. Search **Cloud Text-to-Speech API** → click **Enable**
3. Go to **APIs & Services → Credentials → Create API Key**
4. Paste the key into the app — it is saved in a secure cookie automatically

> Without a key the app falls back to the browser's built-in voice. Indian accent, SSML pacing, and Vision OCR require the API key.

---

## Project Structure

```
pdf-narrator/
├── app/
│   ├── layout.tsx            # Root layout, metadata, nav
│   ├── page.tsx              # Landing page
│   ├── icon.tsx              # Favicon (Next.js ImageResponse)
│   ├── globals.css           # Base styles, text-layer overlay, highlight
│   ├── reader/
│   │   └── page.tsx          # Main reader — orchestrates all state
│   ├── library/
│   │   └── page.tsx          # Session library
│   └── settings/
│       └── page.tsx          # Settings page
│
├── components/
│   ├── ApiKeyCard.tsx        # API key input, language tabs, voice chips (tiered)
│   ├── ControlPanel.tsx      # Mode buttons, sliders, playback controls, bookmarks
│   ├── PdfViewer.tsx         # Canvas + text layer overlay, page nav, tab bar
│   ├── DropZone.tsx          # PDF drag-and-drop landing
│   ├── SessionPanel.tsx      # Recent sessions list
│   ├── BookmarkPrompt.tsx    # Post-reading bookmark prompt
│   └── Footer.tsx            # Site footer
│
├── hooks/
│   ├── usePdfReader.ts       # pdf.js integration — load, render, text layer, word map
│   └── usePlayback.ts        # Audio loop, word-idx state, pause/stop flags
│
└── lib/
    ├── voices.ts             # LANGUAGES, VOICES (10 langs × 3 tiers), MODES
    ├── ssml.ts               # buildSSML(), splitSentences(), cleanPageTextFromItems()
    ├── tts.ts                # callTTS(), testApiKey() — Google TTS fetch wrappers
    ├── db.ts                 # IndexedDB session + bookmark storage
    ├── ocr.ts                # visionOCR(), needsOCR() — Google Vision API
    ├── ocrCache.ts           # Per-session in-memory OCR cache
    ├── langDetect.ts         # detectLanguageFromText() — Unicode script analysis
    └── prefs.ts              # Cookie/localStorage preference helpers
```

---

## Reading Modes

| Mode | Rate | Pause | Style |
|---|---|---|---|
| 🎓 **Teaching** | 0.82× | 900 ms | Deliberate pace, pauses after each idea |
| 💬 **Conversational** | 0.90× | 550 ms | Warm and flowing, like explaining over chai |
| 📚 **Story** | 0.73× | 1300 ms | Slow and immersive, savouring each line |

All three modes can be further tuned with the Speed, Pitch, and Pause sliders.

---

## Voices

Voices are organised into three quality tiers:

| Tier | Badge | Quality | Free chars/month |
|---|---|---|---|
| Standard | — | Natural | 4 million |
| WaveNet | **HD** | Higher fidelity | 1 million |
| Neural2 | **AI** | Most natural | 1 million |

### Language coverage

| Language | Standard | WaveNet | Neural2 |
|---|---|---|---|
| English (India) | ✓ 6 voices | ✓ 4 voices | ✓ 1 voice |
| हिन्दी Hindi | ✓ 6 voices | ✓ 4 voices | ✓ 4 voices |
| తెలుగు Telugu | ✓ 4 voices | — | — |
| বাংলা Bengali | ✓ 4 voices | ✓ 2 voices | — |
| ગુજરાતી Gujarati | ✓ 4 voices | — | — |
| ಕನ್ನಡ Kannada | ✓ 4 voices | ✓ 4 voices | — |
| മലയാളം Malayalam | ✓ 4 voices | ✓ 4 voices | — |
| मराठी Marathi | ✓ 4 voices | ✓ 4 voices | — |
| தமிழ் Tamil | ✓ 4 voices | ✓ 4 voices | — |
| ਪੰਜਾਬੀ Punjabi | ✓ 4 voices | ✓ 4 voices | — |

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Pause toggle |
| `Esc` | Stop |
| `→` | Next page (when stopped) |
| `←` | Previous page (when stopped) |

---

## Preferences & Persistence

| Data | Storage | TTL |
|---|---|---|
| Google API key | Cookie (`gcp_key`) | 30 days |
| Language preference | Cookie (`pref_lang`) | 30 days |
| Voice per session | localStorage (`sess_voice_{id}`) | Until cleared |
| Session library + bookmarks | IndexedDB | Until cleared |
| OCR results | In-memory (per session) | Page lifetime |

Language is auto-detected from the PDF text on each new file load using Unicode script block analysis. A manual selection overrides auto-detection for the current file.

---

## Vision OCR

For scanned or image-based PDFs where pdf.js extracts little or no text, click **Use Vision OCR** in the viewer. This captures the page at 2× resolution and sends it to the [Google Cloud Vision API](https://cloud.google.com/vision) for text extraction.

Requires the same API key with **Cloud Vision API** enabled in your Google Cloud project.

---

## Pricing

### Text-to-Speech

| Tier | Free | Paid |
|---|---|---|
| Standard | 4 M chars/month | $4 per 1 M chars |
| WaveNet / Neural2 | 1 M chars/month | $16 per 1 M chars |

### Vision OCR

| Tier | Free | Paid |
|---|---|---|
| Vision API | 1,000 pages/month | $1.50 per 1,000 pages |

---

## Extending the App

### Add a voice

```ts
// lib/voices.ts → VOICES["en-IN"]
{ name: "en-IN-Wavenet-E", label: "Meera", g: "FEMALE", tier: "Wavenet" }
```

### Add a language

```ts
// lib/voices.ts — LANGUAGES array
{ code: "or-IN", label: "ଓଡ଼ିଆ", script: "OR" }

// VOICES record
"or-IN": [
  { name: "or-IN-Standard-A", label: "Priya", g: "FEMALE" },
]
```

Also update the sentence-splitting regex in `splitSentences()` in `lib/ssml.ts` if the language uses non-Latin sentence-end punctuation.

### Add a reading mode

1. Add a `ReadingMode` entry to `MODES` in `lib/voices.ts` (needs `key`, `label`, `icon`, `desc`, `rate`, `pause`, `color`, `bg`, `border`)
2. Add the key to the `ModeKey` union type
3. Add an `else if (mode === "yourkey")` branch in `buildSSML()` in `lib/ssml.ts`

---

## Development Notes

- **pdf.js worker** is loaded from CDN inside `usePdfReader` and must match the package version (`3.11.174`).
- **Text layer** — pdf.js renders transparent text spans over the canvas at the exact glyph positions. The overlay uses `color: transparent !important` so only the gold highlight background shows through. Custom-encoded fonts (common in Indian PDFs) produce garbled span text that is invisible by design.
- **Word mapping** — a forward-scan fuzzy algorithm (20-word lookahead) maps cleaned TTS words to text-layer spans, tolerating headers/footers that the TTS pipeline skips.
- **Pause / stop** — implemented via `useRef` flags (`stopFlagRef`, `pausedRef`) polled on an 80 ms interval inside the audio loop to avoid stale closure issues.
- **`next.config.js`** aliases `canvas` and `encoding` to `false` to prevent webpack from bundling native Node modules from pdf.js.

---

## Commands

```bash
npm run dev      # start dev server on http://localhost:3000
npm run build    # production build (also type-checks)
npm run lint     # ESLint
```

---

## Tech Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS + inline styles |
| PDF rendering | pdfjs-dist 3.11.174 |
| TTS | Google Cloud Text-to-Speech v1 |
| OCR | Google Cloud Vision API v1 |
| Session storage | IndexedDB (via `lib/db.ts`) |
| Fallback TTS | Web Speech API (`SpeechSynthesis`) |

---

## License

MIT
