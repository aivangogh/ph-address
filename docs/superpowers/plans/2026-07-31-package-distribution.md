# Package Distribution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make public types, CommonJS, ESM, package contents, and the Node.js support floor correct and verifiable from the packed npm artifact.

**Architecture:** Keep package behavior in the existing entry point and metadata. Add one integration test that builds a real tarball, installs it into a temporary consumer, and exercises every published interface.

**Tech Stack:** TypeScript, tsup, Vitest, npm, Node.js

## Global Constraints

- Export `PHRegion`, `PHProvince`, `PHMunicipality`, and `PHBarangay`.
- Publish only `dist`, package metadata, README, and license.
- Support Node.js 18 or newer.
- Add no dependencies or packaging abstractions.

---

### Task 1: Packed-package contract

**Files:**
- Create: `tests/package.test.ts`
- Modify: `package.json`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: the tarball produced by `npm pack`
- Produces: root type exports and `types`/`import`/`require` package conditions

- [ ] **Step 1: Write the failing integration test**

Create one Vitest test that:

```ts
const pack = JSON.parse(execFileSync('npm', ['pack', '--json'], {
  cwd: projectRoot,
  encoding: 'utf8'
}))[0];
```

Then assert `pack.files` contains only `README.md`, `LICENCE`,
`package.json`, and paths under `dist/`.
Install the tarball into a temporary package, run CommonJS and ESM Node.js
smoke commands, and compile an `index.ts` containing:

```ts
import type {
  PHRegion,
  PHProvince,
  PHMunicipality,
  PHBarangay
} from '@aivangogh/ph-address';

const values: [PHRegion, PHProvince, PHMunicipality, PHBarangay] = [] as never;
void values;
```

- [ ] **Step 2: Verify the test fails for the missing contract**

Run:

```bash
npm_config_cache=/tmp/ph-address-npm-cache bun run build
npm_config_cache=/tmp/ph-address-npm-cache bunx vitest run tests/package.test.ts
```

Expected: FAIL because the tarball contains unintended files and the four
types are not exported.

- [ ] **Step 3: Implement the minimal package contract**

Add type-only re-exports to `src/index.ts`:

```ts
export type { PHBarangay } from './types/barangay';
export type { PHMunicipality } from './types/municipality';
export type { PHProvince } from './types/province';
export type { PHRegion } from './types/region';
```

Update `package.json` with:

```json
"files": ["dist"],
"engines": { "node": ">=18" },
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.mjs",
    "require": "./dist/index.js"
  }
}
```

- [ ] **Step 4: Verify the packed-package contract passes**

Run:

```bash
npm_config_cache=/tmp/ph-address-npm-cache bun run build
npm_config_cache=/tmp/ph-address-npm-cache bunx vitest run tests/package.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json src/index.ts tests/package.test.ts
git commit -m "fix: publish complete package contract"
```

### Task 2: Supported Node.js version

**Files:**
- Modify: `README.md`
- Modify: `.github/workflows/main.yml`

**Interfaces:**
- Consumes: `engines.node` value `>=18`
- Produces: matching user documentation and CI execution on Node.js 18

- [ ] **Step 1: Document the support floor**

State in the existing “Node.js and Browser Support” section that Node.js 18
or newer is supported.

- [ ] **Step 2: Enforce the support floor in CI**

Set `node-version: 18` on `actions/setup-node` and run the build plus test
suite. Add Bun setup because the existing build uses Bun.

- [ ] **Step 3: Run full verification**

Run:

```bash
npm_config_cache=/tmp/ph-address-npm-cache bun run build
npm_config_cache=/tmp/ph-address-npm-cache bunx vitest run
npm_config_cache=/tmp/ph-address-npm-cache npm pack --dry-run --json
```

Expected: all tests pass and the dry-run file list contains no source, tests,
lockfiles, graph audit artifacts, or local tooling.

- [ ] **Step 4: Commit**

```bash
git add README.md .github/workflows/main.yml
git commit -m "ci: test minimum supported Node version"
```
