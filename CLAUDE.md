# PDF Narrator

A Next.js 14 app that reads PDFs aloud using Google Cloud Text-to-Speech, with support for Indian English, Hindi, and Telugu voices. Features SSML-driven natural pacing, sentence-by-sentence audio synthesis, and word-level highlighting.

## Commands

```bash
npm run dev      # start dev server on http://localhost:3000
npm run build    # production build (also type-checks)
npm run lint     # ESLint
```

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + inline CSS-in-JS (no CSS modules) |
| PDF rendering | `pdfjs-dist` 3.11.174 — loaded dynamically client-side |
| TTS | Google Cloud Text-to-Speech v1 REST API |
| Fallback TTS | Browser `SpeechSynthesis` API |
| State | React hooks only — no external state library |

## Architecture

```
app/page.tsx              ← orchestrates all state; wires hooks → components
  ├── hooks/usePdfReader  ← PDF load, page render (canvas), text extraction
  ├── hooks/usePlayback   ← audio loop, word-highlight state, pause/stop flags
  ├── lib/voices.ts       ← LANGUAGES, VOICES, MODES constants (single source of truth)
  ├── lib/ssml.ts         ← buildSSML(), splitSentences()
  └── lib/tts.ts          ← callTTS(), testApiKey() — thin fetch wrappers
```

### Data flow for a single "Read Page" click

```
handlePlay()
  → speakPage({ text, words, apiKey, lang, voice, mode, rate, pitch, pauseMs })
    → splitSentences(text)           // lib/ssml.ts
    → for each sentence:
        buildSSML(s, mode, rate, pitchSt, pauseMs)  // lib/ssml.ts
        callTTS(ssml, apiKey, lang, voice)           // lib/tts.ts  → Google API
        playAudio(b64, sentText, wordOffset, total)  // usePlayback
          → schedules setTimeout per word → setState({ activeWordIdx })
```

### Pause / Stop mechanism

`usePlayback` uses two `useRef` flags — `stopFlagRef` and `pausedRef` — checked on an 80 ms `setInterval` inside `playAudio`. This avoids stale closure issues. `hardStop()` sets `stopFlagRef.current = true`, which the loop checks before every sentence and inside the interval tick.

## Key Files

| File | Responsibility |
|---|---|
| `lib/voices.ts` | `LANGUAGES`, `VOICES` record, `MODES` array — **edit here to add voices/languages/modes** |
| `lib/ssml.ts` | `buildSSML(raw, mode, rate, pitchSt, pauseMs)` — SSML markup per mode; `splitSentences()` |
| `lib/tts.ts` | `callTTS(ssml, key, lang, voice)` → base64 MP3; `testApiKey(key)` |
| `hooks/usePdfReader.ts` | `loadPDF(file)`, `goToPage(n)`, `canvasRef` — all pdf.js interaction |
| `hooks/usePlayback.ts` | `speakPage(params)`, `hardStop()`, `pause()`, `resume()` |
| `components/ApiKeyCard.tsx` | API key input + test; language tab + voice chip rendering |
| `components/ControlPanel.tsx` | Mode buttons, sliders (rate/pitch/pause), playback buttons |
| `components/PdfViewer.tsx` | Canvas display, page nav, word-highlight strip |
| `components/DropZone.tsx` | Drag-and-drop / click-to-open PDF landing |

## Adding a Voice

Edit `lib/voices.ts`. Add an entry to the correct language array in `VOICES`:

```ts
{ name: "en-IN-Standard-E", label: "Meera", g: "FEMALE" }
```

The voice `name` must match the Google TTS voice name exactly. No other file needs changing — `ApiKeyCard` renders voices from this array dynamically.

## Adding a Language

1. Add to `LANGUAGES` in `lib/voices.ts`:
   ```ts
   { code: "kn-IN", label: "ಕನ್ನಡ", script: "KN" }
   ```
2. Add to `VOICES` in `lib/voices.ts`:
   ```ts
   "kn-IN": [
     { name: "kn-IN-Standard-A", label: "Aaradhya", g: "FEMALE" },
     { name: "kn-IN-Standard-B", label: "Kiran", g: "MALE" },
   ]
   ```
3. If the language uses a non-Latin script with unique sentence-ending punctuation, update the regex in `splitSentences()` in `lib/ssml.ts`.

## Adding a Reading Mode

1. Add to `MODES` in `lib/voices.ts` (follow the `ReadingMode` interface — needs `key`, `label`, `icon`, `desc`, `rate`, `pause`, `color`, `bg`, `border`).
2. Add a matching `else if (mode === "yourkey")` branch in `buildSSML()` in `lib/ssml.ts`.
3. The `ModeKey` union type in `lib/voices.ts` must include the new key.

## Design System

All colors are defined inline (no Tailwind color classes for brand colors). Reference values:

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0d0d0f` | Page background |
| `--s1` | `#15151a` | Card background |
| `--s2` | `#1c1c23` | Inner surfaces, inputs |
| `--s3` | `#232330` | Active inputs |
| `--bdr` | `#2e2e3e` | Default borders |
| `--bdr2` | `#3a3a50` | Hover/secondary borders |
| `--gold` | `#d4a843` | Primary accent |
| `--goldl` | `#efc96a` | Light gold (active text) |
| `--amber` | `#e07a3a` | Gradient endpoint, warm accent |
| `--cream` | `#ede0c8` | High-emphasis text |
| `--muted` | `#7a7a9a` | Secondary text |
| `--grn` | `#4caf7a` | Success / conversational mode |
| `--err` | `#e05555` | Errors / stop hover |
| `--blue` | `#4a8fff` | Teaching mode |
| `--purp` | `#a06ee0` | Story mode |

## Gotchas

- **pdf.js worker**: loaded from CDN (`cdnjs.cloudflare.com`) inside `usePdfReader.loadPDF`. Must match the `pdfjs-dist` package version (3.11.174).
- **Audio autoplay**: browsers block `audio.play()` until a user gesture. The play button satisfies this — do not try to auto-play on page load.
- **API key storage**: `localStorage` key is `"gcp_key"`. `ApiKeyCard` reads it on mount; `page.tsx` reads it via `useEffect`.
- **SSML pitch**: Google TTS takes pitch in semitones as `"Nst"` (e.g., `"2st"`). The slider range is –10 to +10.
- **Fallback TTS**: `SpeechSynthesis` does not guarantee word-boundary events on all browsers. Highlighting may be less precise without the API key.
- **`next.config.js`** aliases `canvas` and `encoding` to `false` to prevent pdf.js from trying to import native Node modules in the webpack bundle.
