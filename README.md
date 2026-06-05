# PDF Narrator — Indian Voices

A Next.js 14 app that reads PDF documents aloud using **Google Cloud Text-to-Speech**, with authentic Indian voices in English, Hindi, and Telugu. Features SSML-driven natural pacing, three reading modes, and real-time word highlighting.

---

## Features

- **Indian voices** — English (India), Hindi, Telugu with male and female options
- **Three reading modes** — Teaching, Conversational, Story (each with tuned rate, pause, and SSML emphasis rules)
- **Word-level highlighting** — active word lights up in sync with audio playback
- **Pace & tone controls** — speed (0.25×–4×), pitch (±10 semitones), inter-sentence pause (0–3 s)
- **Browser fallback** — works without an API key using the browser's built-in `SpeechSynthesis`
- **Drag-and-drop upload** — or click to open any PDF
- **Per-page text caching** — pages extracted once, replayed without re-fetching
- **Keyboard shortcuts** — `Space` play/pause, `Esc` stop, `←` `→` page navigation

---

## Demo

| Drop a PDF | Choose voice & mode | Read with highlighting |
|---|---|---|
| Drag any PDF onto the landing zone | Pick language, voice, and reading style | Words highlight in sync as audio plays |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Cloud account (free tier covers 4 million characters/month)

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
4. Paste the key into the app — it's saved in `localStorage` automatically

> Without a key the app falls back to the browser's built-in voice. Indian accent and SSML features require the API key.

---

## Project Structure

```
pdf-narrator/
├── app/
│   ├── layout.tsx          # Root layout, metadata
│   ├── page.tsx            # Main page — orchestrates all state
│   └── globals.css         # Base styles, scrollbar, range input thumb
│
├── components/
│   ├── Header.tsx          # App title with ambient glow
│   ├── ApiKeyCard.tsx      # API key input, language tabs, voice chips
│   ├── DropZone.tsx        # PDF drag-and-drop landing
│   ├── PdfViewer.tsx       # Canvas renderer, page nav, word-highlight strip
│   └── ControlPanel.tsx    # Mode buttons, sliders, playback controls
│
├── hooks/
│   ├── usePdfReader.ts     # pdf.js integration — load, render, extract text
│   └── usePlayback.ts      # Audio loop, word-idx state, pause/stop flags
│
├── lib/
│   ├── voices.ts           # LANGUAGES, VOICES, MODES constants
│   ├── ssml.ts             # buildSSML(), splitSentences()
│   └── tts.ts              # callTTS(), testApiKey() — Google TTS fetch wrappers
│
├── .claude/
│   ├── agents/             # Specialized sub-agents (voice-curator, ssml-tuner, pdf-debug)
│   └── commands/           # Slash commands (/add-voice, /add-language, /add-mode, …)
│
├── CLAUDE.md               # AI coding instructions for this project
└── README.md
```

---

## Reading Modes

| Mode | Rate | Pause | Style |
|---|---|---|---|
| 🎓 **Teaching** | 0.82× | 900 ms | Deliberate pace, emphasis on key phrases, comma pauses |
| 💬 **Conversational** | 0.90× | 550 ms | Warm and flowing, like explaining over chai |
| 📚 **Story** | 0.73× | 1300 ms | Slow and immersive, savouring each line |

All three modes can be further tuned with the Speed, Pitch, and Pause sliders.

---

## Voices

### English (India)
| Name | Voice ID | Gender |
|---|---|---|
| Ananya | `en-IN-Standard-A` | Female |
| Priya | `en-IN-Standard-D` | Female |
| Arjun | `en-IN-Standard-B` | Male |
| Rohan | `en-IN-Standard-C` | Male |

### हिन्दी (Hindi)
| Name | Voice ID | Gender |
|---|---|---|
| Prachi | `hi-IN-Standard-A` | Female |
| Kavya | `hi-IN-Standard-D` | Female |
| Vikram | `hi-IN-Standard-B` | Male |
| Rajiv | `hi-IN-Standard-C` | Male |

### తెలుగు (Telugu)
| Name | Voice ID | Gender |
|---|---|---|
| Lalitha | `te-IN-Standard-A` | Female |
| Suresh | `te-IN-Standard-B` | Male |

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Pause toggle |
| `Esc` | Stop |
| `→` | Next page (when stopped) |
| `←` | Previous page (when stopped) |

---

## Extending the App

### Add a voice
```ts
// lib/voices.ts → VOICES["en-IN"]
{ name: "en-IN-Standard-E", label: "Meera", g: "FEMALE" }
```
Or use the slash command: `/add-voice`

### Add a language
```ts
// lib/voices.ts
LANGUAGES: [..., { code: "kn-IN", label: "ಕನ್ನಡ", script: "KN" }]
VOICES["kn-IN"] = [
  { name: "kn-IN-Standard-A", label: "Aaradhya", g: "FEMALE" },
  { name: "kn-IN-Standard-B", label: "Kiran",    g: "MALE"   },
]
```
Or use: `/add-language`

### Add a reading mode
1. Add a `ReadingMode` entry to `MODES` in `lib/voices.ts`
2. Extend the `ModeKey` union type
3. Add an `else if` branch in `buildSSML()` in `lib/ssml.ts`

Or use: `/add-mode`

---

## Pricing

Google Cloud TTS Standard voices:

| Tier | Characters | Cost |
|---|---|---|
| Free | First 4 million / month | $0 |
| Paid | Beyond free tier | $0.000004 / char |

The app shows a live character count and cost estimate per page.  
WaveNet voices cost $0.000016/char but sound more natural — swap `Standard` → `Wavenet` in any voice ID.

---

## Tech Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS + inline styles |
| PDF rendering | pdfjs-dist 3.11.174 |
| TTS | Google Cloud Text-to-Speech v1 |
| Fallback | Web Speech API (`SpeechSynthesis`) |

---

## Development Notes

- `pdfjs-dist` is dynamically imported inside `loadPDF()` to keep it out of the server bundle. The worker is loaded from CDN and **must match** the package version (`3.11.174`).
- `next.config.js` aliases `canvas` and `encoding` to `false` to prevent webpack from trying to bundle native Node modules from pdf.js.
- The API key is stored in `localStorage` under the key `"gcp_key"`. It is never sent to any server other than Google's TTS endpoint.
- Pause and stop are implemented via `useRef` flags (`stopFlagRef`, `pausedRef`) polled on an 80 ms interval inside the audio playback loop — this avoids stale closure issues with `useState`.

---

## License

MIT
# PDF-Narrator
