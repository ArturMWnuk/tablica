import { mount } from 'svelte';
import App from '../App.svelte';
import { Board } from '../lib/core/board';
import { i18n } from '../lib/i18n/i18n.svelte';
import { loadHistoryLimit } from '../lib/settings/history-limit';
import { builtinPlugins, newLessonDocument } from './builtin';
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
void board.loadLayers();

export default mount(App, { target, props: { board } });
