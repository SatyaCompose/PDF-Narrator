// IndexedDB persistence layer — sessions, PDF binary data, bookmarks

const DB_NAME = "pdf-narrator";
const DB_VERSION = 1;
const MAX_UNPINNED = 10; // pinned PDFs are never auto-pruned

export interface SessionMeta {
  id: string;        // hash of fileName+fileSize — stable across re-opens
  fileName: string;
  fileSize: number;  // bytes
  lastPage: number;
  totalPages: number;
  lastRead: number;  // Date.now()
  pinned?: boolean;  // true = keep forever, never auto-pruned
}

export interface Bookmark {
  id: string;
  sessionId: string;
  page: number;
  label: string;
  createdAt: number;
}

// ─── DB open ──────────────────────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains("sessions")) {
        db.createObjectStore("sessions", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("pdf_data")) {
        db.createObjectStore("pdf_data", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("bookmarks")) {
        const bms = db.createObjectStore("bookmarks", { keyPath: "id" });
        bms.createIndex("by_session", "sessionId", { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ─── Session ID ───────────────────────────────────────────────────────────────

export function makeSessionId(fileName: string, fileSize: number): string {
  const slug = fileName.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 40);
  return `${slug}-${fileSize}`;
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function saveSession(
  meta: SessionMeta,
  pdfData: ArrayBuffer
): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["sessions", "pdf_data"], "readwrite");
    tx.objectStore("sessions").put(meta);
    tx.objectStore("pdf_data").put({ id: meta.id, data: pdfData });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  await pruneOldSessions();
}

export async function updateSessionPage(
  id: string,
  page: number
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("sessions", "readwrite");
    const store = tx.objectStore("sessions");
    const req = store.get(id);
    req.onsuccess = () => {
      const s = req.result as SessionMeta | undefined;
      if (s) store.put({ ...s, lastPage: page, lastRead: Date.now() });
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllSessions(): Promise<SessionMeta[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("sessions", "readonly");
    const req = tx.objectStore("sessions").getAll();
    req.onsuccess = () => {
      const list = (req.result as SessionMeta[]).sort(
        (a, b) => b.lastRead - a.lastRead
      );
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getSessionPdf(id: string): Promise<ArrayBuffer | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pdf_data", "readonly");
    const req = tx.objectStore("pdf_data").get(id);
    req.onsuccess = () => resolve(req.result?.data ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteSession(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(
      ["sessions", "pdf_data", "bookmarks"],
      "readwrite"
    );
    tx.objectStore("sessions").delete(id);
    tx.objectStore("pdf_data").delete(id);

    const bmStore = tx.objectStore("bookmarks");
    const idx = bmStore.index("by_session");
    const req = idx.getAll(id);
    req.onsuccess = () => {
      (req.result as Bookmark[]).forEach((bm) => bmStore.delete(bm.id));
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function pruneOldSessions(): Promise<void> {
  const sessions = await getAllSessions();
  // Only prune unpinned sessions; pinned ones are kept indefinitely
  const unpinned = sessions.filter((s) => !s.pinned);
  if (unpinned.length <= MAX_UNPINNED) return;
  const toDelete = unpinned.slice(MAX_UNPINNED);
  await Promise.all(toDelete.map((s) => deleteSession(s.id)));
}

export async function pinSession(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("sessions", "readwrite");
    const store = tx.objectStore("sessions");
    const req = store.get(id);
    req.onsuccess = () => {
      const s = req.result as SessionMeta | undefined;
      if (s) store.put({ ...s, pinned: true });
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function unpinSession(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("sessions", "readwrite");
    const store = tx.objectStore("sessions");
    const req = store.get(id);
    req.onsuccess = () => {
      const s = req.result as SessionMeta | undefined;
      if (s) store.put({ ...s, pinned: false });
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Ask the browser to persist IndexedDB data (prevents auto-eviction under disk pressure).
// Returns true if the browser granted persistent storage.
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) return false;
  try {
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

export async function isPersistentStorage(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.storage?.persisted) return false;
  try {
    return await navigator.storage.persisted();
  } catch {
    return false;
  }
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export async function addBookmark(bm: Bookmark): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("bookmarks", "readwrite");
    tx.objectStore("bookmarks").put(bm);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getBookmarksForSession(
  sessionId: string
): Promise<Bookmark[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("bookmarks", "readonly");
    const idx = tx.objectStore("bookmarks").index("by_session");
    const req = idx.getAll(sessionId);
    req.onsuccess = () => {
      const list = (req.result as Bookmark[]).sort((a, b) => a.page - b.page);
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteBookmark(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("bookmarks", "readwrite");
    tx.objectStore("bookmarks").delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d === 1) return "yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
