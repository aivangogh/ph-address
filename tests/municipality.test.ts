import { describe, it, expect } from 'vitest';
import {
  getAllMunicipalities,
  getAllProvinces,
  getMunicipalityByCode,
  getMunicipalitiesByProvince,
} from '../src';
import allMunicipalities from '../src/data/municipalities.json';
import { sortByName } from '../src/utils/sort';

describe('Get Cities/Municipalities test suite', () => {
  it('should return sorted municipalities when a valid province code is provided', () => {
    const provinceCode = '1400100000'; // Abra

    const result = getMunicipalitiesByProvince(provinceCode);
    const secondResult = getMunicipalitiesByProvince(provinceCode);

    const expected = sortByName(
      allMunicipalities.filter((m) => m.provinceCode === provinceCode)
    );

    expect(result).toEqual(expected);
    expect(secondResult).toBe(result);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return an empty array for a non-existent province code', () => {
    const provinceCode = 'non-existent-code';
    const result = getMunicipalitiesByProvince(provinceCode);
    expect(result).toEqual([]);
  });

  it('should return all municipalities from the cache', () => {
    const municipalities = getAllMunicipalities();
    expect(municipalities).toHaveLength(1656);
    expect(getAllMunicipalities()).toBe(municipalities);
  });

  it('should find a municipality by code', () => {
    expect(getMunicipalityByCode('0730600000')?.name).toBe('Cebu City');
    expect(getMunicipalityByCode('9999999999')).toBeUndefined();
  });

  it.each([
    ['Davao del Sur', ['Davao City']],
    ['Cebu', ['Cebu City', 'Lapu-Lapu City', 'Mandaue City']],
    ['Benguet', ['Baguio City']],
    ['Negros Occidental', ['Bacolod City']],
    ['Pampanga', ['Angeles City']],
  ])(
    'should list the highly urbanized cities of %s under it',
    (provinceName, expectedCities) => {
      const province = getAllProvinces().find((p) => p.name === provinceName);
      expect(province).toBeDefined();

      const names = getMunicipalitiesByProvince(province!.psgcCode).map(
        (m) => m.name
      );

      expectedCities.forEach((city) => expect(names).toContain(city));
    }
  );
});
