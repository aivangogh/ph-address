import fs from "fs";
import path from "path";
import { PHMunicipality } from "../src/types/municipality";
import { PHPostalCode } from "../src/types/postal-code";
import { PHProvince } from "../src/types/province";

const root = process.cwd();
const sourcePath = path.join(root, "assets/ph-postal-code/PH.txt");
const municipalities: PHMunicipality[] = JSON.parse(
  fs.readFileSync(path.join(root, "src/data/municipalities.json"), "utf8"),
);
const provinces: PHProvince[] = JSON.parse(
  fs.readFileSync(path.join(root, "src/data/provinces.json"), "utf8"),
);

function normalize(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/\b(city|municipality|province) of\b/g, "")
    .replace(/\bcity\b/g, "")
    .replace(/\bsta\b/g, "santa")
    .replace(/\bsto\b/g, "santo")
    .replace(/[^a-z0-9]/g, "");
}

function csvEscape(value: string): string {
  return value.includes(",") || value.includes('"') || value.includes("\n")
    ? `"${value.replace(/"/g, '""')}"`
    : value;
}

const municipalitiesByName = new Map<string, PHMunicipality[]>();
for (const municipality of municipalities) {
  const key = normalize(municipality.name);
  const matches = municipalitiesByName.get(key);
  if (matches) matches.push(municipality);
  else municipalitiesByName.set(key, [municipality]);
}

const provinceCodesByName = new Map(
  provinces.map((province) => [normalize(province.name), province.psgcCode]),
);

// Reviewed GeoNames/PHLPost aliases. New SGA municipalities inherit the postal
// areas of the municipalities from which their barangays were transferred.
const reviewedPostalCodes: Record<string, string[]> = {
  "1903637000": ["9320"],
  "1903601000": ["9316"],
  "0301403000": ["3006"],
  "1705305000": ["5306"],
  "1380602000": ["1006"],
  "0403406000": ["4012"],
  "0304905000": ["3123"],
  "1606808000": ["8313"],
  "1908703000": ["9600"],
  "1908803000": ["9621"],
  "1908804000": ["9622"],
  "1908704000": ["9623"],
  "1908805000": ["9624"],
  "1908705000": ["9601"],
  "1908808000": ["9625"],
  "1908809000": ["9626"],
  "1903624000": ["9713"],
  "1004217000": ["7216"],
  "1705323000": ["5323"],
  "1804508000": ["6118"],
  "1908811000": ["9618"],
  "0402107000": ["4124"],
  "1606710000": ["8419"],
  "0304909000": ["3125"],
  "1230800000": ["9500"],
  "0304910000": ["3104"],
  "0402108000": ["4107"],
  "0701226000": ["6334"],
  "1102506000": ["8210"],
  "1908812000": ["9628"],
  "1380609000": ["1002"],
  "0990101000": ["7300"],
  "1102317000": ["8118", "8119", "8120"],
  "1908706000": ["9606"],
  "1999903000": ["9410"],
  "0906603000": ["7416"],
  "1999901000": ["9408"],
  "1206508000": ["9802"],
  "0907226000": ["7125"],
  "1999907000": ["9409"],
  "1380610000": ["1004"],
  "1999906000": ["9409"],
  "1908813000": ["9629"],
  "1908814000": ["9620"],
  "1380600000": ["1000"],
  "1999904000": ["9410", "9415"],
  "0203120000": ["3302"],
  "1908708000": ["9630"],
  "1999902000": ["9407"],
  "0906607000": ["7402"],
  "1004210000": ["7200"],
  "1380611000": ["1007"],
  "1908815000": ["9631"],
  "1908816000": ["9610"],
  "1999905000": ["9412"],
  "1705107000": ["5107"],
  "1380612000": ["1011"],
  "0906608000": ["7414"],
  "0806022000": ["6703"],
  "0504116000": ["5406"],
  "0405636000": ["4339"],
  "1380613000": ["1018"],
  "0907211000": ["7102"],
  "1206510000": ["9804"],
  "1204713000": ["9405"],
  "1381300000": ["1100"],
  "1380603000": ["1001"],
  "1908819000": ["9634"],
  "1804532000": ["6133"],
  "1380606000": ["1008", "1015"],
  "0600613000": ["5700"],
  "1381400000": ["1500", "1502", "1503", "1504"],
  "1380607000": ["1005"],
  "1380604000": ["1010"],
  "0802621000": ["6821"],
  "0600614000": ["5714"],
  "0702243000": ["6011"],
  "1380614000": ["1009"],
  "1380605000": ["1003"],
  "1102324000": ["8121"],
  "0304917000": ["3119"],
  "0907214000": ["7108"],
  "1908820000": ["9608"],
  "1908821000": ["9635"],
  "0907220000": ["7121"],
  "0907340000": ["7022"],
  "1903640000": ["9324"],
  "1908711000": ["9636"],
  "1908823000": ["9611"],
  "1908824000": ["9612"],
  "1908712000": ["9637"],
  "0304931000": ["3118"],
  "1380601000": ["1012", "1013"],
  "0906615000": ["7406"],
  "0402122000": ["4109"],
  "1999908000": ["9409", "9415"],
  "1907008000": ["7507"],
  "0907341000": ["7036"],
};

