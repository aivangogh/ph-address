import {
  getBarangaysByMunicipality,
} from "../src";
import { sortByName } from "../src/utils/sort";

describe("Get barangays test suite", () => {
  // Returns sorted barangays for a given municipality name
  it("should return sorted barangays when a valid municipality code is provided", () => {
    // Cebu City code (3Q 2025 PSGC)
    const result = getBarangaysByMunicipality("0730600000");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('psgcCode');
    expect(result[0]).toHaveProperty('municipalCityCode');
  });
});
