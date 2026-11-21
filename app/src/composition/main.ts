import { getCurrentWindow } from '@tauri-apps/api/window';
import { mount } from 'svelte';
import App from '../App.svelte';
import { Board } from '../lib/core/board';
import { LessonSession } from '../lib/files/session';
import { createTauriPlatform } from '../lib/files/tauri-platform';
import { i18n } from '../lib/i18n/i18n.svelte';
import { loadHistoryLimit } from '../lib/settings/history-limit';
import { loadPenDisablesFingerDrawing } from '../lib/settings/input';
import {
  loadAutosaveMinutes,
  loadRecentFiles,
  saveRecentFiles,
} from '../lib/settings/recent-files';
import { builtinPlugins, DEFAULT_TOOL, newLessonDocument } from './builtin';
import '../styles/global.css';

const target = document.getElementById('app');
if (!target) throw new Error('Missing #app element');

const board = new Board({
  sources: builtinPlugins,
  document: newLessonDocument(),
  translate: i18n.t,
  addTranslations: i18n.addTranslations,
});
board.history.setLimit(loadHistoryLimit());
board.input.settings.penDisablesFingerDrawing = loadPenDisablesFingerDrawing();

// DAN-01, DAN-02: the lesson file, the autosave and the restore offer after a crash.
const session = new LessonSession({
  board,
  platform: createTauriPlatform(() => i18n.t('file.filterName')),
  newDocument: newLessonDocument,
  translate: i18n.t,
  recentFiles: loadRecentFiles(),
  saveRecentFiles,
  autosaveMinutes: loadAutosaveMinutes(),
});

void board
  .loadLayers()
  .then(() => {
    if (!board.tools.active && board.tools.get(DEFAULT_TOOL)) board.tools.setActive(DEFAULT_TOOL);
  })
  .then(() => session.start());

// A proper close asks about unsaved changes and removes the recovery copy (DAN-02 K3).
if ('__TAURI_INTERNALS__' in globalThis) {
  getCurrentWindow()
    .onCloseRequested(async (event) => {
      if (!(await session.close())) event.preventDefault();
    })
    .catch((error: unknown) => console.error('Close handler not installed', error));
}

// NF-04 K1 (T10): the drawing latency meter, readable for measurements on devices.
const diagnostics: Record<string, unknown> = { latency: board.input.latency };
// Development builds only: makes a plugin fail on demand, for the manual test of the recovery of
// broken layers (Q4, WAR-06 K3, P17 b). Example in the developer console:
// tablicaDiagnostics.breakPlugin('tablica.layer-drawing')
if (import.meta.env.DEV) {
  diagnostics['breakPlugin'] = (pluginId: string) =>
    board.breakPlugin(pluginId, new Error('Failure triggered for a test (tablicaDiagnostics)'));
}
Object.assign(globalThis, { tablicaDiagnostics: diagnostics });

export default mount(App, { target, props: { board, session } });
