import barangays from "../data/barangays.json";
import municipalities from "../data/municipalities.json";
import { TBarangay } from "../types/barangay";
import { sortByName } from "../utils/sort";

/**
 * Retrieves a list of barangays filtered by the given city/municipality code and sorts them alphabetically by name.
 *
 * @param {string} name - The name of the municipality to filter barangays by.
 * @returns {Array} - An array of barangays that belong to the specified municipality, sorted alphabetically by name.
 */
function getBarangaysByMunicipality(name: string): TBarangay[] {
  const filteredBarangays = barangays.filter(
    (value) => value.cityOrMunicipality === name
  );
  return sortByName<TBarangay>(filteredBarangays);
}

/**
 * Retrieves a list of barangays filtered by the given municipality code and province name and sorts them alphabetically by name.
 *
 * @param {string} municipalityName - The name of the city/municipality and province to filter barangays by.
 * @param {string} provinceName
 * @returns {Array} - An array of barangays that belong to the specified municipality, sorted alphabetically by name.
 */
function getBarangaysByMunicipalityAndProvince(municipalityName: string, provinceName: string): TBarangay[] {
  const cityOrMunicipality = municipalities.find((municipality) => municipality.province === provinceName)

  const filteredBarangays = barangays.filter(
    (value) => (value.cityOrMunicipality === municipalityName) && (value.cityOrMunicipality === cityOrMunicipality?.name)
  );
  return sortByName<TBarangay>(filteredBarangays);
}

export { getBarangaysByMunicipality, getBarangaysByMunicipalityAndProvince };
