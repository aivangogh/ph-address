# Lazy PSGC Data Initialization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize each PSGC level only when requested, build sorted indexes without repeated array copies, and report cold and cached query medians in the existing benchmark.

**Architecture:** Replace the loader's single all-data initializer with four cached dataset initializers. Each initializer owns parsing, field derivation, one-time sorting, and its related index; public query functions then return those cached sorted values directly.

**Tech Stack:** TypeScript, Vitest, Bun, pako

## Global Constraints

- Preserve the synchronous public API and returned data shapes.
- Parse each dataset at most once.
- Do not add dependencies or change the generated data format.
- Keep benchmark measurements informational and outside CI assertions.
- Keep the existing `bun run benchmark` command.

---

### Task 1: Lazy Dataset Initializers

**Files:**
- Create: `tests/data-loader.test.ts`
- Modify: `src/utils/data-loader.ts`

**Interfaces:**
- Consumes: compressed string exports from `src/data-csv-ts` and `pako.inflate`.
- Produces: the existing `getRegions()`, `getProvinces()`, `getMunicipalities()`, `getBarangays()`, `getIndexedProvincesByRegion()`, `getIndexedMunicipalitiesByProvince()`, and `getIndexedBarangaysByMunicipality()` functions with lazy, sorted caches.

- [ ] **Step 1: Write loader tests with isolated mocked datasets**

Create `tests/data-loader.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { inflate } = vi.hoisted(() => {
  const csvByKey: Record<string, string> = {
    regions: [
      'name,psgcCode,designation',
      'Zulu,0200000000,Region',
      'Alpha,0100000000,Region',
    ].join('\n'),
    provinces: [
      'name,psgcCode',
      'Zulu Province,0200100000',
      'Alpha Province,0200200000',
    ].join('\n'),
    municipalities: [
      'name,psgcCode,provinceCode',
      'Zulu Town,0200101000,0200100000',
      'Alpha Town,0200102000,0200100000',
    ].join('\n'),
    barangays: [
      'name,psgcCode',
      'Zulu Barangay,0200101002',
      'Alpha Barangay,0200101001',
    ].join('\n'),
  };

  return {
    inflate: vi.fn((bytes: Uint8Array) => {
      const key = new TextDecoder().decode(bytes);
      return csvByKey[key];
    }),
  };
});

vi.mock('pako', () => ({ default: { inflate } }));
vi.mock('../src/data-csv-ts', () => ({
  regions: btoa('regions'),
  provinces: btoa('provinces'),
  municipalities: btoa('municipalities'),
  barangays: btoa('barangays'),
}));

describe('lazy data loader', () => {
  beforeEach(() => {
    vi.resetModules();
    inflate.mockClear();
  });

  it('loads only regions for a regions-only lookup', async () => {
    const { getRegions } = await import('../src/utils/data-loader');

    expect(getRegions().map(({ name }) => name)).toEqual(['Alpha', 'Zulu']);
    expect(inflate).toHaveBeenCalledTimes(1);
    expect(new TextDecoder().decode(inflate.mock.calls[0][0])).toBe('regions');
  });

  it('parses each requested dataset once and keeps index buckets sorted', async () => {
    const loader = await import('../src/utils/data-loader');

    expect(loader.getProvinces().map(({ name }) => name)).toEqual([
      'Alpha Province',
      'Zulu Province',
    ]);
    expect(loader.getIndexedProvincesByRegion().get('0200000000')?.map(({ name }) => name))
      .toEqual(['Alpha Province', 'Zulu Province']);

    expect(loader.getMunicipalities().map(({ name }) => name)).toEqual([
      'Alpha Town',
      'Zulu Town',
    ]);
    expect(loader.getIndexedMunicipalitiesByProvince().get('0200100000')?.map(({ name }) => name))
      .toEqual(['Alpha Town', 'Zulu Town']);

    expect(loader.getBarangays().map(({ name }) => name)).toEqual([
      'Alpha Barangay',
      'Zulu Barangay',
    ]);
    expect(loader.getIndexedBarangaysByMunicipality().get('0200101000')?.map(({ name }) => name))
      .toEqual(['Alpha Barangay', 'Zulu Barangay']);

    loader.getProvinces();
    loader.getMunicipalities();
    loader.getBarangays();
    expect(inflate).toHaveBeenCalledTimes(3);
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npx vitest run tests/data-loader.test.ts
```

Expected: FAIL because `getRegions()` initializes all four datasets and returns unsorted regions.

- [ ] **Step 3: Replace the shared initializer with four minimal initializers**

In `src/utils/data-loader.ts`, import the existing sorter:

```ts
import { sortByName } from './sort';
```

Replace the store declarations, `isInitialized`, and `initializeData()` with:

