// Panel with the colour and width of the pen and the highlighter (RYS-01 K2): a palette, any
// colour (colour picker and hex code), ready widths and a slider 1–50 px.
import type { Translate } from '@tablica/plugin-api';
import { PALETTE, WIDTH_PRESETS, type DrawingSettings } from './settings';
import { MAX_WIDTH, MIN_WIDTH, parseHexColor, type StrokeTool } from './stroke';

const TOOLS: readonly StrokeTool[] = ['pen', 'highlighter'];

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  properties: Partial<Record<string, string>> = {},
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(properties)) {
    if (value !== undefined) node.setAttribute(name, value);
  }
  return node;
}

const BUTTON_STYLE =
  'min-width:24px;height:24px;padding:0 4px;font:inherit;font-size:12px;color:var(--color-text);' +
  'background:none;border:1px solid var(--color-border);border-radius:4px;cursor:pointer;';

function toolSection(tool: StrokeTool, settings: DrawingSettings, t: Translate) {
  const section = element('fieldset', {
    'data-tool': tool,
    'data-testid': `drawing-style-${tool}`,
  });
  section.style.cssText =
    'margin:0 0 8px;padding:4px 8px 8px;border:1px solid var(--color-border);border-radius:4px;';
  const legend = element('legend');
  legend.textContent = t(`tool.${tool}`);

  const swatches = element('div', { role: 'group', 'aria-label': t('panel.color') });
  swatches.style.cssText = 'display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px;';
  const swatchButtons = PALETTE.map((color) => {
    const button = element('button', {
      type: 'button',
      'data-testid': 'drawing-swatch',
      'data-color': color,
      'aria-label': t('panel.swatch', { value: color }),
      title: t('panel.swatch', { value: color }),
    });
    button.style.cssText = `${BUTTON_STYLE}width:22px;min-width:22px;height:22px;background:${color};`;
    button.addEventListener('click', () => settings.update(tool, { color }));
    swatches.append(button);
    return button;
  });

  const custom = element('div');
  custom.style.cssText = 'display:flex;align-items:center;gap:4px;margin-bottom:6px;';
  const picker = element('input', {
    type: 'color',
    'data-testid': 'drawing-color-picker',
    'aria-label': t('panel.customColor'),
    title: t('panel.customColor'),
  });
  picker.style.cssText = 'width:32px;height:24px;padding:0;border:1px solid var(--color-border);';
  picker.addEventListener('input', () => settings.update(tool, { color: picker.value }));
  const hex = element('input', {
    type: 'text',
    'data-testid': 'drawing-color-hex',
    'aria-label': t('panel.hex'),
    title: t('panel.hex'),
    maxlength: '7',
    spellcheck: 'false',
  });
  hex.style.cssText =
    'width:72px;font:inherit;color:var(--color-text);background:var(--color-surface);' +
    'border:1px solid var(--color-border);border-radius:4px;padding:1px 4px;';
  hex.addEventListener('change', () => {
    const color = parseHexColor(hex.value);
    if (color) settings.update(tool, { color });
    else hex.value = settings.style(tool).color;
  });
  custom.append(picker, hex);

  const widths = element('div', { role: 'group', 'aria-label': t('panel.width') });
  widths.style.cssText = 'display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px;';
  const widthButtons = WIDTH_PRESETS[tool].map((width) => {
    const button = element('button', {
      type: 'button',
      'data-testid': 'drawing-width-preset',
      'data-width': String(width),
      'aria-label': t('panel.widthPreset', { value: width }),
    });
    button.style.cssText = BUTTON_STYLE;
    button.textContent = t('panel.widthValue', { value: width });
    button.addEventListener('click', () => settings.update(tool, { width }));
    widths.append(button);
    return button;
  });

  const sliderLine = element('div');
  sliderLine.style.cssText = 'display:flex;align-items:center;gap:6px;';
  const slider = element('input', {
    type: 'range',
    'data-testid': 'drawing-width',
    min: String(MIN_WIDTH),
    max: String(MAX_WIDTH),
    step: '1',
    'aria-label': t('panel.width'),
    title: t('panel.width'),
  });
  slider.style.cssText = 'flex:1;min-width:0;accent-color:var(--color-accent);';
  slider.addEventListener('input', () => settings.update(tool, { width: Number(slider.value) }));
  const output = element('output', { 'data-testid': 'drawing-width-value' });
  output.style.cssText =
    'min-width:40px;font-size:12px;text-align:right;color:var(--color-text-muted);';
  sliderLine.append(slider, output);

  section.append(legend, swatches, custom, widths, sliderLine);

  const update = () => {
    const { color, width } = settings.style(tool);
    for (const button of swatchButtons) {
      const pressed = button.dataset['color'] === color;
      button.setAttribute('aria-pressed', String(pressed));
      button.style.outline = pressed ? '2px solid var(--color-accent)' : '';
      button.style.outlineOffset = pressed ? '1px' : '';
    }
    for (const button of widthButtons) {
      const pressed = Number(button.dataset['width']) === width;
      button.setAttribute('aria-pressed', String(pressed));
      button.style.borderColor = pressed ? 'var(--color-accent)' : 'var(--color-border)';
    }
    picker.value = color;
    if (document.activeElement !== hex) hex.value = color;
    slider.value = String(width);
    output.textContent = t('panel.widthValue', { value: width });
  };
  update();
  return { section, update };
}

/** Builds the panel in `root`; returns a function that removes it. */
export function mountStylePanel(
  root: HTMLElement,
  settings: DrawingSettings,
  t: Translate,
): () => void {
  const sections = TOOLS.map((tool) => toolSection(tool, settings, t));
  root.append(...sections.map(({ section }) => section));
  const unsubscribe = settings.subscribe(() => {
    for (const { update } of sections) update();
  });
  return () => {
    unsubscribe();
    for (const { section } of sections) section.remove();
  };
}
