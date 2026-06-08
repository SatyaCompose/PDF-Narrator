/**
 * Detect language from PDF font family names embedded in the document.
 * This is more reliable than Unicode analysis for custom-encoded Indian PDFs
 * where the text layer contains garbled/unmapped glyphs.
 * Returns a BCP-47 language code or null if no known Indian font is found.
 */
export function detectLanguageFromFonts(fontFamilies: string[]): string | null {
  if (!fontFamilies.length) return null;

  // Each entry: [regex to match font name, BCP-47 code or null to block false positives]
  const FONT_RULES: [RegExp, string | null][] = [
    // Telugu
    [/vemana|gautami|mandali|potti.?sreeramulu|noto.?sans.?telugu|tikkana|krishna/i, "te-IN"],
    // Devanagari (Hindi + Marathi — disambiguate later via text)
    [/mangal|aparajita|kokila|kruti.?dev|devlys|chandas|nakula|sahadeva|utsaah|noto.?sans.?devanagari/i, "hi-IN"],
    // Tamil
    [/latha|vijaya|tscu|tam.?|bamini|noto.?sans.?tamil|sundaram|aavarang/i, "ta-IN"],
    // Bengali
    [/vrinda|shonar.?bangla|ekushey|akaash|siyam.?rupali|noto.?sans.?bengali/i, "bn-IN"],
    // Gujarati
    [/shruti|rekha|noto.?sans.?gujarati|aakar|gopika/i, "gu-IN"],
    // Malayalam
    [/kartika|rachana|anjali|meera|noto.?sans.?malayalam|karthika/i, "ml-IN"],
    // Kannada
    [/tunga|kedage|nudi|noto.?sans.?kannada|sampige/i, "kn-IN"],
    // Punjabi / Gurmukhi
    [/raavi|gurbani|waheguru|noto.?sans.?gurmukhi/i, "pa-IN"],
    // Marathi — more specific Marathi fonts override hi-IN match above
    [/shivaji|kiran.?marathi|noto.?sans.?devanagari.*marathi/i, "mr-IN"],
    // Odia (not in our language list but guard against false positives)
    [/noto.?sans.?oriya|utkal/i, null],
  ];

  const votes: Record<string, number> = {};
  for (const family of fontFamilies) {
    for (const [re, code] of FONT_RULES) {
      if (re.test(family)) {
        if (code) votes[code] = (votes[code] ?? 0) + 1;
        break;
      }
    }
  }

  const entries = Object.entries(votes);
  if (!entries.length) return null;
  return entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
}

/**
 * Detect the dominant Indic language in a string by counting characters
 * in Unicode script blocks. Returns a BCP-47 language code (e.g. "hi-IN")
 * or null when the text is predominantly Latin / insufficient evidence.
 */
export function detectLanguageFromText(text: string): string | null {
  if (!text || text.length < 20) return null;

  const counts = {
    devanagari: 0,
    bengali: 0,
    gurmukhi: 0,
    gujarati: 0,
    tamil: 0,
    telugu: 0,
    kannada: 0,
    malayalam: 0,
  };
  let latinLetters = 0;

  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    if      (cp >= 0x0900 && cp <= 0x097F) counts.devanagari++;
    else if (cp >= 0x0980 && cp <= 0x09FF) counts.bengali++;
    else if (cp >= 0x0A00 && cp <= 0x0A7F) counts.gurmukhi++;
    else if (cp >= 0x0A80 && cp <= 0x0AFF) counts.gujarati++;
    else if (cp >= 0x0B80 && cp <= 0x0BFF) counts.tamil++;
    else if (cp >= 0x0C00 && cp <= 0x0C7F) counts.telugu++;
    else if (cp >= 0x0C80 && cp <= 0x0CFF) counts.kannada++;
    else if (cp >= 0x0D00 && cp <= 0x0D7F) counts.malayalam++;
    // Basic Latin + Latin-1 letters (excludes digits and punctuation)
    else if ((cp >= 0x0041 && cp <= 0x005A) || (cp >= 0x0061 && cp <= 0x007A) ||
             (cp >= 0x00C0 && cp <= 0x024F)) latinLetters++;
  }

  const totalIndic = Object.values(counts).reduce((a, b) => a + b, 0);
  // Use letter-only denominator — digits and punctuation (prices, survey nos.) are excluded
  const letterCount = totalIndic + latinLetters;

  // Require at least 3% of letters to be Indic to avoid false positives
  if (letterCount === 0 || totalIndic / letterCount < 0.03) return null;

  const dominant = (Object.entries(counts) as [string, number][])
    .reduce((a, b) => (b[1] > a[1] ? b : a));

  switch (dominant[0]) {
    case "devanagari":
      // Common Marathi function words absent in standard Hindi text
      return /आहे|नाही|आणि|म्हणून|होते|करतो|केले/.test(text) ? "mr-IN" : "hi-IN";
    case "bengali":   return "bn-IN";
    case "gurmukhi":  return "pa-IN";
    case "gujarati":  return "gu-IN";
    case "tamil":     return "ta-IN";
    case "telugu":    return "te-IN";
    case "kannada":   return "kn-IN";
    case "malayalam": return "ml-IN";
    default:          return null;
  }
}
