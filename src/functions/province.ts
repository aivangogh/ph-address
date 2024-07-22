import provinces from "../data/provinces.json";
import { TProvince } from "../types/province";
import { sortByName } from "../utils/sort";

/**
 * Retrieves all provinces sorted alphabetically.
 *
 * @returns {Array} An array of TProvince objects sorted alphabetically by name.
 */
function getAllProvinces(): TProvince[] {
  return sortByName<TProvince>(provinces);
}

/**
 * Retrieves all provinces based in region
 * @param {string} code - The code of the region to filter province by.
 * @returns {Array} An array of TProvince objects sorted alphabetically by name.
 */
function getProvincesByRegion(code: string): TProvince[] {
  const fileteredProvinces = provinces.filter((value) => value.regionCode === code);

  return sortByName<TProvince>(fileteredProvinces);
}

export { getAllProvinces, getProvincesByRegion };
