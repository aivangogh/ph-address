# Scripts

This directory contains scripts for data processing and development utilities.

## Data Pipeline

Scripts for processing the PSGC data.

### `migrate-psgc.ts`

Converts the official PSGC Excel file into formatted JSON and optimized CSV data.

- **Usage**: `pnpm migrate:psgc --file=<filename.xlsx>`
- **Example**: `pnpm migrate:psgc --file=assets/PSGC-2Q-2026-Publication-Datafile.xlsx`
- **Input**: Reads an official PSGC Excel workbook.
- **Output**: Generates JSON files in `src/data/` and optimized CSV files in `src/data-csv/`.

This script handles data cleaning, name reformatting (e.g., "City of Cebu" to "Cebu City"), and deriving hierarchical codes. The name reformatting logic is located in `src/utils/reformat.ts`.

### `convert-to-csv.ts`

Compresses the optimized CSV files into the TypeScript bundle used at runtime.

- **Usage**: `pnpm build:csv-ts`
- **Output**: Generates `src/data-csv-ts/index.ts`.


## Developer Tools

Utilities for development and data analysis.

### `explore-excel.ts`

A CLI tool to quickly inspect the contents of a PSGC Excel file. This is useful for verifying the data structure before migration.

- **Usage**: `pnpm exec tsx scripts/explore-excel.ts <path_to_excel_file>`
- **Example**: `pnpm exec tsx scripts/explore-excel.ts assets/PSGC-2Q-2026-Publication-Datafile.xlsx`
