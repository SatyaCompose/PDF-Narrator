Add a new reading mode to the PDF Narrator.

A reading mode controls speech rate, inter-sentence pause, SSML markup rules, and UI color. Existing modes: teaching (blue), conversational (green), story (purple).

If the user hasn't provided details, ask:
- Mode key (lowercase, no spaces, e.g. `meditation`)
- Label shown in the UI (e.g. `Meditation`)
- Emoji icon (e.g. `🧘`)
- One-sentence description shown below the mode buttons
- Suggested rate (0.25–4.0, typically 0.65–0.95 for natural modes)
- Suggested sentence pause in ms (typically 500–2000ms)
- Accent color (hex) — must be distinct from `#4a8fff`, `#4caf7a`, `#a06ee0`

Steps:
1. Read `/Users/devulapallisatya/Desktop/PDF Reader/lib/voices.ts`
2. Add the `ReadingMode` entry to `MODES` — derive `bg` as `rgba(r,g,b,0.08)` and `border` as the same hex as `color`
3. Add the new key to the `ModeKey` union type
4. Read `/Users/devulapallisatya/Desktop/PDF Reader/lib/ssml.ts`
5. Add an `else if (mode === "yourkey")` branch to `buildSSML()` — design the SSML pause/emphasis rules to match the mode's feel
6. Run `npm run build` and confirm it passes
7. Show the user a summary of what changed in both files
