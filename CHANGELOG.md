# @aivangogh/ph-address

## 2025.3.10

### Patch Changes

- 8438986: fixed issues with build

## 2025.3.8

### Major Changes

- **Simplified Build Process**: The dual-build system for Node.js and the browser has been removed. The package now uses a single, unified build that works in both environments out of the box.

## 2025.3.7

### Major Changes

- **Switched to `npm`**: The entire build process, including CI/CD pipelines, has been migrated from `bun` to `npm` to improve stability and address lockfile issues.
- **Simplified Data Handling with TOON**: The project now uses the `toon-format` for data storage. This simplifies the data loading mechanism and build process, removing the need for `pako` and custom compression scripts. A new script, `convert-to-toon.ts`, has been added to handle the conversion from JSON to TOON.
- **Dual-Build System**: The project now generates two separate bundles: one for Node.js that reads TOON files at runtime, and another for the browser that bundles the TOON data as strings. This provides an optimized experience for both environments.

### Patch Changes

- Fixed various CI/CD failures related to `bun install --frozen-lockfile`.

## 2025.3.3

### Minor Changes

- Added documentation.
- Added `psgcCode` to the JSON data.

### Patch Changes

- Minified JSON data files.
- Removed "(Pob.)" from names.
- General small changes and improvements.
- Updated `README.md`.
- Changed formatting of city names (e.g., "City of Cebu" to "Cebu City").
- Fixed an issue with the CI/CD pipeline by updating `bun.lockb`.
- Refactored scripts for better maintainability and added a separate script for JSON minification.
- Improved the `migrate:psgc` script to accept a file argument.
- Fixed failing tests for provinces and municipalities.
