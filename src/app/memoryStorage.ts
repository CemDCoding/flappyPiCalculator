import type { StorageLike } from '../contracts/leaderboard';

/** In-memory fallback when localStorage is unavailable (data lost on reload). */
export function createMemoryStorage(): StorageLike {
  const data = new Map<string, string>();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, String(v)),
    removeItem: (k) => void data.delete(k),
  };
}

/** Returns window.localStorage if accessible, otherwise an in-memory store. */
export function pickStorage(getStorage: () => StorageLike | null | undefined): StorageLike {
  try {
    const s = getStorage();
    if (s) return s;
  } catch {
    // access denied (e.g. privacy settings)
  }
  return createMemoryStorage();
}
