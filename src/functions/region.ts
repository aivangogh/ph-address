import { getIndexedRegionsByCode, getRegions } from '../utils/data-loader';
import { PHRegion } from '../types/region';

const getAllRegions = getRegions;

function getRegionByCode(code: string): PHRegion | undefined {
  return getIndexedRegionsByCode().get(code);
}

export { getAllRegions, getRegionByCode };
