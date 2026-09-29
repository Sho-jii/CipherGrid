import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const targetDirectory = resolve(root, 'public', 'tessdata');
mkdirSync(targetDirectory, { recursive: true });
copyFileSync(
  resolve(root, 'node_modules', '@tesseract.js-data', 'eng', '4.0.0_best_int', 'eng.traineddata.gz'),
  resolve(targetDirectory, 'eng.traineddata.gz'),
);
