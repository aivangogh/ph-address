# PSGC Code Lookup Utilities Design

## Goal

Complete issue #20 by exposing complete-list, exact-code, and full-address
lookups through the package's existing lazy data loader and cached indexes.

## Public API

Add these synchronous exports:

- `getAllMunicipalities()`
- `getAllBarangays()`
- `getRegionByCode(code)`
- `getProvinceByCode(code)`
- `getMunicipalityByCode(code)`
- `getBarangayByCode(code)`
- `getAddressByBarangayCode(code)`

Exact-code lookups return the matching record or `undefined`. Complete-list
functions return the existing sorted, cached, readonly arrays.

Export this address type:

```ts
export type PHAddress = {
  region: PHRegion;
  province?: PHProvince;
  municipality: PHMunicipality;
  barangay: PHBarangay;
};
```

`getAddressByBarangayCode()` returns `PHAddress | undefined`. The province is
optional because NCR cities and some independent/highly urbanized city records
do not resolve through a normal province record.

## Loader and indexes

Extend each existing lazy initializer in `src/utils/data-loader.ts` to build a
`Map<string, record>` keyed by `psgcCode` at the same time it already parses and
sorts that level. Export one getter per map. Calling a code lookup initializes
only its own level; no eager all-data initialization is introduced.

Reuse the existing cached arrays for `getAllMunicipalities()` and
`getAllBarangays()`. Do not copy or re-sort them.

Keep public functions in the existing level modules:

- `region.ts`: region list and exact lookup;
- `province.ts`: province list, parent filter, and exact lookup;
- `municipality.ts`: municipality list, parent filter, and exact lookup;
- `barangay.ts`: barangay list, parent filter, exact lookup, and address lookup.

No new service or generic repository abstraction is needed.

## Address resolution

For a known barangay:

1. Resolve the barangay by its exact code.
2. Resolve its municipality through `municipalCityCode`.
3. Try to resolve the municipality's `provinceCode` as a province.
4. Resolve the region through the province's `regionCode` when a province
   exists; otherwise derive the region code from the municipality's first two
   PSGC digits plus eight zeroes.
5. Return the four records, omitting `province` when there is no matching
   province.

Return `undefined` if the barangay, municipality, or region cannot be resolved.
This is defensive at the public boundary even though the generated-data
integrity checks reject those orphan states.

## Testing

Add focused tests to the existing level suites for complete lists and known and
unknown exact codes. Add address tests covering a normal province, NCR, a
highly urbanized or independent city, and an unknown barangay code.

Extend packed-package coverage so the new functions work through both CommonJS
and ESM and `PHAddress` resolves from the published declarations. Keep existing
identity assertions to prove complete-list and indexed results reuse cached
objects.

Add one concise README example showing exact barangay and full-address lookup.

## Out of scope

- No fuzzy or name search.
- No network access or new dependency.
- No mutation API.
- No changes to PSGC data or migration.
- No prerelease/publishing changes; issue #26 owns those.
