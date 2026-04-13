# @aivangogh/ph-address

## 2025.4.3

### Major Changes

- **Replaced TOON with CSV**: Dropped `@toon-format/toon` as a runtime dependency. Data is now stored as gzip-compressed, base64-encoded CSV — smaller bundle, faster parse, simpler format.
- **PSGC Hierarchical Code Optimization**: Removed derivable columns from CSV based on the 10-digit PSGC structure (`RR` + `XXX` + `XX` + `XXX`):
  - `municipalCityCode` removed from barangays CSV — derived at load time as `psgcCode[0:7] + '000'` (saves 451 KB raw)
  - `regionCode` removed from provinces CSV — derived at load time as `psgcCode[0:2] + '00000000'`
  - `provinceCode` kept in municipalities CSV — not always derivable due to NCR cities and HUC special cases
  - Public API is unchanged — all types still include the derived fields
- **Migration pipeline now outputs CSV directly from XLSX**: `migrate-psgc.ts` writes `src/data-csv/` alongside `src/data/` JSON, so CSV is generated from the PSGC source — not converted from an intermediate format.

### Performance (vs 2025.4.2 with TOON)

Benchmarked across 20 iterations on 42,011 barangays:

| Metric | TOON (2025.4.2) | CSV optimized (2025.4.3) | Change |
|---|---|---|---|
| Total compressed bundle | 532 KB | 369 KB | **-31%** |
| Barangays compressed | 508 KB | 346 KB | **-32%** |
| Decompress + parse (barangays) | 220 ms | 39 ms | **-82%** |
| dist/index.mjs | 504 KB | 373 KB | **-26%** |

### Minor Changes

- **Fixed `data-loader.browser.ts`**: Was broken — still imported the removed `@toon-format/toon` dep. Now re-exports from the shared `data-loader.ts`.
- **Replaced `Buffer` with `atob()`**: Base64 decoding now uses the browser-native `atob()` API, removing the Node.js-only `Buffer` shim requirement.
- **Removed `ts-node` devDependency**: All scripts now run via `bun` natively.
- **Added `benchmark` script**: Run `bun run benchmark` to compare JSON vs TOON vs CSV full vs CSV optimized across all four datasets.
- **Added `@toon-format/toon` as devDependency**: Kept for benchmark comparisons only — not included in the production bundle.

### Technical Details

- Data pipeline: XLSX → `migrate-psgc.ts` → `src/data-csv/*.csv` → `convert-to-csv.ts` → `src/data-csv-ts/index.ts`
- Compression ratios (CSV optimized, gzip+base64):
  - Barangays: 860 KB → 346 KB (59.8% reduction)
  - Municipalities: 51 KB → 21 KB (57.9% reduction)
  - Provinces: 1.8 KB → 1.0 KB (43.7% reduction)
  - Regions: 0.7 KB → 0.4 KB (37.1% reduction)
- Only production dependency: `pako` for gzip decompression

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
