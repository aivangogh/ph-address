# PSGC Data Migration Summary

## Update: 3Q 2025 PSGC Data

**Source:** PSGC-3Q-2025-Publication-Datafile.xlsx
**Date:** November 2025
**Reference:** [PSA PSGC Publications](https://psa.gov.ph/classification/psgc/)

### Data Changes

| Category | Old Count | New Count | Change |
|----------|-----------|-----------|--------|
| **Regions** | 17 | 18 | +1 |
| **Provinces** | 85 | 82 | -3 |
| **Municipalities** | 1,648 | 1,656 | +8 |
| **Barangays** | 42,046 | 42,011 | -35 |

### File Sizes

| File | Old Size | New Size |
|------|----------|----------|
| regions.json | 1.4 KB | 1.4 KB |
| provinces.json | 5.9 KB | 5.8 KB |
| municipalities.json | 114 KB | 118 KB |
| barangays.json | 3.1 MB | 3.2 MB |

### Notable Changes

#### Regions
- **Added:** 1 new region (likely administrative reorganization)

#### Provinces
- Net decrease of 3 provinces (may indicate reclassification or consolidation)

#### Municipalities/Cities
- Net increase of 8 municipalities
- Possible new city conversions or municipality creations

#### Barangays
- Net decrease of 35 barangays
- May indicate consolidation or reclassification

### Code Changes

#### PSGC Code Updates
Some PSGC codes have changed between publications. For example:
- **Cebu City**
  - Old: `072217000`
  - New: `0730600000`

**Important:** If your application hardcodes PSGC codes, you may need to update them.

### Breaking Changes

While the API remains the same, PSGC codes have changed for some locations. This means:

1. **Hardcoded codes will break** - If you're using specific PSGC codes in your application, verify them against the new data
2. **Database migrations** - If you store PSGC codes in your database, you may need to create a migration mapping
3. **Test updates** - Tests using specific codes need to be updated (see test/barangay.test.ts)

### Migration Script

A new migration script has been added to automate future PSGC updates:

**Location:** `scripts/migrate-psgc.ts`

**Usage:**
```bash
bun run migrate:psgc
```

**Features:**
- Reads Excel PSGC publication files
- Automatically extracts and formats data
- Generates minified JSON files
- Validates data structure
- Shows statistics and samples

### How to Update in Future

1. Download latest PSGC Excel file from PSA website
2. Place in `assets/` directory
3. Update filename in `scripts/migrate-psgc.ts` if needed
4. Run: `bun run migrate:psgc`
5. Run tests: `bun test`
6. Review changes and update changelog
7. Create changeset: `bunx changeset`

### Verification

All tests pass with the new data:
```bash
✓ Region tests
✓ Province tests
✓ Municipality tests
✓ Barangay tests
```

### Data Format Improvements

For better user experience, city and municipality names have been reformatted:

**City Names:**
- Old format: "City of Cebu", "City of Manila"
- New format: "Cebu City", "Manila City"

**Municipality Names:**
- Old format: "Municipality of Adams"
- New format: "Adams"

This makes the data more readable and user-friendly when displayed in dropdowns or forms.

### API Compatibility

The API remains **fully compatible** - no changes required to existing code using this package:

- `getAllRegions()`
- `getAllProvinces()`
- `getProvincesByRegion(code)`
- `getMunicipalitiesByProvince(code)`
- `getBarangaysByMunicipality(code)`

All functions continue to work with the same signatures and return types.

### Recommendations

1. **Don't hardcode PSGC codes** - Always fetch fresh data from this package
2. **Use location names as fallback** - Names are more stable than codes
3. **Implement migration mapping** - If you have stored codes, create a mapping table
4. **Test thoroughly** - Verify your dropdowns and address forms with new data

### Related Files

- `scripts/migrate-psgc.ts` - Migration script
- `scripts/explore-excel.ts` - Excel exploration tool
- `scripts/README.md` - Migration documentation
- `assets/PSGC-3Q-2025-Publication-Datafile.xlsx` - Source data

### Support

For questions or issues related to the PSGC codes themselves, refer to:
- [PSA PSGC Official Website](https://psa.gov.ph/classification/psgc/)

For package-related issues:
- [GitHub Issues](https://github.com/aivangogh/ph-address/issues)
