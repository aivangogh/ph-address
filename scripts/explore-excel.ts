// scripts/explore-excel.ts

/**
 * Developer Tool: Excel Data Explorer
 *
 * This script is intended for manual exploration and analysis of PSGC Excel files.
 * It is NOT part of the main application logic or the data migration process.
 *
 * Purpose:
 * - To quickly inspect the structure and content of a PSGC Excel file.
 * - To view column names, total rows, and sample data for different geographic levels.
 * - To assist developers in understanding the data format before running the migration script.
 *
 * Usage:
 * bun run scripts/explore-excel.ts [path_to_excel_file]
 *
 * Example:
 * bun run scripts/explore-excel.ts assets/PSGC-3Q-2025-Publication-Datafile.xlsx
 */

import * as XLSX from 'xlsx';
import * as path from 'path';

const PSGC_SHEET_NAME = 'PSGC';
const PSGC_CODE_COLUMN_CANDIDATES = ['10-digit PSGC', 'PSGC Code', 'Code'];

interface PSGCDataRow {
  [key: string]: any;
}

function getPSGCLevel(code: string): string {
  if (code.endsWith('00000000')) return 'Region';
  if (code.endsWith('00000')) return 'Province';
  if (code.endsWith('000')) return 'Municipality';
  return 'Barangay';
}

function findPSGCCodeColumn(columns: string[]): string | undefined {
  return PSGC_CODE_COLUMN_CANDIDATES.find(candidate => columns.includes(candidate));
}

function analyzeData(data: PSGCDataRow[], psgcCodeColumn: string): void {
  console.log('Total rows:', data.length);
  console.log('\nFirst 3 rows:');
  console.log(JSON.stringify(data.slice(0, 3), null, 2));

  console.log('\nColumn names:');
  console.log(Object.keys(data[0] || {}));

  console.log('\nPSGC Code Analysis:');
  const samples: Record<string, PSGCDataRow[]> = {
    Region: [],
    Province: [],
    Municipality: [],
    Barangay: [],
  };

  data.forEach(row => {
    const code = row[psgcCodeColumn];
    if (!code) return;

    const codeStr = String(code).padStart(10, '0');
    const level = getPSGCLevel(codeStr);

    if (samples[level] && samples[level].length < 3) {
      samples[level].push(row);
    }
  });

  for (const level in samples) {
    console.log(`\nSample ${level}s:`);
    console.log(JSON.stringify(samples[level], null, 2));
  }
}

function readExcelFile(filePath: string): PSGCDataRow[] {
  try {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[PSGC_SHEET_NAME];

    if (!worksheet) {
      console.error(`Sheet "${PSGC_SHEET_NAME}" not found in ${filePath}!`);
      console.log('Available sheets:', workbook.SheetNames);
      process.exit(1);
    }

    return XLSX.utils.sheet_to_json(worksheet);
  } catch (error) {
    console.error(`Error reading or processing Excel file at: ${filePath}`);
    console.error(error);
    process.exit(1);
  }
}

function main() {
  const excelFilePathArg = process.argv[2];

  if (!excelFilePathArg) {
    console.log('Usage: bun run scripts/explore-excel.ts [path_to_excel_file]');
    console.log(
      'Example: bun run scripts/explore-excel.ts assets/PSGC-3Q-2025-Publication-Datafile.xlsx'
    );
    process.exit(1);
  }

  const excelFilePath = path.resolve(excelFilePathArg);
  const data = readExcelFile(excelFilePath);

  if (data.length === 0) {
    console.log('No data found in the sheet.');
    return;
  }

  const psgcCodeColumn = findPSGCCodeColumn(Object.keys(data[0]));

  if (!psgcCodeColumn) {
    console.error(
      `Could not find a valid PSGC code column. Expected one of: ${PSGC_CODE_COLUMN_CANDIDATES.join(
        ', '
      )}`
    );
    process.exit(1);
  }
  
  console.log(`Using PSGC code column: "${psgcCodeColumn}"`);
  analyzeData(data, psgcCodeColumn);
}

main();