```ts
let regions: readonly PHRegion[] | undefined;
let provinces: readonly PHProvince[] | undefined;
let municipalities: readonly PHMunicipality[] | undefined;
let barangays: readonly PHBarangay[] | undefined;

let provincesByRegion: Map<string, readonly PHProvince[]> | undefined;
let municipalitiesByProvince: Map<string, readonly PHMunicipality[]> | undefined;
let barangaysByMunicipality: Map<string, readonly PHBarangay[]> | undefined;

function initializeRegions() {
  return regions ??= sortByName(decompressAndParse<PHRegion>(regionsCompressed));
}

function initializeProvinces() {
  if (provinces) return provinces;

  provinces = sortByName(
    decompressAndParse<Omit<PHProvince, 'regionCode'>>(provincesCompressed).map(province => ({
      ...province,
      regionCode: province.psgcCode.substring(0, 2) + '00000000',
    })),
  );

  const index = new Map<string, PHProvince[]>();
  for (const province of provinces) {
    const bucket = index.get(province.regionCode);
    if (bucket) bucket.push(province);
    else index.set(province.regionCode, [province]);
  }
  provincesByRegion = index;
  return provinces;
}

function initializeMunicipalities() {
  if (municipalities) return municipalities;

  municipalities = sortByName(
    decompressAndParse<PHMunicipality>(municipalitiesCompressed),
  );

  const index = new Map<string, PHMunicipality[]>();
  for (const municipality of municipalities) {
    const bucket = index.get(municipality.provinceCode);
    if (bucket) bucket.push(municipality);
    else index.set(municipality.provinceCode, [municipality]);
  }
  municipalitiesByProvince = index;
  return municipalities;
}

function initializeBarangays() {
  if (barangays) return barangays;

  barangays = sortByName(
    decompressAndParse<Omit<PHBarangay, 'municipalCityCode'>>(barangaysCompressed).map(barangay => ({
      ...barangay,
      municipalCityCode: barangay.psgcCode.substring(0, 7) + '000',
    })),
  );

  const index = new Map<string, PHBarangay[]>();
  for (const barangay of barangays) {
    const bucket = index.get(barangay.municipalCityCode);
    if (bucket) bucket.push(barangay);
    else index.set(barangay.municipalCityCode, [barangay]);
  }
  barangaysByMunicipality = index;
  return barangays;
}
```

Update the exported getters:

```ts
export function getRegions(): readonly PHRegion[] {
  return initializeRegions();
}

export function getProvinces(): readonly PHProvince[] {
  return initializeProvinces();
}

export function getMunicipalities(): readonly PHMunicipality[] {
  return initializeMunicipalities();
}

export function getBarangays(): readonly PHBarangay[] {
  return initializeBarangays();
}

export function getIndexedProvincesByRegion() {
  initializeProvinces();
  return provincesByRegion!;
}

export function getIndexedMunicipalitiesByProvince() {
  initializeMunicipalities();
  return municipalitiesByProvince!;
}

export function getIndexedBarangaysByMunicipality() {
  initializeBarangays();
  return barangaysByMunicipality!;
}
```

- [ ] **Step 4: Run loader and existing query tests**

Run:

```bash
npx vitest run tests/data-loader.test.ts tests/region.test.ts tests/province.test.ts tests/municipality.test.ts tests/barangay.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/data-loader.ts tests/data-loader.test.ts
git commit -m "perf: initialize PSGC datasets lazily"
```

---

### Task 2: Remove Repeated Query Sorting

**Files:**
- Modify: `src/functions/province.ts`
- Modify: `src/functions/municipality.ts`
- Modify: `src/functions/barangay.ts`
- Test: `tests/province.test.ts`
- Test: `tests/municipality.test.ts`
- Test: `tests/barangay.test.ts`

**Interfaces:**
- Consumes: sorted arrays and index buckets produced by Task 1.
- Produces: unchanged public query functions that return the cached readonly arrays directly.

- [ ] **Step 1: Add cached-result identity assertions**

Add to the existing valid-query test in each query test file:

```ts
expect(secondResult).toBe(result);
```

Declare `secondResult` by calling the same public function with the same code:

```ts
const secondResult = getProvincesByRegion(regionCode);
const secondResult = getMunicipalitiesByProvince(provinceCode);
const secondResult = getBarangaysByMunicipality(municipalityCode);
```

In the all-provinces test, also add:

```ts
expect(getAllProvinces()).toBe(result);
```

- [ ] **Step 2: Run the query tests and verify RED**

Run:

```bash
npx vitest run tests/province.test.ts tests/municipality.test.ts tests/barangay.test.ts
```

Expected: FAIL on reference identity because each query currently creates a new sorted array.

- [ ] **Step 3: Return the already sorted caches directly**

In `src/functions/province.ts`, remove the `sortByName` import and return cached values:

```ts
function getAllProvinces(): readonly PHProvince[] {
  return getProvinces();
}

function getProvincesByRegion(code: string): readonly PHProvince[] {
  return getIndexedProvincesByRegion().get(code) || [];
}
```

In `src/functions/municipality.ts`, remove the `sortByName` import:

```ts
function getMunicipalitiesByProvince(code: string): readonly PHMunicipality[] {
  return getIndexedMunicipalitiesByProvince().get(code) || [];
}
```

