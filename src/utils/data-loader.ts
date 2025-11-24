import { decode } from '@toon-format/toon';
import fs from 'fs';
import path from 'path';
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

    regions = loadAndDecode<PHRegion[]>('regions.toon');
    provinces = loadAndDecode<PHProvince[]>('provinces.toon');
    municipalities = loadAndDecode<PHMunicipality[]>('municipalities.toon');
    barangays = loadAndDecode<PHBarangay[]>('barangays.toon');

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

function loadAndDecode<T>(fileName: string): T {
  const filePath = path.resolve(__dirname, `../data-toon/${fileName}`);
  const fileBuffer = fs.readFileSync(filePath, 'utf-8');
  return decode(fileBuffer) as T;
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