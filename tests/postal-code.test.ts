import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  getAllPostalCodes,
  getLocationsByPostalCode,
  getPostalCodesByMunicipality,
} from "../src";
import municipalities from "../src/data/municipalities.json";

describe("postal codes", () => {
  it("documents reviewed municipality changes", () => {
    const [header, ...lines] = fs
      .readFileSync(
        path.join(
          process.cwd(),
          "assets/ph-postal-code/municipality-mappings.csv",
        ),
        "utf8",
      )
      .trim()
      .split("\n");
    const columns = header.split(",");
    const mappings = lines.map((line) =>
      Object.fromEntries(
        line.split(",").map((value, index) => [columns[index], value]),
      ),
    );

    expect(mappings).toContainEqual(
      expect.objectContaining({
        municipalityName: "Amai Manabilang",
        municipalityCode: "1903637000",
        sourceMunicipality: "Bumbaran",
        changeType: "renamed",
      }),
    );
    expect(mappings).toContainEqual(
      expect.objectContaining({
        municipalityName: "Nabalawag",
        postalCodes: "9410|9415",
        sourceMunicipality: "Midsayap and Aleosan",
        changeType: "inherited-area",
      }),
    );
  });

  it("loads the complete GeoNames snapshot once", () => {
    const postalCodes = getAllPostalCodes();

    expect(postalCodes).toHaveLength(2424);
    expect(getAllPostalCodes()).toBe(postalCodes);
    expect(
      postalCodes.every(({ postalCode }) => /^\d{4}$/.test(postalCode)),
    ).toBe(true);
  });

  it("looks up locations by postal code", () => {
    expect(getLocationsByPostalCode("6000")).toContainEqual(
      expect.objectContaining({ postalCode: "6000", placeName: "Cebu City" }),
    );
    expect(getLocationsByPostalCode("not-a-postal-code")).toEqual([]);
  });

  it("looks up mapped postal codes by PSGC municipality code", () => {
    expect(getPostalCodesByMunicipality("0730600000")).toContainEqual(
      expect.objectContaining({
        postalCode: "6000",
        municipalityCode: "0730600000",
      }),
    );
    expect(getPostalCodesByMunicipality("1380500000")).toHaveLength(7);
    expect(getPostalCodesByMunicipality("9999999999")).toEqual([]);
  });

  it("retains locations without a guessed PSGC mapping", () => {
    expect(getLocationsByPostalCode("0401")).toContainEqual({
      postalCode: "0401",
      placeName: "Asian Development Bank",
      provinceName: "",
      regionName: "",
      municipalityCode: undefined,
    });
    expect(
      getLocationsByPostalCode("8017")[0].municipalityCode,
    ).toBeUndefined();
    expect(
      getLocationsByPostalCode("8119").find(
        ({ placeName }) => placeName === "Samal",
      )?.municipalityCode,
    ).toBeUndefined();
  });

  it("covers every PSGC municipality, including inherited SGA postal areas", () => {
    const missing = municipalities.filter(
      ({ psgcCode }) => getPostalCodesByMunicipality(psgcCode).length === 0,
    );

    expect(missing).toEqual([]);
    expect(
      getPostalCodesByMunicipality("1999904000").map(
        ({ postalCode }) => postalCode,
      ),
    ).toEqual(["9410", "9415"]); // Nabalawag: Midsayap + Aleosan
    expect(
      getPostalCodesByMunicipality("1999908000").map(
        ({ postalCode }) => postalCode,
      ),
    ).toEqual(["9409", "9415"]); // Tugunan: Pikit + Aleosan
  });
});
