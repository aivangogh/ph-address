<p align="center">
  <a href="LICENSE.md" >
    <img src="https://img.shields.io/npm/l/@aivangogh/ph-address"/>
  </a>
  <a href="#">
    <img src="https://img.shields.io/npm/v/@aivangogh/ph-address/2025.3.1"/>
  </a>
  <a href="https://www.npmjs.com/package/@aivangogh/ph-address">
    <img src="https://img.shields.io/npm/dt/@aivangogh/ph-address"/>
  </a>
</p>

# PH-Address

A collection of philippine geographic data based on PSGC

## Installing

### Package manager

Using npm:

```bash
$ npm install @aivangogh/ph-address
```

Using yarn:

```bash
$ yarn add @aivangogh/ph-address
```

Using pnpm:

```bash
$ pnpm add @aivangogh/ph-address
```

Using bun:

```bash
$ bun add @aivangogh/ph-address
```

Once the package is installed, you can import the library using `import` or `require` approach:

```ts
import {
  getAllRegions,
  getAllProvinces,
  getMunicipalitiesByProvince,
  getBarangaysByMunicipality,
  getBarangaysByMunicipalityAndProvince,
} from "@aivangogh/ph-address";
```

| Function                        | Param         | Description                                                  |
| ------------------------------- | ------------- | ------------------------------------------------------------ |
| `getAllRegions()`               |               | Returns all regions available.                               |
| `getAllProvinces()`             |               | Returns all provinces available. |
| `getProvincesByRegion()`        | code {string} | The code of the region to filter province by.                |
| `getMunicipalitiesByProvince()` | code {string} | The code of the province to filter municipalities by.        |
| `getBarangaysByMunicipality()`  | code {string} | The code of the municipality to filter barangays by.         |

## Example

```ts
import {
  getMunicipalitiesByProvince,
  getBarangaysByMunicipality,
} from "@aivangogh/ph-address";

// All municipaliy/city in Bohol
console.log(getMunicipalitiesByProvince("071200000"));

// All barangays in the city of Cebu City
console.log(getBarangaysByMunicipality("072217000"));
```

## Types

You can use this types as well.

```ts
import {
  type PHBarangay,
  type PHMunicipality,
  type PHProvince,
  type PHRegion
} from "@aivangogh/ph-address"

```

```ts
type PHBarangay = {
  name: string;
  psgcCode: string;
  municipalCityCode: string;
};

type PHMunicipality = {
  name: string;
  psgcCode: string;
  provinceCode: string;
};

type PHProvince = {
  name: string;
  psgcCode: string;
  regionCode: string;
};

type PHRegion = {
  name: string;
  psgcCode: string;
  designation: string;
};
```

## Reference

- [PSA-PSGC Publications](https://psa.gov.ph/classification/psgc/)

## License

[MIT](LICENSE)
