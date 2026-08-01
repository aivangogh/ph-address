import { PHBarangay } from './barangay';
import { PHMunicipality } from './municipality';
import { PHProvince } from './province';
import { PHRegion } from './region';

export type PHAddress = {
  region: PHRegion;
  province?: PHProvince;
  municipality: PHMunicipality;
  barangay: PHBarangay;
};
