# Q2 2026 PSGC Release Design

## Goal

Publish version `2026.2.0` from the official PSGC publication as of
30 June 2026, cumulatively including the Q1 and Q2 changes.

## Source and generated artifacts

Replace `assets/PSGC-4Q-2025-Publication-Datafile.xlsx` with
`assets/PSGC-2Q-2026-Publication-Datafile.xlsx`.

Use the existing pipeline:

1. `migrate-psgc.ts` generates retained JSON and CSV datasets.
2. `convert-to-csv.ts` generates the compressed TypeScript bundle.

Add a `data:check` command that reruns both steps and uses `git diff --exit-code`
on the generated directories. CI will run it to prove the committed artifacts
are reproducible from the workbook.

## Expected dataset

The generated package will contain:

- 18 regions;
- 82 provinces;
- 1,656 combined municipalities, cities, and submunicipalities;
- 42,010 barangays.

The PSA release's 1,493 count is municipalities only. The package's existing
combined collection also retains 149 cities and 14 submunicipalities.

All codes remain unique 10-digit strings and all modeled parent relationships
must pass the existing integrity test.

## Regression coverage

Add table-driven assertions keyed by PSGC code for all cumulative name changes:

- Q1: one municipality and seven barangays;
- Q2: two municipalities and fifteen barangays, including the Sawata/Poblacion
  renames.

Assert that retired Barangay San Rafael code `0401007038` is absent. The
expected names and codes come from the official workbook comparison and PSA
Q1/Q2 releases.

## Release metadata

Set package and npm lockfile versions to `2026.2.0`. Update README dataset
counts and source date, the browser smoke expected barangay count, and prepend
a concise `2026.2.0` changelog entry covering the cumulative data update.

No API, type, dependency, or migration-model change is included.
