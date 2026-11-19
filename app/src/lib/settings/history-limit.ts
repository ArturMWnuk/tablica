// Undo limit set by the user (DAN-03 K2, D6), remembered on this device.
import { DEFAULT_HISTORY_LIMIT, isHistoryLimit } from '../core/history';
import { loadSetting, saveSetting } from './storage';

const SETTING_KEY = 'historyLimit';

export function loadHistoryLimit(): number {
  return loadSetting(SETTING_KEY, isHistoryLimit) ?? DEFAULT_HISTORY_LIMIT;
}

export function saveHistoryLimit(limit: number): void {
  saveSetting(SETTING_KEY, limit);
}
