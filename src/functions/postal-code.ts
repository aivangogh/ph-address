import {
  getIndexedPostalCodesByMunicipality,
  getIndexedPostalCodesByValue,
  getPostalCodes,
} from "../utils/data-loader";
import { PHPostalCode } from "../types/postal-code";

function getAllPostalCodes(): readonly PHPostalCode[] {
  return getPostalCodes();
}

function getLocationsByPostalCode(postalCode: string): readonly PHPostalCode[] {
  return getIndexedPostalCodesByValue().get(postalCode) || [];
}

function getPostalCodesByMunicipality(
  municipalityCode: string,
): readonly PHPostalCode[] {
  return getIndexedPostalCodesByMunicipality().get(municipalityCode) || [];
}

export {
  getAllPostalCodes,
  getLocationsByPostalCode,
  getPostalCodesByMunicipality,
};
