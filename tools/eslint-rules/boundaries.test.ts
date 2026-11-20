import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

// WAR-12 K2: module boundaries of the plugin architecture, checked with the project's own
// ESLint configuration on code placed at real paths of the repository.
const root = resolve(import.meta.dirname, '../..');
const eslint = new ESLint({ cwd: root });

async function boundaryErrors(filePath: string, code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath: join(root, filePath) });
  return (result?.messages ?? [])
    .filter((message) =>
      ['boundaries/dependencies', 'no-restricted-imports'].includes(message.ruleId ?? ''),
    )
    .map((message) => message.ruleId ?? '');
}

const layerFile = 'packages/layer-drawing/src/check.ts';

// Linting with the full project configuration can take a few seconds on a busy machine.
describe('WAR-12: plugins use only the public API (lint rule)', { timeout: 60_000 }, () => {
  it('WAR-12: a layer may import the plugin API', async () => {
    expect(
      await boundaryErrors(layerFile, "import { API_VERSION } from '@tablica/plugin-api';\n"),
    ).toEqual([]);
    expect(await boundaryErrors(layerFile, "import x from './index';\nexport { x };\n")).toEqual(
      [],
    );
  });

  it('WAR-12: a layer may not import the program core', async () => {
    expect(
      await boundaryErrors(
        layerFile,
        "import { Board } from '../../../app/src/lib/core/board';\nexport { Board };\n",
      ),
    ).toContain('boundaries/dependencies');
  });

  it('WAR-12: a layer may not import another layer', async () => {
    expect(
      await boundaryErrors(
        layerFile,
        "import media from '../../layer-media/src/index';\nexport { media };\n",
      ),
    ).toContain('boundaries/dependencies');
    expect(
      await boundaryErrors(
        layerFile,
        "import media from '@tablica/layer-media';\nexport { media };\n",
      ),
    ).toContain('no-restricted-imports');
  });

  it('WAR-12: the core and the plugin API do not import concrete layers', async () => {
    const importDrawing = (from: string) => `import drawing from '${from}';\nexport { drawing };\n`;
    expect(
      await boundaryErrors(
        'app/src/lib/core/check.ts',
        importDrawing('../../../../packages/layer-drawing/src/index'),
      ),
    ).toContain('boundaries/dependencies');
    expect(
      await boundaryErrors(
        'packages/plugin-api/src/check.ts',
        importDrawing('../../layer-drawing/src/index'),
      ),
    ).toContain('boundaries/dependencies');
    expect(
      await boundaryErrors(
        'packages/plugin-api/src/check.ts',
        "import { Board } from '../../../app/src/lib/core/board';\nexport { Board };\n",
      ),
    ).toContain('boundaries/dependencies');
  });

  it('WAR-12: only the composition root names concrete layers', async () => {
    expect(
      await boundaryErrors(
        'app/src/composition/check.ts',
        "import drawing from '../../../packages/layer-drawing/src/index';\nexport { drawing };\n",
      ),
    ).toEqual([]);
  });

  it('WAR-12: layer packages depend only on the plugin API', () => {
    const packages = readdirSync(join(root, 'packages'), { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== 'plugin-api')
      .map((entry) => entry.name);
    expect(packages).toEqual(
      expect.arrayContaining(['layer-background', 'layer-drawing', 'layer-media']),
    );
    for (const name of packages) {
      const manifest = JSON.parse(
        readFileSync(join(root, 'packages', name, 'package.json'), 'utf8'),
      ) as Record<string, Record<string, string> | undefined>;
      const dependencies = {
        ...manifest['dependencies'],
        ...manifest['peerDependencies'],
      };
      // The only program package a layer may use is the plugin API. Other dependencies can be
      // only external libraries (e.g. perfect-freehand of the drawing layer, ADR-007), never
      // workspace packages of the program.
      const program = Object.keys(dependencies).filter((dependency) =>
        dependency.startsWith('@tablica/'),
      );
      expect(program, name).toEqual(['@tablica/plugin-api']);
      for (const [dependency, version] of Object.entries(dependencies)) {
        if (dependency === '@tablica/plugin-api') continue;
        expect(version, `${name}: ${dependency}`).not.toMatch(/^(workspace|link|file):/);
      }
    }
  });
});