const records: PHPostalCode[] = fs
  .readFileSync(sourcePath, "utf8")
  .trim()
  .split("\n")
  .map((line) => {
    const fields = line.replace(/\r$/, "").split("\t");
    if (
      fields.length !== 12 ||
      fields[0] !== "PH" ||
      !/^\d{4}$/.test(fields[1])
    ) {
      throw new Error(`Invalid GeoNames postal-code row: ${line}`);
    }

    const [postalCode, placeName, regionName, provinceName, municipalityName] =
      [fields[1], fields[2], fields[3], fields[5], fields[7] || fields[2]];
    let matches = municipalitiesByName.get(normalize(municipalityName)) || [];
    const provinceCode = provinceCodesByName.get(normalize(provinceName));
    const sameProvince = matches.filter(
      (municipality) => municipality.provinceCode === provinceCode,
    );
    if (fields[7]) {
      if (sameProvince.length) matches = sameProvince;
    } else if (provinceName) {
      matches = sameProvince.length
        ? sameProvince
        : matches.filter(
            (municipality) =>
              municipality.provinceCode === municipality.psgcCode,
          );
    }

    return {
      postalCode,
      placeName,
      provinceName,
      regionName,
      ...(matches.length === 1
        ? { municipalityCode: matches[0].psgcCode }
        : {}),
    } satisfies PHPostalCode;
  });

const recordsByPostalCode = new Map<string, PHPostalCode>();
for (const record of records)
  recordsByPostalCode.set(record.postalCode, record);
for (const [municipalityCode, postalCodes] of Object.entries(
  reviewedPostalCodes,
)) {
  const municipality = municipalities.find(
    ({ psgcCode }) => psgcCode === municipalityCode,
  );
  if (!municipality)
    throw new Error(`Unknown reviewed municipality: ${municipalityCode}`);

  for (const postalCode of postalCodes) {
    const source = recordsByPostalCode.get(postalCode);
    if (!source) throw new Error(`Unknown reviewed postal code: ${postalCode}`);
    records.push({ ...source, placeName: municipality.name, municipalityCode });
  }
}

records.sort(
  (a, b) =>
    a.postalCode.localeCompare(b.postalCode) ||
    a.placeName.localeCompare(b.placeName),
);

const headers: (keyof PHPostalCode)[] = [
  "postalCode",
  "placeName",
  "provinceName",
  "regionName",
  "municipalityCode",
];
const csv = [
  headers.join(","),
  ...records.map((record) =>
    headers.map((header) => csvEscape(record[header] || "")).join(","),
  ),
].join("\n");

fs.writeFileSync(
  path.join(root, "src/data/postal-codes.json"),
  JSON.stringify(records, null, 2),
);
fs.writeFileSync(path.join(root, "src/data-csv/postalCodes.csv"), csv);

console.log(
  `Generated ${records.length} postal-code records (${records.filter((record) => record.municipalityCode).length} mapped to PSGC municipalities).`,
);
