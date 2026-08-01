import pako from 'pako';
import {
    regions as regionsCompressed,
    provinces as provincesCompressed,
    municipalities as municipalitiesCompressed,
    barangays as barangaysCompressed,
} from '../data-csv-ts';

import { PHRegion } from '../types/region';
import { PHProvince } from '../types/province';
import { PHMunicipality } from '../types/municipality';
import { PHBarangay } from '../types/barangay';
import { sortByName } from './sort';

// ─── CSV parser ───────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    result.push(current);
    return result;
}

function fromCSV<T>(csv: string): T[] {
    const lines = csv.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',');
    const rows: T[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        const values = parseCSVLine(line);
        const row: Record<string, string> = {};
        for (let j = 0; j < headers.length; j++) {
            row[headers[j]] = values[j] ?? '';
        }
        rows.push(row as T);
    }

    return rows;
}

// ─── Decompression ────────────────────────────────────────────────────────────

function decompressAndParse<T>(compressed: string): T[] {
    // atob works in both browsers and Node.js (v16+); avoids Node-only Buffer
    const bytes = Uint8Array.from(atob(compressed), c => c.charCodeAt(0));
    const csv = pako.inflate(bytes, { to: 'string' });
    return fromCSV<T>(csv);
}

// ─── In-memory store ──────────────────────────────────────────────────────────

let regions: readonly PHRegion[] | undefined;
let provinces: readonly PHProvince[] | undefined;
let municipalities: readonly PHMunicipality[] | undefined;
let barangays: readonly PHBarangay[] | undefined;

let regionsByCode: Map<string, PHRegion> | undefined;
let provincesByCode: Map<string, PHProvince> | undefined;
let municipalitiesByCode: Map<string, PHMunicipality> | undefined;
let barangaysByCode: Map<string, PHBarangay> | undefined;

let provincesByRegion: Map<string, readonly PHProvince[]> | undefined;
let municipalitiesByProvince: Map<string, readonly PHMunicipality[]> | undefined;
let barangaysByMunicipality: Map<string, readonly PHBarangay[]> | undefined;

function initializeRegions() {
    if (regions) return regions;

    regions = sortByName(decompressAndParse<PHRegion>(regionsCompressed));
    regionsByCode = new Map(regions.map(region => [region.psgcCode, region]));
    return regions;
}

function initializeProvinces() {
    if (provinces) return provinces;

    provinces = sortByName(
        decompressAndParse<Omit<PHProvince, 'regionCode'>>(provincesCompressed).map(province => ({
            ...province,
            regionCode: province.psgcCode.substring(0, 2) + '00000000',
        })),
    );
    provincesByCode = new Map(provinces.map(province => [province.psgcCode, province]));

    const index = new Map<string, PHProvince[]>();
    for (const province of provinces) {
        const bucket = index.get(province.regionCode);
        if (bucket) bucket.push(province);
        else index.set(province.regionCode, [province]);
    }
    provincesByRegion = index;
    return provinces;
}

function initializeMunicipalities() {
    if (municipalities) return municipalities;

    municipalities = sortByName(
        decompressAndParse<PHMunicipality>(municipalitiesCompressed),
    );
    municipalitiesByCode = new Map(
        municipalities.map(municipality => [municipality.psgcCode, municipality]),
    );

    const index = new Map<string, PHMunicipality[]>();
    for (const municipality of municipalities) {
        const bucket = index.get(municipality.provinceCode);
        if (bucket) bucket.push(municipality);
        else index.set(municipality.provinceCode, [municipality]);
    }
    municipalitiesByProvince = index;
    return municipalities;
}

function initializeBarangays() {
    if (barangays) return barangays;

    barangays = sortByName(
        decompressAndParse<Omit<PHBarangay, 'municipalCityCode'>>(barangaysCompressed).map(barangay => ({
            ...barangay,
            municipalCityCode: barangay.psgcCode.substring(0, 7) + '000',
        })),
    );
    barangaysByCode = new Map(barangays.map(barangay => [barangay.psgcCode, barangay]));

    const index = new Map<string, PHBarangay[]>();
    for (const barangay of barangays) {
        const bucket = index.get(barangay.municipalCityCode);
        if (bucket) bucket.push(barangay);
        else index.set(barangay.municipalCityCode, [barangay]);
    }
    barangaysByMunicipality = index;
    return barangays;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getRegions(): readonly PHRegion[] {
    return initializeRegions();
}

export function getProvinces(): readonly PHProvince[] {
    return initializeProvinces();
}

export function getMunicipalities(): readonly PHMunicipality[] {
    return initializeMunicipalities();
}

export function getBarangays(): readonly PHBarangay[] {
    return initializeBarangays();
}

export function getIndexedRegionsByCode() {
    initializeRegions();
    return regionsByCode!;
}

export function getIndexedProvincesByCode() {
    initializeProvinces();
    return provincesByCode!;
}

export function getIndexedMunicipalitiesByCode() {
    initializeMunicipalities();
    return municipalitiesByCode!;
}

export function getIndexedBarangaysByCode() {
    initializeBarangays();
    return barangaysByCode!;
}

export function getIndexedProvincesByRegion() {
    initializeProvinces();
    return provincesByRegion!;
}

export function getIndexedMunicipalitiesByProvince() {
    initializeMunicipalities();
    return municipalitiesByProvince!;
}

export function getIndexedBarangaysByMunicipality() {
    initializeBarangays();
    return barangaysByMunicipality!;
}
