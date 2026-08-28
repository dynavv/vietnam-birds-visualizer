import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const speciesPath = path.resolve(__dirname, '../../src/data/species.json');
const speciesList = JSON.parse(fs.readFileSync(speciesPath, 'utf8'));

console.log(`Total species loaded: ${speciesList.length}`);

const report = {
  totalSpecies: speciesList.length,
  missingAcademic: [],
  missingAudio: [],
  missingIllustration: [],
  iucnUrls: { valid: 0, malformed: 0, missing: 0, samples: [] },
  avibaseIds: { valid: 0, invalidFormat: 0, missing: 0, samples: [] },
  gbifKeys: { valid: 0, isUrlInsteadOfKey: 0, missing: 0, samples: [] },
  primaryLit: { totalRefs: 0, withDoi: 0, withBhl: 0, withUrl: 0, withoutAnyLink: 0, samples: [] },
  audioUrls: { xenoCanto: 0, other: 0, missing: 0, nonMp3: 0, samples: [] },
  imageUrls: { inaturalistS3: 0, wikimedia: 0, other: 0, missingThumbnail: 0, missingObservationUrl: 0, missingLicense: 0, samples: [] }
};

speciesList.forEach((s, idx) => {
  // Check Academic
  if (!s.academic) {
    report.missingAcademic.push(s.id);
  } else {
    // IUCN
    if (!s.academic.iucnUrl) {
      report.iucnUrls.missing++;
    } else {
      report.iucnUrls.valid++;
      if (idx < 5) report.iucnUrls.samples.push({ id: s.id, url: s.academic.iucnUrl });
    }

    // Avibase
    if (!s.academic.avibaseId) {
      report.avibaseIds.missing++;
    } else {
      if (s.academic.avibaseId.startsWith('AVIBASE-')) {
        report.avibaseIds.invalidFormat++;
        if (report.avibaseIds.samples.length < 5) {
          report.avibaseIds.samples.push({ id: s.id, avibaseId: s.academic.avibaseId });
        }
      } else {
        report.avibaseIds.valid++;
      }
    }

    // GBIF
    if (!s.academic.gbifTaxonKey) {
      report.gbifKeys.missing++;
    } else {
      // Check if it's a numeric key or a search URL
      if (s.academic.gbifTaxonKey.startsWith('http')) {
        report.gbifKeys.isUrlInsteadOfKey++;
        if (report.gbifKeys.samples.length < 5) {
          report.gbifKeys.samples.push({ id: s.id, gbifTaxonKey: s.academic.gbifTaxonKey });
        }
      } else {
        report.gbifKeys.valid++;
      }
    }

    // Primary literature
    if (s.academic.primaryLiterature && Array.isArray(s.academic.primaryLiterature)) {
      s.academic.primaryLiterature.forEach(ref => {
        report.primaryLit.totalRefs++;
        if (ref.doiOrUrl) {
          if (ref.doiOrUrl.includes('doi.org')) report.primaryLit.withDoi++;
          else if (ref.doiOrUrl.includes('biodiversitylibrary.org')) report.primaryLit.withBhl++;
          else report.primaryLit.withUrl++;
          if (report.primaryLit.samples.length < 8) {
            report.primaryLit.samples.push({ speciesId: s.id, refTitle: ref.title, link: ref.doiOrUrl });
          }
        } else {
          report.primaryLit.withoutAnyLink++;
        }
      });
    }
  }

  // Check Audio
  if (!s.audioCall || !s.audioCall.audioUrl) {
    report.missingAudio.push(s.id);
  } else {
    if (s.audioCall.audioUrl.includes('xeno-canto.org')) {
      report.audioUrls.xenoCanto++;
    } else {
      report.audioUrls.other++;
    }
    if (!s.audioCall.audioUrl.endsWith('.mp3')) {
      report.audioUrls.nonMp3++;
    }
    if (idx < 5) {
      report.audioUrls.samples.push({
        id: s.id,
        url: s.audioCall.audioUrl,
        duration: s.audioCall.duration,
        recordist: s.audioCall.recordist,
        xenoCantoId: s.audioCall.xenoCantoId
      });
    }
  }

  // Check Illustration & Media
  if (!s.illustration || !s.illustration.imageUrl) {
    report.missingIllustration.push(s.id);
  } else {
    if (s.illustration.imageUrl.includes('inaturalist-open-data')) {
      report.imageUrls.inaturalistS3++;
    } else if (s.illustration.imageUrl.includes('wikimedia')) {
      report.imageUrls.wikimedia++;
    } else {
      report.imageUrls.other++;
    }
    if (!s.illustration.thumbnailUrl) report.imageUrls.missingThumbnail++;
    if (!s.illustration.observationUrl) report.imageUrls.missingObservationUrl++;
    if (!s.illustration.license) report.imageUrls.missingLicense++;

    if (idx < 5) {
      report.imageUrls.samples.push({
        id: s.id,
        imageUrl: s.illustration.imageUrl,
        thumbnailUrl: s.illustration.thumbnailUrl,
        license: s.illustration.license,
        observationUrl: s.illustration.observationUrl,
        artist: s.illustration.artist,
        year: s.illustration.year,
        plateNumber: s.illustration.plateNumber
      });
    }
  }
});

console.log(JSON.stringify(report, null, 2));
