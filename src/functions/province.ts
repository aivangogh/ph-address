import { getProvinces, getIndexedProvincesByRegion } from '../utils/data-loader';
import { PHProvince } from '../types/province';
import { sortByName } from '../utils/sort';

/**
 * Retrieves all provinces sorted alphabetically.
 *
 * @returns {ReadonlyArray<PHProvince>} An array of PHProvince objects sorted alphabetically by name.
 */
function getAllProvinces(): readonly PHProvince[] {
  return sortByName(getProvinces());
}

/**
 * Retrieves all provinces based in region
 * @param {string} code - The code of the region to filter province by.
 * @returns {ReadonlyArray<PHProvince>} An array of PHProvince objects sorted alphabetically by name.
 */
function getProvincesByRegion(code: string): readonly PHProvince[] {
  const provinces = getIndexedProvincesByRegion().get(code) || [];
  return sortByName(provinces);
}

export { getAllProvinces, getProvincesByRegion };
