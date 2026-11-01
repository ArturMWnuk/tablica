// Color tokens of the interface themes (UI-02). Components use only the CSS custom properties
// generated from these tokens (`--color-<token>`), never literal colors.

export const THEMES = ['light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export interface ThemeTokens {
  /** Window background behind panels. */
  background: string;
  /** Toolbars and panels. */
  surface: string;
  /** Main interface text. */
  text: string;
  /** Secondary interface text (hints, labels). */
  textMuted: string;
  /** Panel and control borders. */
  border: string;
  /** Accent for active and focused controls. */
  accent: string;
  /** Text drawn on the accent color. */
  onAccent: string;
  /** Default board area color until the background layer takes over (TLO-01). */
  board: string;
}

export const themeTokens: Record<Theme, ThemeTokens> = {
  light: {
    background: '#eef0f3',
    surface: '#ffffff',
    text: '#1c1f24',
    textMuted: '#4f5661',
    border: '#c9ced6',
    accent: '#1f5fbf',
    onAccent: '#ffffff',
    board: '#ffffff',
  },
  dark: {
    background: '#14171b',
    surface: '#1f2329',
    text: '#e8eaed',
    textMuted: '#a9b0ba',
    border: '#3a414b',
    accent: '#7fb0ff',
    onAccent: '#0d1520',
    board: '#2a2f36',
  },
};

/** Text/background token pairs that must meet the WCAG AA contrast ratio. */
export const TEXT_PAIRS: ReadonlyArray<readonly [keyof ThemeTokens, keyof ThemeTokens]> = [
  ['text', 'background'],
  ['text', 'surface'],
  ['textMuted', 'background'],
  ['textMuted', 'surface'],
  ['onAccent', 'accent'],
  ['text', 'board'],
];

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEME_PREFERENCES as readonly string[]).includes(value);
}

/** Resolves the user's preference to a concrete theme; "system" follows the OS (D11). */
export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): Theme {
  if (preference === 'system') return systemPrefersDark ? 'dark' : 'light';
  return preference;
}

/** Converts a token name to its CSS custom property, e.g. textMuted -> --color-text-muted. */
export function cssVariableName(token: keyof ThemeTokens): string {
  return `--color-${token.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
}
