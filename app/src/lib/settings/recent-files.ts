// Recently used lesson files (DAN-01 K4) and the autosave interval (DAN-02 K1, D7), remembered on
// this device (program settings, not the lesson).
import { loadSetting, saveSetting } from './storage';

/** Number of files kept in the "Recent files" list. */
export const MAX_RECENT_FILES = 10;

const RECENT_KEY = 'recentFiles';
const AUTOSAVE_KEY = 'autosaveMinutes';

/** DAN-02 K1: default autosave interval in minutes. */
export const DEFAULT_AUTOSAVE_MINUTES = 2;
/** D7: allowed interval, in whole minutes; `null` means the autosave is switched off. */
export const MIN_AUTOSAVE_MINUTES = 1;
export const MAX_AUTOSAVE_MINUTES = 60;

function isPathList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && item !== '');
}

export function isAutosaveMinutes(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === 'number' &&
      Number.isInteger(value) &&
      value >= MIN_AUTOSAVE_MINUTES &&
      value <= MAX_AUTOSAVE_MINUTES)
  );
}

/** Brings a number into the D7 range (rounded to whole minutes). */
export function clampAutosaveMinutes(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_AUTOSAVE_MINUTES;
  return Math.min(MAX_AUTOSAVE_MINUTES, Math.max(MIN_AUTOSAVE_MINUTES, Math.round(value)));
}

export function loadRecentFiles(): string[] {
  return (loadSetting(RECENT_KEY, isPathList) ?? []).slice(0, MAX_RECENT_FILES);
}

export function saveRecentFiles(paths: readonly string[]): void {
  saveSetting(RECENT_KEY, paths.slice(0, MAX_RECENT_FILES));
}

/** The list with `path` moved to the front (newest first), without duplicates. */
export function withRecent(paths: readonly string[], path: string): string[] {
  return [path, ...paths.filter((item) => item !== path)].slice(0, MAX_RECENT_FILES);
}

export function loadAutosaveMinutes(): number | null {
  const value = loadSetting(AUTOSAVE_KEY, isAutosaveMinutes);
  return value === undefined ? DEFAULT_AUTOSAVE_MINUTES : value;
}

export function saveAutosaveMinutes(minutes: number | null): void {
  saveSetting(AUTOSAVE_KEY, minutes);
}
