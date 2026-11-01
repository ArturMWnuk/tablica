// Local ESLint plugin with project-specific rules.
import noRawText from './no-raw-text.js';

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
  meta: { name: 'eslint-plugin-tablica' },
  rules: { 'no-raw-text': noRawText },
};

export default plugin;
