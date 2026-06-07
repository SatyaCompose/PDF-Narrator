// localStorage-backed OCR text cache keyed by (sessionId, page).
// Each entry is just the extracted text string — small enough for localStorage.
const PREFIX = "ocr_v1_";

export function getOcrCache(sessionId: string, page: number): string | null {
  try {
    return localStorage.getItem(`${PREFIX}${sessionId}:${page}`);
  } catch {
    return null;
  }
}

export function setOcrCache(sessionId: string, page: number, text: string): void {
  try {
    localStorage.setItem(`${PREFIX}${sessionId}:${page}`, text);
  } catch {
    // Quota exceeded — silently skip caching
  }
}

export function clearOcrCache(sessionId: string): void {
  try {
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith(`${PREFIX}${sessionId}`)
    );
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
