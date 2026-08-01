import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const packageSpec = process.argv.slice(2).find(argument => argument !== '--');
if (!packageSpec) {
  console.error('Usage: pnpm test:published -- <npm-spec-or-tarball>');
  process.exit(1);
}

const consumer = mkdtempSync(join(tmpdir(), 'ph-address-rc-'));
const env = { ...process.env, npm_config_cache: mkdtempSync(join(tmpdir(), 'ph-address-rc-npm-cache-')) };

try {
  writeFileSync(join(consumer, 'package.json'), '{"type":"module"}\n');
  execFileSync('npm', ['install', '--prefer-online', '--ignore-scripts', '--no-package-lock', packageSpec], {
    cwd: consumer,
    env,
    stdio: 'inherit',
  });

  execFileSync('node', ['-e', "const m=require('@aivangogh/ph-address'); if (m.getAddressByBarangayCode('0730600001')?.barangay.name !== 'Adlaon') process.exit(1)"], { cwd: consumer });
  execFileSync('node', ['--input-type=module', '-e', "import('@aivangogh/ph-address').then(m => { if (m.getAllBarangays().length !== 42010) process.exit(1) })"], { cwd: consumer });

  writeFileSync(join(consumer, 'index.ts'), `
    import { getAddressByBarangayCode, type PHAddress } from '@aivangogh/ph-address';
    const address: PHAddress | undefined = getAddressByBarangayCode('0730600001');
    void address;
  `);
  execFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../node_modules/.bin/tsc'), [
    '--noEmit', '--strict', '--target', 'ES2022', '--module', 'NodeNext',
    '--moduleResolution', 'NodeNext', join(consumer, 'index.ts'),
  ], { cwd: consumer, stdio: 'inherit' });

  const entry = execFileSync('node', ['-e', "process.stdout.write(require.resolve('@aivangogh/ph-address'))"], { cwd: consumer, encoding: 'utf8' });
  const pako = execFileSync('node', ['-e', "process.stdout.write(require.resolve('pako/dist/pako.esm.mjs'))"], { cwd: consumer, encoding: 'utf8' });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.route('http://rc.test/**', route => {
      const url = route.request().url();
      if (url === 'http://rc.test/') {
        return route.fulfill({ contentType: 'text/html', body: `<!doctype html><script type="importmap">{"imports":{"pako":"/pako.mjs"}}</script><script type="module">import{getAddressByBarangayCode}from"/index.mjs";document.body.dataset.ok=String(getAddressByBarangayCode("0730600001")?.barangay.name==="Adlaon")</script>` });
      }
      if (url.endsWith('/index.mjs')) return route.fulfill({ contentType: 'text/javascript', body: readFileSync(entry.replace(/index\.js$/, 'index.mjs')) });
      if (url.endsWith('/pako.mjs')) return route.fulfill({ contentType: 'text/javascript', body: readFileSync(pako) });
      return route.fulfill({ status: 404 });
    });
    await page.goto('http://rc.test/');
    await page.waitForFunction(() => document.body.dataset.ok === 'true');
  } finally {
    await browser.close();
  }
} finally {
  rmSync(consumer, { recursive: true, force: true });
  rmSync(env.npm_config_cache, { recursive: true, force: true });
}

function fileURLToPath(url) {
  return new URL(url).pathname;
}
