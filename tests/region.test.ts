import { getAllRegions, getRegionByCode } from "../src";

describe("Get Region/s test suite", () => {
  it("should return regions in administrative display order", () => {
    expect(getAllRegions().map(({ psgcCode }) => psgcCode)).toEqual([
      "0100000000", "0200000000", "0300000000", "0400000000",
      "1700000000", "0500000000", "0600000000", "0700000000",
      "0800000000", "0900000000", "1000000000", "1100000000",
      "1200000000", "1600000000", "1300000000", "1400000000",
      "1900000000", "1800000000",
    ]);
  });

  it("should find a region by code", () => {
    expect(getRegionByCode("0700000000")?.name).toBe("Region VII");
    expect(getRegionByCode("9999999999")).toBeUndefined();
  });
});
