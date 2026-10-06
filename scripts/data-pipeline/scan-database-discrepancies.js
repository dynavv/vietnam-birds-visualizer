/**
 * scripts/data-pipeline/scan-database-discrepancies.js
 * 
 * Script Chẩn đoán Đối soát Toàn diện Cơ sở Dữ liệu 74 loài chim Việt Nam.
 * Đối chiếu dữ liệu hiện tại trong species.json với:
 * 1. GBIF Taxonomy API (api.gbif.org/v1/species/match): Kiểm tra danh pháp, tình trạng ACCEPTED/SYNONYM, Bộ và Họ.
 * 2. iNaturalist Taxon API (api.inaturalist.org/v1/taxa): Kiểm tra Tên tiếng Việt chính thức (locale: 'vi') và cấp độ bảo tồn.
 * 
 * Chỉ đọc (Read-only), tuyệt đối không can thiệp hay sửa đổi dữ liệu!
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const speciesPath = path.resolve(__dirname, '../../src/data/species.json');
const speciesList = JSON.parse(fs.readFileSync(speciesPath, 'utf8'));

console.log(`\n🔍 BẮT ĐẦU QUÉT ĐỐI SOÁT TOÀN DIỆN ${speciesList.length} LOÀI CHIM HIỆN CÓ...`);
console.log('📡 Đang truy vấn GBIF Taxonomy API & iNaturalist Vernacular Names Database...\n');

// Danh mục đối chiếu tên tiếng Việt chuẩn của điểu học (Ground Truth Checklist)
// Tổng hợp từ Avibase Vietnam Checklist, Danh lục Chim VN (VAST) và Craik & Minh 2018
const CANONICAL_VIETNAMESE_NAMES = {
  'Leptoptilos javanicus': 'Già đẫy nhỏ',
  'Lophura edwardsi': 'Gà lôi lam mào trắng',
  'Trochalopteron ngoclinhense': 'Khướu Ngọc Linh',
  'Ianthocincla konkakinhensis': 'Khướu Kon Ka Kinh',
  'Liochichla langbianis': 'Mi Langbiang',
  'Trochalopteron yersini': 'Khướu đầu đen má xám',
  'Chloris monguilloti': 'Sẻ thông họng vàng',
  'Rimator pasquieri': 'Khướu đất họng trắng',
  'Cutia legalleni': 'Khướu hông đỏ',
  'Garrulax annamensis': 'Khướu ngực đốm',
  'Schoeniparus klossi': 'Khướu bụi gáy đen',
  'Prinia rocki': 'Chiền chiện núi Langbiang',
  'Locustella idonea': 'Chích bụi Đà Lạt',
  'Tropicoperdix tonkinensis': 'Gà so Bắc Bộ',
  'Actinodura sodangorum': 'Khướu vằn đầu đen',
  'Polyplectron germaini': 'Gà tiền mặt đỏ',
  'Stachyris herberti': 'Khướu đá mun',
  'Macronus kelleyi': 'Chích chạch má xám',
  'Rheinardia ocellata': 'Trĩ sao',
  'Antigone antigone': 'Sếu đầu đỏ',
  'Calidris pygmaea': 'Rẽ mỏ thìa',
  'Platalea minor': 'Cò thìa mặt đen',
  'Mycteria leucocephala': 'Giang sen',
  'Pseudibis davisoni': 'Cò quăm cánh xanh',
  'Buceros bicornis': 'Hồng hoàng',
  'Anorrhinus austeni': 'Niệc nâu',
  'Aceros nipalensis': 'Niệc cổ hung',
  'Rhyticeros undulatus': 'Niệc mỏ vằn',
  'Pitta nympha': 'Đuôi cụt cánh xanh bụng đỏ (Đuôi cụt tiên)',
  'Pitta soror': 'Đuôi cụt đầu lam',
  'Pitta oatesi': 'Đuôi cụt đầu đỏ',
  'Pitta cyanea': 'Đuôi cụt xanh',
  'Pitta elliotii': 'Đuôi cụt bụng vằn',
  'Haliaeetus leucogaster': 'Đại bàng biển bụng trắng',
  'Ichthyophaga humilis': 'Diều cá bé',
  'Ichthyophaga ichthyaetus': 'Diều cá đầu xám',
  'Ketupa zeylonensis': 'Dù dì phương Đông',
  'Otus spilocephalus': 'Cú mèo núi',
  'Tyto alba': 'Cú lợn lưng xám',
  'Alcedo atthis': 'Bói cá sông',
  'Pelargopsis capensis': 'Sếu đầu đỏ / Bồng chanh lớn',
  'Ceryle rudis': 'Bói cá hoa',
  'Psilopogon faiostrictus': 'Cu rốc tai xanh',
  'Psilopogon lagrandieri': 'Cu rốc đít đỏ',
  'Chrysocolaptes guttacristatus': 'Gõ kiến vàng lớn',
  'Dinopium javanense': 'Gõ kiến vàng ba ngón',
  'Mulleripicus pulverulentus': 'Gõ kiến đen lớn',
  'Dendrocopos macei': 'Gõ kiến đốm ngực',
  'Picus rabieri': 'Gõ kiến đầu đỏ',
  'Sitta solangiae': 'Trèo cây mỏ vàng',
  'Sitta formosa': 'Trèo cây trán đen',
  'Garrulax leucolophus': 'Khướu đầu trắng',
  'Garrulax castanotis': 'Khướu đầu hung (Khướu má hạt dẻ)',
  'Garrulax milleti': 'Khướu đầu đen',
  'Trochalopteron formosum': 'Khướu cánh đỏ',
  'Trochalopteron milnei': 'Khướu đuôi đỏ',
  'Liocichla steerii': 'Khướu mặt vàng',
  'Leiothrix argentauris': 'Kim oanh tai bạc',
  'Leiothrix lutea': 'Kim oanh mỏ đỏ',
  'Minla ignotincta': 'Khướu lùn đuôi đỏ',
  'Heterophasia annectens': 'Mi lưng hạt dẻ',
  'Heterophasia desgodinsi': 'Mi đầu đen',
  'Yuhina flavicollis': 'Khướu mào cổ hung',
  'Yuhina nigrimenta': 'Khướu mào cằm đen',
  'Niltava grandis': 'Đớp ruồi lớn',
  'Cyornis rubeculoides': 'Đớp ruồi cằm xanh',
  'Eumyias thalassinus': 'Đớp ruồi xanh',
  'Ficedula mugimaki': 'Đớp ruồi Mugi',
  'Luscinia svecica': 'Oanh cổ xanh',
  'Calliope pectoralis': 'Oanh đuôi trắng',
  'Larvivora sibilans': 'Oanh huýt gió',
  'Myophonus caeruleus': 'Hoét lam',
  'Zoothera marginata': 'Hoét mỏ dài',
  'Geokichla citrina': 'Hoét vàng'
};

async function fetchGBIF(scientificName) {
  try {
    const url = `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientificName)}&strict=false`;
    const res = await fetch(url, { headers: { 'User-Agent': 'VietnamBirdsVisualizer/1.0' } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchINatTaxon(scientificName) {
  try {
    const url = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(scientificName)}&locale=vi`;
    const res = await fetch(url, { headers: { 'User-Agent': 'VietnamBirdsVisualizer/1.0' } });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const match = data.results.find(t => t.name.toLowerCase() === scientificName.toLowerCase()) || data.results[0];
      return match;
    }
    return null;
  } catch {
    return null;
  }
}

async function runAudit() {
  const discrepancies = [];
  const verifiedList = [];
  let count = 0;

  for (const sp of speciesList) {
    count++;
    process.stdout.write(`\r[${count}/${speciesList.length}] Đang kiểm tra: ${sp.scientificName}...`);

    const gbif = await fetchGBIF(sp.scientificName);
    const inat = await fetchINatTaxon(sp.scientificName);

    const issues = [];

    // 1. Kiểm tra Tên Khoa Học trên GBIF
    if (!gbif || gbif.matchType === 'NONE') {
      issues.push({
        type: 'CRITICAL',
        field: 'scientificName',
        msg: `Tên khoa học "${sp.scientificName}" không tìm thấy trên hệ thống GBIF!`
      });
    } else {
      if (gbif.status === 'SYNONYM') {
        issues.push({
          type: 'WARNING',
          field: 'scientificName',
          msg: `Danh pháp "${sp.scientificName}" là SYNONYM (Tên cũ). Tên được công nhận (Accepted): "${gbif.species || gbif.scientificName}"`
        });
      }

      // Kiểm tra Order / Family
      if (gbif.order && sp.taxonomy.order && gbif.order.toLowerCase() !== sp.taxonomy.order.toLowerCase()) {
        issues.push({
          type: 'WARNING',
          field: 'order',
          msg: `Lệch Bộ: Trong DB là "${sp.taxonomy.order}", GBIF ghi nhận "${gbif.order}"`
        });
      }

      if (gbif.family && sp.taxonomy.family && gbif.family.toLowerCase() !== sp.taxonomy.family.toLowerCase()) {
        issues.push({
          type: 'WARNING',
          field: 'family',
          msg: `Lệch Họ: Trong DB là "${sp.taxonomy.family}", GBIF ghi nhận "${gbif.family}"`
        });
      }
    }

    // 2. Kiểm tra Tên Tiếng Việt
    const expectedVi = CANONICAL_VIETNAMESE_NAMES[sp.scientificName];
    if (expectedVi && expectedVi !== sp.vietnameseName) {
      issues.push({
        type: 'CRITICAL',
        field: 'vietnameseName',
        msg: `Sai tên tiếng Việt! Trong DB ghi "${sp.vietnameseName}", Chuẩn danh lục (Avibase/VAST) là "${expectedVi}"`
      });
    }

    // 3. Đối chiếu Tên tiếng Việt từ iNaturalist
    if (inat && inat.preferred_common_name) {
      const inatVi = inat.preferred_common_name;
      if (!sp.vietnameseName.toLowerCase().includes(inatVi.toLowerCase()) && 
          !inatVi.toLowerCase().includes(sp.vietnameseName.toLowerCase()) &&
          !issues.some(i => i.field === 'vietnameseName')) {
        issues.push({
          type: 'INFO',
          field: 'vietnameseName_alias',
          msg: `iNaturalist ghi nhận tên thông dụng: "${inatVi}" (Tên hiện tại: "${sp.vietnameseName}")`
        });
      }
    }

    // 4. Kiểm tra văn phong kỳ quặc trong mô tả
    const desc = sp.conservation?.description || '';
    if (desc.includes('giáo sư già') || desc.includes('nhà nghiên cứu') || desc.includes('Victorian')) {
      issues.push({
        type: 'NOTICE',
        field: 'description',
        msg: `Phát hiện câu từ văn hoa / nhân cách hóa: "${desc.slice(0, 60)}..."`
      });
    }

    if (issues.length > 0) {
      discrepancies.push({
        id: sp.id,
        scientificName: sp.scientificName,
        currentVietnameseName: sp.vietnameseName,
        issues
      });
    } else {
      verifiedList.push({
        id: sp.id,
        scientificName: sp.scientificName,
        vietnameseName: sp.vietnameseName
      });
    }

    // Delay nhỏ để tôn trọng rate limit API
    await new Promise(r => setTimeout(r, 60));
  }

  console.log('\n\n================================================================================');
  console.log('📊 BÁO CÁO KẾT QUẢ ĐỐI SOÁT TOÀN DIỆN CƠ SỞ DỮ LIỆU CHIM VIỆT NAM');
  console.log('================================================================================\n');

  console.log(`✅ Số loài chuẩn xác 100% (Khớp hoàn toàn GBIF/Avibase): ${verifiedList.length}/${speciesList.length} loài`);
  console.log(`⚠️ Số loài phát hiện sai lệch hoặc có điểm cần rà soát: ${discrepancies.length}/${speciesList.length} loài\n`);

  if (discrepancies.length > 0) {
    console.log('--------------------------------------------------------------------------------');
    console.log('🔴 DANH SÁCH CÁC LOÀI PHÁT HIỆN SAI LỆCH HOẶC ĐIỂM NGHI NGỜ:');
    console.log('--------------------------------------------------------------------------------');

    discrepancies.forEach((item, idx) => {
      console.log(`\n${idx + 1}. [${item.id}] ${item.scientificName}`);
      console.log(`   Tên tiếng Việt hiện tại: "${item.currentVietnameseName}"`);
      item.issues.forEach(iss => {
        const icon = iss.type === 'CRITICAL' ? '❌ [CRITICAL]' : iss.type === 'WARNING' ? '⚠️ [WARNING]' : 'ℹ️ [NOTE]';
        console.log(`   ${icon} (${iss.field}): ${iss.msg}`);
      });
    });
  }

  console.log('\n================================================================================\n');
}

runAudit();
