// Application settings persisted per device (not in the lesson file).
// Storage can be unavailable (private mode, blocked site data), so every access is guarded.

const PREFIX = 'tablica.';

export function loadSetting<T>(
  key: string,
  isValid: (value: unknown) => value is T,
): T | undefined {
  try {
    const raw = globalThis.localStorage?.getItem(PREFIX + key);
    if (raw === null || raw === undefined) return undefined;
    const value: unknown = JSON.parse(raw);
    return isValid(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

export function saveSetting(key: string, value: unknown): void {
  try {
    globalThis.localStorage?.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Settings stay in memory for this session.
  }
}
