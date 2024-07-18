<p align="center">
  <a href="LICENSE.md" >
    <img src="https://img.shields.io/npm/l/@aivangogh/ph-address"/>
  </a>
  <a href="#">
    <img src="https://img.shields.io/npm/v/@aivangogh/ph-address"/>
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

```js
import {
  getAllRegions,
  getAllProvinces,
  getMunicipalitiesByProvince,
  getBarangaysByMunicipality,
} from "@aivangogh/ph-address";
```

## Example

```js
import {
  getMunicipalitiesByProvince,
  getBarangaysByMunicipality,
} from "@aivangogh/ph-address";

// All city in Metro Manila
console.log(getMunicipalitiesByProvince("Metro Manila"));

// All barangays in the city of Manila
console.log(getBarangaysByMunicipality("Manila"));
```

## Reference

- [PSA-PSGC Publications](https://psa.gov.ph/classification/psgc/)

## License

[MIT](LICENSE)
