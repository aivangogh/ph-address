// scripts/minify-json.ts

import * as fs from 'fs';
import * as path from 'path';

/**
 * Minifies all JSON files in a specified directory.
 *
 * This script reads each `.json` file, parses its content to validate it,
 * and then overwrites the file with a minified (no whitespace) version.
 *
 * @param dirPath - The absolute or relative path to the directory containing the JSON files.
 */
function minifyJsonInDirectory(dirPath: string): void {
  const absolutePath = path.resolve(dirPath);

  if (!fs.existsSync(absolutePath) || !fs.lstatSync(absolutePath).isDirectory()) {
    console.error(`Error: Directory not found at ${absolutePath}`);
    process.exit(1);
  }

  const files = fs.readdirSync(absolutePath);

  console.log(`Minifying JSON files in ${absolutePath}...`);

  for (const file of files) {
    if (path.extname(file).toLowerCase() === '.json') {
      const filePath = path.join(absolutePath, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(content);
        fs.writeFileSync(filePath, JSON.stringify(json));
        console.log(`  - Minified ${file}`);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
  }

  console.log('JSON minification complete.');
}

function main() {
  const targetDirectory = process.argv[2];

  if (!targetDirectory) {
    console.error('Usage: bun run scripts/minify-json.ts <directory_path>');
    console.error('Example: bun run scripts/minify-json.ts src/data');
    process.exit(1);
  }

  minifyJsonInDirectory(targetDirectory);
}

main();
