/**
 * scripts/data-pipeline/add-species.js
 * 
 * LỆNH THỰC THI TOÀN DIỆN (ALL-IN-ONE SAFE PIPELINE):
 * Cách dùng: node scripts/data-pipeline/add-species.js --name="Antigone antigone"
 * 
 * Luồng thực thi:
 * 1. GIAI ĐOẠN 1: Thu thập dữ liệu từ các API (GBIF, iNaturalist, Xeno-canto...) -> Lưu draft.
 * 2. GIAI ĐOẠN 2: Hàng rào kiểm toán chất lượng (Tên tiếng Việt, Ảnh thực địa, Liên kết học thuật).
 * 3. GIAI ĐOẠN 3: Nạp nguyên tử vào Database & Chạy kiểm thử hồi quy.
 * 
 * Nếu FAIL ở bất kỳ giai đoạn nào: HỦY BỎ NGAY LẬP TỨC, KHÔNG ẢNH HƯỞNG DATABASE!
 */

import { harvestSpeciesData } from './harvest-species.js';
import { verifyCandidateSpecies } from './verify-species-candidate.js';
import { commitCandidateSpecies } from './commit-species-candidate.js';

async function main() {
  const targetArg = process.argv.find(arg => arg.startsWith('--name='));
  if (!targetArg) {
    console.error(`❌ Vui lòng cung cấp tên khoa học của loài cần nạp.`);
    console.error(`Ví dụ: npm run species:add -- --name="Antigone antigone"`);
    process.exit(1);
  }

  const scientificName = targetArg.replace('--name=', '').replace(/^["']|["']$/g, '').trim();

  console.log(`\n======================================================================`);
  console.log(`🦅 BẮT ĐẦU QUY TRÌNH NẠP LOÀI MỚI TOÀN DIỆN: "${scientificName}"`);
  console.log(`======================================================================`);

  // BƯỚC 1: THU THẬP DỮ LIỆU TỪ CÁC API VÀO VÙNG ĐỆM
  console.log(`\n▶️ BƯỚC 1: THU THẬP DỮ LIỆU TỪ CÁC API...`);
  const draft = await harvestSpeciesData(scientificName);

  // BƯỚC 2: HÀNG RÀO KIỂM ĐỊNH CHỐT CHẶN (GATEKEEPER)
  console.log(`\n▶️ BƯỚC 2: HÀNG RÀO KIỂM ĐỊNH CHẤT LƯỢNG (5 BÀI TEST)...`);
  const verifyResult = await verifyCandidateSpecies(draft);

  if (!verifyResult.isPassed) {
    console.log(`\n⛔ QUY TRÌNH BỊ CHẶN Ở BƯỚC 2: Dữ liệu không đạt chuẩn kiểm định.`);
    console.log(`🛡️  Database hoàn toàn được bảo vệ nguyên vẹn.`);
    process.exit(1);
  }

  // BƯỚC 3: COMMIT AN TOÀN VÀO DATABASE & TEST HỒI QUY
  console.log(`\n▶️ BƯỚC 3: NẠP VÀO DATABASE & KIỂM THỬ HỒI QUY...`);
  await commitCandidateSpecies();
}

main().catch(err => {
  console.error('\n💥 Đã xảy ra sự cố trong quy trình nạp loài:', err.message);
  process.exit(1);
});
