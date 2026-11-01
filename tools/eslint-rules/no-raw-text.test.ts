import { RuleTester } from 'eslint';
import svelteParser from 'svelte-eslint-parser';
import { describe, it } from 'vitest';
import rule from './no-raw-text.js';

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: { parser: svelteParser },
});

describe('UI-01: lint rule forbids text literals in components', () => {
  tester.run('no-raw-text', rule, {
    valid: [
      { code: '<p>{t("board.title")}</p>' },
      { code: '<button title={t("settings.language")}>{t("ok")}</button>' },
      { code: '<div>  </div>' },
      { code: '<span>{count} / 10 — 5%</span>' },
      { code: '<style>p { color: red; }</style>' },
      { code: '<div class="board" id="main"></div>' },
    ],
    invalid: [
      { code: '<p>Tablica</p>', errors: [{ messageId: 'rawText' }] },
      { code: '<button>Zapisz</button>', errors: [{ messageId: 'rawText' }] },
      { code: '<input placeholder="Szukaj" />', errors: [{ messageId: 'rawText' }] },
      { code: '<button aria-label="Close"></button>', errors: [{ messageId: 'rawText' }] },
      { code: '<img alt="Logo" src="x.png" />', errors: [{ messageId: 'rawText' }] },
      { code: '<p>{t("a")} żółć</p>', errors: [{ messageId: 'rawText' }] },
    ],
  });
});
