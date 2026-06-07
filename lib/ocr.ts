// Unicode ranges for Indic scripts — used to detect whether text extraction
// actually returned the right script or just garbled custom-font glyphs.
const SCRIPT_RANGES: Record<string, [number, number]> = {
  "hi-IN": [0x0900, 0x097f], // Devanagari
  "mr-IN": [0x0900, 0x097f], // Devanagari
  "te-IN": [0x0c00, 0x0c7f], // Telugu
  "ta-IN": [0x0b80, 0x0bff], // Tamil
  "kn-IN": [0x0c80, 0x0cff], // Kannada
  "ml-IN": [0x0d00, 0x0d7f], // Malayalam
  "bn-IN": [0x0980, 0x09ff], // Bengali
  "gu-IN": [0x0a80, 0x0aff], // Gujarati
  "pa-IN": [0x0a00, 0x0a7f], // Gurmukhi
};

/**
 * Returns true if Vision API OCR should be used for this page.
 * Triggers when:
 *   - text is empty, OR
 *   - the selected language uses a non-Latin script but none of its
 *     expected Unicode characters appear in the extracted text
 *     (classic sign of custom-font encoding in the PDF).
 */
export function needsOCR(text: string, lang: string): boolean {
  if (text.trim().length === 0) return true;
  const range = SCRIPT_RANGES[lang];
  if (!range) return false; // English / unknown — trust pdf.js extraction
  const [start, end] = range;
  const re = new RegExp(
    `[\\u${start.toString(16).padStart(4, "0")}-\\u${end.toString(16).padStart(4, "0")}]`
  );
  return !re.test(text);
}

/**
 * Calls Google Cloud Vision DOCUMENT_TEXT_DETECTION on a base64-encoded image.
 * Returns the full text annotation string.
 */
export async function visionOCR(base64: string, apiKey: string): Promise<string> {
  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          },
        ],
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message ?? "Vision API error");
  }
  return (data.responses?.[0]?.fullTextAnnotation?.text ?? "").trim();
}
