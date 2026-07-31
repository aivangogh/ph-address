# PSGC Test Coverage Design

## Goal

Prove the generated datasets and packed package work in supported Node.js and
browser environments, while keeping performance measurements out of the
correctness suite.

## Branching and data scope

This change is stacked on issue #17 and reuses its packed-package CommonJS,
ESM, and type-import test.

The official Q2 workbook is available locally at
`assets/PSGC-2Q-2026-Publication-Datafile.xlsx`, but the generated artifacts
still contain Q4 2025 data. Issue #16 will validate the currently generated
artifacts. Issue #15 will regenerate them from the Q2 workbook, update the
expected total, and add the Q1/Q2 rename and retired-code assertions in the
same commit as the data change.

## Integrity coverage

Add one test over all four generated datasets. It will assert:

- exact current totals;
- unique 10-digit PSGC codes within each level;
- every province references an existing region;
- every municipality or city references an existing province;
- every barangay references an existing municipality or city.

Failures will identify the invalid level and code through focused assertion
messages.

## Runtime coverage

Keep issue #17's packed tarball test for CommonJS and ESM.

Add one browser smoke script using Playwright. A small Node HTTP server will
serve the built ESM file, `pako`, and an HTML import map. Chromium will load
the package without Node globals or builtins and call every public API.

## CI and performance

Run build, type checking, and tests on Node.js 18, 20, 22, and 24. Run the
Chromium smoke test once on Node.js 24.

Remove timing assertions from Vitest correctness tests. Performance remains
covered by the existing `scripts/benchmark.ts` command.

Playwright is the only new development dependency.
