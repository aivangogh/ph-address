# PSGC Code Lookup Utilities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add complete-list, exact PSGC-code, and full barangay-address lookups backed by the package's existing lazy cached data.

**Architecture:** Build one exact-code `Map` inside each existing lazy initializer, then expose thin public functions from the existing level modules. Compose full addresses from those exact lookups, with an optional province for NCR and independent/highly urbanized cities.

**Tech Stack:** TypeScript, Vitest, pnpm, tsup

## Global Constraints

- Keep all lookups synchronous and backed by cached `Map` indexes.
- Return `undefined` for unknown exact codes and full-address lookups.
- Return existing readonly cached arrays for complete-list functions.
- Add no fuzzy search, network access, dependency, or data change.
- Keep `province` optional in `PHAddress`.

---

### Task 1: Complete-list and exact-code lookups

**Files:**
- Modify: `tests/region.test.ts`
- Modify: `tests/province.test.ts`
- Modify: `tests/municipality.test.ts`
- Modify: `tests/barangay.test.ts`
- Modify: `tests/data-loader.test.ts`
- Modify: `src/utils/data-loader.ts`
- Modify: `src/functions/region.ts`
- Modify: `src/functions/province.ts`
- Modify: `src/functions/municipality.ts`
- Modify: `src/functions/barangay.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Produces: `getAllMunicipalities`, `getAllBarangays`, `getRegionByCode`,
  `getProvinceByCode`, `getMunicipalityByCode`, `getBarangayByCode`
- Produces internally: `getIndexedRegionsByCode`,
  `getIndexedProvincesByCode`, `getIndexedMunicipalitiesByCode`,
  `getIndexedBarangaysByCode`

- [ ] **Step 1: Write failing public API tests**

Extend each existing level test to import its exact lookup. Add:

```ts
expect(getRegionByCode('0700000000')?.name).toBe('Region VII');
expect(getRegionByCode('9999999999')).toBeUndefined();

expect(getProvinceByCode('0702200000')?.name).toBe('Cebu');
expect(getProvinceByCode('9999999999')).toBeUndefined();

const municipalities = getAllMunicipalities();
expect(municipalities).toHaveLength(1656);
expect(getAllMunicipalities()).toBe(municipalities);
expect(getMunicipalityByCode('0730600000')?.name).toBe('Cebu City');
expect(getMunicipalityByCode('9999999999')).toBeUndefined();

const barangays = getAllBarangays();
expect(barangays).toHaveLength(42010);
expect(getAllBarangays()).toBe(barangays);
expect(getBarangayByCode('0730600001')?.name).toBe('Adlaon');
expect(getBarangayByCode('9999999999')).toBeUndefined();
```

Keep each level's assertions in its existing test file.

- [ ] **Step 2: Verify the public contract fails**

Run:

```bash
pnpm exec vitest run tests/region.test.ts tests/province.test.ts tests/municipality.test.ts tests/barangay.test.ts
```

Expected: FAIL because the six new public exports do not exist.

- [ ] **Step 3: Extend the loader test contract**

In `tests/data-loader.test.ts`, after each dataset is loaded, assert its code map
returns the same object held in the cached array:

```ts
expect(loader.getIndexedRegionsByCode().get('0100000000')).toBe(
  loader.getRegions()[0],
);
expect(loader.getIndexedProvincesByCode().get('0200200000')).toBe(
  loader.getProvinces()[0],
);
expect(loader.getIndexedMunicipalitiesByCode().get('0200102000')).toBe(
  loader.getMunicipalities()[0],
);
expect(loader.getIndexedBarangaysByCode().get('0200101001')).toBe(
  loader.getBarangays()[0],
);
```

- [ ] **Step 4: Add exact-code maps to the lazy loader**

Declare one optional code map per level. In each initializer, build it from the
already sorted cached array:

```ts
regionsByCode = new Map(regions.map(region => [region.psgcCode, region]));
```

Use the equivalent record type and variable for provinces, municipalities, and
barangays. Export getters that initialize only their level and return the map:

```ts
export function getIndexedRegionsByCode() {
  initializeRegions();
  return regionsByCode!;
}
```

Repeat for the other three levels. Do not add a generic index builder.

- [ ] **Step 5: Add the thin public functions**

Follow the current level-module pattern:

```ts
function getRegionByCode(code: string): PHRegion | undefined {
  return getIndexedRegionsByCode().get(code);
}

