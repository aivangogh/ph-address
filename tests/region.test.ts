import { getAllRegions } from "../src/region";
import regions from "../src/data/regions.json";

describe("Get Region/s test suite", () => {
  it("should return all regions from the JSON file", () => {
    const result = getAllRegions();
    expect(result).toEqual(regions);
  });
});
