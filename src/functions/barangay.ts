import { getIndexedBarangaysByMunicipality } from '../utils/data-loader';
import { PHBarangay } from '../types/barangay';
import { sortByName } from '../utils/sort';

/**
 * Retrieves a list of barangays filtered by the given city/municipality code and sorts them alphabetically by name.
 *
 * @param {string} code - The code of the municipality to filter barangays by.
 * @returns {ReadonlyArray<PHBarangay>} - An array of barangays that belong to the specified municipality, sorted alphabetically by name.
 */
function getBarangaysByMunicipality(code: string): readonly PHBarangay[] {
  const barangays = getIndexedBarangaysByMunicipality().get(code) || [];
  return sortByName(barangays);
}

export { getBarangaysByMunicipality };
