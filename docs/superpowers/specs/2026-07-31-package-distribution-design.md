# Package Distribution Design

## Goal

Make the documented public types and both JavaScript module formats work from
the package users actually install, while publishing only distribution files
and declaring the supported Node.js version.

## Changes

- Re-export `PHRegion`, `PHProvince`, `PHMunicipality`, and `PHBarangay` as
  types from `src/index.ts`.
- Add `types`, `import`, and `require` conditions to the root package export.
- Restrict published package contents with `"files": ["dist"]`.
- Declare Node.js 18 or newer in `engines` and document that version.
- Configure CI to run on the minimum supported Node.js version.

## Verification

Build and pack the package, then inspect and consume the generated tarball from
a temporary project. The distribution check must:

1. Assert the tarball contains package metadata, license, README, and `dist`
   artifacts only.
2. Install the tarball and verify CommonJS `require()` resolves.
3. Verify ESM `import` resolves.
4. Compile the documented type-only imports with TypeScript.

The test uses existing Node.js, npm, TypeScript, and Vitest tooling. It adds no
runtime dependency or packaging abstraction.
