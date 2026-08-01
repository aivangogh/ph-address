import {
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

export type { PHBarangay } from "./types/barangay";
export type { PHMunicipality } from "./types/municipality";
export type { PHProvince } from "./types/province";
export type { PHRegion } from "./types/region";

export {
    getAllBarangays,
    getAllMunicipalities,
    getAllProvinces,
    getAllRegions,
    getBarangayByCode,
    getBarangaysByMunicipality,
    getMunicipalityByCode,
    getMunicipalitiesByProvince,
    getProvinceByCode,
    getProvincesByRegion,
    getRegionByCode,
};
