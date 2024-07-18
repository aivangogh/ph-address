import { getBarangaysByMunicipality } from "../src";

describe("Get barangays test suite", () => {
  // Returns sorted barangays for a given municipality name
  it("should return sorted barangays when a valid municipality name is provided", () => {
    const mockBarangays = getBarangaysByMunicipality("Bacarra");
    jest.mock("../src/data/barangays.json", () => mockBarangays);
    const result = getBarangaysByMunicipality("Bacarra");

    expect(result).toEqual(mockBarangays);
  });
});
