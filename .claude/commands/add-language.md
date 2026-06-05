Add a new Indian language to the PDF Narrator.

If the user provided details, use them. Otherwise ask:
- BCP-47 language code (e.g. `kn-IN`)
- Display label in the native script (e.g. `ಕನ್ನಡ`)
- 2-letter script identifier for the `script` field (e.g. `KN`)
- Initial voices to add (at minimum one FEMALE and one MALE Standard voice)

Known Indian Standard voices available in Google TTS (use only these):
- kn-IN: Standard-A (F), Standard-B (M)
- ml-IN: Standard-A (F), Standard-B (M)
- ta-IN: Standard-A (F), Standard-B (M), Standard-C (M), Standard-D (F)
- bn-IN: Standard-A (F), Standard-B (M)
- gu-IN: Standard-A (F), Standard-B (M)
- mr-IN: Standard-A (F), Standard-B (M)
- pa-IN: Standard-A (F), Standard-B (M), Standard-C (M), Standard-D (F)

Steps:
1. Read `/Users/devulapallisatya/Desktop/PDF Reader/lib/voices.ts`
2. Add to `LANGUAGES` array
3. Add to `VOICES` record with named entries (use Indian given names for labels)
4. Check if the language uses any sentence-ending punctuation not in `[.!?।]` — if so, also read `lib/ssml.ts` and update the regex in `splitSentences()`
5. Run `npm run build` and confirm it passes
6. Report exactly what was added
