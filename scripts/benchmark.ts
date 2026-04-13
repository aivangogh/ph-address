/**
 * Benchmark: JSON vs TOON vs CSV (full) vs CSV (optimized)
 *
 * JSON          — source format (src/data/*.json)
 * TOON          — Token-Oriented Object Notation (devDep, former format)
 * CSV full      — naive conversion of JSON with all columns
 * CSV optimized — what the library actually ships (src/data-csv/*.csv),
 *                 derivable columns removed per PSGC 10-digit structure
 *
 * Both raw and compressed (gzip deflate + base64) sizes are measured,
 * since the library ships data as compressed TS string literals.
 *
 * Run: bun run benchmark
 */

import fs from 'fs';
import path from 'path';
import pako from 'pako';
import { encode, decode } from '@toon-format/toon';

// ─── Types ───────────────────────────────────────────────────────────────────

type Row = Record<string, string>;

interface FormatResult {
  rawKb: number;
  compressedKb: number;
  parseMs: number;
  decompressParseMs: number;
}

interface FileReport {
  name: string;
  rows: number;
  json: FormatResult;
  toon: FormatResult;
  csvFull: FormatResult;
  csvOpt: FormatResult;
}

// ─── CSV helpers ─────────────────────────────────────────────────────────────

function csvEscape(v: string): string {
  return v.includes(',') || v.includes('"') || v.includes('\n')
    ? `"${v.replace(/"/g, '""')}"`
    : v;
}

function toCSV(headers: string[], rows: Row[]): string {
  return [
    headers.join(','),
    ...rows.map(row => headers.map(h => csvEscape(row[h] ?? '')).join(',')),
  ].join('\n');
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function fromCSV(csv: string): Row[] {
  const lines = csv.split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',');
  const rows: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i]);
    const row: Row = {};
    for (let j = 0; j < headers.length; j++) row[headers[j]] = values[j] ?? '';
    rows.push(row);
  }
  return rows;
}

// ─── Compression ─────────────────────────────────────────────────────────────

function compress(text: string): string {
  return Buffer.from(pako.deflate(text)).toString('base64');
}

function decompress(b64: string): string {
  return pako.inflate(Uint8Array.from(atob(b64), c => c.charCodeAt(0)), { to: 'string' });
}

// ─── Measurement ─────────────────────────────────────────────────────────────

const ITERATIONS = 20;

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m];
}

function time(fn: () => unknown): number {
  const times: number[] = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const t = performance.now();
    fn();
    times.push(performance.now() - t);
  }
  return median(times);
}

function measure(text: string, parseFn: (t: string) => unknown): FormatResult {
  const b64 = compress(text);
  return {
    rawKb: Buffer.byteLength(text, 'utf-8') / 1024,
    compressedKb: Buffer.byteLength(b64, 'utf-8') / 1024,
    parseMs: time(() => parseFn(text)),
    decompressParseMs: time(() => parseFn(decompress(b64))),
  };
}

// ─── Core ────────────────────────────────────────────────────────────────────

// Map JSON field names → CSV column headers for the full (naive) CSV
const FULL_HEADERS: Record<string, string[]> = {
  'regions.json':       ['name', 'psgcCode', 'designation'],
  'provinces.json':     ['name', 'psgcCode', 'regionCode'],
  'municipalities.json':['name', 'psgcCode', 'provinceCode'],
  'barangays.json':     ['name', 'psgcCode', 'municipalCityCode'],
};

function benchmarkFile(jsonPath: string, csvPath: string): FileReport {
  const jsonFile = path.basename(jsonPath);
  const csvFile  = path.basename(csvPath);
  const name     = jsonFile.replace('.json', '');

  const jsonText = fs.readFileSync(jsonPath, 'utf-8');
  const jsonData: Row[] = JSON.parse(jsonText);

  // TOON: encoded from JSON source
  const toonText = encode(jsonData);

  // Full CSV: naive conversion with all columns from JSON
  const fullHeaders = FULL_HEADERS[jsonFile] ?? Object.keys(jsonData[0] ?? {});
  const csvFullText = toCSV(fullHeaders, jsonData);

  // Optimized CSV: what is actually shipped (derivable columns removed)
  const csvOptText = fs.readFileSync(csvPath, 'utf-8');

  return {
    name,
    rows: jsonData.length,
    json:    measure(jsonText,    t => JSON.parse(t)),
    toon:    measure(toonText,    t => decode(t)),
    csvFull: measure(csvFullText, t => fromCSV(t)),
    csvOpt:  measure(csvOptText,  t => fromCSV(t)),
  };
}

// ─── Display ─────────────────────────────────────────────────────────────────

const W = 72;
const sep  = '─'.repeat(W);
const sep2 = '═'.repeat(W);

function kb(v: number)  { return v.toFixed(1).padStart(8) + ' KB'; }
function ms(v: number)  { return v.toFixed(3).padStart(9) + ' ms'; }

function badge(base: number, val: number, lowerIsBetter = true): string {
  const diff = ((val - base) / base) * 100;
  if (Math.abs(diff) < 0.5) return '';
  const better = lowerIsBetter ? diff < 0 : diff > 0;
  const sign = diff > 0 ? '+' : '';
  return better
    ? `  \x1b[32m(${sign}${diff.toFixed(0)}%)\x1b[0m`
    : `  \x1b[33m(${sign}${diff.toFixed(0)}%)\x1b[0m`;
}

