import { describe, it, expect, beforeAll } from 'vitest';
import {
  getAllProvinces,
  getAllRegions,
  getProvincesByRegion,
  getMunicipalitiesByProvince,
  getBarangaysByMunicipality
} from '@aivangogh/ph-address';

describe('Distribution files test suite', () => {
  let initStartTime: number;
  let initEndTime: number;

  beforeAll(() => {
    // Measure initialization time
    initStartTime = performance.now();
    getAllRegions(); // This triggers data initialization
    initEndTime = performance.now();
  });

  describe('Data Loading & Decompression', () => {
    it('should initialize data in reasonable time (<2s)', () => {
      const initTime = initEndTime - initStartTime;
      expect(initTime).toBeLessThan(2000); // Should be under 2 seconds
      console.log(`    ✓ Data initialized in ${initTime.toFixed(2)}ms`);
    });

    it('should return all regions from the dist files', () => {
      const result = getAllRegions();
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBe(18); // Philippines has 18 regions (including BARMM)
      console.log(`    ✓ Loaded ${result.length} regions`);
    });

    it('should return all provinces from the dist files', () => {
      const result = getAllProvinces();
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeGreaterThan(80); // Philippines has 81+ provinces
      expect(result).toEqual(result.sort((a, b) => a.name.localeCompare(b.name))); // Should be sorted
      console.log(`    ✓ Loaded ${result.length} provinces (sorted)`);
    });
  });

  describe('Data Integrity', () => {
    it('should have valid region structure', () => {
      const regions = getAllRegions();
      const firstRegion = regions[0];

      expect(firstRegion).toHaveProperty('name');
      expect(firstRegion).toHaveProperty('psgcCode');
      expect(firstRegion).toHaveProperty('designation');
      expect(typeof firstRegion.name).toBe('string');
      expect(typeof firstRegion.psgcCode).toBe('string');
      expect(typeof firstRegion.designation).toBe('string');
    });

    it('should have valid province structure', () => {
      const provinces = getAllProvinces();
      const firstProvince = provinces[0];

      expect(firstProvince).toHaveProperty('name');
      expect(firstProvince).toHaveProperty('psgcCode');
      expect(firstProvince).toHaveProperty('regionCode');
      expect(typeof firstProvince.name).toBe('string');
      expect(typeof firstProvince.psgcCode).toBe('string');
      expect(typeof firstProvince.regionCode).toBe('string');
    });

    it('should maintain data relationships (region -> province)', () => {
      const regionCode = '1400000000'; // CAR region
      const provinces = getProvincesByRegion(regionCode);

      expect(provinces.length).toBeGreaterThan(0);
      provinces.forEach(province => {
        expect(province.regionCode).toBe(regionCode);
      });
      console.log(`    ✓ Region ${regionCode} has ${provinces.length} provinces`);
    });

    it('should maintain data relationships (province -> municipality)', () => {
      const provinceCode = '1400100000'; // Abra
      const municipalities = getMunicipalitiesByProvince(provinceCode);

      expect(municipalities.length).toBeGreaterThan(0);
      municipalities.forEach(municipality => {
        expect(municipality.provinceCode).toBe(provinceCode);
      });
      console.log(`    ✓ Province ${provinceCode} has ${municipalities.length} municipalities`);
    });

    it('should maintain data relationships (municipality -> barangay)', () => {
      const municipalityCode = '0730600000'; // Cebu City
      const barangays = getBarangaysByMunicipality(municipalityCode);

      expect(barangays.length).toBeGreaterThan(0);
      barangays.forEach(barangay => {
        expect(barangay.municipalCityCode).toBe(municipalityCode);
      });
      console.log(`    ✓ Municipality ${municipalityCode} has ${barangays.length} barangays`);
    });
  });

  describe('Edge Cases', () => {
    it('should return empty array for non-existent region code', () => {
      const result = getProvincesByRegion('9999999999');
      expect(result).toEqual([]);
    });

    it('should return empty array for non-existent province code', () => {
      const result = getMunicipalitiesByProvince('9999999999');
      expect(result).toEqual([]);
    });

    it('should return empty array for non-existent municipality code', () => {
      const result = getBarangaysByMunicipality('9999999999');
      expect(result).toEqual([]);
    });

    it('should handle multiple calls efficiently (data cached)', () => {
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        getAllProvinces();
      }
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50); // 100 calls should be very fast (cached)
      console.log(`    ✓ 100 cached calls in ${duration.toFixed(2)}ms`);
    });
  });

  describe('Data Completeness', () => {
    it('should load all barangays', () => {
      // Sample a few municipalities and check their barangays
      const cebuCity = getBarangaysByMunicipality('0730600000');
      expect(cebuCity.length).toBeGreaterThan(0);

      const quezonCity = getBarangaysByMunicipality('1381300000'); // Quezon City
      expect(quezonCity.length).toBeGreaterThan(0);

      console.log(`    ✓ Cebu City: ${cebuCity.length} barangays`);
      console.log(`    ✓ Quezon City: ${quezonCity.length} barangays`);
    });

    it('should return sorted results', () => {
      const provinces = getAllProvinces();

      // Check if sorted alphabetically
      for (let i = 1; i < provinces.length; i++) {
        expect(provinces[i].name.localeCompare(provinces[i - 1].name)).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
