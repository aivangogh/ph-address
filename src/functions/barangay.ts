import barangays from "../data/barangays.json";
import { TBarangay } from "../types/barangay";
import { sortByName } from "../utils/sort";

/**
 * Retrieves a list of barangays filtered by the given city/municipality code and sorts them alphabetically by name.
 *
 * @param {string} code - The code of the municipality to filter barangays by.
 * @returns {Array} - An array of barangays that belong to the specified municipality, sorted alphabetically by name.
 */
function getBarangaysByMunicipality(code: string): TBarangay[] {
  const filteredBarangays = barangays.filter(
    (value) => value.municipalCityCode === code
  );

  return sortByName<TBarangay>(filteredBarangays);
}

export { getBarangaysByMunicipality };
