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

const recordsByCode = new Map(
  [...datasets.municipality, ...datasets.barangay].map(record => [
    record.psgcCode,
    record
  ])
);

const q1Changes = [
  ['0201522000', 'Sanchez Mira'],
  ['0502002010', 'Genitligan'],
  ['1401104001', 'Ambuklao'],
  ['1401104004', 'Daklan'],
  ['1001309030', 'Sto. Rosario'],
  ['1001314021', 'Sto. Niño'],
  ['1001312058', 'St. Peter'],
  ['1001312061', 'Sto. Niño']
] as const;

const q2Changes = [
  ['1102324000', 'Sawata'],
  ['1102324013', 'Poblacion'],
  ['1004217000', 'Don Victoriano'],
  ['0300809015', 'Parang-Parang'],
  ['1001307002', 'Barorawon'],
  ['1001307007', 'Macaopao'],
  ['1001309002', 'Balocbocan'],
  ['1001312018', 'Indalasa'],
  ['1001312021', 'Kibalabag'],
  ['1001317019', 'Merangeran'],
  ['1001317034', 'Sta. Cruz'],
  ['1001319002', 'Kulasi'],
  ['1001320016', 'Sto. Niño'],
  ['1001321022', 'Nabag-o'],
  ['1001321011', 'Kahaponan'],
  ['1001321017', 'Lurugan'],
  ['1001313009', 'Sta. Ines']
] as const;

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
  it('has the expected Q2 2026 totals', () => {
    expect(datasets.region).toHaveLength(18);
    expect(datasets.province).toHaveLength(82);
    expect(datasets.municipality).toHaveLength(1656);
    expect(datasets.barangay).toHaveLength(42010);
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

  it.each(q1Changes)('applies Q1 name correction %s → %s', (code, name) => {
    expect(recordsByCode.get(code)?.name).toBe(name);
  });

  it.each(q2Changes)('applies Q2 name change %s → %s', (code, name) => {
    expect(recordsByCode.get(code)?.name).toBe(name);
  });

  it('retires Barangay San Rafael', () => {
    expect(recordsByCode.has('0401007038')).toBe(false);
  });
});
