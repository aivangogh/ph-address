import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

const sourceDir = path.join(process.cwd(), 'src', 'data');
const outputDir = process.argv[2]; // Get the output dir from the command line

if (!outputDir) {
  console.error('Please provide an output directory.');
  process.exit(1);
}

const destDir = path.resolve(process.cwd(), outputDir);


// Ensure the destination directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.json'));

files.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const destPath = path.join(destDir, `${file}.gz`);

  const fileContents = fs.readFileSync(sourcePath);
  const compressed = zlib.gzipSync(fileContents);

  fs.writeFileSync(destPath, compressed);

  console.log(`Compressed ${file} to ${destPath}`);
});
