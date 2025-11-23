import { describe, it, expect } from 'vitest';
import { getMunicipalitiesByProvince } from '../src';
import allMunicipalities from '../src/data/municipalities.json';
import { sortByName } from '../src/utils/sort';

describe('Get Cities/Municipalities test suite', () => {
  it('should return sorted municipalities when a valid province code is provided', () => {
    const provinceCode = '1400100000'; // Abra

    const result = getMunicipalitiesByProvince(provinceCode);

    const expected = sortByName(
      allMunicipalities.filter((m) => m.provinceCode === provinceCode)
    );

    expect(result).toEqual(expected);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return an empty array for a non-existent province code', () => {
    const provinceCode = 'non-existent-code';
    const result = getMunicipalitiesByProvince(provinceCode);
    expect(result).toEqual([]);
  });
});
