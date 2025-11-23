# Migration Scripts

This directory contains scripts for updating the PSGC data from official sources.

## migrate-psgc.ts

Converts PSGC Excel data file to JSON format for the package.

### Usage

```bash
bun run migrate:psgc
```

Or directly:

```bash
bun run scripts/migrate-psgc.ts
```

### Input

The script reads from:
- `assets/PSGC-3Q-2025-Publication-Datafile.xlsx`

Expected Excel structure:
- **Sheet name:** `PSGC`
- **Required columns:**
  - `10-digit PSGC` - The PSGC code
  - `Name` - Location name
  - `Geographic Level` - Type of location (Reg, Prov, City, Mun, Bgy, etc.)

### Output

Generates minified JSON files in `src/data/`:
- `regions.json` - Philippine regions
- `provinces.json` - Philippine provinces
- `municipalities.json` - Municipalities and cities
- `barangays.json` - Barangays

### Data Mapping

#### Geographic Levels

| Excel Value | Output File | Description |
|-------------|-------------|-------------|
| `Reg` | regions.json | Regions |
| `Prov` | provinces.json | Provinces |
| `Dist` | provinces.json | Districts (treated as provinces) |
| `City` | municipalities.json | Cities |
| `Mun` | municipalities.json | Municipalities |
| `SubMun` | municipalities.json | Sub-municipalities |
| `Bgy` | barangays.json | Barangays |

#### PSGC Code Hierarchy

The PSGC uses a 10-digit hierarchical code:

```
[XX][XXXX][XXX][XXX]
 │    │     │    │
 │    │     │    └─ Barangay code (001-999)
 │    │     └────── Municipality/City code (001-999)
 │    └──────────── Province code (0100-9999)
 └───────────────── Region code (01-18)
```

**Examples:**
- `1300000000` - National Capital Region (NCR)
- `0730000000` - Cebu Province
- `0730600000` - Cebu City
- `0730600001` - Adlaon (Barangay in Cebu City)

#### Special Cases

**NCR (National Capital Region):**
- NCR doesn't have traditional provinces
- Cities/municipalities use region code as province code
- Province code: `1300000000`

**Highly Urbanized Cities (HUC):**
- May have province code equal to their own PSGC code
- Example: Cebu City (`0730600000`)

### Data Structure

#### Region
```typescript
{
  name: string;        // "National Capital Region"
  psgcCode: string;    // "1300000000"
  designation: string; // "NCR"
}
```

#### Province
```typescript
{
  name: string;       // "Cebu"
  psgcCode: string;   // "0730000000"
  regionCode: string; // "0700000000"
}
```

#### Municipality
```typescript
{
  name: string;         // "Cebu City"
  psgcCode: string;     // "0730600000"
  provinceCode: string; // "0730000000"
}
```

#### Barangay
```typescript
{
  name: string;              // "Adlaon"
  psgcCode: string;          // "0730600001"
  municipalCityCode: string; // "0730600000"
}
```

### Getting Updated PSGC Data

1. Visit [PSA PSGC Publications](https://psa.gov.ph/classification/psgc/)
2. Download the latest quarterly publication Excel file
3. Place it in the `assets/` directory
4. Update the file path in `migrate-psgc.ts` if needed
5. Run the migration script

### Data Transformations

The script performs these transformations for better readability:

#### City/Municipality Names
- **"City of [Name]"** → **"[Name] City"**
  - Example: "City of Cebu" → "Cebu City"
  - Example: "City of Manila" → "Manila City"

- **"Municipality of [Name]"** → **"[Name]"**
  - Example: "Municipality of Adams" → "Adams"

#### Region Names
- Extracts region designation from name (e.g., "NCR", "Region I")
- Removes designation suffix from region names
- Example: "National Capital Region (NCR)" → "National Capital Region"

#### General Cleaning
- Removes extra whitespace
- Trims leading/trailing spaces
- Calculates parent codes based on PSGC hierarchy
- Minifies JSON output (no formatting)

### After Migration

1. Run tests: `bun test`
2. Check file sizes: `ls -lh src/data/`
3. Verify data counts match PSA publication
4. Update CHANGELOG.md with changes
5. Update README.md if API changes
6. Create changeset: `bunx changeset`
