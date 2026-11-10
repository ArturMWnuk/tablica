import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// WAR-12 K1: API v1 is documented in docs/api: reference generated from the types and a guide.
const root = resolve(import.meta.dirname, '..');
const reference = join(root, 'docs/api/referencja');

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).replaceAll('\\', '/'))
    .sort();
}

function exportedNames(): string[] {
  const source = readFileSync(join(root, 'packages/plugin-api/src/index.ts'), 'utf8');
  const lists = [...source.matchAll(/export\s*\{([^}]*)\}/g)].map((match) => match[1] ?? '');
  return lists
    .flatMap((list) => list.split(','))
    .map((item) => item.replace(/\btype\b/, '').trim())
    .filter((name) => name !== '');
}

describe('WAR-12: plugin API documentation', () => {
  it('WAR-12: reference documentation is generated from the current types', () => {
    const out = mkdtempSync(join(tmpdir(), 'tablica-api-'));
    try {
      // TypeDoc fails on any undocumented export (typedoc.json: notDocumented + warnings as errors).
      execFileSync(
        process.execPath,
        [join(root, 'node_modules/typedoc/bin/typedoc'), '--out', out, '--logLevel', 'Error'],
        { cwd: root, stdio: 'pipe' },
      );
      const generated = listFiles(out);
      expect(listFiles(reference)).toEqual(generated);
      for (const file of generated) {
        expect(readFileSync(join(reference, file), 'utf8'), file).toBe(
          readFileSync(join(out, file), 'utf8'),
        );
      }
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  }, 120_000);

  it('WAR-12: every export of the API has a reference page', () => {
    const pages = listFiles(reference).map((file) =>
      file.replace(/^.*\//, '').replace(/\.md$/, ''),
    );
    const names = exportedNames();
    expect(names.length).toBeGreaterThan(20);
    for (const name of names) expect(pages, name).toContain(name);
  });

  it('WAR-12: the guide "Jak napisać warstwę" covers every part of the API', () => {
    const guide = readFileSync(join(root, 'docs/api/jak-napisac-warstwe.md'), 'utf8');
    for (const topic of [
      'manifest.json',
      'apiVersion',
      'validateManifest',
      'defineLayerPlugin',
      'createData',
      'serialize',
      'deserialize',
      'schemaVersion',
      'activate',
      'mountLayer',
      'render()',
      'camera',
      'execute',
      'registerTool',
      'registerShortcut',
      'registerPanel',
      'translations',
      'LayerAccessError',
    ]) {
      expect(guide, topic).toContain(topic);
    }
  });
});
