import provinces from "../data/provinces.json";
import { PHProvince } from "../types/province";
import { sortByName } from "../utils/sort";

/**
 * Retrieves all provinces sorted alphabetically.
 *
 * @returns {Array} An array of PHProvince objects sorted alphabetically by name.
 */
function getAllProvinces(): PHProvince[] {
  return sortByName<PHProvince>(provinces);
}

/**
 * Retrieves all provinces based in region
 * @param {string} code - The code of the region to filter province by.
 * @returns {Array} An array of PHProvince objects sorted alphabetically by name.
 */
function getProvincesByRegion(code: string): PHProvince[] {
  const fileteredProvinces = provinces.filter((value) => value.regionCode === code);

  return sortByName<PHProvince>(fileteredProvinces);
}

export { getAllProvinces, getProvincesByRegion };
