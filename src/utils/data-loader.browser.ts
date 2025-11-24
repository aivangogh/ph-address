import { gunzip } from 'pako';
import {
    regions,
    provinces,
    municipalities,
    barangays,
} from '../data-compressed';

import { PHRegion } from '../types/region';
import { PHProvince } from '../types/province';
import { PHMunicipality } from '../types/municipality';
import { PHBarangay } from '../types/barangay';

let isInitialized = false;

// Data is stored in memory after initial load
let regionsData: readonly PHRegion[];
let provincesData: readonly PHProvince[];
let municipalitiesData: readonly PHMunicipality[];
let barangaysData: readonly PHBarangay[];

// Indexed data for faster lookups
let provincesByRegion: Map<string, readonly PHProvince[]>;
let municipalitiesByProvince: Map<string, readonly PHMunicipality[]>;
let barangaysByMunicipality: Map<string, readonly PHBarangay[]>;

function initializeData() {
    if (isInitialized) {
        return;
    }

    regionsData = decompressData(regions) as readonly PHRegion[];
    provincesData = decompressData(provinces) as readonly PHProvince[];
    municipalitiesData = decompressData(municipalities) as readonly PHMunicipality[];
    barangaysData = decompressData(barangays) as readonly PHBarangay[];

    provincesByRegion = new Map();
    for (const province of provincesData) {
        const regionProvinces = (provincesByRegion.get(province.regionCode) || []).concat(province);
        provincesByRegion.set(province.regionCode, regionProvinces);
    }

    municipalitiesByProvince = new Map();
    for (const municipality of municipalitiesData) {
        const provinceMunicipalities = (municipalitiesByProvince.get(municipality.provinceCode) || []).concat(municipality);
        municipalitiesByProvince.set(municipality.provinceCode, provinceMunicipalities);
    }

    barangaysByMunicipality = new Map();
    for (const barangay of barangaysData) {
        const municipalityBarangays = (barangaysByMunicipality.get(barangay.municipalCityCode) || []).concat(barangay);
        barangaysByMunicipality.set(barangay.municipalCityCode, municipalityBarangays);
    }

    isInitialized = true;
}

function decompressData<T>(base64: string): T {
  const compressedData = atob(base64);
  const uint8Array = new Uint8Array(compressedData.length);
  for (let i = 0; i < compressedData.length; i++) {
    uint8Array[i] = compressedData.charCodeAt(i);
  }
  const decompressed = gunzip(uint8Array, { to: 'string' });
  return JSON.parse(decompressed);
}

export function getRegions(): readonly PHRegion[] {
  initializeData();
  return regionsData;
}

export function getProvinces(): readonly PHProvince[] {
    initializeData();
    return provincesData;
}

export function getMunicipalities(): readonly PHMunicipality[] {
    initializeData();
    return municipalitiesData;
}

export function getBarangays(): readonly PHBarangay[] {
    initializeData();
    return barangaysData;
}

export function getIndexedProvincesByRegion() {
  initializeData();
  return provincesByRegion;
}

export function getIndexedMunicipalitiesByProvince() {
  initializeData();
  return municipalitiesByProvince;
}

export function getIndexedBarangaysByMunicipality() {
  initializeData();
  return barangaysByMunicipality;
}
