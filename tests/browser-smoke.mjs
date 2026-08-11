import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('..', import.meta.url));
const html = `<!doctype html>
<script type="importmap">
  { "imports": { "pako": "/pako.mjs" } }
</script>
<script type="module">
  import {
    getAllProvinces,
    getAllRegions,
    getLocationsByPostalCode,
    getBarangaysByMunicipality,
    getMunicipalitiesByProvince,
    getProvincesByRegion
  } from "/index.mjs";

  document.body.dataset.results = JSON.stringify([
    getAllRegions().length,
    getAllProvinces().length,
    getProvincesByRegion("1400000000").length,
    getMunicipalitiesByProvince("1400100000").length,
    getBarangaysByMunicipality("0730600000").length,
    getLocationsByPostalCode("6000")[0].placeName
  ]);
</script>`;

let browser;

try {
  browser = await chromium.launch();
  const page = await browser.newPage();
  const assets = {
    'http://app.test/': ['text/html', html],
    'http://app.test/index.mjs': [
      'text/javascript',
      await readFile(`${root}/dist/index.mjs`)
    ],
    'http://app.test/pako.mjs': [
      'text/javascript',
      await readFile(`${root}/node_modules/pako/dist/pako.esm.mjs`)
    ]
  };
  await page.route('http://app.test/**', route => {
    const asset = assets[route.request().url()];
    return asset
      ? route.fulfill({ contentType: asset[0], body: asset[1] })
      : route.fulfill({ status: 404 });
  });
  const pageError = new Promise((_, reject) => page.once('pageerror', reject));
  await page.goto('http://app.test/');
  await Promise.race([
    page.waitForFunction(() => document.body.dataset.results),
    pageError
  ]);

  assert.deepEqual(
    JSON.parse(await page.evaluate(() => document.body.dataset.results)),
    [18, 82, 6, 27, 80, 'Cebu City']
  );
} finally {
  await browser?.close();
}
