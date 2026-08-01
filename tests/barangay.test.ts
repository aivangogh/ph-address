import { describe, it, expect } from 'vitest';
import {
  getAllBarangays,
  getAddressByBarangayCode,
  getBarangayByCode,
  getBarangaysByMunicipality,
} from '../src';
import allBarangays from '../src/data/barangays.json';
import { sortByName } from '../src/utils/sort';

describe('Get barangays test suite', () => {
  it('should return sorted barangays when a valid municipality code is provided', () => {
    const municipalityCode = '0730600000'; // Cebu City code

    const result = getBarangaysByMunicipality(municipalityCode);
    const secondResult = getBarangaysByMunicipality(municipalityCode);

    const expected = sortByName(
      allBarangays.filter((b) => b.municipalCityCode === municipalityCode)
    );

    expect(result).toEqual(expected);
    expect(secondResult).toBe(result);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return an empty array for a non-existent municipality code', () => {
    const municipalityCode = 'non-existent-code';
    const result = getBarangaysByMunicipality(municipalityCode);
    expect(result).toEqual([]);
  });

  it('should return all barangays from the cache', () => {
    const barangays = getAllBarangays();
    expect(barangays).toHaveLength(42010);
    expect(getAllBarangays()).toBe(barangays);
  });

  it('should find a barangay by code', () => {
    expect(getBarangayByCode('0730600001')?.name).toBe('Adlaon');
    expect(getBarangayByCode('9999999999')).toBeUndefined();
  });

  it.each([
    ['1400101001', 'Cordillera Administrative Region', 'Abra', 'Bangued', 'Agtangao'],
    ['1381300001', 'National Capital Region', undefined, 'Quezon City', 'Alicia'],
    ['0730600001', 'Region VII', undefined, 'Cebu City', 'Adlaon'],
    ['0203135001', 'Region II', 'Isabela', 'Santiago City', 'Abra'],
  ])(
    'should resolve the address hierarchy for %s',
    (code, region, province, municipality, barangay) => {
      const result = getAddressByBarangayCode(code);
      expect(result?.region.name).toBe(region);
      expect(result?.province?.name).toBe(province);
      expect(result?.municipality.name).toBe(municipality);
      expect(result?.barangay.name).toBe(barangay);
    },
  );

  it('should return undefined for an unknown address code', () => {
    expect(getAddressByBarangayCode('9999999999')).toBeUndefined();
  });
});
