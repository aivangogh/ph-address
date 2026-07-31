import { getBarangaysByMunicipality } from "./functions/barangay";
import { getMunicipalitiesByProvince } from "./functions/municipality";
import { getAllProvinces, getProvincesByRegion } from "./functions/province";
import { getAllRegions } from "./functions/region";

export type { PHBarangay } from "./types/barangay";
export type { PHMunicipality } from "./types/municipality";
export type { PHProvince } from "./types/province";
export type { PHRegion } from "./types/region";

export {
    getAllProvinces,
    getAllRegions,
    getBarangaysByMunicipality,
    getMunicipalitiesByProvince,
    getProvincesByRegion
};
