# pnpm Migration Design

## Goal

Replace Bun and npm development tooling with pnpm while preserving Node.js 18+ package compatibility.

## Changes

- Pin the local package manager with `packageManager` in `package.json`.
- Replace `bun.lock` and `package-lock.json` with `pnpm-lock.yaml`.
- Use `tsx` to run TypeScript development scripts on Node.js 18+.
- Replace Bun script invocations with pnpm-compatible commands.
- Replace `Bun.spawnSync` in the benchmark with Node's `spawnSync`.
- Configure CI and release workflows to install pnpm, use its frozen lockfile, and run project commands through pnpm.
- Update current script documentation and usage messages. Historical changelog and completed planning records remain unchanged.

## Verification

Run a clean frozen install, build, generated-data check, typecheck, tests, browser smoke test, benchmark smoke test, and packed-package tests through pnpm. Confirm the packed CommonJS and ESM outputs still load under supported Node.js versions through the existing package tests and CI matrix.

## Scope

No runtime API, generated geographic data, or release behavior changes beyond selecting pnpm as the package manager.