function getAllMunicipalities(): readonly PHMunicipality[] {
  return getMunicipalities();
}
```

Add the corresponding province, municipality, and barangay functions. Export
all six from `src/index.ts`.

- [ ] **Step 6: Verify green**

Run:

```bash
pnpm exec vitest run tests/data-loader.test.ts tests/region.test.ts tests/province.test.ts tests/municipality.test.ts tests/barangay.test.ts
```

Expected: all loader identity, complete-list, known-code, and unknown-code
assertions pass.

- [ ] **Step 7: Commit**

```bash
git add src tests/data-loader.test.ts tests/region.test.ts tests/province.test.ts tests/municipality.test.ts tests/barangay.test.ts
git commit -m "feat: add PSGC code lookup utilities"
```

### Task 2: Full address lookup

**Files:**
- Create: `src/types/address.d.ts`
- Modify: `src/functions/barangay.ts`
- Modify: `src/index.ts`
- Modify: `tests/barangay.test.ts`

**Interfaces:**
- Consumes: the exact-code functions from Task 1
- Produces: `PHAddress` and
  `getAddressByBarangayCode(code: string): PHAddress | undefined`

- [ ] **Step 1: Write failing address tests**

Add table-driven cases to `tests/barangay.test.ts`:

```ts
it.each([
  ['1400101001', 'Cordillera Administrative Region', 'Abra', 'Bangued', 'Agtangao'],
  ['1381300001', 'National Capital Region', undefined, 'Quezon City', 'Alicia'],
  ['0730600001', 'Region VII', undefined, 'Cebu City', 'Adlaon'],
  ['0203135001', 'Region II', 'Isabela', 'Santiago City', 'Abra'],
])('resolves address hierarchy for %s', (code, region, province, municipality, barangay) => {
  const result = getAddressByBarangayCode(code);
  expect(result?.region.name).toBe(region);
  expect(result?.province?.name).toBe(province);
  expect(result?.municipality.name).toBe(municipality);
  expect(result?.barangay.name).toBe(barangay);
});

it('returns undefined for an unknown address code', () => {
  expect(getAddressByBarangayCode('9999999999')).toBeUndefined();
});
```

The regular, NCR, self-parented HUC, and ICC cases cover the distinct parent
relationships required by issue #20.

- [ ] **Step 2: Verify red**

Run:

```bash
pnpm exec vitest run tests/barangay.test.ts
```

Expected: FAIL because `getAddressByBarangayCode` is not exported.

- [ ] **Step 3: Add `PHAddress`**

Create `src/types/address.d.ts`:

```ts
import { PHBarangay } from './barangay';
import { PHMunicipality } from './municipality';
import { PHProvince } from './province';
import { PHRegion } from './region';

export type PHAddress = {
  region: PHRegion;
  province?: PHProvince;
  municipality: PHMunicipality;
  barangay: PHBarangay;
};
```

- [ ] **Step 4: Implement the minimal composition**

In `src/functions/barangay.ts`, compose the Task 1 exact lookups:

```ts
function getAddressByBarangayCode(code: string): PHAddress | undefined {
  const barangay = getBarangayByCode(code);
  if (!barangay) return undefined;

  const municipality = getMunicipalityByCode(barangay.municipalCityCode);
  if (!municipality) return undefined;

  const province = getProvinceByCode(municipality.provinceCode);
  const region = getRegionByCode(
    province?.regionCode ?? municipality.psgcCode.slice(0, 2) + '00000000',
  );
  if (!region) return undefined;

  return { region, ...(province && { province }), municipality, barangay };
}
```

Export the function and `PHAddress` from `src/index.ts`.

- [ ] **Step 5: Verify green and full source tests**

Run:

```bash
pnpm exec vitest run tests/barangay.test.ts tests/integrity.test.ts
pnpm typecheck
```

Expected: all address paths, unknown code, data integrity, and types pass.

- [ ] **Step 6: Commit**

```bash
git add src/types/address.d.ts src/functions/barangay.ts src/index.ts tests/barangay.test.ts
git commit -m "feat: resolve full addresses by barangay code"
```

### Task 3: Published API and documentation

**Files:**
- Modify: `tests/package.test.ts`
- Modify: `tests/dist.test.ts`
- Modify: `README.md`

**Interfaces:**
- Consumes: all Task 1 and Task 2 exports
- Produces: verified CommonJS, ESM, TypeScript declaration, browser-bundled,
  and documented public API

- [ ] **Step 1: Write failing packed-package assertions**

Before rebuilding, extend `tests/package.test.ts` so the CommonJS subprocess
calls `getAddressByBarangayCode('0730600001')`, the ESM subprocess calls
`getAllBarangays()`, and the generated TypeScript consumer imports `PHAddress`
and includes it in the declared tuple.

Extend `tests/dist.test.ts` to import every new runtime export and assert the
known/unknown contract through the built package alias.

- [ ] **Step 2: Verify stale dist fails**

Run:

```bash
pnpm exec vitest run tests/dist.test.ts tests/package.test.ts
```

Expected: FAIL because the existing `dist` files predate the new exports.

- [ ] **Step 3: Rebuild and verify published exports**

Run:

```bash
pnpm build
pnpm exec vitest run tests/dist.test.ts tests/package.test.ts
```

Expected: CommonJS, ESM, declarations, and all new runtime exports pass.

- [ ] **Step 4: Add one README example**

Add a concise “Code and Address Lookup” section showing:

```ts
const barangay = getBarangayByCode('0730600001');
const address = getAddressByBarangayCode('0730600001');
```

Mention that exact lookups return `undefined` for unknown codes and `province`
is optional for NCR and independent/highly urbanized cities.

- [ ] **Step 5: Run complete verification**

Run:

```bash
pnpm install --frozen-lockfile
pnpm data:check
pnpm build
pnpm typecheck
pnpm test --run
pnpm test:browser
npm_config_cache=/tmp/ph-address-npm-cache npm pack --dry-run --json
git diff --check
```

Expected: every command exits 0; generated data is unchanged; 18 regions, 82
provinces, 1,656 municipality/city/submunicipality records, and 42,010
barangays remain; the package dry-run contains only the seven intended files.

- [ ] **Step 6: Commit**

```bash
git add README.md tests/dist.test.ts tests/package.test.ts
git commit -m "docs: document PSGC code and address lookups"
```
