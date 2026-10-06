/**
 * scripts/data-pipeline/commit-species-candidate.js
 * 
 * GIAI ĐOẠN 3: NẠP NGUYÊN TỬ VÀO DATABASE (ATOMIC COMMIT & REGRESSION CHECK)
 * 
 * Chỉ thực thi khi và chỉ khi:
 * 1. Bản ghi dự thảo đạt 100% PASS từ verifyCandidateSpecies().
 * 2. Cập nhật đồng bộ cả 2 file:
 *    - src/data/species.json
 *    - src/data/taxonomy.json
 * 3. Chạy kiểm thử tự động toàn diện. Nếu có bất kỳ lỗi nào ➔ Tự động ROLLBACK!
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { verifyCandidateSpecies } from './verify-species-candidate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRAFT_FILE = path.resolve(__dirname, 'drafts/candidate-species.json');
const SPECIES_FILE = path.resolve(__dirname, '../../src/data/species.json');
const TAXONOMY_FILE = path.resolve(__dirname, '../../src/data/taxonomy.json');

// Hàm đồng bộ cây phân loại taxonomy.json
function insertSpeciesIntoTaxonomy(taxonomyRoot, candidate) {
  const tax = candidate.taxonomy;
  const orderName = tax.order || 'Passeriformes';
  const familyName = tax.family || 'Leiothrichidae';
  const genusName = tax.genus || candidate.scientificName.split(' ')[0];

  // 1. Tìm hoặc tạo Order
  let orderNode = taxonomyRoot.children?.find(c => c.name.toLowerCase() === orderName.toLowerCase());
  if (!orderNode) {
    orderNode = {
      name: orderName,
      vietnameseName: tax.orderVietnamese || `Bộ ${orderName}`,
      rank: 'order',
      color: '#2D5A27',
      children: []
    };
    if (!taxonomyRoot.children) taxonomyRoot.children = [];
    taxonomyRoot.children.push(orderNode);
  }

  // 2. Tìm hoặc tạo Family
  if (!orderNode.children) orderNode.children = [];
  let familyNode = orderNode.children.find(c => c.name.toLowerCase() === familyName.toLowerCase());
  if (!familyNode) {
    familyNode = {
      name: familyName,
      vietnameseName: tax.familyVietnamese || `Họ ${familyName}`,
      rank: 'family',
      color: orderNode.color || '#2D5A27',
      children: []
    };
    orderNode.children.push(familyNode);
  }

  // 3. Tìm hoặc tạo Genus
  if (!familyNode.children) familyNode.children = [];
  let genusNode = familyNode.children.find(c => c.name.toLowerCase() === genusName.toLowerCase());
  if (!genusNode) {
    genusNode = {
      name: genusName,
      vietnameseName: `Chi ${genusName}`,
      rank: 'genus',
      color: familyNode.color || '#2D5A27',
      children: []
    };
    familyNode.children.push(genusNode);
  }

  // 4. Tìm hoặc chèn Species
  if (!genusNode.children) genusNode.children = [];
  const existingSpeciesIndex = genusNode.children.findIndex(c => c.speciesId === candidate.id);
  const speciesLeafNode = {
    name: candidate.scientificName,
    vietnameseName: candidate.vietnameseName,
    rank: 'species',
    color: genusNode.color || '#2D5A27',
    speciesId: candidate.id
  };

  if (existingSpeciesIndex >= 0) {
    genusNode.children[existingSpeciesIndex] = speciesLeafNode;
  } else {
    genusNode.children.push(speciesLeafNode);
  }

  return taxonomyRoot;
}

export async function commitCandidateSpecies() {
  console.log(`\n=============================================================`);
  console.log(`🚀 GIAI ĐOẠN 3: NẠP DỮ LIỆU NGUYÊN TỬ (ATOMIC DATABASE COMMIT)`);
  console.log(`=============================================================\n`);

  if (!fs.existsSync(DRAFT_FILE)) {
    console.error(`❌ LỖI: Không tìm thấy file dự thảo ${DRAFT_FILE}!`);
    process.exit(1);
  }

  const candidate = JSON.parse(fs.readFileSync(DRAFT_FILE, 'utf8'));

  // BƯỚC 1: CHẠY HÀNG RÀO KIỂM TOÁN CHỐT CHẶN
  console.log(`🛡️  Đang kích hoạt Gatekeeper Verification trước khi cho phép commit...`);
  const verifyResult = await verifyCandidateSpecies(candidate);

  if (!verifyResult.isPassed) {
    console.log(`\n⛔ TỪ CHỐI COMMIT VÀO DATABASE!`);
    console.log(`🛡️  DATABASE CHÍNH HOÀN TOÀN ĐƯỢC BẢO VỆ NGUYÊN VẸN.`);
    console.log(`👉 Vui lòng xem danh sách lỗi ở trên và khắc phục trước khi thử lại.\n`);
    process.exit(1);
  }

  // BƯỚC 2: SAO LƯU DỮ LIỆU ĐỂ PHÒNG NGỪA ROLLBACK
  console.log(`\n💾 Đang tạo điểm phục hồi tạm thời (Rollback Snapshot)...`);
  const originalSpeciesRaw = fs.readFileSync(SPECIES_FILE, 'utf8');
  const originalTaxonomyRaw = fs.readFileSync(TAXONOMY_FILE, 'utf8');

  try {
    // BƯỚC 3: CẬP NHẬT SPECIES.JSON
    const speciesList = JSON.parse(originalSpeciesRaw);
    const existingIndex = speciesList.findIndex(s => s.id === candidate.id);

    if (existingIndex >= 0) {
      console.log(`📝 Cập nhật bản ghi loài đã tồn tại: [${candidate.id}] ${candidate.vietnameseName}...`);
      speciesList[existingIndex] = candidate;
    } else {
      console.log(`➕ Bổ sung loài mới vào danh lục: [${candidate.id}] ${candidate.vietnameseName}...`);
      speciesList.push(candidate);
    }

    fs.writeFileSync(SPECIES_FILE, JSON.stringify(speciesList, null, 2), 'utf8');

    // BƯỚC 4: CẬP NHẬT TAXONOMY.JSON
    console.log(`🌳 Đang đồng bộ nhánh cây phân loại (Taxonomy Cladogram)...`);
    const taxonomyData = JSON.parse(originalTaxonomyRaw);
    const updatedTaxonomy = insertSpeciesIntoTaxonomy(taxonomyData, candidate);
    fs.writeFileSync(TAXONOMY_FILE, JSON.stringify(updatedTaxonomy, null, 2), 'utf8');

    // BƯỚC 5: CHẠY KIỂM THỬ HỒI QUY TOÀN BỘ DỰ ÁN
    console.log(`🧪 Đang kích hoạt kiểm thử hồi quy (Data & Naming Firewall Tests)...`);
    execSync('npm test', { stdio: 'inherit' });

    console.log(`\n=============================================================`);
    console.log(`🎉 NẠP LOÀI MỚI THÀNH CÔNG VÀO DATABASE!`);
    console.log(`=============================================================`);
    console.log(`✅ Loài: ${candidate.vietnameseName} (${candidate.scientificName})`);
    console.log(`✅ ID:   ${candidate.id}`);
    console.log(`✅ Tổng số loài hiện tại trong database: ${speciesList.length} loài`);
    console.log(`✅ Cây phân loại taxonomy.json đã đồng bộ 100% khớp lá.`);
    console.log(`=============================================================\n`);

    // Lưu vào lịch sử nạp thành công
    const logPath = path.resolve(__dirname, 'drafts/committed-history.jsonl');
    const logEntry = JSON.stringify({
      timestamp: new Date().toISOString(),
      speciesId: candidate.id,
      scientificName: candidate.scientificName,
      vietnameseName: candidate.vietnameseName
    }) + '\n';
    fs.appendFileSync(logPath, logEntry, 'utf8');

  } catch (err) {
    console.error(`\n💥 PHÁT HIỆN LỖI TRONG QUÁ TRÌNH COMMIT HOẶC TEST HỒI QUY THẤT BẠI:`, err.message);
    console.log(`🔄 ĐANG TỰ ĐỘNG ROLLBACK KHÔI PHỤC DATABASE VỀ NGUYÊN TRẠNG AN TOÀN...`);
    fs.writeFileSync(SPECIES_FILE, originalSpeciesRaw, 'utf8');
    fs.writeFileSync(TAXONOMY_FILE, originalTaxonomyRaw, 'utf8');
    console.log(`✅ Đã rollback hoàn tất. src/data/species.json và taxonomy.json không bị ảnh hưởng.`);
    process.exit(1);
  }
}

// Chạy trực tiếp từ CLI nếu được gọi
if (process.argv[1] && process.argv[1].endsWith('commit-species-candidate.js')) {
  commitCandidateSpecies().catch(err => {
    console.error('Lỗi commit:', err);
    process.exit(1);
  });
}