function printReport(r: FileReport) {
  console.log(`\n${sep}`);
  console.log(`  ${r.name}  (${r.rows.toLocaleString()} rows)`);
  console.log(sep);

  const rows: Array<{ label: string; key: keyof FormatResult; unit: string }> = [
    { label: 'Raw size',             key: 'rawKb',            unit: 'size' },
    { label: 'Compressed (shipped)', key: 'compressedKb',     unit: 'size' },
    { label: 'Raw parse',            key: 'parseMs',          unit: 'time' },
    { label: 'Decompress + parse',   key: 'decompressParseMs',unit: 'time' },
  ];

  const fmtFn = (key: keyof FormatResult) =>
    key === 'rawKb' || key === 'compressedKb' ? kb : ms;

  for (const { label, key } of rows) {
    const fmt = fmtFn(key);
    console.log(`\n  ${label}:`);
    console.log(`     JSON          ${fmt(r.json[key])}`);
    console.log(`     TOON          ${fmt(r.toon[key])}${badge(r.json[key], r.toon[key])}`);
    console.log(`     CSV full      ${fmt(r.csvFull[key])}${badge(r.json[key], r.csvFull[key])}`);
    console.log(`     CSV optimized ${fmt(r.csvOpt[key])}${badge(r.json[key], r.csvOpt[key])}`);
  }
}

function printSummary(reports: FileReport[]) {
  console.log(`\n\n${sep2}`);
  console.log('  SUMMARY — compressed bundle size (what consumers download)');
  console.log(sep2);
  console.log(`\n  ${'File'.padEnd(18)} ${'JSON'.padStart(9)} ${'TOON'.padStart(9)} ${'CSV full'.padStart(9)} ${'CSV opt'.padStart(9)}  ${'Saved vs JSON'.padStart(14)}`);
  console.log('  ' + '─'.repeat(76));

  let totalJson = 0, totalToon = 0, totalFull = 0, totalOpt = 0;
  for (const r of reports) {
    const saved = r.json.compressedKb - r.csvOpt.compressedKb;
    const pct   = ((saved / r.json.compressedKb) * 100).toFixed(0);
    console.log(
      `  ${r.name.padEnd(18)}` +
      `${kb(r.json.compressedKb)}` +
      `${kb(r.toon.compressedKb)}` +
      `${kb(r.csvFull.compressedKb)}` +
      `${kb(r.csvOpt.compressedKb)}` +
      `  \x1b[32m-${saved.toFixed(1)} KB (-${pct}%)\x1b[0m`
    );
    totalJson += r.json.compressedKb;
    totalToon += r.toon.compressedKb;
    totalFull += r.csvFull.compressedKb;
    totalOpt  += r.csvOpt.compressedKb;
  }

  const totalSaved = totalJson - totalOpt;
  const totalPct   = ((totalSaved / totalJson) * 100).toFixed(0);
  console.log('  ' + '─'.repeat(76));
  console.log(
    `  ${'TOTAL'.padEnd(18)}` +
    `${kb(totalJson)}` +
    `${kb(totalToon)}` +
    `${kb(totalFull)}` +
    `${kb(totalOpt)}` +
    `  \x1b[32m-${totalSaved.toFixed(1)} KB (-${totalPct}%)\x1b[0m`
  );

  console.log(`\n\n  Decompress + parse  (barangays, median ${ITERATIONS} runs):`);
  const bar = reports.find(r => r.name === 'barangays')!;
  if (bar) {
    console.log(`     JSON:          ${ms(bar.json.decompressParseMs)}`);
    console.log(`     TOON:          ${ms(bar.toon.decompressParseMs)}${badge(bar.json.decompressParseMs, bar.toon.decompressParseMs)}`);
    console.log(`     CSV full:      ${ms(bar.csvFull.decompressParseMs)}${badge(bar.json.decompressParseMs, bar.csvFull.decompressParseMs)}`);
    console.log(`     CSV optimized: ${ms(bar.csvOpt.decompressParseMs)}${badge(bar.json.decompressParseMs, bar.csvOpt.decompressParseMs)}`);
  }
  console.log();
}

// ─── Main ────────────────────────────────────────────────────────────────────

const jsonDir = path.join(process.cwd(), 'src', 'data');
const csvDir  = path.join(process.cwd(), 'src', 'data-csv');

const files = ['regions', 'provinces', 'municipalities', 'barangays'];

console.log(`\n  ph-address Benchmark  (${ITERATIONS} iterations / measurement)`);
console.log('  JSON (source)  vs  TOON (former)  vs  CSV full (naive)  vs  CSV optimized (shipped)\n');

const reports: FileReport[] = [];

for (const name of files) {
  const jsonPath = path.join(jsonDir, `${name}.json`);
  const csvPath  = path.join(csvDir,  `${name}.csv`);
  if (!fs.existsSync(jsonPath) || !fs.existsSync(csvPath)) {
    console.warn(`  Skipping ${name} (files missing)`);
    continue;
  }
  process.stdout.write(`  Benchmarking ${name}...`);
  reports.push(benchmarkFile(jsonPath, csvPath));
  process.stdout.write(' done\n');
}

for (const r of reports) printReport(r);
printSummary(reports);
