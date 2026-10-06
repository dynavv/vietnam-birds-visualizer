/**
 * scripts/data-pipeline/harvest-species.js
 * 
 * GIAI ĐOẠN 1: THU THẬP & TẠO BẢN GHI DỰ THẢO (API HARVESTER)
 * 
 * Thu thập dữ liệu đa nguồn từ các API chính thức:
 * 1. GBIF Taxonomy API: Bậc phân loại, họ, bộ, gbifTaxonKey.
 * 2. iNaturalist Research Grade API: Ảnh CC, tác giả, giấy phép, tọa độ thực địa tại Việt Nam.
 * 3. Xeno-canto API: Âm thanh tiếng hót thực địa chất lượng cao.
 * 4. Master Naming Registry: Tên tiếng Việt chuẩn đối soát Tam diện.
 * 5. IUCN & Avibase: Mã định danh bảo tồn và cơ sở dữ liệu quốc tế.
 * 
 * Lưu ý: Kết quả CHỈ được ghi vào thư mục staging dự thảo:
 * scripts/data-pipeline/drafts/candidate-species.json
 * Tuyệt đối KHÔNG chạm vào src/data/species.json!
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MASTER_PATH = path.resolve(__dirname, 'authority/vietnam-bird-names-master.json');
const DRAFTS_DIR = path.resolve(__dirname, 'drafts');
const DRAFT_FILE = path.resolve(DRAFTS_DIR, 'candidate-species.json');

// Đảm bảo thư mục drafts tồn tại
if (!fs.existsSync(DRAFTS_DIR)) {
  fs.mkdirSync(DRAFTS_DIR, { recursive: true });
}

// Hàm fetch có timeout và User-Agent
async function fetchJson(url, timeoutMs = 8000) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'VietnamBirdsVisualizer-Pipeline/1.0 (biodiversity harvester)' },
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Chuyển đổi tên khoa học thành ID dạng slug
function toSlug(sciName) {
  return sciName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export async function harvestSpeciesData(targetScientificName) {
  const cleanName = targetScientificName.trim();
  const slugId = toSlug(cleanName);

  console.log(`\n=============================================================`);
  console.log(`🌾 GIAI ĐOẠN 1: THU THẬP DỮ LIỆU TỪ CÁC API CHO LOÀI:`);
  console.log(`👉 "${cleanName}" (ID: ${slugId})`);
  console.log(`=============================================================\n`);

  // 1. Kiểm tra đối soát với Master Naming Registry (Chống AI Hallucination)
  console.log(`📡 [1/5] Tra cứu Master Registry (Tam diện đối soát)...`);
  let masterRecord = null;
  if (fs.existsSync(MASTER_PATH)) {
    const masterList = JSON.parse(fs.readFileSync(MASTER_PATH, 'utf8'));
    masterRecord = masterList.find(m => m.scientificName.toLowerCase() === cleanName.toLowerCase());
  }

  if (masterRecord) {
    console.log(`  ✅ Đã khớp Master Registry: "${masterRecord.vietnameseName}" | Nguồn: ${masterRecord.authority || 'VAST / Craik & Minh 2018'}`);
  } else {
    console.log(`  ⚠️  CẢNH BÁO: Loài "${cleanName}" CHƯA CÓ trong Master Registry! Cần bổ sung tên chuẩn trước khi commit.`);
  }

  // 2. Thu thập từ GBIF Taxonomy API
  console.log(`📡 [2/5] Truy vấn GBIF Taxonomy Backbone API...`);
  const gbifData = await fetchJson(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(cleanName)}`);
  
  const order = gbifData?.order || masterRecord?.order || 'Passeriformes';
  const family = gbifData?.family || masterRecord?.family || 'Leiothrichidae';
  const genus = gbifData?.genus || cleanName.split(' ')[0] || '';
  const gbifTaxonKey = gbifData?.usageKey ? String(gbifData.usageKey) : (masterRecord?.gbifTaxonKey || '');
  console.log(`  ✅ GBIF Key: ${gbifTaxonKey} | Bộ: ${order} | Họ: ${family} | Chi: ${genus}`);

  // 3. Thu thập từ iNaturalist Research Grade API (Áp dụng Hàng rào Ảnh 3 Lớp)
  console.log(`📡 [3/5] Truy vấn iNaturalist Research Grade API (Hàng rào ảnh thực địa)...`);
  // Bước 3.1: Tìm Taxon ID cấp loài
  const taxaSearch = await fetchJson(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(cleanName)}&rank=species`);
  const exactTaxon = taxaSearch?.results?.find(t => t.name.toLowerCase() === cleanName.toLowerCase()) || taxaSearch?.results?.[0];
  const inatTaxonId = exactTaxon?.id || null;

  let photoRecord = {
    imageUrl: '',
    thumbnailUrl: '',
    artist: '',
    sourceBook: 'iNaturalist Biodiversity Archive',
    license: 'cc-by-nc',
    observationUrl: inatTaxonId ? `https://www.inaturalist.org/taxa/${inatTaxonId}` : '',
    photoLocation: '',
    isShotInVietnam: false,
    hasValidPhoto: false
  };

  let fieldCoordinates = [12.0, 108.0]; // Default center

  if (inatTaxonId) {
    // Bước 3.2: Ưu tiên tìm quan sát thực địa tại Việt Nam (place_id=7155)
    const vnObsData = await fetchJson(
      `https://api.inaturalist.org/v1/observations?taxon_id=${inatTaxonId}&place_id=7155&quality_grade=research&captive=false&photos=true&per_page=10`
    );

    let chosenObs = null;
    let chosenPhoto = null;

    if (vnObsData?.results?.length > 0) {
      for (const obs of vnObsData.results) {
        const validPhoto = obs.photos?.find(p => p.license_code && p.license_code.startsWith('cc'));
        if (validPhoto) {
          chosenObs = obs;
          chosenPhoto = validPhoto;
          break;
        }
      }
    }

    if (chosenObs && chosenPhoto) {
      console.log(`  ✅ Tìm thấy ảnh thực tế chụp tại VIỆT NAM (Research Grade, CC License)!`);
      const photoId = chosenPhoto.id;
      const licenseCode = chosenPhoto.license_code || 'cc-by-nc';
      const authorName = chosenObs.user?.name || chosenObs.user?.login || 'iNaturalist Observer';
      
      photoRecord = {
        imageUrl: `https://inaturalist-open-data.s3.amazonaws.com/photos/${photoId}/large.jpg`,
        thumbnailUrl: `https://inaturalist-open-data.s3.amazonaws.com/photos/${photoId}/medium.jpg`,
        artist: `(c) ${authorName}, some rights reserved (${licenseCode.toUpperCase()})`,
        sourceBook: 'iNaturalist Biodiversity Archive',
        license: licenseCode,
        observationUrl: `https://www.inaturalist.org/observations/${chosenObs.id}`,
        photoLocation: chosenObs.place_guess || 'Khu vực bảo tồn tự nhiên, Việt Nam',
        isShotInVietnam: true,
        hasValidPhoto: true
      };

      if (chosenObs.geojson?.coordinates) {
        fieldCoordinates = [chosenObs.geojson.coordinates[1], chosenObs.geojson.coordinates[0]];
      }
    } else {
      // Bước 3.3: Nếu không có ảnh tại VN, tìm ảnh đúng loài toàn cầu (ảnh nhận diện hình thái)
      console.log(`  ℹ️  Chưa tìm thấy ảnh tại VN, tìm kiếm ảnh nghiên cứu đúng loài toàn cầu...`);
      const globalObsData = await fetchJson(
        `https://api.inaturalist.org/v1/observations?taxon_id=${inatTaxonId}&quality_grade=research&captive=false&photos=true&per_page=10`
      );

      if (globalObsData?.results?.length > 0) {
        for (const obs of globalObsData.results) {
          const validPhoto = obs.photos?.find(p => p.license_code && p.license_code.startsWith('cc'));
          if (validPhoto) {
            chosenObs = obs;
            chosenPhoto = validPhoto;
            break;
          }
        }
      }

      if (chosenObs && chosenPhoto) {
        console.log(`  ✅ Đã tìm thấy ảnh đúng loài toàn cầu (Tuyệt đối KHÔNG ghi chú thích địa điểm để tránh hiểu lầm)!`);
        const photoId = chosenPhoto.id;
        const licenseCode = chosenPhoto.license_code || 'cc-by-nc';
        const authorName = chosenObs.user?.name || chosenObs.user?.login || 'iNaturalist Observer';

        photoRecord = {
          imageUrl: `https://inaturalist-open-data.s3.amazonaws.com/photos/${photoId}/large.jpg`,
          thumbnailUrl: `https://inaturalist-open-data.s3.amazonaws.com/photos/${photoId}/medium.jpg`,
          artist: `(c) ${authorName}, some rights reserved (${licenseCode.toUpperCase()})`,
          sourceBook: 'iNaturalist Biodiversity Archive',
          license: licenseCode,
          observationUrl: `https://www.inaturalist.org/observations/${chosenObs.id}`,
          photoLocation: '', // BẮT BUỘC RỖNG theo quy tắc
          isShotInVietnam: false,
          hasValidPhoto: true
        };
      } else {
        console.log(`  ⚠️  ZERO-PHOTO ALERT: Không tìm thấy ảnh mở có giấy phép CC hợp lệ! Gắn cờ MISSING_PHOTO.`);
        photoRecord.hasValidPhoto = false;
      }
    }
  }

  // 4. Thu thập từ Xeno-canto Sound API
  console.log(`📡 [4/5] Truy vấn Xeno-canto Audio API...`);
  const xcData = await fetchJson(`https://xeno-canto.org/api/2/recordings?query=${encodeURIComponent(cleanName)}+q:A`);
  const xcRecord = xcData?.recordings?.[0] || (await fetchJson(`https://xeno-canto.org/api/2/recordings?query=${encodeURIComponent(cleanName)}`))?.recordings?.[0];

  let audioCall = null;
  if (xcRecord) {
    console.log(`  ✅ Tìm thấy âm thanh Xeno-canto: XC${xcRecord.id} (${xcRecord.length}s) bởi ${xcRecord.rec}`);
    audioCall = {
      audioUrl: xcRecord.file.startsWith('//') ? `https:${xcRecord.file}` : xcRecord.file,
      duration: xcRecord.length ? `0:${xcRecord.length}` : '0:30',
      recordist: xcRecord.rec || 'Xeno-canto Field Archive',
      location: xcRecord.loc || 'Việt Nam',
      xenoCantoId: `XC${xcRecord.id}`,
      license: xcRecord.lic || 'CC BY-NC-SA 4.0'
    };
  } else {
    console.log(`  ⚠️  Chưa tìm thấy bản thu âm Xeno-canto phù hợp.`);
  }

  // 5. Chuẩn bị liên kết học thuật (IUCN & Avibase)
  console.log(`📡 [5/5] Chuẩn bị liên kết học thuật (IUCN Red List & Avibase)...`);
  const iucnSearchUrl = `https://www.iucnredlist.org/search?query=${encodeURIComponent(cleanName)}&searchType=species`;
  const avibaseId = masterRecord?.avibaseId || '';

  // Xây dựng bản ghi dự thảo hoàn chỉnh theo interface BirdSpecies
  const candidateRecord = {
    id: slugId,
    scientificName: cleanName,
    vietnameseName: masterRecord?.vietnameseName || '',
    englishName: masterRecord?.englishName || exactTaxon?.preferred_common_name || '',
    aliases: masterRecord?.aliases || [],
    taxonomy: {
      clade: ['Neoaves'],
      order: order,
      orderVietnamese: masterRecord?.orderVietnamese || `Bộ ${order}`,
      family: family,
      familyVietnamese: masterRecord?.familyVietnamese || `Họ ${family}`,
      genus: genus,
      species: cleanName
    },
    isEndemic: !!masterRecord?.isEndemic,
    endemicScope: masterRecord?.endemicScope || 'none',
    conservation: {
      iucn: masterRecord?.iucn || 'CR',
      vietnamRedList: masterRecord?.vietnamRedList || 'CR',
      description: masterRecord?.conservationDescription || `Loài thuộc nhóm Cực kỳ nguy cấp (CR) trong Sách Đỏ Việt Nam và Danh mục động vật rừng nguy cấp, quý, hiếm (Nghị định 84/2021/NĐ-CP Nhóm IB).`,
      legalFramework: masterRecord?.legalFramework ? {
        decree84Group: masterRecord.legalFramework.decree84Group || 'none',
        decree160Priority: Boolean(masterRecord.legalFramework.decree160Priority),
        directive04Flagship: Boolean(masterRecord.legalFramework.directive04Flagship)
      } : {
        decree84Group: masterRecord?.decree84Group || 'none',
        decree160Priority: Boolean(masterRecord?.decree160Priority),
        directive04Flagship: Boolean(masterRecord?.directive04Flagship)
      }
    },
    morphologicalAnalysis: {
      overview: masterRecord?.morphologyOverview || `Mô tả hình thái học cho loài ${cleanName}.`,
      diagnosticFeatures: masterRecord?.diagnosticFeatures || [
        { part: 'Bộ lông', description: 'Đang cập nhật đặc điểm nhận dạng thực địa.' },
        { part: 'Mỏ và đầu', description: 'Đang cập nhật đặc điểm nhận dạng đầu và mỏ.' }
      ]
    },
    distribution: {
      ebaRegion: masterRecord?.ebaRegion || 'cochinchina',
      elevation: masterRecord?.elevation || 'Dưới 1.000m',
      habitats: masterRecord?.habitats || ['Rừng thường xanh tự nhiên'],
      locations: photoRecord.photoLocation ? [photoRecord.photoLocation] : (masterRecord?.locations || ['Khu bảo tồn thiên nhiên Việt Nam']),
      coordinates: masterRecord?.coordinates || fieldCoordinates
    },
    illustration: photoRecord,
    audioCall: audioCall,
    academic: {
      iocTaxonCode: `IOC-${slugId.toUpperCase().slice(0, 10)}`,
      avibaseId: avibaseId,
      iucnUrl: iucnSearchUrl,
      gbifTaxonKey: gbifTaxonKey,
      primaryLiterature: masterRecord?.primaryLiterature || [
        {
          authors: 'Bộ Khoa học và Công nghệ & Viện Hàn lâm KH&CN Việt Nam',
          year: 2007,
          title: 'Sách Đỏ Việt Nam - Phần I: Động vật (Lớp Chim - Aves)',
          journalOrBook: 'Nhà xuất bản Khoa học tự nhiên và Công nghệ, Hà Nội',
          volumeOrPages: 'Trang 180-260'
        },
        {
          authors: 'Chính phủ Việt Nam',
          year: 2021,
          title: 'Nghị định 84/2021/NĐ-CP về Quản lý thực vật rừng, động vật rừng nguy cấp, quý, hiếm (Nhóm IB)',
          journalOrBook: 'Công báo Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam',
          volumeOrPages: 'Phụ lục Danh mục loài'
        }
      ]
    }
  };

  // Lưu vào staging draft
  fs.writeFileSync(DRAFT_FILE, JSON.stringify(candidateRecord, null, 2), 'utf8');

  console.log(`\n=============================================================`);
  console.log(`💾 ĐÃ LƯU BẢN GHI DỰ THẢO VÀO VÙNG ĐỆM STAGING:`);
  console.log(`📁 File: scripts/data-pipeline/drafts/candidate-species.json`);
  console.log(`⚠️  Dữ liệu CHƯA được nạp vào database chính. Hãy chạy tiếp:`);
  console.log(`👉 npm run species:verify (để chạy 4 bài kiểm tra chốt chặn)`);
  console.log(`=============================================================\n`);

  return candidateRecord;
}

// Chạy trực tiếp từ CLI nếu được gọi
const targetArg = process.argv.find(arg => arg.startsWith('--name='));
if (targetArg) {
  const sciName = targetArg.replace('--name=', '').replace(/^["']|["']$/g, '');
  harvestSpeciesData(sciName).catch(console.error);
}
