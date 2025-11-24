import { describe, it, expect } from 'vitest';
import { decode } from '@toon-format/toon';
import pako from 'pako';
import {
  regions as regionsCompressed,
  provinces as provincesCompressed,
  municipalities as municipalitiesCompressed,
  barangays as barangaysCompressed,
} from '../src/data-toon-ts';

describe('Compression test suite', () => {
  describe('Data Format Validation', () => {
    it('should have compressed regions data as base64 string', () => {
      expect(typeof regionsCompressed).toBe('string');
      expect(regionsCompressed.length).toBeGreaterThan(0);

      // Check if it's valid base64
      expect(() => {
        atob(regionsCompressed);
      }).not.toThrow();
    });

    it('should have compressed provinces data as base64 string', () => {
      expect(typeof provincesCompressed).toBe('string');
      expect(provincesCompressed.length).toBeGreaterThan(0);

      expect(() => {
        atob(provincesCompressed);
      }).not.toThrow();
    });

    it('should have compressed municipalities data as base64 string', () => {
      expect(typeof municipalitiesCompressed).toBe('string');
      expect(municipalitiesCompressed.length).toBeGreaterThan(0);

      expect(() => {
        atob(municipalitiesCompressed);
      }).not.toThrow();
    });

    it('should have compressed barangays data as base64 string', () => {
      expect(typeof barangaysCompressed).toBe('string');
      expect(barangaysCompressed.length).toBeGreaterThan(0);

      expect(() => {
        atob(barangaysCompressed);
      }).not.toThrow();
    });
  });

  describe('Decompression Performance', () => {
    it('should decompress regions data quickly (<50ms)', () => {
      const start = performance.now();

      const compressedBytes = Uint8Array.from(atob(regionsCompressed), c => c.charCodeAt(0));
      const decompressed = pako.inflate(compressedBytes, { to: 'string' });
      const data = decode(decompressed);

      const duration = performance.now() - start;

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(50);
      console.log(`    ✓ Regions decompressed in ${duration.toFixed(2)}ms`);
    });

    it('should decompress provinces data quickly (<100ms)', () => {
      const start = performance.now();

      const compressedBytes = Uint8Array.from(atob(provincesCompressed), c => c.charCodeAt(0));
      const decompressed = pako.inflate(compressedBytes, { to: 'string' });
      const data = decode(decompressed);

      const duration = performance.now() - start;

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100);
      console.log(`    ✓ Provinces decompressed in ${duration.toFixed(2)}ms`);
    });

    it('should decompress municipalities data quickly (<100ms)', () => {
      const start = performance.now();

      const compressedBytes = Uint8Array.from(atob(municipalitiesCompressed), c => c.charCodeAt(0));
      const decompressed = pako.inflate(compressedBytes, { to: 'string' });
      const data = decode(decompressed);

      const duration = performance.now() - start;

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100);
      console.log(`    ✓ Municipalities decompressed in ${duration.toFixed(2)}ms`);
    });

    it('should decompress barangays data in reasonable time (<2000ms)', () => {
      const start = performance.now();

      const compressedBytes = Uint8Array.from(atob(barangaysCompressed), c => c.charCodeAt(0));
      const decompressed = pako.inflate(compressedBytes, { to: 'string' });
      const data = decode(decompressed);

      const duration = performance.now() - start;

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(2000);
      console.log(`    ✓ Barangays decompressed in ${duration.toFixed(2)}ms`);
    });
  });

  describe('Compression Ratio', () => {
    it('should have good compression ratio for barangays', () => {
      // Decompress to measure original size
      const compressedBytes = Uint8Array.from(atob(barangaysCompressed), c => c.charCodeAt(0));
      const decompressed = pako.inflate(compressedBytes, { to: 'string' });

      const compressedSize = barangaysCompressed.length;
      const decompressedSize = decompressed.length;
      const ratio = ((1 - compressedSize / decompressedSize) * 100).toFixed(1);

      // Should have at least 60% compression
      expect(compressedSize).toBeLessThan(decompressedSize * 0.4);

      console.log(`    ✓ Barangays: ${decompressedSize} → ${compressedSize} bytes (${ratio}% reduction)`);
    });

    it('should have good compression ratio for municipalities', () => {
      const compressedBytes = Uint8Array.from(atob(municipalitiesCompressed), c => c.charCodeAt(0));
      const decompressed = pako.inflate(compressedBytes, { to: 'string' });

      const compressedSize = municipalitiesCompressed.length;
      const decompressedSize = decompressed.length;
      const ratio = ((1 - compressedSize / decompressedSize) * 100).toFixed(1);

      expect(compressedSize).toBeLessThan(decompressedSize * 0.4);

      console.log(`    ✓ Municipalities: ${decompressedSize} → ${compressedSize} bytes (${ratio}% reduction)`);
    });
  });

  describe('Data Integrity After Decompression', () => {
    it('should produce valid region objects after decompression', () => {
      const compressedBytes = Uint8Array.from(atob(regionsCompressed), c => c.charCodeAt(0));
      const decompressed = pako.inflate(compressedBytes, { to: 'string' });
      const data = decode(decompressed);

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(18); // Philippines has 18 regions (including BARMM)

      const firstRegion = data[0];
      expect(firstRegion).toHaveProperty('name');
      expect(firstRegion).toHaveProperty('psgcCode');
      expect(typeof firstRegion.name).toBe('string');
      expect(typeof firstRegion.psgcCode).toBe('string');
    });

    it('should produce valid barangay objects after decompression', () => {
      const compressedBytes = Uint8Array.from(atob(barangaysCompressed), c => c.charCodeAt(0));
      const decompressed = pako.inflate(compressedBytes, { to: 'string' });
      const data = decode(decompressed);

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(40000); // Philippines has 40k+ barangays

      const firstBarangay = data[0];
      expect(firstBarangay).toHaveProperty('name');
      expect(firstBarangay).toHaveProperty('psgcCode');
      expect(firstBarangay).toHaveProperty('municipalCityCode');
      expect(typeof firstBarangay.name).toBe('string');
      expect(typeof firstBarangay.psgcCode).toBe('string');
      expect(typeof firstBarangay.municipalCityCode).toBe('string');
    });
  });
});
