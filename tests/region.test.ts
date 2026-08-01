import { getAllRegions, getRegionByCode } from "../src";
import regions from "../src/data/regions.json";

describe("Get Region/s test suite", () => {
  it("should return all regions from the JSON file", () => {
    const result = getAllRegions();
    expect(result).toEqual(regions);
  });

  it("should find a region by code", () => {
    expect(getRegionByCode("0700000000")?.name).toBe("Region VII");
    expect(getRegionByCode("9999999999")).toBeUndefined();
  });
});
