import { describe, expect, it } from 'vitest';
import { coreCatalogs } from './catalogs';
import { addNamespace, type Catalogs, detectLocale, flattenKeys, translate } from './core';

describe('UI-01: translation files', () => {
  it('UI-01: PL and EN translation files have identical keys', () => {
    const pl = flattenKeys(coreCatalogs.pl).sort();
    const en = flattenKeys(coreCatalogs.en).sort();
    expect(pl.length).toBeGreaterThan(0);
    expect(en).toEqual(pl);
  });

  it('UI-01: no translation is empty', () => {
    for (const locale of ['pl', 'en'] as const) {
      for (const key of flattenKeys(coreCatalogs[locale])) {
        expect(translate(coreCatalogs, locale, key).trim(), `${locale}:${key}`).not.toBe('');
      }
    }
  });
});

describe('UI-01: translation lookup', () => {
  const catalogs: Catalogs = {
    pl: { greeting: 'Cześć, {name}!', only: { pl: 'tylko PL' } },
    en: { greeting: 'Hello, {name}!', onlyEn: 'only EN' },
  };

  it('UI-01: translates a key in the selected locale', () => {
    expect(translate(catalogs, 'pl', 'greeting', { name: 'Ala' })).toBe('Cześć, Ala!');
    expect(translate(catalogs, 'en', 'greeting', { name: 'Ala' })).toBe('Hello, Ala!');
  });

  it('UI-01: missing key falls back to the other locale, then to the key', () => {
    expect(translate(catalogs, 'pl', 'onlyEn')).toBe('only EN');
    expect(translate(catalogs, 'en', 'only.pl')).toBe('tylko PL');
    expect(translate(catalogs, 'en', 'does.not.exist')).toBe('does.not.exist');
  });

  it('UI-01: plugin catalogs are added under their namespace', () => {
    const merged = addNamespace(catalogs, 'layer-drawing', {
      pl: { pen: 'Pióro' },
      en: { pen: 'Pen' },
    });
    expect(translate(merged, 'pl', 'layer-drawing.pen')).toBe('Pióro');
    expect(translate(merged, 'en', 'layer-drawing.pen')).toBe('Pen');
    expect(translate(merged, 'en', 'greeting', { name: 'X' })).toBe('Hello, X!');
  });
});

describe('UI-01: default language (D10)', () => {
  it('UI-01: Polish system language selects PL', () => {
    expect(detectLocale('pl')).toBe('pl');
    expect(detectLocale('pl-PL')).toBe('pl');
  });

  it('UI-01: any other system language selects EN', () => {
    expect(detectLocale('en-US')).toBe('en');
    expect(detectLocale('de-DE')).toBe('en');
    expect(detectLocale(undefined)).toBe('en');
  });
});
