import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast';
import { cssVariableName, resolveTheme, TEXT_PAIRS, THEMES, themeTokens } from './tokens';

describe('UI-02: theme tokens', () => {
  it('UI-02: contrast calculation matches WCAG reference values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
  });

  for (const theme of THEMES) {
    for (const [foreground, background] of TEXT_PAIRS) {
      it(`UI-02: ${theme} theme ${foreground} on ${background} has contrast >= 4.5:1`, () => {
        const tokens = themeTokens[theme];
        expect(contrastRatio(tokens[foreground], tokens[background])).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it('UI-02: light and dark themes define the same tokens', () => {
    expect(Object.keys(themeTokens.dark).sort()).toEqual(Object.keys(themeTokens.light).sort());
  });

  it('UI-02: system preference follows the OS color scheme (D11)', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('UI-02: token names map to CSS custom properties', () => {
    expect(cssVariableName('textMuted')).toBe('--color-text-muted');
    expect(cssVariableName('background')).toBe('--color-background');
  });
});
