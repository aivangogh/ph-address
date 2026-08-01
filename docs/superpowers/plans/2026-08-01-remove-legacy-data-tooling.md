# Remove Legacy Data Tooling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove every active TOON and unused data-tooling path while preserving the CSV runtime, generated PSGC data, benchmark command, and published package behavior.

**Architecture:** Delete retired files instead of replacing them. Keep the existing XLSX → JSON/optimized CSV → compressed TypeScript pipeline, and reduce the benchmark from four formats to the three retained formats.

**Tech Stack:** TypeScript, pnpm, Vitest, tsx, tsup, pako

## Global Constraints

- Keep the public API, types, runtime CSV data, and packed file set unchanged.
- Keep `src/data/*.json` as migration output, test fixtures, and the benchmark baseline.
- Preserve historical CHANGELOG entries and completed design documents.
- Add no dependencies or abstractions.

---

### Task 1: Delete unconsumed tooling and artifacts

**Files:**
- Delete: `scripts/compress-json.ts`
- Delete: `scripts/convert-to-toon.ts`
- Delete: `src/data-toon/regions.toon`
- Delete: `src/data-toon/provinces.toon`
- Delete: `src/data-toon/municipalities.toon`
- Delete: `src/data-toon/barangays.toon`
- Delete: `src/data-toon-ts/index.ts`
- Delete: `src/utils/data-loader.browser.ts`
- Delete: `tests/compression.test.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: the current package build and packed-package contract
- Produces: the same package without dead TOON and browser-re-export paths

- [ ] **Step 1: Record the preservation baseline**

Run:

```bash
pnpm build
pnpm exec vitest run tests/data-loader.test.ts tests/integrity.test.ts tests/package.test.ts
```

Expected: build succeeds and all selected CSV runtime, PSGC integrity, CJS,
ESM, declaration, and packed-file assertions pass.

- [ ] **Step 2: Prove the files are unconsumed**

Run:

```bash
rg -n "compress-json|convert-to-toon|data-toon|data-loader\.browser" package.json tsconfig.json tsup.config.ts src scripts tests .github
```

Expected: matches are limited to the files being deleted and TOON-only test;
no build entry, package export, or retained runtime import consumes them.

- [ ] **Step 3: Delete the dead files**

Delete exactly the files listed for deletion above. Do not alter the retained
JSON, CSV, compressed CSV, migration, or shared loader files.

- [ ] **Step 4: Remove the retired dependency**

Run:

```bash
pnpm remove --save-dev @toon-format/toon
```

Expected: `@toon-format/toon` disappears from `package.json` and
`pnpm-lock.yaml`; no other dependency changes.

- [ ] **Step 5: Verify preserved behavior**

Run:

```bash
pnpm build
pnpm exec vitest run tests/data-loader.test.ts tests/integrity.test.ts tests/package.test.ts
```

Expected: the same preservation checks from Step 1 pass.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml scripts/compress-json.ts scripts/convert-to-toon.ts src/data-toon src/data-toon-ts src/utils/data-loader.browser.ts tests/compression.test.ts
git commit -m "chore: remove retired data tooling"
```

### Task 2: Simplify the retained benchmark

**Files:**
- Modify: `scripts/benchmark.ts`

**Interfaces:**
- Consumes: `src/data/*.json`, `src/data-csv/*.csv`, and public query functions
- Produces: the existing `pnpm benchmark` command comparing JSON, full CSV,
  optimized CSV, and cold/cached query timings

- [ ] **Step 1: Capture the failing retirement check**

Run:

```bash
rg -n "TOON|toon|@toon-format" scripts/benchmark.ts
```

Expected: command finds the retired import, `FileReport.toon`, encoding,
measurements, report rows, totals, and labels.

- [ ] **Step 2: Remove only the TOON benchmark branch**

In `scripts/benchmark.ts`:

- Change the header and startup label to `JSON vs CSV (full) vs CSV (optimized)`.
- Delete the `@toon-format/toon` import.
- Delete `toon` from `FileReport`.
- Delete `toonText` and its measurement from `benchmarkFile`.
- Delete TOON rows from `printReport`, `printSummary`, and the barangay timing.
- Delete `totalToon` and its accumulation/output column.
- Resize summary headings and separators only as needed for the remaining
  JSON, CSV full, CSV optimized, and saved-vs-JSON columns.
- Leave CSV helpers, compression measurement, query timings, iteration count,
  and source file inputs unchanged.

- [ ] **Step 3: Verify the retirement check passes**

Run:

```bash
rg -n "TOON|toon|@toon-format" scripts/benchmark.ts
```

Expected: exit code 1 with no matches.

- [ ] **Step 4: Run the benchmark**

Run:

```bash
pnpm benchmark
```

Expected: all four datasets report JSON, CSV full, and CSV optimized results;
all five public query timing rows print; command exits 0.

- [ ] **Step 5: Commit**

```bash
git add scripts/benchmark.ts
git commit -m "perf: drop retired TOON benchmark"
```

### Task 3: Update current documentation and verify the cleanup

**Files:**
- Modify: `README.md`
- Modify: `scripts/README.md`

**Interfaces:**
- Consumes: the retained migration and benchmark commands
- Produces: current documentation containing no instructions for deleted paths

- [ ] **Step 1: Capture stale current documentation**

Run:

```bash
rg -n "TOON|toon|build:toon|3Q-2025|Generates formatted JSON" README.md scripts/README.md
```

Expected: command finds the former-format benchmark row and outdated pipeline
instructions.

- [ ] **Step 2: Document the retained path**

In `scripts/README.md`, replace the TOON section with a concise
`convert-to-csv.ts` section. State that migration writes both
`src/data/*.json` and `src/data-csv/*.csv`, use the Q2 2026 workbook in the
example, and document:

```bash
pnpm build:csv-ts
```

as generating `src/data-csv-ts/index.ts`.

In `README.md`, remove the TOON row from the current format benchmark and
describe the bundle-size comparison as “smaller than the previous format” so
current usage documentation contains no dependency on the retired format.

- [ ] **Step 3: Verify active paths contain no retired references**

Run:

```bash
rg -n "TOON|toon|@toon-format|compress-json|convert-to-toon|data-toon|data-loader\.browser" package.json pnpm-lock.yaml README.md scripts src tests .github
```

Expected: exit code 1 with no matches. Historical `CHANGELOG.md` and
`docs/superpowers/` are intentionally excluded.

- [ ] **Step 4: Run complete verification**

Run:

```bash
pnpm install --frozen-lockfile
pnpm data:check
pnpm build
pnpm typecheck
pnpm test --run
pnpm test:browser
pnpm benchmark
npm_config_cache=/tmp/ph-address-npm-cache npm pack --dry-run --json
git diff --check
```

Expected: every command exits 0; generated data remains unchanged; the packed
package contains only `LICENCE`, `README.md`, `package.json`, and `dist/*`.

- [ ] **Step 5: Commit**

```bash
git add README.md scripts/README.md
git commit -m "docs: document the CSV-only data pipeline"
```
