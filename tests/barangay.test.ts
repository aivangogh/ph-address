import {
  getBarangaysByMunicipality,
  getBarangaysByMunicipalityAndProvince,
} from "../src";

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
      {
        code: "072214003",
        name: "Calidngan",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214004",
        name: "Can-asujan",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214005",
        name: "Guadalupe",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214006",
        name: "Liburon",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214007",
        name: "Napo",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214008",
        name: "Ocana",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214009",
        name: "Perrelos",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214010",
        name: "Valencia",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214011",
        name: "Valladolid",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214012",
        name: "Poblacion I",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214013",
        name: "Poblacion II",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214014",
        name: "Poblacion III",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214015",
        name: "Tuyom",
        cityOrMunicipality: "Carcar City",
      },
    ];
    const mockMunicipalities = [{ name: "Carcar City", province: "Cebu" }];

    jest.mock("../src/data/barangays.json", () => mockBarangays);
    jest.mock("../src/data/municipalities.json", () => mockMunicipalities);

    const result = getBarangaysByMunicipalityAndProvince("Carcar City", "Cebu");

    expect(result).toContainEqual([
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
      {
        code: "072214003",
        name: "Calidngan",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214004",
        name: "Can-asujan",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214005",
        name: "Guadalupe",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214006",
        name: "Liburon",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214007",
        name: "Napo",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214008",
        name: "Ocana",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214009",
        name: "Perrelos",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214010",
        name: "Valencia",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214011",
        name: "Valladolid",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214012",
        name: "Poblacion I",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214013",
        name: "Poblacion II",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214014",
        name: "Poblacion III",
        cityOrMunicipality: "Carcar City",
      },
      {
        code: "072214015",
        name: "Tuyom",
        cityOrMunicipality: "Carcar City",
      },
    ]);
  });
});
