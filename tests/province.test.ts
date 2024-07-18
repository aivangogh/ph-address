import { getAllProvinces } from "../src";
import provinces from "../src/data/provinces.json";
import { sortByName } from "../src/utils/sort";

describe("Get province/s test suite", () => {
  // Returns all provinces sorted by name
  it("should return all provinces sorted by name when provinces are available", () => {
    const mockProvinces = sortByName(provinces);
    jest.mock("../src/data/provinces.json", () => mockProvinces);

    const result = getAllProvinces();
    expect(result).toEqual(mockProvinces);
  });
});
