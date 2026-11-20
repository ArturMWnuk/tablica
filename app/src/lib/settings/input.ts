// D4 switch: after the first use of the pen a single finger does not draw. Remembered on this device.
import { loadSetting, saveSetting } from './storage';

const SETTING_KEY = 'penDisablesFingerDrawing';

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function loadPenDisablesFingerDrawing(): boolean {
  return loadSetting(SETTING_KEY, isBoolean) ?? true;
}

export function savePenDisablesFingerDrawing(value: boolean): void {
  saveSetting(SETTING_KEY, value);
}
