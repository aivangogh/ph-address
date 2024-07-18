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

export { getAllProvinces };
