# Lazy PSGC Data Initialization Design

## Goal

Load only the geographic datasets required by each public query, parse every
dataset at most once, and avoid repeated sorting and index-array copying while
preserving the synchronous public API and returned data shapes.

## Design

Replace the shared `initializeData()` flag in `src/utils/data-loader.ts` with
four dataset-specific lazy initializers:

- Regions: decompress, parse, sort by name, and cache.
- Provinces: decompress, parse, derive `regionCode`, sort by name, build the
  region index, and cache both.
- Municipalities: decompress, parse, sort by name, build the province index,
  and cache both.
- Barangays: decompress, parse, derive `municipalCityCode`, sort by name, build
  the municipality index, and cache both.

Each initializer checks its cached dataset before doing work. Index buckets are
local mutable arrays populated with `push()`, then exposed through the existing
readonly return types. Because each full dataset is sorted before indexing,
every bucket is already alphabetically sorted.

The four public query modules will return these cached arrays or buckets
directly. This removes per-query `sortByName()` calls without changing function
signatures, object fields, lookup behavior, or empty-result behavior.

## Loading Behavior

| Query | Datasets initialized |
| --- | --- |
| `getAllRegions()` | regions |
| `getAllProvinces()` | provinces |
| `getProvincesByRegion()` | provinces |
| `getMunicipalitiesByProvince()` | municipalities |
| `getBarangaysByMunicipality()` | barangays |

Calling any query repeatedly reuses the associated cached dataset and index.
No query implicitly initializes another geographic level.

## Testing

Add focused loader tests that mock the compressed data and decompression layer
to verify:

- a regions-only query does not parse provinces, municipalities, or barangays;
- each requested dataset is parsed once across repeated queries;
- full datasets and indexed buckets remain alphabetically sorted;
- existing public query tests continue to validate compatible values and empty
  results.

## Benchmark

Extend the existing `bun run benchmark` command with median timings for:

- cold initialization of each public query path, measured inside fresh Bun
  subprocesses so process startup is excluded from the reported query timing;
- repeated cached lookups after initialization.

Benchmark measurements remain informational and separate from normal CI
assertions.

## Scope

No public API, type, data format, dependency, or migration-pipeline changes are
included.
