import { getIndexedMunicipalitiesByProvince } from '../utils/data-loader';
import { PHMunicipality } from '../types/municipality';
import { sortByName } from '../utils/sort';

/**
 * Retrieves municipalities filtered by the specified province name and sorts them alphabetically.
 *
 * @param {string} code - The code of the province to filter municipalities by.
 * @returns {ReadonlyArray<PHMunicipality>} An array of municipalities belonging to the specified province, sorted alphabetically.
 */
function getMunicipalitiesByProvince(code: string): readonly PHMunicipality[] {
  const municipalities = getIndexedMunicipalitiesByProvince().get(code) || [];
  return sortByName(municipalities);
}

export { getMunicipalitiesByProvince };
