import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import { reformatCityName } from '../src/utils/reformat';
import { PHRegion } from '../src/types/region';
import { PHProvince } from '../src/types/province';
import { PHMunicipality } from '../src/types/municipality';
import { PHBarangay } from '../src/types/barangay';
import { sortByName } from '../src/utils/sort';

const PSGC_SHEET_NAME = 'PSGC';
const ASSETS_DIR = path.join(__dirname, '../assets');
const DATA_DIR = path.join(__dirname, '../src/data');
const CSV_DATA_DIR = path.join(__dirname, '../src/data-csv');

interface RawPSGCDataRow {
	['10-digit PSGC']?: string | number;
	Name?: string;
	['Geographic Level']?: string;
	Code?: string | number; // Alternative for 10-digit PSGC
}

function parseArguments(): { filePath: string } {
	const args = process.argv.slice(2);
	let filePath: string | undefined;

	for (const arg of args) {
		if (arg.startsWith('--file=')) {
			filePath = arg.split('=')[1];
			break;
		}
	}

	if (!filePath) {
		console.error('Error: --file argument is required.');
		console.error('Usage: bun run scripts/migrate-psgc.ts --file=<filename.xlsx>');
		process.exit(1);
	}

	return { filePath };
}

function readExcelFile(excelPath: string): RawPSGCDataRow[] {
	const workbook = XLSX.readFile(excelPath);
	const worksheet = workbook.Sheets[PSGC_SHEET_NAME];

	if (!worksheet) {
		console.error(`Sheet "${PSGC_SHEET_NAME}" not found in ${excelPath}!`);
		process.exit(1);
	}

	return XLSX.utils.sheet_to_json<RawPSGCDataRow>(worksheet);
}

function getPsgcCode(row: RawPSGCDataRow): string {
	const code = row['10-digit PSGC'] || row.Code;
	if (code === undefined) {
		throw new Error(`Missing PSGC code in row: ${JSON.stringify(row)}`);
	}
	return String(code).padStart(10, '0');
}

function extractData(rawData: RawPSGCDataRow[]) {
	const regions: PHRegion[] = [];
	const provinces: PHProvince[] = [];
	const municipalities: PHMunicipality[] = [];
	const barangays: PHBarangay[] = [];

	rawData.forEach(row => {
		const psgcCode = getPsgcCode(row);
		const name = row.Name?.trim() || '';
		const geoLevel = row['Geographic Level']?.trim();

		if (!name || !geoLevel) {
			return; // Skip rows with missing name or geo level
		}

		switch (geoLevel) {
			case 'Reg': {
				const designationMatch = name.match(/\(([^)]+)\)$/);
				const designation = designationMatch ? designationMatch[1] : '';
				const cleanedName = name.replace(/\s*\([^)]+\)$/, '').trim();
				regions.push({ name: cleanedName, psgcCode, designation });
				break;
			}
			case 'Prov':
			case 'Dist': { // Treat districts as provinces
				const regionCode = psgcCode.substring(0, 2) + '00000000';
				provinces.push({ name, psgcCode, regionCode });
				break;
			}
			case 'City':
			case 'Mun':
			case 'SubMun': { // Treat sub-municipalities as municipalities
				let provinceCode = psgcCode.substring(0, 5) + '00000';
				if (psgcCode.startsWith('13') && (geoLevel === 'City' || geoLevel === 'Mun')) {
					// Special handling for NCR cities/municipalities using region code as province code
					provinceCode = psgcCode.substring(0, 2) + '00000000'; // NCR region code
				} else if (psgcCode.substring(5, 7) === '00') {
					// For Highly Urbanized Cities (HUC), their province code might be their own PSGC code
					// We need to check if there is a parent province
					const parentProvince = provinces.find(p => psgcCode.startsWith(p.psgcCode.substring(0, 5)) && psgcCode !== p.psgcCode);
					if (!parentProvince) {
						// If no direct parent province, use own code (HUCs, independent cities)
						provinceCode = psgcCode;
					}
				}

				municipalities.push({ name: reformatCityName(name), psgcCode, provinceCode });
				break;
			}
			case 'Bgy': {
				const municipalCityCode = psgcCode.substring(0, 7) + '000';
				barangays.push({ name, psgcCode, municipalCityCode });
				break;
			}
		}
	});

	return { regions, provinces, municipalities, barangays };
}

