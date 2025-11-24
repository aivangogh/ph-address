<p align="center">
  <a href="LICENSE" >
    <img src="https://img.shields.io/npm/l/@aivangogh/ph-address"/>
  </a>
  <a href="https://www.npmjs.com/package/@aivangogh/ph-address">
    <img src="https://img.shields.io/npm/v/@aivangogh/ph-address"/>
  </a>
  <a href="https://www.npmjs.com/package/@aivangogh/ph-address">
    <img src="https://img.shields.io/npm/dt/@aivangogh/ph-address"/>
  </a>
</p>

# PH-Address

A lightweight package that provides a comprehensive collection of Philippine geographic data, based on the official [Philippine Standard Geographic Code (PSGC)](https://psa.gov.ph/classification/psgc/).

## Features

- **Up-to-Date Data**: Sourced from the latest PSGC publications.
- **Lightweight**: Optimized for a small bundle size, with data compressed using the `toon-format`.
- **Fully Typed**: Written in TypeScript for a better developer experience.
- **Easy to Use**: A simple and intuitive API for retrieving regions, provinces, municipalities, and barangays.

## Node.js and Browser Support

This package is a "hybrid" package that supports both CommonJS (`require()`) and ESM (`import`) syntax. It is compatible with both Node.js and browser environments out of the box. The data is bundled directly with the code, so it works seamlessly without needing file system access.

## Versioning

This package uses a calendar-based versioning scheme: `YYYY.Q.P`

- `YYYY`: The year of the PSGC data publication.
- `Q`: The quarter of the publication (1, 2, 3, or 4).
- `P`: A patch number for any bug fixes or improvements to the package itself, which resets with each new quarterly release.

For example, version `2025.3.1` means the data is from the **3rd quarter of 2025**, with `1` patch release.

## Installation

```bash
# Using npm
npm install @aivangogh/ph-address

# Using yarn
yarn add @aivangogh/ph-address

# Using pnpm
pnpm add @aivangogh/ph-address
```

## API Reference

You can import all functions from the package:

```ts
import {
  getAllRegions,
  getAllProvinces,
  getProvincesByRegion,
  getMunicipalitiesByProvince,
  getBarangaysByMunicipality,
} from "@aivangogh/ph-address";
```

---

### `getAllRegions()`

Returns a sorted list of all regions.

**Example:**

```ts
import { getAllRegions } from "@aivangogh/ph-address";

const regions = getAllRegions();
console.log(regions);
/*
[
  { name: 'AUTONOMOUS REGION IN MUSLIM MINDANAO (ARMM)', psgcCode: '1900000000', designation: 'ARMM' },
  { name: 'BICOL REGION', psgcCode: '0500000000', designation: 'REGION V' },
  ...
]
*/
```

---

### `getAllProvinces()`

Returns a sorted list of all provinces.

**Example:**

```ts
import { getAllProvinces } from "@aivangogh/ph-address";

const provinces = getAllProvinces();
console.log(provinces);
/*
[
  { name: 'Abra', psgcCode: '1400100000', regionCode: '1400000000' },
  { name: 'Agusan Del Norte', psgcCode: '1600200000', regionCode: '1600000000' },
  ...
]
*/
```

---

### `getProvincesByRegion(regionCode)`

Returns a sorted list of provinces within a specific region.

- `regionCode` (string): The PSGC code of the region.

**Example:**

```ts
import { getProvincesByRegion } from "@aivangogh/ph-address";

// Get all provinces in Region VII (Central Visayas)
const provinces = getProvincesByRegion("0700000000"); 
console.log(provinces);
/*
[
  { name: 'Bohol', psgcCode: '0701200000', regionCode: '0700000000' },
  { name: 'Cebu', psgcCode: '0702200000', regionCode: '0700000000' }
]
*/
```

---

### `getMunicipalitiesByProvince(provinceCode)`

Returns a sorted list of municipalities/cities within a specific province.

- `provinceCode` (string): The PSGC code of the province.

**Example:**

```ts
import { getMunicipalitiesByProvince } from "@aivangogh/ph-address";

// Get all municipalities in Cebu
const municipalities = getMunicipalitiesByProvince("0702200000");
console.log(municipalities);
/*
[
  { name: 'Alcantara', psgcCode: '0702201000', provinceCode: '0702200000' },
  { name: 'Alcoy', psgcCode: '0702202000', provinceCode: '0702200000' },
  ...
]
*/
```

---

### `getBarangaysByMunicipality(municipalityCode)`

Returns a sorted list of barangays within a specific municipality or city.

- `municipalityCode` (string): The PSGC code of the municipality or city.

**Note**: In the context of this library and the PSGC data, the term "municipality" is used to refer to both municipalities and cities.

**Example:**

```ts
import { getBarangaysByMunicipality } from "@aivangogh/ph-address";

// Get all barangays in Cebu City
const barangays = getBarangaysByMunicipality("0730600000");
console.log(barangays);
/*
[
  { name: 'Adlaon', psgcCode: '0730600001', municipalCityCode: '0730600000' },
  { name: 'Agsungot', psgcCode: '0730600002', municipalCityCode: '0730600000' },
  ...
]
*/
```

## Types

You can import all the necessary types for use in your TypeScript projects.

```ts
import type {
  PHRegion,
  PHProvince,
  PHMunicipality,
  PHBarangay
} from "@aivangogh/ph-address";
```

## Data Source

The data is sourced directly from the quarterly publications of the **Philippine Statistics Authority (PSA)**.

## License

[MIT](LICENSE)
