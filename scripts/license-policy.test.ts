import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findViolations, isAllowedExpression } from './license-policy.mjs';

describe('NF-01: license check', () => {
  it('NF-01: accepts GPL-3.0 compatible licenses', () => {
    for (const license of ['MIT', 'Apache-2.0', 'BSD-3-Clause', 'ISC', 'MPL-2.0', 'GPL-3.0-only']) {
      expect(isAllowedExpression(license), license).toBe(true);
    }
  });

  it('NF-01: rejects licenses incompatible with GPL-3.0', () => {
    for (const license of ['SSPL-1.0', 'BUSL-1.1', 'GPL-2.0-only', 'CC-BY-NC-4.0', 'UNLICENSED']) {
      expect(isAllowedExpression(license), license).toBe(false);
    }
  });

  it('NF-01: evaluates SPDX expressions with OR, AND, WITH and parentheses', () => {
    expect(isAllowedExpression('(MIT OR SSPL-1.0)')).toBe(true);
    expect(isAllowedExpression('MIT AND SSPL-1.0')).toBe(false);
    expect(isAllowedExpression('Apache-2.0 WITH LLVM-exception')).toBe(true);
    expect(isAllowedExpression('(MIT AND Zlib) OR BUSL-1.1')).toBe(true);
    expect(isAllowedExpression('GPL-3.0+')).toBe(true);
  });

  it('NF-01: report with a deliberately disallowed dependency fails the check', () => {
    const report = {
      MIT: [{ name: 'good-lib', versions: ['1.0.0'] }],
      'SSPL-1.0': [{ name: 'bad-lib', versions: ['2.3.4'] }],
      Unknown: [{ name: 'no-license-lib', versions: ['0.1.0'] }],
    };
    expect(findViolations(report)).toEqual([
      { name: 'bad-lib', versions: ['2.3.4'], license: 'SSPL-1.0' },
      { name: 'no-license-lib', versions: ['0.1.0'], license: 'Unknown' },
    ]);
  });

  it('NF-01: report with only allowed dependencies passes', () => {
    const report = {
      MIT: [{ name: 'a', versions: ['1.0.0'] }],
      '(MIT OR Apache-2.0)': [{ name: 'b', versions: ['1.0.0'] }],
    };
    expect(findViolations(report)).toEqual([]);
  });
});

describe('NF-01: project license', () => {
  it('NF-01: LICENSE file contains the GPL-3.0 text', () => {
    const text = readFileSync(new URL('../LICENSE', import.meta.url), 'utf8');
    expect(text).toContain('GNU GENERAL PUBLIC LICENSE');
    expect(text).toContain('Version 3, 29 June 2007');
  });

  it('NF-01: packages and the Rust core declare GPL-3.0', () => {
    const root = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    const app = JSON.parse(readFileSync(new URL('../app/package.json', import.meta.url), 'utf8'));
    const cargo = readFileSync(new URL('../src-tauri/Cargo.toml', import.meta.url), 'utf8');
    expect(root.license).toBe('GPL-3.0-only');
    expect(app.license).toBe('GPL-3.0-only');
    expect(cargo).toMatch(/^license = "GPL-3\.0-only"$/m);
  });
});
