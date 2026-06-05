Tune the SSML pacing for one or more reading modes.

Common tuning requests:
- "Pauses feel too long/short" → adjust `pauseMs` default in `MODES` in `lib/voices.ts`
- "Sentences run together" → increase sentence-break pause in `buildSSML()`
- "Emphasis isn't noticeable" → change `level="moderate"` to `level="strong"`
- "Commas sound robotic" → adjust the comma-pause multiplier
- "Numbers sound wrong" → add `<say-as interpret-as="cardinal">` wrapping

Steps:
1. Read `/Users/devulapallisatya/Desktop/PDF Reader/lib/ssml.ts`
2. Read `/Users/devulapallisatya/Desktop/PDF Reader/lib/voices.ts` (for MODES defaults)
3. Identify the exact lines to change based on the user's complaint
4. Make the minimal targeted edit — do not rewrite logic that isn't broken
5. Explain what was changed and why in one sentence
6. Run `npm run build` to confirm no errors

If the user wants to test the change, remind them to run `npm run dev`, open a PDF, and use the affected mode — there is no automated audio test.
