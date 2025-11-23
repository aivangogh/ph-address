import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Type definitions matching your existing structure
type TRegion = {
  name: string;
  psgcCode: string;
  designation: string;
};

type TProvince = {
  name: string;
  psgcCode: string;
  regionCode: string;
};

type TMunicipality = {
  name: string;
  psgcCode: string;
  provinceCode: string;
};

type TBarangay = {
  name: string;
  psgcCode: string;
  municipalCityCode: string;
};

// Helper function to pad PSGC code to 10 digits
function formatPsgcCode(code: any): string {
  return String(code).padStart(10, '0').replace(/\D/g, '').padStart(10, '0');
}

// Helper function to extract region designation from name
function extractDesignation(name: string): string {
  const match = name.match(/\(([^)]+)\)$/);
  if (match) {
    return match[1];
  }

  // Fallback patterns
  if (name.includes('National Capital Region')) return 'NCR';
  if (name.includes('Cordillera')) return 'CAR';
  if (name.includes('Region I ')) return 'Region I';
  if (name.includes('Region II')) return 'Region II';
  if (name.includes('Region III')) return 'Region III';
  if (name.includes('Region IV-A')) return 'Region IV-A';
  if (name.includes('Region V')) return 'Region V';
  if (name.includes('Region VI')) return 'Region VI';
  if (name.includes('Region VII')) return 'Region VII';
  if (name.includes('Region VIII')) return 'Region VIII';
  if (name.includes('Region IX')) return 'Region IX';
  if (name.includes('Region X')) return 'Region X';
  if (name.includes('Region XI')) return 'Region XI';
  if (name.includes('Region XII')) return 'Region XII';
  if (name.includes('Region XIII')) return 'Region XIII';
  if (name.includes('MIMAROPA')) return 'MIMAROPA';
  if (name.includes('BARMM')) return 'BARMM';

  return name;
}

// Helper function to clean location names
function cleanName(name: string): string {
  // Remove region designation in parentheses for regions
  return name.replace(/\s*\([^)]+\)\s*$/, '').trim();
}

// Helper function to reformat city/municipality names for better readability
function reformatCityName(name: string): string {
  // Transform "City of [Name]" to "[Name] City"
  const cityOfPattern = /^City of (.+)$/i;
  if (cityOfPattern.test(name)) {
    return name.replace(cityOfPattern, '$1 City');
  }

  // Transform "Municipality of [Name]" to "[Name]"
  const munOfPattern = /^Municipality of (.+)$/i;
  if (munOfPattern.test(name)) {
    return name.replace(munOfPattern, '$1');
  }

  return name;
}

const excelFilePath = path.join(__dirname, '../assets/PSGC-3Q-2025-Publication-Datafile.xlsx');
const outputDir = path.join(__dirname, '../src/data');

// Read the Excel file
console.log('Reading Excel file...');
const workbook = XLSX.readFile(excelFilePath);
const worksheet = workbook.Sheets['PSGC'];

if (!worksheet) {
  console.error('PSGC sheet not found!');
  process.exit(1);
}

// Convert to JSON
const data: any[] = XLSX.utils.sheet_to_json(worksheet);
console.log(`Total rows: ${data.length}`);

// Initialize collections
const regions: TRegion[] = [];
const provinces: TProvince[] = [];
const municipalities: TMunicipality[] = [];
const barangays: TBarangay[] = [];

// Process each row
data.forEach((row, index) => {
  try {
    const psgcCode = formatPsgcCode(row['10-digit PSGC']);
    const name = String(row['Name'] || '').trim();
    const geoLevel = String(row['Geographic Level'] || '').trim();

    if (!psgcCode || !name) {
      console.warn(`Skipping row ${index + 1}: missing code or name`);
      return;
    }

    // Process based on geographic level
    if (geoLevel === 'Reg') {
      // Region
      regions.push({
        name: cleanName(name),
        psgcCode: psgcCode,
        designation: extractDesignation(name)
      });
    } else if (geoLevel === 'Prov' || geoLevel === 'Dist') {
      // Province or District
      const regionCode = psgcCode.substring(0, 2) + '0000000';
      provinces.push({
        name: cleanName(name),
        psgcCode: psgcCode,
        regionCode: regionCode
      });
    } else if (geoLevel === 'City' || geoLevel === 'Mun' || geoLevel === 'SubMun') {
      // Municipality, City, or Sub-municipality
      // For NCR, province code is the region code
      // For others, province code is first 6 digits + '0000'
      let provinceCode: string;

      if (psgcCode.startsWith('13')) {
        // NCR - use region code as province code
        provinceCode = '1300000000';
      } else {
        // Extract province code from municipality code
        provinceCode = psgcCode.substring(0, 6) + '0000';
      }

      municipalities.push({
        name: reformatCityName(cleanName(name)),
        psgcCode: psgcCode,
        provinceCode: provinceCode
      });
    } else if (geoLevel === 'Bgy') {
      // Barangay
      const municipalCityCode = psgcCode.substring(0, 7) + '000';
      barangays.push({
        name: cleanName(name),
        psgcCode: psgcCode,
        municipalCityCode: municipalCityCode
      });
    }
  } catch (error) {
    console.error(`Error processing row ${index + 1}:`, error);
  }
});

// Log statistics
console.log('\nProcessing complete:');
console.log(`- Regions: ${regions.length}`);
console.log(`- Provinces: ${provinces.length}`);
console.log(`- Municipalities: ${municipalities.length}`);
console.log(`- Barangays: ${barangays.length}`);

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write JSON files (minified, no formatting)
console.log('\nWriting JSON files...');

fs.writeFileSync(
  path.join(outputDir, 'regions.json'),
  JSON.stringify(regions)
);
console.log('✓ regions.json');

fs.writeFileSync(
  path.join(outputDir, 'provinces.json'),
  JSON.stringify(provinces)
);
console.log('✓ provinces.json');

fs.writeFileSync(
  path.join(outputDir, 'municipalities.json'),
  JSON.stringify(municipalities)
);
console.log('✓ municipalities.json');

fs.writeFileSync(
  path.join(outputDir, 'barangays.json'),
  JSON.stringify(barangays)
);
console.log('✓ barangays.json');

console.log('\n✅ Migration complete!');
console.log(`\nOutput directory: ${outputDir}`);

// Show some samples
console.log('\n--- Sample Data ---');
console.log('\nSample Region:', JSON.stringify(regions[0], null, 2));
console.log('\nSample Province:', JSON.stringify(provinces[0], null, 2));
console.log('\nSample Municipality:', JSON.stringify(municipalities[0], null, 2));
console.log('\nSample Barangay:', JSON.stringify(barangays[0], null, 2));
