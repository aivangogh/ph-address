import {
  getBarangays,
  getIndexedBarangaysByCode,
  getIndexedBarangaysByMunicipality,
} from '../utils/data-loader';
import { PHBarangay } from '../types/barangay';
import { PHAddress } from '../types/address';
import { getMunicipalityByCode } from './municipality';
import { getProvinceByCode } from './province';
import { getRegionByCode } from './region';

/**
 * Retrieves a list of barangays filtered by the given city/municipality code and sorts them alphabetically by name.
 *
 * @param {string} code - The code of the municipality to filter barangays by.
 * @returns {ReadonlyArray<PHBarangay>} - An array of barangays that belong to the specified municipality, sorted alphabetically by name.
 */
function getBarangaysByMunicipality(code: string): readonly PHBarangay[] {
  return getIndexedBarangaysByMunicipality().get(code) || [];
}

function getAllBarangays(): readonly PHBarangay[] {
  return getBarangays();
}

function getBarangayByCode(code: string): PHBarangay | undefined {
  return getIndexedBarangaysByCode().get(code);
}

function getAddressByBarangayCode(code: string): PHAddress | undefined {
  const barangay = getBarangayByCode(code);
  if (!barangay) return undefined;

  const municipality = getMunicipalityByCode(barangay.municipalCityCode);
  if (!municipality) return undefined;

  const province = getProvinceByCode(municipality.provinceCode);
  const region = getRegionByCode(
    province?.regionCode ?? municipality.psgcCode.slice(0, 2) + '00000000',
  );
  if (!region) return undefined;

  return { region, ...(province && { province }), municipality, barangay };
}

export {
  getAddressByBarangayCode,
  getAllBarangays,
  getBarangayByCode,
  getBarangaysByMunicipality,
};
