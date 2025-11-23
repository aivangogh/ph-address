import { describe, it, expect } from 'vitest';
import { reformatCityName } from '../src/utils/reformat';

describe('reformatCityName', () => {
  it('should reformat "City of [Name]" to "[Name] City"', () => {
    expect(reformatCityName('City of Cebu')).toBe('Cebu City');
    expect(reformatCityName('City of Manila')).toBe('Manila City');
    expect(reformatCityName('City of Zamboanga')).toBe('Zamboanga City');
  });

  it('should reformat "Municipality of [Name]" to "[Name]"', () => {
    expect(reformatCityName('Municipality of Adams')).toBe('Adams');
    expect(reformatCityName('Municipality of Allacapan')).toBe('Allacapan');
    expect(reformatCityName('Municipality of Aborlan')).toBe('Aborlan');
  });

  it('should not change names that do not match the patterns', () => {
    expect(reformatCityName('Cebu')).toBe('Cebu');
    expect(reformatCityName('Manila')).toBe('Manila');
    expect(reformatCityName('Zamboanga')).toBe('Zamboanga');
    expect(reformatCityName('Biñan')).toBe('Biñan');
  });

  it('should handle names with "City" in them already', () => {
    expect(reformatCityName('Quezon City')).toBe('Quezon City');
    expect(reformatCityName('Mandaue City')).toBe('Mandaue City');
  });

  it('should handle case-insensitivity', () => {
    expect(reformatCityName('city of cebu')).toBe('cebu City');
    expect(reformatCityName('municipality of adams')).toBe('adams');
  });
});
