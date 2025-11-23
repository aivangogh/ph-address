# Scripts

This directory contains scripts for data processing and development utilities.

## Data Pipeline

Scripts for processing the PSGC data.

### `migrate-psgc.ts`

Converts the official PSGC Excel file into formatted JSON data.

- **Usage**: `bun run scripts/migrate-psgc.ts --file=<filename.xlsx>`
  - The `build` script (`bun run build`) in `package.json` uses a default file path.
- **Example**: `bun run scripts/migrate-psgc.ts --file=assets/PSGC-3Q-2025-Publication-Datafile.xlsx`
- **Input**: Reads an Excel file (e.g., `assets/PSGC-3Q-2025-Publication-Datafile.xlsx`).
- **Output**: Generates formatted JSON files in `src/data/`.

This script handles data cleaning, name reformatting (e.g., "City of Cebu" to "Cebu City"), and deriving hierarchical codes. The name reformatting logic is located in `src/utils/reformat.ts`.

### `minify-json.ts`

Minifies JSON files in a specified directory to reduce their file size. This is typically run after the migration script.

- **Usage**: `bun run minify:json <directory_path>`
- **Example**: `bun run minify:json src/data`

The `bun run minify:json` command is already pre-configured in `package.json` to target the `src/data` directory.

## Developer Tools

Utilities for development and data analysis.

### `explore-excel.ts`

A CLI tool to quickly inspect the contents of a PSGC Excel file. This is useful for verifying the data structure before migration.

- **Usage**: `bun run scripts/explore-excel.ts <path_to_excel_file>`
- **Example**: `bun run scripts/explore-excel.ts assets/PSGC-3Q-2025-Publication-Datafile.xlsx`

