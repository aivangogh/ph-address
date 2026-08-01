# Remove Legacy Data Tooling Design

## Goal

Complete issue #19 by deleting the retired TOON pipeline and other unused data
tooling without changing the package API, runtime CSV format, or published
files.

## Scope

Delete the TOON source artifacts, generated TypeScript bundle, converter, and
TOON-only compression test. Remove `@toon-format/toon` from development
dependencies and simplify the existing benchmark to compare JSON, full CSV,
and the shipped optimized CSV only.

Delete `scripts/compress-json.ts` because no package script or retained build
path invokes it. Delete `src/utils/data-loader.browser.ts` because the build has
one entry point and nothing imports or resolves the browser re-export.

Keep `src/data/*.json`. The migration writes these audit artifacts, existing
API tests consume them as independent expected data, and the benchmark uses
them as its baseline. Removing JSON would expand this cleanup into test and
migration redesign with no release benefit.

Update `scripts/README.md` and current README benchmark text to describe only
the retained pipeline. Preserve historical CHANGELOG entries and prior design
documents as records of shipped versions; “no TOON references” applies to
active code, dependencies, scripts, generated artifacts, and current usage
documentation.

## Data and build flow

The sole retained path remains:

1. `scripts/migrate-psgc.ts` reads the official workbook and writes JSON audit
   data plus optimized CSV source data.
2. `scripts/convert-to-csv.ts` compresses the CSV into
   `src/data-csv-ts/index.ts`.
3. `src/utils/data-loader.ts` lazily decompresses and indexes the bundled CSV.
4. `tsup` emits the existing CommonJS and ESM package outputs.

No replacement abstraction or dependency is needed.

## Verification

First capture the current package file list and public behavior. After the
deletions, run a repository search proving that active code and package
metadata contain no TOON references, then run the frozen install, data
reproducibility check, build, typecheck, complete Vitest suite, browser smoke
test, benchmark, and package dry-run checks.

The package test remains the regression gate for CommonJS, ESM, declarations,
and the packed file set. Existing loader and integrity tests cover the shipped
CSV compression path, so the obsolete TOON compression test is deleted rather
than duplicated.

## Out of scope

- No public API or type changes; issue #20 owns those.
- No release or prerelease workflow changes; issue #26 owns those.
- No rewrite of the migration pipeline.
- No cleanup of historical changelog or completed design records.
