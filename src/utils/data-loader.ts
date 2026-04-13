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

let regions: readonly PHRegion[];
let provinces: readonly PHProvince[];
let municipalities: readonly PHMunicipality[];
let barangays: readonly PHBarangay[];

let provincesByRegion: Map<string, readonly PHProvince[]>;
let municipalitiesByProvince: Map<string, readonly PHMunicipality[]>;
let barangaysByMunicipality: Map<string, readonly PHBarangay[]>;

let isInitialized = false;

function initializeData() {
    if (isInitialized) {
        return;
    }

    regions = decompressAndParse<PHRegion>(regionsCompressed);

    // regionCode is derivable from PSGC structure: digits 1-2 + '00000000'
    provinces = decompressAndParse<Omit<PHProvince, 'regionCode'>>(provincesCompressed).map(p => ({
        ...p,
        regionCode: p.psgcCode.substring(0, 2) + '00000000',
    }));

    municipalities = decompressAndParse<PHMunicipality>(municipalitiesCompressed);

    // municipalCityCode is derivable from PSGC structure: digits 1-7 + '000'
    barangays = decompressAndParse<Omit<PHBarangay, 'municipalCityCode'>>(barangaysCompressed).map(b => ({
        ...b,
        municipalCityCode: b.psgcCode.substring(0, 7) + '000',
    }));

    provincesByRegion = new Map();
    for (const province of provinces) {
        const existing = provincesByRegion.get(province.regionCode) || [];
        provincesByRegion.set(province.regionCode, [...existing, province]);
    }

    municipalitiesByProvince = new Map();
    for (const municipality of municipalities) {
        const existing = municipalitiesByProvince.get(municipality.provinceCode) || [];
        municipalitiesByProvince.set(municipality.provinceCode, [...existing, municipality]);
    }

    barangaysByMunicipality = new Map();
    for (const barangay of barangays) {
        const existing = barangaysByMunicipality.get(barangay.municipalCityCode) || [];
        barangaysByMunicipality.set(barangay.municipalCityCode, [...existing, barangay]);
    }

    isInitialized = true;
}

// ─── Public API ───────────────────────────────────────────────────────────────

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
