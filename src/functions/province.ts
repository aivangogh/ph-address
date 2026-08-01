import {
  getIndexedProvincesByCode,
  getIndexedProvincesByRegion,
  getProvinces,
} from '../utils/data-loader';
import { PHProvince } from '../types/province';

/**
 * Retrieves all provinces sorted alphabetically.
 *
 * @returns {ReadonlyArray<PHProvince>} An array of PHProvince objects sorted alphabetically by name.
 */
function getAllProvinces(): readonly PHProvince[] {
  return getProvinces();
}

/**
 * Retrieves all provinces based in region
 * @param {string} code - The code of the region to filter province by.
 * @returns {ReadonlyArray<PHProvince>} An array of PHProvince objects sorted alphabetically by name.
 */
function getProvincesByRegion(code: string): readonly PHProvince[] {
  return getIndexedProvincesByRegion().get(code) || [];
}

function getProvinceByCode(code: string): PHProvince | undefined {
  return getIndexedProvincesByCode().get(code);
}

export { getAllProvinces, getProvinceByCode, getProvincesByRegion };
