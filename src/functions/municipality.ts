import {
  getIndexedMunicipalitiesByCode,
  getIndexedMunicipalitiesByProvince,
  getMunicipalities,
} from '../utils/data-loader';
import { PHMunicipality } from '../types/municipality';

/**
 * Retrieves municipalities filtered by the specified province name and sorts them alphabetically.
 *
 * @param {string} code - The code of the province to filter municipalities by.
 * @returns {ReadonlyArray<PHMunicipality>} An array of municipalities belonging to the specified province, sorted alphabetically.
 */
function getMunicipalitiesByProvince(code: string): readonly PHMunicipality[] {
  return getIndexedMunicipalitiesByProvince().get(code) || [];
}

function getAllMunicipalities(): readonly PHMunicipality[] {
  return getMunicipalities();
}

function getMunicipalityByCode(code: string): PHMunicipality | undefined {
  return getIndexedMunicipalitiesByCode().get(code);
}

export {
  getAllMunicipalities,
  getMunicipalityByCode,
  getMunicipalitiesByProvince,
};
