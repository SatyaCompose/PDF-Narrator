/** Cookie-based global language preference + per-session voice preference. */

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === "undefined") return;
  try {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Strict; max-age=${maxAge}`;
  } catch {
    // ignore
  }
}

/** Persist the user's preferred language to a cookie (30-day TTL). */
export function savePrefLang(lang: string): void {
  setCookie("pref_lang", lang, 30);
}

/** Load the persisted language preference, or null if not set. */
export function loadPrefLang(): string | null {
  return getCookie("pref_lang");
}

/** Persist the voice name for a given session to localStorage. */
export function saveSessionVoice(sessionId: string, voiceName: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(`sess_voice_${sessionId}`, voiceName);
  } catch {
    // ignore
  }
}

/** Load the saved voice name for a given session, or null if not set. */
export function loadSessionVoice(sessionId: string): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(`sess_voice_${sessionId}`);
  } catch {
    return null;
  }
}
