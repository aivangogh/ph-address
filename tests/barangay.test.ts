import { describe, it, expect } from 'vitest';
import { getBarangaysByMunicipality } from '../src';
import allBarangays from '../src/data/barangays.json';
import { sortByName } from '../src/utils/sort';

describe('Get barangays test suite', () => {
  it('should return sorted barangays when a valid municipality code is provided', () => {
    const municipalityCode = '0730600000'; // Cebu City code

    const result = getBarangaysByMunicipality(municipalityCode);

    const expected = sortByName(
      allBarangays.filter((b) => b.municipalCityCode === municipalityCode)
    );

    expect(result).toEqual(expected);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return an empty array for a non-existent municipality code', () => {
    const municipalityCode = 'non-existent-code';
    const result = getBarangaysByMunicipality(municipalityCode);
    expect(result).toEqual([]);
  });
});
