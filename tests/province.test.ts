import { describe, it, expect } from 'vitest';
import { getAllProvinces } from '../src';
import provinces from '../src/data/provinces.json';

describe('Get province/s test suite', () => {
  it('should return all provinces sorted by name', () => {
    const result = getAllProvinces();
    
    // Check if the result has the same number of items as the source
    expect(result.length).toEqual(provinces.length);

    // Check if the result is sorted by name
    const sortedResult = [...result].sort((a, b) => a.name.localeCompare(b.name));
    expect(result).toEqual(sortedResult);
  });
});
