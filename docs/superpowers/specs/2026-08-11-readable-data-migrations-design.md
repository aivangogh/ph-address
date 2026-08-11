# Readable Data Migrations Design

## Goal

Make reviewed postal-code exceptions and existing PSGC derivation rules understandable without decoding raw numeric keys or tracing nested conditions. Preserve the public API, generated schemas, and deterministic build output.

## Postal-code mapping data

Move reviewed exceptions from `scripts/migrate-postal-codes.ts` to `assets/ph-postal-code/municipality-mappings.csv` with these columns:

| Column | Meaning |
| --- | --- |
| `municipalityName` | Current PSA municipality/city name shown to reviewers |
| `municipalityCode` | Current 10-digit PSGC code |
| `postalCodes` | One or more four-digit ZIP codes separated by `|` |
| `sourceMunicipality` | GeoNames or predecessor municipality/locality name supporting the mapping |
| `changeType` | A documented category describing why automatic matching is insufficient |
| `notes` | Short human-readable explanation or inheritance provenance |

Allowed `changeType` values are `renamed`, `spelling`, `historical-province`, `district`, and `inherited-area`. Each row represents a current municipality and explains the corresponding source change. Multiple ZIP codes remain in one readable municipality row.

The CSV is reviewed source data, not generated output. The migration must reject missing columns, unknown change types, duplicate municipality rows, unknown PSGC codes, mismatched municipality names, malformed ZIP codes, and ZIP codes absent from the bundled GeoNames snapshot.

## Postal migration flow

`scripts/migrate-postal-codes.ts` will use small named stages:

1. Load and validate GeoNames rows.
2. Build municipality and province indexes.
3. Apply conservative exact name/province matching.
4. Load and validate reviewed municipality changes.
5. Add the reviewed mappings without altering retained unmatched GeoNames rows.
6. Sort and write JSON and CSV output deterministically.

Automatic fuzzy matching will not be added. New exceptions must be documented as CSV rows so future reviewers can see the municipality, its source name, the type of change, and the reason.

The eight BARMM Special Geographic Area municipalities remain explicit `inherited-area` entries. Nabalawag and Tugunan retain both inherited postal areas.

## Existing PSGC migration readability

`scripts/migrate-psgc.ts` will retain its current output but replace implicit control flow with named concepts:

- constants for supported geographic levels;
- `deriveRegionCode` for province parents;
- `deriveMunicipalityCode` for barangay parents;
- `resolveProvinceCode` for ordinary municipalities, NCR, and independent/highly urbanized cities;
- a named predicate for whether a province is the direct parent of a city or municipality.

Comments will explain exceptional Philippine geographic rules rather than restating string operations. This refactor will not introduce a generic rules engine, new dependencies, or new runtime abstractions.

## Verification

Tests will prove:

- every mapping CSV row passes schema and reference validation;
- representative rename, spelling, district, and inherited-area rows generate the expected mappings;
- every current PSGC municipality/city has at least one postal-code mapping;
- unmatched GeoNames records are retained without guessed municipality codes;
- PSGC JSON/CSV output remains unchanged after the readability refactor;
- migration output is reproducible;
- build, typecheck, package tests, and browser smoke tests still pass.

## Scope

This change applies the readable-data philosophy to the postal feature and the existing PSGC migration scripts. It does not rewrite generated files by hand, change public types or lookup behavior, or refactor unrelated runtime indexes and benchmarks.
