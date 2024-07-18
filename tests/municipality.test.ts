import { getMunicipalitiesByProvince } from "../src";

describe("Get Cities/Municipalities test suite", () => {
  it("should return sorted municipalities when a valid province name is provided", () => {
    const mockMunicipalities = getMunicipalitiesByProvince("Metro Manila");
    jest.mock("../src/data/municipalities.json", () => mockMunicipalities);
    const result = getMunicipalitiesByProvince("Metro Manila");

    expect(result).toEqual(mockMunicipalities);
  });
});
