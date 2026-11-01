import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import tablica from './tools/eslint-rules/index.js';

export default ts.config(
  {
    ignores: [
      '**/node_modules/',
      '**/dist/',
      'src-tauri/target/',
      'src-tauri/gen/',
      'test-results/',
      'playwright-report/',
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        extraFileExtensions: ['.svelte'],
      },
    },
  },
  {
    // UI-01: interface texts come only from translation files.
    files: ['**/*.svelte'],
    plugins: { tablica },
    rules: { 'tablica/no-raw-text': 'error' },
  },
  {
    // WAR-12: layer plugins may import only the public plugin API; the API and the core
    // never import layer plugins.
    files: ['app/src/**', 'packages/*/src/**'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'core', pattern: 'app/src' },
        { type: 'plugin-api', pattern: 'packages/plugin-api' },
        { type: 'layer', pattern: 'packages/*', capture: ['name'] },
      ],
      'import/resolver': { node: { extensions: ['.js', '.ts', '.svelte', '.json'] } },
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { type: 'core' } },
              allow: { to: { element: { types: { anyOf: ['core', 'plugin-api'] } } } },
            },
            {
              from: { element: { type: 'plugin-api' } },
              allow: { to: { element: { type: 'plugin-api' } } },
            },
            {
              from: { element: { type: 'layer' } },
              allow: { to: { element: { type: 'plugin-api' } } },
            },
            {
              // Each layer may import its own files.
              from: { element: { type: 'layer' } },
              allow: {
                to: { element: { type: 'layer', captured: { name: '{{from.captured.name}}' } } },
              },
            },
            {
              allow: { to: { module: { origin: 'external' } } },
            },
          ],
        },
      ],
    },
  },
);
