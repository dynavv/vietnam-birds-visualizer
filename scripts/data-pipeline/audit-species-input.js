/**
 * Vietnam Birds Visualizer — Species Input Auditor & Cross-Validator
 * 
 * Kiểm định đầu vào tự động thông qua GBIF Taxonomy Backbone & iNaturalist API
 * Ngăn chặn lỗi GIGO (Garbage In, Garbage Out) và phát hiện mâu thuẫn ngữ nghĩa / địa lý.
 * 
 * Cách dùng:
 *  - Kiểm tra 1 loài cụ thể: node scripts/data-pipeline/audit-species-input.js --name="Trochalopteron formosum"
 *  - Chạy audit nhanh mẫu:   node scripts/data-pipeline/audit-species-input.js --sample
 *  - Quét toàn bộ dataset:  node scripts/data-pipeline/audit-species-input.js --all
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const speciesPath = path.join(__dirname, '../../src/data/species.json');

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'VietnamBirdsVisualizer/1.0 (biodiversity audit)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

/**
 * Kiểm định đối soát chéo một loài chim
 */
export async function auditSpeciesRecord(record) {
  const sciName = record.scientificName || '';
  const vnName = record.vietnameseName || '';
  const isEndemic = !!record.isEndemic;
  const endemicScope = record.endemicScope || (isEndemic ? 'vietnam' : 'none');

  const discrepancies = [];
  const warnings = [];
  let confidence = 100;

  // 1. Kiểm tra với GBIF Species Match API
  const cleanName = sciName.replace(/\s+/g, ' ').trim();
  const gbifUrl = `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(cleanName)}`;
  const gbifData = await fetchJson(gbifUrl);

  let gbifMatch = null;
  if (!gbifData || gbifData.matchType === 'NONE') {
    discrepancies.push(`[GBIF] Không tìm thấy danh pháp khoa học '${cleanName}' trong hệ thống phân loại toàn cầu.`);
    confidence -= 40;
  } else {
    gbifMatch = gbifData;
    if (gbifData.matchType === 'FUZZY') {
      warnings.push(`[GBIF Cảnh báo] Danh pháp khớp gần đúng (Fuzzy match): '${cleanName}' -> Khớp thành '${gbifData.scientificName}'. Hãy kiểm tra lại chính tả.`);
      confidence -= 15;
    }

    if (gbifData.status === 'SYNONYM') {
      warnings.push(`[GBIF Cảnh báo] Danh pháp '${cleanName}' là tên đồng nghĩa (SYNONYM). Tên được chấp nhận chính thức là '${gbifData.species || gbifData.scientificName}'.`);
      confidence -= 15;
    }

    // Kiểm tra tính nhất quán họ / bộ nếu có trong record
    if (record.taxonomy?.family && gbifData.family && record.taxonomy.family.toLowerCase() !== gbifData.family.toLowerCase()) {
      discrepancies.push(`[Phân loại lệch] Khai báo Họ '${record.taxonomy.family}' nhưng GBIF xác định Họ '${gbifData.family}'.`);
      confidence -= 20;
    }
  }

  // 2. Kiểm tra với iNaturalist API
  const inatUrl = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(cleanName)}`;
  const inatData = await fetchJson(inatUrl);
  let inatMatch = null;

  if (inatData?.results?.length > 0) {
    inatMatch = inatData.results[0];
    const enName = inatMatch.preferred_common_name || '';

    // 3. Kiểm tra mâu thuẫn ngữ nghĩa (Semantic Discrepancy)
    // Ví dụ: Red-winged Laughingthrush nhưng gán tiếng Việt là "Khướu hông đỏ" (Cutia legalleni)
    if (enName.toLowerCase().includes('red-winged') && vnName.includes('hông đỏ')) {
      discrepancies.push(`[Mâu thuẫn ngữ nghĩa] Tên tiếng Anh là '${enName}' (cánh đỏ) nhưng tên tiếng Việt ghi '${vnName}'. Nghi ngờ nhầm lẫn với Khướu hông đỏ (Cutia legalleni).`);
      confidence -= 35;
    }
  }

  // 4. Kiểm tra phân bố đặc hữu (Geo-Endemism Check)
  if (isEndemic && endemicScope === 'vietnam') {
    // Nếu là loài phân bố rộng nổi tiếng (như Trochalopteron formosum, Psittiparus bakeri, Trochalopteron milnei)
    const wideAsianSpecies = ['Trochalopteron formosum', 'Trochalopteron milnei', 'Psittiparus bakeri', 'Pomatorhinus hypoleucos'];
    const matchedWide = wideAsianSpecies.find(w => cleanName.startsWith(w));
    if (matchedWide) {
      discrepancies.push(`[Địa lý lệch] Loài '${cleanName}' phân bố rộng tại Đông Nam Á / Trung Quốc, không thể gán cờ 'Đặc hữu Việt Nam'.`);
      confidence -= 40;
    }
  }

  // 5. Kiểm tra danh mục bảo vệ pháp lý (Legal Conservation Framework Check)
  const legal = record.conservation?.legalFramework;
  if (!legal) {
    warnings.push(`[Thiếu khung pháp lý] Bản ghi chưa khai báo trường 'legalFramework'.`);
    confidence -= 10;
  } else {
    const validGroups = ['IB', 'IIB', 'none'];
    if (!validGroups.includes(legal.decree84Group)) {
      discrepancies.push(`[Pháp lý lỗi] decree84Group '${legal.decree84Group}' không thuộc [IB, IIB, none].`);
      confidence -= 20;
    }
  }

  confidence = Math.max(0, Math.min(100, confidence));

  return {
    record,
    cleanName,
    gbifMatch,
    inatMatch,
    confidence,
    isPassed: discrepancies.length === 0 && confidence >= 80,
    discrepancies,
    warnings
  };
}

function printAuditReport(res) {
  console.log('\n' + '='.repeat(70));
  const statusIcon = res.isPassed ? '✅ HỢP LỆ' : (res.confidence > 50 ? '⚠️ CẢNH BÁO' : '❌ MÂU THUẪN NGHIÊM TRỌNG');
  console.log(`${statusIcon}: [${res.cleanName}] | Độ tin cậy: ${res.confidence}/100`);
  console.log('='.repeat(70));

  if (res.gbifMatch) {
    console.log(`• GBIF: ${res.gbifMatch.scientificName} | Order: ${res.gbifMatch.order} | Family: ${res.gbifMatch.family} | Status: ${res.gbifMatch.status}`);
  }
  if (res.inatMatch) {
    console.log(`• iNaturalist: Taxon #${res.inatMatch.id} (${res.inatMatch.name}) | English: ${res.inatMatch.preferred_common_name || 'N/A'}`);
  }

  if (res.discrepancies.length > 0) {
    console.log('\n❌ Mâu thuẫn phát hiện:');
    res.discrepancies.forEach(d => console.log(`   - ${d}`));
  }

  if (res.warnings.length > 0) {
    console.log('\n⚠️ Lưu ý kiểm tra:');
    res.warnings.forEach(w => console.log(`   - ${w}`));
  }

  if (!res.isPassed) {
    console.log('\n👉 Khuyến nghị: Kiểm tra lại danh pháp khoa học hoặc tên tiếng Việt trước khi ghi vào species.json.');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const nameArg = args.find(a => a.startsWith('--name='))?.split('=')[1];
  const isSample = args.includes('--sample');
  const isAll = args.includes('--all');

  const speciesList = JSON.parse(fs.readFileSync(speciesPath, 'utf8'));

  if (nameArg) {
    console.log(`🔍 Đang kiểm định danh pháp: "${nameArg}"...`);
    const mock = speciesList.find(s => s.scientificName.toLowerCase().includes(nameArg.toLowerCase())) || {
      scientificName: nameArg,
      vietnameseName: 'Chưa đặt tên',
      isEndemic: false
    };
    const res = await auditSpeciesRecord(mock);
    printAuditReport(res);
  } else if (isAll) {
    console.log(`🚀 Bắt đầu quét kiểm định toàn bộ ${speciesList.length} loài trong dataset...`);
    let passCount = 0;
    let failCount = 0;

    for (let i = 0; i < speciesList.length; i++) {
      const sp = speciesList[i];
      const res = await auditSpeciesRecord(sp);
      if (res.isPassed) {
        passCount++;
      } else {
        failCount++;
        printAuditReport(res);
      }
      // Nghỉ ngắn giữa các request để bảo vệ rate limit API
      await new Promise(r => setTimeout(r, 80));
    }

    console.log('\n' + '='.repeat(70));
    console.log(`📊 TỔNG KẾT QUÉT TOÀN BỘ: ${passCount}/${speciesList.length} loài đạt chuẩn (${failCount} loài có cảnh báo).`);
    console.log('='.repeat(70));
  } else {
    // Mặc định kiểm tra 3 loài tiêu biểu
    console.log('🔬 Chạy kiểm định 3 loài tiêu biểu (Kiểm tra chéo GBIF + iNaturalist):');
    const testSamples = [
      speciesList.find(s => s.id === 'cutia-legalleni'),
      speciesList.find(s => s.id === 'rimator-pasquieri'),
      speciesList.find(s => s.id === 'tropicoperdix-tonkinensis')
    ].filter(Boolean);

    for (const sp of testSamples) {
      const res = await auditSpeciesRecord(sp);
      printAuditReport(res);
      await new Promise(r => setTimeout(r, 100));
    }

    console.log('\n💡 Mẹo: Chạy `node scripts/data-pipeline/audit-species-input.js --name="Tên loài"` để kiểm định bất kỳ loài nào.');
  }
}

// Chỉ thực thi main() khi script được gọi trực tiếp từ dòng lệnh
if (process.argv[1] && process.argv[1].endsWith('audit-species-input.js')) {
  main();
}

