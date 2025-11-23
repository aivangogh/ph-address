import * as XLSX from 'xlsx';
import * as path from 'path';

const excelFilePath = path.join(__dirname, '../assets/PSGC-3Q-2025-Publication-Datafile.xlsx');

// Read the Excel file
const workbook = XLSX.readFile(excelFilePath);

// Get the PSGC sheet
const sheetName = 'PSGC';
const worksheet = workbook.Sheets[sheetName];

if (!worksheet) {
  console.error(`Sheet "${sheetName}" not found!`);
  console.log('Available sheets:', workbook.SheetNames);
  process.exit(1);
}

// Convert to JSON
const data: any[] = XLSX.utils.sheet_to_json(worksheet);

console.log('Total rows:', data.length);
console.log('\nFirst 3 rows:');
console.log(JSON.stringify(data.slice(0, 3), null, 2));

console.log('\nColumn names:');
if (data.length > 0) {
  console.log(Object.keys(data[0]));
}

// Analyze PSGC code patterns
console.log('\nPSGC Code Analysis:');
const samples: Record<string, any[]> = {
  regions: [],
  provinces: [],
  municipalities: [],
  barangays: []
};

data.forEach(row => {
  const code = row['10-digit PSGC'] || row['PSGC Code'] || row['Code'];
  if (!code) return;

  const codeStr = String(code).padStart(10, '0');

  // Analyze based on PSGC code pattern
  if (codeStr.endsWith('0000000')) {
    // Region: XX0000000
    if (samples.regions.length < 3) samples.regions.push(row);
  } else if (codeStr.endsWith('00000')) {
    // Province: XXXX00000
    if (samples.provinces.length < 3) samples.provinces.push(row);
  } else if (codeStr.endsWith('000')) {
    // Municipality: XXXXXXX000
    if (samples.municipalities.length < 3) samples.municipalities.push(row);
  } else {
    // Barangay: XXXXXXXXXX
    if (samples.barangays.length < 3) samples.barangays.push(row);
  }
});

console.log('\nSample Regions:');
console.log(JSON.stringify(samples.regions, null, 2));

console.log('\nSample Provinces:');
console.log(JSON.stringify(samples.provinces, null, 2));

console.log('\nSample Municipalities:');
console.log(JSON.stringify(samples.municipalities, null, 2));

console.log('\nSample Barangays:');
console.log(JSON.stringify(samples.barangays, null, 2));
