import fs from "fs";
import path from "path";
import { PHMunicipality } from "../src/types/municipality";
import { PHPostalCode } from "../src/types/postal-code";
import { PHProvince } from "../src/types/province";

const root = process.cwd();
const geoNamesPath = path.join(root, "assets/ph-postal-code/PH.txt");
const mappingsPath = path.join(
  root,
  "assets/ph-postal-code/municipality-mappings.csv",
);
const municipalities: PHMunicipality[] = JSON.parse(
  fs.readFileSync(path.join(root, "src/data/municipalities.json"), "utf8"),
);
const provinces: PHProvince[] = JSON.parse(
  fs.readFileSync(path.join(root, "src/data/provinces.json"), "utf8"),
);

const mappingHeaders = [
  "municipalityName",
  "municipalityCode",
  "postalCodes",
  "sourceMunicipality",
  "changeType",
  "notes",
] as const;
const changeTypes = new Set([
  "renamed",
  "spelling",
  "historical-province",
  "district",
  "inherited-area",
]);

interface ReviewedMunicipalityMapping {
  municipalityName: string;
  municipalityCode: string;
  postalCodes: string[];
  sourceMunicipality: string;
  changeType: string;
  notes: string;
}

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

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(value);
      value = "";
    } else {
      value += character;
    }
  }
  values.push(value);
  if (quoted) throw new Error(`Unclosed quote in mapping row: ${line}`);
  return values;
}

function buildNameIndex<T extends { name: string }>(
  records: T[],
): Map<string, T[]> {
  const index = new Map<string, T[]>();
  for (const record of records) {
    const key = normalize(record.name);
    const matches = index.get(key);
    if (matches) matches.push(record);
    else index.set(key, [record]);
  }
  return index;
}

const municipalitiesByName = buildNameIndex(municipalities);
const municipalitiesByCode = new Map(
  municipalities.map((municipality) => [municipality.psgcCode, municipality]),
);
const provinceCodesByName = new Map(
  provinces.map((province) => [normalize(province.name), province.psgcCode]),
);

function matchMunicipality(
  municipalityName: string,
  provinceName: string,
  hasGeoNamesMunicipality: boolean,
): PHMunicipality | undefined {
  let matches = municipalitiesByName.get(normalize(municipalityName)) || [];
  const provinceCode = provinceCodesByName.get(normalize(provinceName));
  const sameProvince = matches.filter(
    (municipality) => municipality.provinceCode === provinceCode,
  );

  if (hasGeoNamesMunicipality) {
    if (sameProvince.length) matches = sameProvince;
  } else if (provinceName) {
    matches = sameProvince.length
      ? sameProvince
      : matches.filter(
          (municipality) => municipality.provinceCode === municipality.psgcCode,
        );
  }
  return matches.length === 1 ? matches[0] : undefined;
}

function loadGeoNamesRecords(): PHPostalCode[] {
  return fs
    .readFileSync(geoNamesPath, "utf8")
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

      const [postalCode, placeName, regionName, provinceName] = [
        fields[1],
        fields[2],
        fields[3],
        fields[5],
      ];
      const municipality = matchMunicipality(
        fields[7] || placeName,
        provinceName,
        Boolean(fields[7]),
      );
      return {
        postalCode,
        placeName,
        provinceName,
        regionName,
        ...(municipality ? { municipalityCode: municipality.psgcCode } : {}),
      } satisfies PHPostalCode;
    });
}

function loadReviewedMappings(
  availablePostalCodes: ReadonlySet<string>,
): ReviewedMunicipalityMapping[] {
  const [headerLine, ...lines] = fs
    .readFileSync(mappingsPath, "utf8")
    .trim()
    .split("\n");
  const headers = parseCsvLine(headerLine);
  if (headers.join(",") !== mappingHeaders.join(",")) {
    throw new Error(`Invalid mapping headers: ${headers.join(",")}`);
  }

  const seenMunicipalities = new Set<string>();
  return lines.map((line) => {
    const values = parseCsvLine(line.replace(/\r$/, ""));
    if (
      values.length !== mappingHeaders.length ||
      values.some((value) => !value)
    ) {
      throw new Error(`Invalid reviewed mapping row: ${line}`);
    }
    const row = Object.fromEntries(
      mappingHeaders.map((header, index) => [header, values[index]]),
    ) as Record<(typeof mappingHeaders)[number], string>;
    const municipality = municipalitiesByCode.get(row.municipalityCode);
    if (!municipality || municipality.name !== row.municipalityName) {
      throw new Error(
        `Unknown reviewed municipality: ${row.municipalityName} (${row.municipalityCode})`,
      );
    }
    if (seenMunicipalities.has(row.municipalityCode)) {
      throw new Error(
        `Duplicate reviewed municipality: ${row.municipalityCode}`,
      );
    }
    seenMunicipalities.add(row.municipalityCode);
    if (!changeTypes.has(row.changeType)) {
      throw new Error(`Unknown mapping change type: ${row.changeType}`);
    }

    const postalCodes = row.postalCodes.split("|");
    const invalidPostalCode = postalCodes.find(
      (postalCode) =>
        !/^\d{4}$/.test(postalCode) || !availablePostalCodes.has(postalCode),
    );
    if (invalidPostalCode) {
      throw new Error(`Unknown reviewed postal code: ${invalidPostalCode}`);
    }
    return { ...row, postalCodes };
  });
}

function applyReviewedMappings(records: PHPostalCode[]): void {
  const recordsByPostalCode = new Map<string, PHPostalCode>();
  for (const record of records)
    recordsByPostalCode.set(record.postalCode, record);
  const mappings = loadReviewedMappings(new Set(recordsByPostalCode.keys()));

  for (const mapping of mappings) {
    for (const postalCode of mapping.postalCodes) {
      const source = recordsByPostalCode.get(postalCode)!;
      records.push({
        ...source,
        placeName: mapping.municipalityName,
        municipalityCode: mapping.municipalityCode,
      });
    }
  }
}

function writePostalCodeData(records: PHPostalCode[]): void {
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
}

const records = loadGeoNamesRecords();
applyReviewedMappings(records);
writePostalCodeData(records);

console.log(
  `Generated ${records.length} postal-code records (${records.filter((record) => record.municipalityCode).length} mapped to PSGC municipalities).`,
);
