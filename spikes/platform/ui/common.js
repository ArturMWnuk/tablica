// Shared helpers of the prototype pages (step 1.1). Not part of the application.
const tauri = window.__TAURI__;

export const invoke = tauri.core.invoke;
export const listen = tauri.event.listen;
export const params = new URLSearchParams(location.search);

/** Sends a result or an observed event to the Rust side (collected by the automatic run). */
export function report(kind, data = null) {
  return invoke('report', { kind, data }).catch(() => {});
}

export function percentile(values, p) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return Math.round(sorted[Math.max(0, index)] * 1000) / 1000;
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
