import { beforeEach, describe, expect, it, vi } from 'vitest';

const { inflate } = vi.hoisted(() => {
  const csvByKey: Record<string, string> = {
    regions: [
      'name,psgcCode,designation',
      'Zulu,0200000000,Region',
      'Alpha,0100000000,Region',
    ].join('\n'),
    provinces: [
      'name,psgcCode',
      'Zulu Province,0200100000',
      'Alpha Province,0200200000',
    ].join('\n'),
    municipalities: [
      'name,psgcCode,provinceCode',
      'Zulu Town,0200101000,0200100000',
      'Alpha Town,0200102000,0200100000',
    ].join('\n'),
    barangays: [
      'name,psgcCode',
      'Zulu Barangay,0200101002',
      'Alpha Barangay,0200101001',
    ].join('\n'),
  };

  return {
    inflate: vi.fn((bytes: Uint8Array) => {
      const key = new TextDecoder().decode(bytes);
      return csvByKey[key];
    }),
  };
});

vi.mock('pako', () => ({ default: { inflate } }));
vi.mock('../src/data-csv-ts', () => ({
  regions: btoa('regions'),
  provinces: btoa('provinces'),
  municipalities: btoa('municipalities'),
  barangays: btoa('barangays'),
}));

describe('lazy data loader', () => {
  beforeEach(() => {
    vi.resetModules();
    inflate.mockClear();
  });

  it('loads only regions for a regions-only lookup', async () => {
    const { getRegions } = await import('../src/utils/data-loader');

    expect(getRegions().map(({ name }) => name)).toEqual(['Alpha', 'Zulu']);
    expect(inflate).toHaveBeenCalledTimes(1);
    expect(new TextDecoder().decode(inflate.mock.calls[0][0])).toBe('regions');
  });

  it('parses each requested dataset once and keeps index buckets sorted', async () => {
    const loader = await import('../src/utils/data-loader');

    expect(loader.getProvinces().map(({ name }) => name)).toEqual([
      'Alpha Province',
      'Zulu Province',
    ]);
    expect(
      loader
        .getIndexedProvincesByRegion()
        .get('0200000000')
        ?.map(({ name }) => name),
    ).toEqual(['Alpha Province', 'Zulu Province']);

    expect(loader.getMunicipalities().map(({ name }) => name)).toEqual([
      'Alpha Town',
      'Zulu Town',
    ]);
    expect(
      loader
        .getIndexedMunicipalitiesByProvince()
        .get('0200100000')
        ?.map(({ name }) => name),
    ).toEqual(['Alpha Town', 'Zulu Town']);

    expect(loader.getBarangays().map(({ name }) => name)).toEqual([
      'Alpha Barangay',
      'Zulu Barangay',
    ]);
    expect(
      loader
        .getIndexedBarangaysByMunicipality()
        .get('0200101000')
        ?.map(({ name }) => name),
    ).toEqual(['Alpha Barangay', 'Zulu Barangay']);

    loader.getProvinces();
    loader.getMunicipalities();
    loader.getBarangays();
    expect(inflate).toHaveBeenCalledTimes(3);
  });
});
