import {
  getBarangaysByMunicipality,
  getBarangaysByMunicipalityAndProvince,
} from "../src";
import { sortByName } from "../src/utils/sort";

describe("Get barangays test suite", () => {
  // Returns sorted barangays for a given municipality name
  it("should return sorted barangays when a valid municipality name is provided", () => {
    const mockBarangays = getBarangaysByMunicipality("Bacarra");
    jest.mock("../src/data/barangays.json", () => mockBarangays);
    const result = getBarangaysByMunicipality("Bacarra");

    expect(result).toEqual(mockBarangays);
  });

  it("should return sorted barangays for a given municipality and province", () => {
    const mockBarangays = [
      {
        code: "072214001",
        name: "Bolinawan",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214002",
        name: "Buenavista",
        cityOrMunicipality: "Carcar City",
      },
    ];
    const mockMunicipalities = [{ name: "Carcar City", province: "Cebu" }];

    jest.mock("../src/data/barangays.json", () => sortByName(mockBarangays));
    jest.mock("../src/data/municipalities.json", () =>
      sortByName(mockMunicipalities)
    );

    const result = getBarangaysByMunicipalityAndProvince(
      "San Fernando",
      "Bukidnon"
    );

    expect(result).toEqual([
      {
        code: "072214001",
        name: "Bolinawan",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214002",
        name: "Buenavista",
        cityOrMunicipality: "Carcar City",
      },
    ]);
  });
});
