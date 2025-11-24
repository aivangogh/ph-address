import { describe, it, expect } from 'vitest';
import { getAllProvinces, getProvincesByRegion } from '../src';
import allProvinces from '../src/data/provinces.json';
import { sortByName } from '../src/utils/sort';

describe('Get province/s test suite', () => {
  it('should return all provinces sorted by name', () => {
    const result = getAllProvinces();
    const expected = sortByName(allProvinces);

    expect(result).toEqual(expected);
  });

  it('should return sorted provinces when a valid region code is provided', () => {
    const regionCode = '1400000000';

    const result = getProvincesByRegion(regionCode);

    const expected = sortByName(
      allProvinces.filter((p) => p.regionCode === regionCode)
    );

    expect(result).toEqual(expected);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return an empty array for a non-existent region code', () => {
    const regionCode = 'non-existent-code';
    const result = getProvincesByRegion(regionCode);
    expect(result).toEqual([]);
  });
});
