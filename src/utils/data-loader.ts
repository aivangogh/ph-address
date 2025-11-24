import regionsData from '../data/regions.json';
import provincesData from '../data/provinces.json';
import municipalitiesData from '../data/municipalities.json';
import barangaysData from '../data/barangays.json';

import { PHRegion } from '../types/region';
import { PHProvince } from '../types/province';
import { PHMunicipality } from '../types/municipality';
import { PHBarangay } from '../types/barangay';

// Data is stored in memory after initial load
let regions: readonly PHRegion[];
let provinces: readonly PHProvince[];
let municipalities: readonly PHMunicipality[];
let barangays: readonly PHBarangay[];

// Indexed data for faster lookups
let provincesByRegion: Map<string, readonly PHProvince[]>;
let municipalitiesByProvince: Map<string, readonly PHMunicipality[]>;
let barangaysByMunicipality: Map<string, readonly PHBarangay[]>;

let isInitialized = false;

function initializeData() {
    if (isInitialized) {
        return;
    }

    regions = regionsData as readonly PHRegion[];
    provinces = provincesData as readonly PHProvince[];
    municipalities = municipalitiesData as readonly PHMunicipality[];
    barangays = barangaysData as readonly PHBarangay[];

    provincesByRegion = new Map();
    for (const province of provinces) {
        const regionProvinces = (provincesByRegion.get(province.regionCode) || []).concat(province);
        provincesByRegion.set(province.regionCode, regionProvinces);
    }

    municipalitiesByProvince = new Map();
    for (const municipality of municipalities) {
        const provinceMunicipalities = (municipalitiesByProvince.get(municipality.provinceCode) || []).concat(municipality);
        municipalitiesByProvince.set(municipality.provinceCode, provinceMunicipalities);
    }

    barangaysByMunicipality = new Map();
    for (const barangay of barangays) {
        const municipalityBarangays = (barangaysByMunicipality.get(barangay.municipalCityCode) || []).concat(barangay);
        barangaysByMunicipality.set(barangay.municipalCityCode, municipalityBarangays);
    }

    isInitialized = true;
}

export function getRegions(): readonly PHRegion[] {
  initializeData();
  return regions;
}

export function getProvinces(): readonly PHProvince[] {
    initializeData();
    return provinces;
}

export function getMunicipalities(): readonly PHMunicipality[] {
    initializeData();
    return municipalities;
}

export function getBarangays(): readonly PHBarangay[] {
    initializeData();
    return barangays;
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
