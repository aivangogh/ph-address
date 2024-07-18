import municipalities from "../data/municipalities.json";
import { TMunicipality } from "../types/municipality";
import { sortByName } from "../utils/sort";

/**
 * Retrieves municipalities filtered by the specified province name and sorts them alphabetically.
 *
 * @param {string} name - The name of the province to filter municipalities by.
 * @returns {Array} An array of municipalities belonging to the specified province, sorted alphabetically.
 */
function getMunicipalitiesByProvince(name: string): TMunicipality[] {
  const filteredMunicipalities = municipalities.filter(
    (value) => value.province === name
  );
  return sortByName<TMunicipality>(filteredMunicipalities);
}

export { getMunicipalitiesByProvince };
