import { describe, expect, it } from 'vitest';
import {
  getBarangays,
  getMunicipalities,
  getProvinces,
  getRegions
} from '../src/utils/data-loader';

const datasets = {
  region: getRegions(),
  province: getProvinces(),
  municipality: getMunicipalities(),
  barangay: getBarangays()
};

function expectValidCodes(level: string, records: readonly { psgcCode: string }[]) {
  const malformed = records.find(record => !/^\d{10}$/.test(record.psgcCode));
  expect(malformed, `malformed ${level} code: ${malformed?.psgcCode}`).toBeUndefined();

  const seen = new Set<string>();
  const duplicate = records.find(record => {
    if (seen.has(record.psgcCode)) return true;
    seen.add(record.psgcCode);
    return false;
  });
  expect(duplicate, `duplicate ${level} code: ${duplicate?.psgcCode}`).toBeUndefined();
}

describe('generated PSGC integrity', () => {
  it('has the expected Q4 2025 totals', () => {
    expect(datasets.region).toHaveLength(18);
    expect(datasets.province).toHaveLength(82);
    expect(datasets.municipality).toHaveLength(1656);
    expect(datasets.barangay).toHaveLength(42011);
  });

  it('has unique 10-digit codes', () => {
    for (const [level, records] of Object.entries(datasets)) {
      expectValidCodes(level, records);
    }
  });

  it('has valid parent codes', () => {
    const regionCodes = new Set(datasets.region.map(region => region.psgcCode));
    const orphanedProvince = datasets.province.find(
      province => !regionCodes.has(province.regionCode)
    );
    expect(
      orphanedProvince,
      `orphaned province ${orphanedProvince?.psgcCode}: ${orphanedProvince?.regionCode}`
    ).toBeUndefined();

    const provinceCodes = new Set(datasets.province.map(province => province.psgcCode));
    const municipalityCodes = new Set(
      datasets.municipality.map(municipality => municipality.psgcCode)
    );
    const municipalityParentCodes = new Set([
      ...regionCodes, // NCR uses its region as the parent.
      ...provinceCodes,
      ...municipalityCodes, // HUCs self-parent; submunicipalities use their city.
      '0990100000', // The workbook's "City of Isabela (Not a Province)" parent.
      '1999900000' // The workbook's Special Geographic Area has no geographic level.
    ]);
    const orphanedMunicipality = datasets.municipality.find(
      municipality => !municipalityParentCodes.has(municipality.provinceCode)
    );
    expect(
      orphanedMunicipality,
      `orphaned municipality ${orphanedMunicipality?.psgcCode}: ${orphanedMunicipality?.provinceCode}`
    ).toBeUndefined();

    const orphanedBarangay = datasets.barangay.find(
      barangay => !municipalityCodes.has(barangay.municipalCityCode)
    );
    expect(
      orphanedBarangay,
      `orphaned barangay ${orphanedBarangay?.psgcCode}: ${orphanedBarangay?.municipalCityCode}`
    ).toBeUndefined();
  });
});
