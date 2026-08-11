import {
    getAddressByBarangayCode,
    getAllBarangays,
    getBarangayByCode,
    getBarangaysByMunicipality,
} from "./functions/barangay";
import {
    getAllMunicipalities,
    getMunicipalityByCode,
    getMunicipalitiesByProvince,
} from "./functions/municipality";
import {
    getAllProvinces,
    getProvinceByCode,
    getProvincesByRegion,
} from "./functions/province";
import { getAllRegions, getRegionByCode } from "./functions/region";
import {
    getAllPostalCodes,
    getLocationsByPostalCode,
    getPostalCodesByMunicipality,
} from "./functions/postal-code";

export type { PHBarangay } from "./types/barangay";
export type { PHAddress } from "./types/address";
export type { PHMunicipality } from "./types/municipality";
export type { PHProvince } from "./types/province";
export type { PHRegion } from "./types/region";
export type { PHPostalCode } from "./types/postal-code";

export {
    getAddressByBarangayCode,
    getAllBarangays,
    getAllMunicipalities,
    getAllProvinces,
    getAllRegions,
    getBarangayByCode,
    getBarangaysByMunicipality,
    getMunicipalityByCode,
    getMunicipalitiesByProvince,
    getAllPostalCodes,
    getLocationsByPostalCode,
    getPostalCodesByMunicipality,
    getProvinceByCode,
    getProvincesByRegion,
    getRegionByCode,
};
