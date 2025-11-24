# Scripts

This directory contains scripts for data processing and development utilities.

## Data Pipeline

Scripts for processing the PSGC data.

### `migrate-psgc.ts`

Converts the official PSGC Excel file into formatted JSON data.

- **Usage**: `npm run migrate:psgc -- --file=<filename.xlsx>`
- **Example**: `npm run migrate:psgc -- --file=assets/PSGC-3Q-2025-Publication-Datafile.xlsx`
- **Input**: Reads an Excel file (e.g., `assets/PSGC-3Q-2025-Publication-Datafile.xlsx`).
- **Output**: Generates formatted JSON files in `src/data/`.

This script handles data cleaning, name reformatting (e.g., "City of Cebu" to "Cebu City"), and deriving hierarchical codes. The name reformatting logic is located in `src/utils/reformat.ts`.

### `convert-to-toon.ts`

Converts the JSON data files into the TOON format. This script has two modes:

1.  **Generate `.toon` files**: Creates individual `.toon` files for each JSON file.
    -   **Usage**: `npm run build:toon`
    -   **Output**: Generates `.toon` files in `src/data-toon/`.

2.  **Generate a TypeScript file**: Creates a single TypeScript file that exports the TOON data as strings.
    -   **Usage**: `npm run build:toon-ts`
    -   **Output**: Generates `index.ts` in `src/data-toon-ts/`.


## Developer Tools

Utilities for development and data analysis.

### `explore-excel.ts`

A CLI tool to quickly inspect the contents of a PSGC Excel file. This is useful for verifying the data structure before migration.

- **Usage**: `ts-node scripts/explore-excel.ts <path_to_excel_file>`
- **Example**: `ts-node scripts/explore-excel.ts assets/PSGC-3Q-2025-Publication-Datafile.xlsx`

