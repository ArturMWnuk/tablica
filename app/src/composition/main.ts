import { mount } from 'svelte';
import App from '../App.svelte';
import { Board } from '../lib/core/board';
import { i18n } from '../lib/i18n/i18n.svelte';
import { loadHistoryLimit } from '../lib/settings/history-limit';
import { loadPenDisablesFingerDrawing } from '../lib/settings/input';
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
void board.loadLayers().then(() => {
  if (!board.tools.active && board.tools.get(DEFAULT_TOOL)) board.tools.setActive(DEFAULT_TOOL);
});

// NF-04 K1 (T10): the drawing latency meter, readable for measurements on devices.
Object.assign(globalThis, { tablicaDiagnostics: { latency: board.input.latency } });

export default mount(App, { target, props: { board } });
