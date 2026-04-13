// Browser-compatible data loader — uses atob() instead of Buffer for base64 decoding.
// Re-exports all functions from the shared data-loader (pako + atob work in modern browsers).
export {
    getRegions,
    getProvinces,
    getMunicipalities,
    getBarangays,
    getIndexedProvincesByRegion,
    getIndexedMunicipalitiesByProvince,
    getIndexedBarangaysByMunicipality,
} from './data-loader';
