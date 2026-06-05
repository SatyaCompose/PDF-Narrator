Add a new Google TTS voice to the PDF Narrator.

If the user provided a language, voice name, label, or gender, use those. Otherwise ask:
- Which language? (show current languages from lib/voices.ts)
- Voice name (e.g. `en-IN-Standard-E`) — must be a real Google TTS voice ID
- Friendly label (an Indian given name appropriate to the gender/region)
- Gender: FEMALE or MALE

Then:
1. Read `/Users/devulapallisatya/Desktop/PDF Reader/lib/voices.ts`
2. Add the new `Voice` object `{ name, label, g }` to the correct language array in `VOICES`
3. Keep voices ordered: FEMALE entries first, then MALE
4. Run `npm run build` in the project directory to confirm no errors
5. Report the exact line added and confirm the build passed
