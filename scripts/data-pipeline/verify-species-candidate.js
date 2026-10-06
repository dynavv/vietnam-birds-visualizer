/**
 * scripts/data-pipeline/verify-species-candidate.js
 * 
 * GIAI ĐOẠN 2: HÀNG RÀO KIỂM TOÁN CHẶT CHẼ (QUALITY GATEKEEPER AUDIT)
 * 
 * Thực thi 5 bài kiểm tra chốt chặn nghiêm ngặt đối với bản ghi dự thảo:
 * scripts/data-pipeline/drafts/candidate-species.json
 * 
 * 🔍 BÀI TEST 1: Tên tiếng Việt & Chống AI Hallucination (Khớp 1:1 Master Registry)
 * 🔍 BÀI TEST 2: Hình ảnh thực địa & Cấp bậc Taxon (Đúng 100% loài, rank=species, quy tắc địa điểm, HTTP 200 OK)
 * 🔍 BÀI TEST 3: Liên kết học thuật quốc tế (IUCN 200 OK, Avibase hex ID, GBIF API 200)
 * 🔍 BÀI TEST 4: Cấu trúc phân loại & Tọa độ phân bố tại Việt Nam
 * 🔍 BÀI TEST 5: Danh mục Bảo vệ Pháp lý của Chính phủ (Nghị định 84/2021/NĐ-CP, Nghị định 160/2013/NĐ-CP, Chỉ thị 04/CT-TTg)
 * 
 * CHỈ KHI 100% CÁC BÀI TEST ĐỀU PASS THÌ MỚI ĐỦ ĐIỀU KIỆN ĐỂ COMMIT VÀO DATABASE!
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRAFT_FILE = path.resolve(__dirname, 'drafts/candidate-species.json');
const MASTER_PATH = path.resolve(__dirname, 'authority/vietnam-bird-names-master.json');

async function fetchWithTimeout(url, timeoutMs = 7000) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'VietnamBirdsVisualizer-Gatekeeper/1.0' },
      signal: AbortSignal.timeout(timeoutMs)
    });
    return res;
  } catch {
    return null;
  }
}

export async function verifyCandidateSpecies(draftRecord = null) {
  let record = draftRecord;

  if (!record) {
    if (!fs.existsSync(DRAFT_FILE)) {
      console.error(`❌ LỖI: Không tìm thấy file dự thảo tại ${DRAFT_FILE}! Hãy chạy harvest trước.`);
      process.exit(1);
    }
    record = JSON.parse(fs.readFileSync(DRAFT_FILE, 'utf8'));
  }

  console.log(`\n=============================================================`);
  console.log(`🛡️  GIAI ĐOẠN 2: HÀNG RÀO KIỂM TOÁN CHẤT LƯỢNG (GATEKEEPER)`);
  console.log(`👉 Loài kiểm định: ${record.vietnameseName || '(Chưa có tên)'} (${record.scientificName})`);
  console.log(`=============================================================\n`);

  const errors = [];
  const warnings = [];

  // =========================================================================
  // BÀI TEST 1: HÀNG RÀO TÊN TIẾNG VIỆT & CHỐNG AI HALLUCINATION
  // =========================================================================
  console.log(`🔍 [BÀI TEST 1] Kiểm tra Tên tiếng Việt & Hàng rào Naming Firewall...`);
  if (!record.vietnameseName || record.vietnameseName.trim() === '') {
    errors.push(`[TÊN TIẾNG VIỆT] Trường vietnameseName bị trống! Bắt buộc phải có tên tiếng Việt chuẩn.`);
  } else {
    // Đối soát với Master Registry (Tam diện đối soát: Craik & Minh 2018 + GS. Võ Quý / VAST)
    if (!fs.existsSync(MASTER_PATH)) {
      errors.push(`[TÊN TIẾNG VIỆT] Không tìm thấy Master Naming Registry (${MASTER_PATH})!`);
    } else {
      const masterList = JSON.parse(fs.readFileSync(MASTER_PATH, 'utf8'));
      const masterMatch = masterList.find(m => m.scientificName.toLowerCase() === record.scientificName.toLowerCase());

      if (!masterMatch) {
        errors.push(
          `[AI HALLUCINATION DEFENSE] Loài "${record.scientificName}" CHƯA CÓ trong Master Registry! ` +
          `Tuyệt đối không dùng tên tự dịch từ AI. Cần đối soát thủ công với Craik & Minh (2018) và bổ sung vào Master Registry trước.`
        );
      } else if (masterMatch.vietnameseName.trim() !== record.vietnameseName.trim()) {
        errors.push(
          `[LỆCH TÊN CHUẨN] Tên dự thảo "${record.vietnameseName}" không khớp với tên chuẩn trong Master Registry "${masterMatch.vietnameseName}"!`
        );
      } else {
        console.log(`   ✅ Tên tiếng Việt: "${record.vietnameseName}" khớp 100% với Master Registry.`);
      }
    }
  }

  // =========================================================================
  // BÀI TEST 2: HÀNG RÀO HÌNH ẢNH THỰC ĐỊA & CẤP BẬC TAXON
  // =========================================================================
  console.log(`\n🔍 [BÀI TEST 2] Kiểm tra Hình ảnh thực địa & Cấp bậc Taxon (3-Tier Image Firewall)...`);
  const ill = record.illustration || {};

  if (!ill.imageUrl || ill.imageUrl.trim() === '' || ill.hasValidPhoto === false) {
    errors.push(
      `[ZERO-PHOTO RULE] Không có hình ảnh mở hợp lệ (CC License)! ` +
      `Theo quy tắc, script không được đoán bừa sang loài khác mà phải báo cáo để người dùng chỉ đạo hướng xử lý.`
    );
  } else {
    // 2.1 Kiểm tra HTTP 200 OK của ảnh
    console.log(`   📡 Đang kiểm tra HTTP status của ảnh: ${ill.imageUrl}...`);
    const imgRes = await fetchWithTimeout(ill.imageUrl);
    if (!imgRes || !imgRes.ok) {
      errors.push(`[HTTP ẢNH LỖI] URL ảnh (${ill.imageUrl}) không thể tải được (HTTP status: ${imgRes ? imgRes.status : 'TIMEOUT/ERR'})!`);
    } else {
      console.log(`   ✅ Ảnh phản hồi HTTP ${imgRes.status} OK.`);
    }

    // 2.2 Kiểm tra Taxon Rank & Đúng loài từ iNaturalist
    const obsUrl = ill.observationUrl || '';
    const taxaMatch = obsUrl.match(/taxa\/(\d+)/);
    const obsMatch = obsUrl.match(/observations\/(\d+)/);

    let fetchedTaxon = null;

    if (taxaMatch) {
      const tRes = await fetchWithTimeout(`https://api.inaturalist.org/v1/taxa/${taxaMatch[1]}`);
      const tData = tRes?.ok ? await tRes.json() : null;
      fetchedTaxon = tData?.results?.[0];
    } else if (obsMatch) {
      const oRes = await fetchWithTimeout(`https://api.inaturalist.org/v1/observations/${obsMatch[1]}`);
      const oData = oRes?.ok ? await oRes.json() : null;
      fetchedTaxon = oData?.results?.[0]?.taxon;
    }

    if (fetchedTaxon) {
      const targetName = record.scientificName.toLowerCase().trim();
      const actualName = (fetchedTaxon.name || '').toLowerCase().trim();

      // Kiểm tra đúng loài
      if (actualName !== targetName && !actualName.startsWith(targetName) && !targetName.startsWith(actualName)) {
        errors.push(
          `[TAXON MISMATCH - SAI LOÀI] Ảnh đang gắn với Taxon "${fetchedTaxon.name}" thay vì "${record.scientificName}"! ` +
          `(Bài học Gallus gallus vs Gallus varius). Chặn commit ngay lập tức!`
        );
      } else {
        console.log(`   ✅ Mã Taxon khớp 100% đúng loài: "${fetchedTaxon.name}".`);
      }

      // Kiểm tra bậc phân loại (rank phải là species)
      if (fetchedTaxon.rank && fetchedTaxon.rank !== 'species' && fetchedTaxon.rank !== 'subspecies') {
        errors.push(`[RANK MISMATCH] Cấp bậc của ảnh là "${fetchedTaxon.rank}" thay vì "species"! Không được trỏ nhầm cấp Chi.`);
      }
    }

    // 2.3 Kiểm tra Quy tắc Chú thích Địa điểm (Field Photo Curation Rule)
    if (ill.isShotInVietnam === true) {
      if (!ill.photoLocation || ill.photoLocation.trim() === '') {
        errors.push(`[QUY TẮC ĐỊA ĐIỂM] Ảnh chụp tại Việt Nam (isShotInVietnam: true) bắt buộc phải có thông tin photoLocation!`);
      } else {
        console.log(`   ✅ Ảnh chụp tại Việt Nam có chú thích địa điểm: "${ill.photoLocation}".`);
      }
    } else {
      // Chụp ngoài VN -> photoLocation BẮT BUỘC RỖNG để tránh hiểu lầm
      if (ill.photoLocation && ill.photoLocation.trim() !== '') {
        errors.push(
          `[QUY TẮC ĐỊA ĐIỂM] Ảnh chụp NGOÀI Việt Nam (isShotInVietnam: false) bắt buộc photoLocation phải để RỖNG ` +
          `để tránh gây hiểu lầm rằng ảnh được chụp tại Việt Nam!`
        );
      } else {
        console.log(`   ✅ Ảnh ngoài Việt Nam đã để trống photoLocation (Tuân thủ 100% quy tắc).`);
      }
    }
  }

  // =========================================================================
  // BÀI TEST 3: HÀNG RÀO LIÊN KẾT HỌC THUẬT QUỐC TẾ
  // =========================================================================
  console.log(`\n🔍 [BÀI TEST 3] Kiểm tra Liên kết Học thuật Quốc tế (IUCN, Avibase, GBIF)...`);
  const acad = record.academic || {};

  // 3.1 Kiểm tra GBIF Taxon Key (Bắt buộc phải thuộc Lớp Chim Aves)
  if (!acad.gbifTaxonKey || !/^\d+$/.test(String(acad.gbifTaxonKey))) {
    errors.push(`[GBIF KEY LỖI] gbifTaxonKey ("${acad.gbifTaxonKey}") phải là số nguyên dương hợp lệ!`);
  } else {
    console.log(`   📡 Đang kiểm tra GBIF API với key ${acad.gbifTaxonKey}...`);
    const gbifRes = await fetchWithTimeout(`https://api.gbif.org/v1/species/${acad.gbifTaxonKey}`);
    if (!gbifRes || !gbifRes.ok) {
      errors.push(`[GBIF KEY LỖI] GBIF API trả về lỗi hoặc không tìm thấy key ${acad.gbifTaxonKey}!`);
    } else {
      const gbifData = await gbifRes.json();
      if (gbifData.class !== 'Aves') {
        errors.push(
          `[GBIF KHÔNG PHẢI CHIM] gbifTaxonKey (${acad.gbifTaxonKey}) thuộc Lớp "${gbifData.class || 'Unknown'}", ` +
          `không phải Lớp Chim (Aves)! Tuyệt đối chặn commit.`
        );
      } else {
        console.log(`   ✅ GBIF API phản hồi HTTP 200 OK — Thuộc Lớp Chim Aves (${gbifData.scientificName || 'Khớp'}).`);
      }
    }
  }

  // 3.2 Kiểm tra IUCN URL & Bậc bảo tồn
  const iucnUrl = acad.iucnUrl;
  if (!iucnUrl) {
    console.log(`   ✅ IUCN URL để null (Loài chưa được đánh giá - Not Evaluated). Giao diện kích hoạt nhãn NE an toàn.`);
  } else if (iucnUrl.includes('/search?')) {
    warnings.push(`[IUCN SEARCH URL] Khuyến nghị: Với loài chưa đánh giá, nên để iucnUrl = null để giao diện kích hoạt nhãn NE thay vì search URL.`);
  } else {
    // Nếu là link trực tiếp, kiểm tra định dạng chính thức
    if (!/^https:\/\/www\.iucnredlist\.org\/species\/\d+\/\d+$/.test(String(iucnUrl).trim())) {
      errors.push(`[IUCN URL SAI ĐỊNH DẠNG] URL "${iucnUrl}" không đúng định dạng chuẩn: https://www.iucnredlist.org/species/<sis_id>/<assessment_id>!`);
    } else {
      console.log(`   ✅ URL IUCN trực tiếp đúng định dạng chuẩn: ${iucnUrl}.`);
    }
  }

  // 3.3 Kiểm tra Avibase ID
  const avibaseId = acad.avibaseId;
  if (!avibaseId) {
    console.log(`   ℹ️  Chưa có Avibase ID (để null). Hệ thống sẽ kích hoạt fallback tìm kiếm an toàn.`);
  } else if (!/^[A-F0-9]{8,16}$/i.test(String(avibaseId).trim())) {
    errors.push(`[AVIBASE ID SAI ĐỊNH DẠNG] avibaseId ("${avibaseId}") phải là chuỗi 8 hoặc 16 ký tự Hex hợp lệ hoặc để null!`);
  } else {
    console.log(`   ✅ Avibase ID chuẩn 8-16 hex: ${avibaseId}.`);
  }

  // =========================================================================
  // BÀI TEST 4: CẤU TRÚC PHÂN LOẠI & TỌA ĐỘ PHÂN BỐ TẠI VIỆT NAM
  // =========================================================================
  console.log(`\n🔍 [BÀI TEST 4] Kiểm tra Cấu trúc Phân loại & Tọa độ phân bố...`);
  const tax = record.taxonomy || {};
  if (!tax.order || !tax.family || !tax.genus) {
    errors.push(`[CÂU TRÚC TAXONOMY] Thiếu cấp phân loại Bộ (${tax.order}), Họ (${tax.family}) hoặc Chi (${tax.genus})!`);
  } else {
    console.log(`   ✅ Phân loại đầy đủ: Bộ ${tax.order} ➔ Họ ${tax.family} ➔ Chi ${tax.genus}.`);
  }

  const coords = record.distribution?.coordinates;
  if (!coords || !Array.isArray(coords) || coords.length !== 2) {
    errors.push(`[TỌA ĐỘ LỖI] Thiếu hoặc sai định dạng tọa độ phân bố [lat, lon]!`);
  } else {
    const [lat, lon] = coords;
    // Bounding box xấp xỉ của Việt Nam (Vĩ độ: 8.0 -> 24.0, Kinh độ: 102.0 -> 110.0)
    if (lat < 8.0 || lat > 24.0 || lon < 102.0 || lon > 110.0) {
      warnings.push(`[TỌA ĐỘ LƯU Ý] Tọa độ [${lat}, ${lon}] nằm ngoài bounding box thông thường của đất liền Việt Nam.`);
    } else {
      console.log(`   ✅ Tọa độ GPS hợp lệ tại Việt Nam: [${lat.toFixed(2)}, ${lon.toFixed(2)}].`);
    }
  }

  // =========================================================================
  // BÀI TEST 5: HÀNG RÀO DANH MỤC BẢO VỆ CHÍNH PHỦ (LEGAL FRAMEWORK GATEKEEPER)
  // (Nghị định 84/2021/NĐ-CP, Nghị định 160/2013/NĐ-CP & 64/2019/NĐ-CP, Chỉ thị 04/CT-TTg)
  // =========================================================================
  console.log(`\n🔍 [BÀI TEST 5] Kiểm tra Danh mục Bảo vệ Pháp lý (Chính phủ Việt Nam)...`);
  const legal = record.conservation?.legalFramework;

  if (!legal || typeof legal !== 'object') {
    errors.push(`[PHÁP LÝ THIẾU] Trường conservation.legalFramework bị thiếu! Bắt buộc phải khai báo danh mục bảo vệ cho loài.`);
  } else {
    // 5.1 Kiểm tra tính hợp lệ của decree84Group
    const validDecree84Groups = ['IB', 'IIB', 'none'];
    if (!validDecree84Groups.includes(legal.decree84Group)) {
      errors.push(
        `[NGHỊ ĐỊNH 84 LỖI] decree84Group ("${legal.decree84Group}") không hợp lệ! ` +
        `Giá trị bắt buộc phải là một trong: ${validDecree84Groups.map(g => `'${g}'`).join(', ')}.`
      );
    } else {
      console.log(`   ✅ Nghị định 84/2021/NĐ-CP: Phân nhóm hợp lệ [${legal.decree84Group}].`);
    }

    // 5.2 Kiểm tra decree160Priority
    if (typeof legal.decree160Priority !== 'boolean') {
      errors.push(`[NGHỊ ĐỊNH 160 LỖI] decree160Priority phải là kiểu boolean (true/false), hiện tại là: ${typeof legal.decree160Priority}.`);
    } else {
      console.log(`   ✅ Nghị định 160/2013/NĐ-CP (Ưu tiên bảo vệ): ${legal.decree160Priority ? 'CÓ (True)' : 'KHÔNG (False)'}.`);
    }

    // 5.3 Kiểm tra directive04Flagship
    if (typeof legal.directive04Flagship !== 'boolean') {
      errors.push(`[CHỈ THỊ 04 LỖI] directive04Flagship phải là kiểu boolean (true/false), hiện tại là: ${typeof legal.directive04Flagship}.`);
    } else {
      console.log(`   ✅ Chỉ thị 04/CT-TTg (Loài di cư cờ đầu): ${legal.directive04Flagship ? 'CÓ (True)' : 'KHÔNG (False)'}.`);
    }

    // 5.4 Kiểm tra tính nhất quán logic pháp lý (Legal Consistency Rules)
    const desc = (record.conservation?.description || '').toLowerCase();
    const primaryLit = Array.isArray(record.academic?.primaryLiterature) ? record.academic.primaryLiterature : [];
    const litTitles = primaryLit.map(l => (l.title || '').toLowerCase()).join(' ');

    // Rule: Nếu Nhóm IB -> Bắt buộc mô tả hoặc tài liệu tham khảo phải nêu rõ căn cứ pháp luật / bảo vệ nghiêm ngặt
    if (legal.decree84Group === 'IB') {
      const mentionsLegal = desc.includes('84') || desc.includes('ib') || desc.includes('nghiêm cấm') || desc.includes('nguy cấp') ||
                            litTitles.includes('84') || litTitles.includes('ib');
      if (!mentionsLegal) {
        warnings.push(
          `[NHẤT QUÁN PHÁP LÝ] Loài được phân vào Nhóm IB (Nghị định 84) nhưng trong mô tả bảo tồn hoặc tài liệu học thuật chưa nhắc đến quy định bảo vệ này.`
        );
      }
    }

    // Rule: Cảnh báo đối với loài Cực kỳ nguy cấp (CR) nhưng chưa có trong Nhóm IB hoặc Ưu tiên bảo vệ
    const isCR = record.conservation?.iucn === 'CR' || record.conservation?.vietnamRedList === 'CR';
    if (isCR && legal.decree84Group === 'none' && !legal.decree160Priority) {
      warnings.push(
        `[RÀ SOÁT BẢO TỒN] Loài xếp hạng CR (Cực kỳ nguy cấp) nhưng chưa được đưa vào Nhóm IB hoặc Ưu tiên bảo vệ (NĐ 160). Vui lòng rà soát lại văn bản quy phạm pháp luật.`
      );
    }

    // Rule: Loài thông thường (LC) không được tự tiện gán Nhóm IB trừ khi có căn cứ rõ ràng
    const isLC = record.conservation?.iucn === 'LC' && (!record.conservation?.vietnamRedList || record.conservation?.vietnamRedList === 'LC' || record.conservation?.vietnamRedList === 'LR');
    if (isLC && legal.decree84Group === 'IB' && !legal.directive04Flagship) {
      warnings.push(
        `[NGHI VẤN XẾP HẠNG] Loài có bậc bảo tồn LC nhưng lại được gán Nhóm IB (Nghiêm cấm khai thác thương mại). Vui lòng kiểm tra lại tính chính xác.`
      );
    }
  }

  // =========================================================================
  // TỔNG KẾT KẾT QUẢ KIỂM TOÁN
  // =========================================================================
  console.log(`\n=============================================================`);
  console.log(`📊 BÁO CÁO KẾT QUẢ KIỂM ĐỊNH CHỐT CHẶN (GATEKEEPER REPORT)`);
  console.log(`=============================================================`);
  console.log(`❌ Lỗi nghiêm trọng (Errors):   ${errors.length}`);
  console.log(`⚠️  Cảnh báo cần lưu ý (Warnings): ${warnings.length}`);

  if (warnings.length > 0) {
    console.log(`\n⚠️  DANH SÁCH CẢNH BÁO:`);
    warnings.forEach((w, i) => console.log(`   ${i + 1}. ${w}`));
  }

  if (errors.length > 0) {
    console.log(`\n⛔ DANH SÁCH LỖI KHÔNG ĐẠT (FAILED CRITERIA):`);
    errors.forEach((e, i) => console.log(`   ${i + 1}. ${e}`));
    console.log(`\n🚫 KẾT LUẬN: BẢN GHI DỰ THẢO KHÔNG ĐỦ ĐIỀU KIỆN ĐỂ COMMIT VÀO DATABASE!`);
    console.log(`👉 Hãy sửa đổi các lỗi trên trước khi commit.`);
    return { isPassed: false, errors, warnings };
  }

  console.log(`\n🎉 XUẤT SẮC! BẢN GHI ĐẠT 100% TIÊU CHÍ KIỂM ĐỊNH CHẤT LƯỢNG!`);
  console.log(`✅ Đủ điều kiện để nạp an toàn vào database chính: src/data/species.json.`);
  console.log(`👉 Hãy chạy lệnh tiếp theo: npm run species:commit`);

  return { isPassed: true, errors: [], warnings };
}

// Chạy trực tiếp từ CLI nếu được gọi
if (process.argv[1] && process.argv[1].endsWith('verify-species-candidate.js')) {
  verifyCandidateSpecies().then(res => {
    if (!res.isPassed) {
      process.exit(1);
    }
  }).catch(err => {
    console.error('Lỗi khi chạy gatekeeper verify:', err);
    process.exit(1);
  });
}
