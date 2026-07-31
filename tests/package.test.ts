import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

const projectRoot = resolve(import.meta.dirname, '..');
const consumerRoot = mkdtempSync(join(tmpdir(), 'ph-address-package-'));
const npmEnv = { ...process.env, npm_config_cache: join(tmpdir(), 'ph-address-npm-cache') };

afterAll(() => rmSync(consumerRoot, { recursive: true, force: true }));

describe('packed package', () => {
  it('publishes and resolves the complete public contract', () => {
    const [pack] = JSON.parse(execFileSync(
      'npm',
      ['pack', '--json', '--pack-destination', consumerRoot],
      { cwd: projectRoot, encoding: 'utf8', env: npmEnv }
    )) as [{ filename: string; files: { path: string }[] }];
    const files = pack.files.map(file => file.path);

    expect(files).toContain('dist/index.d.ts');
    expect(files).toContain('dist/index.js');
    expect(files).toContain('dist/index.mjs');
    expect(files.every(path =>
      path === 'LICENCE' ||
      path === 'README.md' ||
      path === 'package.json' ||
      path.startsWith('dist/')
    )).toBe(true);

    writeFileSync(join(consumerRoot, 'package.json'), '{"type":"module"}');
    execFileSync(
      'npm',
      ['install', '--ignore-scripts', '--no-package-lock', join(consumerRoot, pack.filename)],
      { cwd: consumerRoot, env: npmEnv }
    );

    execFileSync(
      'node',
      ['-e', "require('@aivangogh/ph-address').getAllRegions()"],
      { cwd: consumerRoot }
    );
    execFileSync(
      'node',
      ['--input-type=module', '-e', "import('@aivangogh/ph-address').then(m => m.getAllRegions())"],
      { cwd: consumerRoot }
    );

    writeFileSync(join(consumerRoot, 'index.ts'), `
      import type {
        PHRegion,
        PHProvince,
        PHMunicipality,
        PHBarangay
      } from '@aivangogh/ph-address';

      const values: [PHRegion, PHProvince, PHMunicipality, PHBarangay] = [] as never;
      void values;
    `);
    execFileSync(
      resolve(projectRoot, 'node_modules/.bin/tsc'),
      [
        '--noEmit',
        '--strict',
        '--target', 'ES2022',
        '--module', 'NodeNext',
        '--moduleResolution', 'NodeNext',
        join(consumerRoot, 'index.ts')
      ],
      { cwd: consumerRoot }
    );
  }, 30_000);
});
