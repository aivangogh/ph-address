# pnpm Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Bun and npm development tooling with pnpm while preserving Node.js 18+ package compatibility.

**Architecture:** Use pnpm for dependency installation and command orchestration, and `tsx` for the existing TypeScript development scripts. Use Node's standard `child_process.spawnSync` in the benchmark and pnpm's official GitHub Action in CI and releases.

**Tech Stack:** pnpm 10.15.1, Node.js 18+, TypeScript, tsx, GitHub Actions

## Global Constraints

- Keep the published package compatible with Node.js 18 or newer.
- Do not change the runtime API or generated geographic data.
- Remove active Bun and npm workflow requirements; retain historical changelog and completed planning records.

---

### Task 1: Package manager and TypeScript scripts

**Files:**
- Modify: `package.json`
- Modify: `scripts/benchmark.ts`
- Modify: `scripts/migrate-psgc.ts`
- Modify: `scripts/convert-to-csv.ts`
- Modify: `scripts/explore-excel.ts`
- Modify: `scripts/minify-json.ts`
- Modify: `scripts/README.md`
- Delete: `bun.lock`
- Delete: `package-lock.json`
- Create: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: existing package scripts and TypeScript data utilities
- Produces: pnpm scripts runnable on Node.js 18+ through `tsx`

- [ ] **Step 1: Confirm the current frozen pnpm install cannot satisfy the repository**

Run: `pnpm install --frozen-lockfile`
Expected: FAIL because `pnpm-lock.yaml` does not exist.

- [ ] **Step 2: Replace package scripts and add the TypeScript runner**

Set `packageManager` to `pnpm@10.15.1`, add `"tsx": "^4.20.6"` to `devDependencies`, and use these script commands:

```json
{
  "release": "pnpm build && changeset publish",
  "test:prepare": "pnpm build:csv-ts",
  "migrate:psgc": "tsx scripts/migrate-psgc.ts",
  "build:csv-ts": "tsx scripts/convert-to-csv.ts src/data-csv-ts/index.ts",
  "data:check": "pnpm migrate:psgc --file=assets/PSGC-2Q-2026-Publication-Datafile.xlsx && pnpm build:csv-ts && git diff --exit-code -- src/data src/data-csv src/data-csv-ts",
  "build": "pnpm build:csv-ts && pnpm build:tsup",
  "benchmark": "tsx scripts/benchmark.ts"
}
```

- [ ] **Step 3: Replace the Bun benchmark subprocess with Node-compatible tooling**

Import `spawnSync` from `node:child_process` and replace `Bun.spawnSync` with:

```ts
const result = spawnSync('pnpm', ['exec', 'tsx', '--eval', script], {
  cwd: process.cwd(),
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'inherit'],
});
if (result.status !== 0) {
  throw new Error(`Query benchmark failed: ${expression}`);
}
const timing = JSON.parse(result.stdout);
```

- [ ] **Step 4: Update current usage text**

Replace Bun commands in script comments, error messages, and `scripts/README.md` with their `pnpm` equivalents. Do not edit historical records in `CHANGELOG.md` or `docs/superpowers`.

- [ ] **Step 5: Generate the pnpm lockfile and remove obsolete lockfiles**

Run: `pnpm install --lockfile-only`
Expected: `pnpm-lock.yaml` records `tsx` and all existing dependencies.

Delete `bun.lock` and `package-lock.json`.

- [ ] **Step 6: Verify package tooling**

Run: `pnpm install --frozen-lockfile && pnpm build && pnpm data:check && pnpm typecheck && pnpm test --run && pnpm exec vitest run tests/package.test.ts && pnpm benchmark`
Expected: every command exits 0 and generated data remains unchanged.

- [ ] **Step 7: Commit package tooling**

```bash
git add package.json pnpm-lock.yaml scripts
git add -u bun.lock package-lock.json
git commit -m "build: migrate package tooling to pnpm"
```

### Task 2: CI and release workflows

**Files:**
- Modify: `.github/workflows/main.yml`
- Modify: `.github/workflows/publish.yml`

**Interfaces:**
- Consumes: `packageManager` and `pnpm-lock.yaml` from Task 1
- Produces: Bun-free CI and release jobs using frozen pnpm installs

- [ ] **Step 1: Replace CI package setup and commands**

In both CI jobs, add `pnpm/action-setup@v4` before `actions/setup-node`, configure setup-node with `cache: pnpm`, and replace install/build/test commands with:

```yaml
- run: pnpm install --frozen-lockfile
- run: pnpm build
- run: pnpm data:check
  if: matrix.node-version == 24
- run: pnpm typecheck
- run: pnpm test --run
```

Keep the browser job's Playwright install and run both commands through pnpm:

```yaml
- run: pnpm exec playwright install --with-deps chromium
- run: pnpm test:browser
```

- [ ] **Step 2: Replace release package setup and commands**

Use `pnpm/action-setup@v4`, configure `actions/setup-node` with Node.js 24 and `cache: pnpm`, run `pnpm install --frozen-lockfile`, and set Changesets publishing to:

```yaml
with:
  publish: pnpm release
```

- [ ] **Step 3: Verify no active Bun or npm workflow commands remain**

Run: `rg -n '\bbun\b|bunx|npm (ci|run|test)' package.json scripts .github`
Expected: no matches.

- [ ] **Step 4: Run final package verification**

Run: `pnpm install --frozen-lockfile && pnpm build && pnpm typecheck && pnpm test --run && pnpm test:browser && pnpm exec vitest run tests/package.test.ts`
Expected: every command exits 0.

- [ ] **Step 5: Commit workflow migration**

```bash
git add .github/workflows/main.yml .github/workflows/publish.yml
git commit -m "ci: run workflows with pnpm"
```