function csvEscape(value: string): string {
	return value.includes(',') || value.includes('"') || value.includes('\n')
		? `"${value.replace(/"/g, '""')}"`
		: value;
}

function toCSV(headers: string[], rows: Record<string, string>[]): string {
	const lines = [
		headers.join(','),
		...rows.map(row => headers.map(h => csvEscape(row[h] ?? '')).join(',')),
	];
	return lines.join('\n');
}

function writeCsvFiles(data: {
	regions: PHRegion[];
	provinces: PHProvince[];
	municipalities: PHMunicipality[];
	barangays: PHBarangay[];
}) {
	if (!fs.existsSync(CSV_DATA_DIR)) {
		fs.mkdirSync(CSV_DATA_DIR, { recursive: true });
	}

	const sortedRegions = sortByName(data.regions);
	const sortedProvinces = sortByName(data.provinces);
	const sortedMunicipalities = sortByName(data.municipalities);
	const sortedBarangays = sortByName(data.barangays);

	// regionCode  = psgcCode[0:2] + '00000000' → derivable, omitted from CSV
	// municipalCityCode = psgcCode[0:7] + '000' → derivable, omitted from CSV
	// provinceCode for municipalities is NOT always derivable (NCR/HUC special cases) → kept
	fs.writeFileSync(
		path.join(CSV_DATA_DIR, 'regions.csv'),
		toCSV(['name', 'psgcCode', 'designation'], sortedRegions as unknown as Record<string, string>[]),
	);
	fs.writeFileSync(
		path.join(CSV_DATA_DIR, 'provinces.csv'),
		toCSV(['name', 'psgcCode'], sortedProvinces as unknown as Record<string, string>[]),
	);
	fs.writeFileSync(
		path.join(CSV_DATA_DIR, 'municipalities.csv'),
		toCSV(['name', 'psgcCode', 'provinceCode'], sortedMunicipalities as unknown as Record<string, string>[]),
	);
	fs.writeFileSync(
		path.join(CSV_DATA_DIR, 'barangays.csv'),
		toCSV(['name', 'psgcCode'], sortedBarangays as unknown as Record<string, string>[]),
	);

	console.log('Generated CSV files in src/data-csv/');
}

function writeJsonFiles(data: {
	regions: PHRegion[];
	provinces: PHProvince[];
	municipalities: PHMunicipality[];
	barangays: PHBarangay[];
}) {
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR, { recursive: true });
	}

	const sortedRegions = sortByName(data.regions);
	const sortedProvinces = sortByName(data.provinces);
	const sortedMunicipalities = sortByName(data.municipalities);
	const sortedBarangays = sortByName(data.barangays);

	fs.writeFileSync(path.join(DATA_DIR, 'regions.json'), JSON.stringify(sortedRegions, null, 2));
	fs.writeFileSync(path.join(DATA_DIR, 'provinces.json'), JSON.stringify(sortedProvinces, null, 2));
	fs.writeFileSync(path.join(DATA_DIR, 'municipalities.json'), JSON.stringify(sortedMunicipalities, null, 2));
	fs.writeFileSync(path.join(DATA_DIR, 'barangays.json'), JSON.stringify(sortedBarangays, null, 2));

	console.log('Generated JSON files in src/data/');
}

function main() {
	const { filePath: inputFileName } = parseArguments();
	let excelFilePath: string;

	if (path.isAbsolute(inputFileName)) {
		excelFilePath = inputFileName;
	} else if (inputFileName.startsWith('assets/')) {
		excelFilePath = path.join(process.cwd(), inputFileName);
	} else {
		excelFilePath = path.join(ASSETS_DIR, inputFileName);
	}

	if (!fs.existsSync(excelFilePath)) {
		console.error(`Error: Excel file not found at ${excelFilePath}`);
		process.exit(1);
	}

	console.log(`Reading Excel file: ${excelFilePath}`);
	const rawData = readExcelFile(excelFilePath);
	console.log(`Found ${rawData.length} rows in the Excel file.`);

	const { regions, provinces, municipalities, barangays } = extractData(rawData);

	console.log('Writing JSON files...');
	writeJsonFiles({ regions, provinces, municipalities, barangays });
	console.log('Writing CSV files...');
	writeCsvFiles({ regions, provinces, municipalities, barangays });
	console.log('Data migration complete.');
}

main();
