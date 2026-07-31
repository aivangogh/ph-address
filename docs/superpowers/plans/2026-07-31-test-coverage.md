# PSGC Test Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify generated PSGC integrity and package behavior across supported Node.js versions and a real browser.

**Architecture:** Keep correctness checks in Vitest, browser compatibility in one standalone Playwright smoke script, and performance in the existing benchmark command. Stack on issue #17 so its packed-package test remains the single CJS/ESM consumer test.

**Tech Stack:** TypeScript, Vitest, Node.js, Playwright 1.55.0, GitHub Actions

## Global Constraints

- Validate the currently generated Q4 2025 artifacts.
- Leave Q2 regeneration and Q1/Q2 regression assertions to issue #15.
- Support Node.js 18, 20, 22, and 24.
- Keep performance measurements out of correctness tests.
- Add only Playwright 1.55.0 as a development dependency because newer releases require Node.js 20.

---

### Task 1: Generated data integrity

**Files:**
- Create: `tests/integrity.test.ts`

**Interfaces:**
- Consumes: `getRegions()`, `getProvinces()`, `getMunicipalities()`, and `getBarangays()` from `src/utils/data-loader.ts`
- Produces: one corruption-sensitive integrity test for all generated datasets

- [ ] **Step 1: Add the integrity test**

Load all four datasets and assert exact totals `18`, `82`, `1656`, and
`42011`. For each dataset, use a `Set` and `/^\d{10}$/` to identify the first
duplicate or malformed code, with the level and code in the assertion message.
Build parent-code sets and identify the first province, municipality, or
barangay whose parent code is absent.

- [ ] **Step 2: Run the integrity test**

Run:

```bash
npx vitest run tests/integrity.test.ts
```

Expected: PASS against the current generated artifacts. Mutation check: changing
any expected total, duplicating a code, or replacing a parent code makes the
corresponding focused assertion fail.

- [ ] **Step 3: Commit**

```bash
git add tests/integrity.test.ts
git commit -m "test: validate generated PSGC integrity"
```

### Task 2: Separate performance from correctness

**Files:**
- Modify: `tests/compression.test.ts`
- Modify: `tests/dist.test.ts`

**Interfaces:**
- Consumes: existing `scripts/benchmark.ts`
- Produces: deterministic correctness suites without wall-clock assertions

- [ ] **Step 1: Delete benchmark assertions**

Remove the `Decompression Performance` and `Compression Ratio` sections from
`tests/compression.test.ts`. Remove initialization timing and cached-call timing
from `tests/dist.test.ts`, including their setup and console output.

- [ ] **Step 2: Verify correctness tests remain green**

Run:

```bash
npx vitest run tests/compression.test.ts tests/dist.test.ts
```

Expected: PASS with no `performance.now()` assertions.

- [ ] **Step 3: Commit**

```bash
git add tests/compression.test.ts tests/dist.test.ts
git commit -m "test: keep benchmarks out of correctness suite"
```

### Task 3: Real browser smoke test

**Files:**
- Create: `tests/browser-smoke.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `bun.lock`

**Interfaces:**
- Consumes: `dist/index.mjs` and `node_modules/pako/dist/pako.esm.mjs`
- Produces: `npm run test:browser`

- [ ] **Step 1: Write the browser smoke script**

Use Node's `createServer()` to serve an HTML page, the built ESM package, and
Pako. The HTML must map the bare `pako` import to `/pako.mjs`, import the
package, call all five public APIs, and store their lengths on `document.body`.
Launch Chromium with Playwright, load the page, wait for those results, and
assert `[18, 82, 6, 27, 80]`. Always close the browser and server.

- [ ] **Step 2: Verify the missing browser dependency fails**

Run:

```bash
node tests/browser-smoke.mjs
```

Expected: FAIL because `playwright` is not installed.

- [ ] **Step 3: Add the minimum compatible dependency and script**

Add exact development dependency `"playwright": "1.55.0"` and:

```json
"typecheck": "tsc --noEmit",
"test:browser": "node tests/browser-smoke.mjs"
```

Update both npm and Bun lockfiles without changing unrelated dependency
versions.

- [ ] **Step 4: Install Chromium and verify the smoke test**

Run:

```bash
npx playwright install chromium
npm run test:browser
```

Expected: PASS in headless Chromium.

- [ ] **Step 5: Commit**

```bash
git add tests/browser-smoke.mjs package.json package-lock.json bun.lock
git commit -m "test: smoke test every API in Chromium"
```

### Task 4: Supported-runtime CI

**Files:**
- Modify: `.github/workflows/main.yml`

**Interfaces:**
- Consumes: `typecheck`, `test`, `test:browser`, and issue #17's package test
- Produces: Node.js matrix and Chromium CI jobs

- [ ] **Step 1: Add the Node.js matrix**

Run checkout, Node setup, Bun setup, `npm ci`, build, typecheck, and
`npm test -- --run` for Node.js `18`, `20`, `22`, and `24`.

- [ ] **Step 2: Add the browser job**

On Node.js 24, install dependencies, build, run
`npx playwright install --with-deps chromium`, and run
`npm run test:browser`.

- [ ] **Step 3: Run full local verification**

Run:

```bash
bun run build
npm run typecheck
npm test -- --run
npm run test:browser
npm_config_cache=/tmp/ph-address-npm-cache npm pack --dry-run --json
```

Expected: build and all checks pass; the package dry run still contains only
the seven intended distribution files.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/main.yml
git commit -m "ci: test supported Node and browser runtimes"
```