In `src/functions/barangay.ts`, remove the `sortByName` import:

```ts
function getBarangaysByMunicipality(code: string): readonly PHBarangay[] {
  return getIndexedBarangaysByMunicipality().get(code) || [];
}
```

- [ ] **Step 4: Run query tests and the full unit suite**

Run:

```bash
npx vitest run tests/province.test.ts tests/municipality.test.ts tests/barangay.test.ts
npm test -- --run
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/functions tests/province.test.ts tests/municipality.test.ts tests/barangay.test.ts
git commit -m "perf: reuse sorted PSGC query results"
```

---

### Task 3: Cold and Cached Query Benchmark

**Files:**
- Modify: `scripts/benchmark.ts`

**Interfaces:**
- Consumes: the unchanged public API from `src/index.ts`.
- Produces: additional median cold-initialization and cached-lookup sections from `bun run benchmark`.

- [ ] **Step 1: Add a subprocess query measurement**

After the existing measurement helpers in `scripts/benchmark.ts`, add:

```ts
interface QueryTiming {
  name: string;
  coldMs: number;
  cachedMs: number;
}

const QUERY_EXPRESSIONS = [
  ['getAllRegions()', 'getAllRegions'],
  ['getAllProvinces()', 'getAllProvinces'],
  ["getProvincesByRegion('1400000000')", 'getProvincesByRegion'],
  ["getMunicipalitiesByProvince('1400100000')", 'getMunicipalitiesByProvince'],
  ["getBarangaysByMunicipality('0730600000')", 'getBarangaysByMunicipality'],
] as const;

function benchmarkQuery(expression: string, importName: string): QueryTiming {
  const cold: number[] = [];
  const cached: number[] = [];

  for (let i = 0; i < ITERATIONS; i++) {
    const script = `
      import { ${importName} } from './src/index.ts';
      const start = performance.now();
      ${expression};
      const initialized = performance.now();
      for (let i = 0; i < 1000; i++) ${expression};
      const finished = performance.now();
      console.log(JSON.stringify({
        cold: initialized - start,
        cached: (finished - initialized) / 1000,
      }));
    `;
    const result = Bun.spawnSync(['bun', '--eval', script], {
      cwd: process.cwd(),
      stdout: 'pipe',
      stderr: 'inherit',
    });
    if (result.exitCode !== 0) {
      throw new Error(`Query benchmark failed: ${expression}`);
    }
    const timing = JSON.parse(new TextDecoder().decode(result.stdout));
    cold.push(timing.cold);
    cached.push(timing.cached);
  }

  return {
    name: expression,
    coldMs: median(cold),
    cachedMs: median(cached),
  };
}
```

- [ ] **Step 2: Print the query benchmark from the existing command**

After `printSummary(reports)`, add:

```ts
console.log(`\n${sep2}`);
console.log(`  QUERY TIMINGS — median ${ITERATIONS} runs`);
console.log(sep2);
console.log(`\n  ${'Query'.padEnd(56)} ${'Cold'.padStart(11)} ${'Cached'.padStart(11)}`);

for (const [expression, importName] of QUERY_EXPRESSIONS) {
  const timing = benchmarkQuery(expression, importName);
  console.log(
    `  ${timing.name.padEnd(56)}${ms(timing.coldMs)}${ms(timing.cachedMs)}`,
  );
}
```

- [ ] **Step 3: Run and inspect the benchmark**

Run:

```bash
bun run benchmark
```

Expected: exit 0; existing format reports remain, followed by `QUERY TIMINGS`, with cold and cached median columns for all five public query paths.

- [ ] **Step 4: Commit**

```bash
git add scripts/benchmark.ts
git commit -m "perf: benchmark cold and cached PSGC queries"
```

---

### Task 4: Final Compatibility Verification

**Files:**
- Verify only; no planned source changes.

**Interfaces:**
- Consumes: all changes from Tasks 1–3.
- Produces: evidence that public behavior, build artifacts, types, browser use, and package contents remain compatible.

- [ ] **Step 1: Run formatting and diff checks**

Run:

```bash
npx prettier --check src/utils/data-loader.ts src/functions tests/data-loader.test.ts tests/province.test.ts tests/municipality.test.ts tests/barangay.test.ts scripts/benchmark.ts
git diff --check
```

Expected: PASS with no formatting or whitespace errors.

- [ ] **Step 2: Run the complete verification suite**

Run:

```bash
npm ci
bun run build
npm run typecheck
npm test -- --run
npm run test:browser
npm_config_cache=/tmp/ph-address-issue-18-npm-cache npm pack --dry-run --json
```

Expected: every command exits 0; package dry run lists the existing seven public files.

- [ ] **Step 3: Confirm the branch is clean**

Run:

```bash
git status --short
```

Expected: only the user's pre-existing untracked `assets/PSGC-1Q-2026-Publication-Datafile.xlsx` and `assets/PSGC-2Q-2026-Publication-Datafile.xlsx` remain.
