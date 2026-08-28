import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const speciesPath = path.resolve(__dirname, '../../src/data/species.json');
const speciesList = JSON.parse(fs.readFileSync(speciesPath, 'utf8'));

const otherImages = speciesList.filter(s => !s.illustration?.imageUrl?.includes('inaturalist-open-data'));

console.log(`Other images count: ${otherImages.length}`);
otherImages.forEach(s => {
  console.log(`Species: ${s.id}`);
  console.log(`  imageUrl: ${s.illustration?.imageUrl}`);
  console.log(`  thumbnailUrl: ${s.illustration?.thumbnailUrl}`);
  console.log(`  artist: ${s.illustration?.artist}`);
  console.log(`  license: ${s.illustration?.license}`);
  console.log(`  sourceBook: ${s.illustration?.sourceBook}`);
  console.log(`  year: ${s.illustration?.year}`);
  console.log(`  plateNumber: ${s.illustration?.plateNumber}`);
  console.log('---');
});
