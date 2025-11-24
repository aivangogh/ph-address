# @aivangogh/ph-address

## 2025.3.12

### Patch Changes

- 98b58f5: fixed compiled issues

## 2025.3.9

### Major Changes

- **Compression Layer Added**: Implemented gzip compression on top of TOON format using `pako`, achieving an 87.6% reduction in data size compared to raw JSON (4.3 MB → 533 KB).
- **Improved Performance**: Data initialization is now ~47% faster due to smaller payload size. Decompression + decoding is faster than decoding uncompressed TOON data.
- **Optimized Bundle Size**: Distribution package reduced from 3.2 MB to 1.1 MB (65.6% reduction).

### Minor Changes

- **Enhanced Test Suite**: Added comprehensive test coverage including:
  - Performance benchmarks for data loading and decompression
  - Data integrity and relationship validation tests
  - Compression ratio verification tests
  - Edge case and caching performance tests
- **Improved Build Process**: Updated `convert-to-toon.ts` to automatically compress TOON data with gzip and encode as base64.

### Technical Details

- Data is now stored as gzip-compressed, base64-encoded TOON strings
- Compression ratios achieved:
  - Barangays: 67.4% reduction (1.59 MB → 520 KB)
  - Municipalities: 63.3% reduction (62 KB → 23 KB)
  - Provinces: 60.2% reduction (3.2 KB → 1.3 KB)
  - Regions: 39.5% reduction
- All data is decompressed on first access and cached in memory for subsequent calls
- Browser and Node.js compatibility maintained

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
