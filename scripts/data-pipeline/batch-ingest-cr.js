/**
 * scripts/data-pipeline/batch-ingest-cr.js
 * 
 * BATCH RUNNER NẠP 7 LOÀI CHIM CỰC KỲ NGUY CẤP (CR) VÀO HỆ THỐNG
 * 
 * Thực thi tuần tự từng loài theo đúng quy trình 2 giai đoạn:
 * 1. Đăng ký thông tin thẩm quyền vào vietnam-bird-names-master.json
 * 2. Thu thập dữ liệu API đa nguồn (harvestSpeciesData)
 * 3. Hàng rào kiểm toán chất lượng 4 lớp (verifyCandidateSpecies)
 * 4. Nạp nguyên tử & kiểm thử hồi quy tự động rollback (commitCandidateSpecies)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { harvestSpeciesData } from './harvest-species.js';
import { verifyCandidateSpecies } from './verify-species-candidate.js';
import { commitCandidateSpecies } from './commit-species-candidate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MASTER_PATH = path.resolve(__dirname, 'authority/vietnam-bird-names-master.json');

const CR_SPECIES_ENTRIES = [
  {
    id: "pseudibis-gigantea",
    scientificName: "Pseudibis gigantea",
    vietnameseName: "Cò quăm lớn",
    englishName: "Giant Ibis",
    aliases: ["Cò quắm lớn", "Cò quăm Đông Dương"],
    isEndemic: false,
    endemicScope: "none",
    order: "Pelecaniformes",
    orderVietnamese: "Bộ Bồ nông",
    family: "Threskiornithidae",
    familyVietnamese: "Họ Cò quăm",
    authority: "VAST (GS. Võ Quý) / Craik & Minh 2018 / Sách Đỏ Việt Nam 2007 (CR) / Nghị định 84/2021/NĐ-CP (Nhóm IB)",
    gbifTaxonKey: "2480779",
    avibaseId: "F12CC0610AA89673",
    iucn: "CR",
    vietnamRedList: "CR",
    legalFramework: {
      decree84Group: "IB",
      decree160Priority: true,
      directive04Flagship: false
    },
    conservationDescription: "Loài Cực kỳ nguy cấp (CR) trong Sách Đỏ Việt Nam và Danh mục động vật rừng nguy cấp, quý, hiếm (Nghị định 84/2021/NĐ-CP Nhóm IB). Từng ghi nhận tại vùng đất ngập nước Nam Bộ và Tây Nguyên, hiện gần như tuyệt chủng ngoài tự nhiên tại Việt Nam.",
    morphologyOverview: "Loài cò quăm lớn nhất thế giới với chiều dài thân lên tới 102-106 cm, bộ lông màu nâu sẫm ánh xám đục, đầu và cổ trên trần trụi với các nếp gấp da trần xám đen.",
    diagnosticFeatures: [
      { part: "Đầu và cổ", description: "Đầu và phần trên cổ trần hoàn toàn, da màu xám xỉn với các vòng gấp ngang sẫm màu đặc trưng phía sau gáy." },
      { part: "Bộ lông và cánh", description: "Lông thân màu nâu xám sẫm, lông bao cánh trên có vệt xám bạc sáng tạo độ tương phản rõ rệt khi bay." }
    ],
    ebaRegion: "cochinchina",
    elevation: "Dưới 200m",
    habitats: ["Vùng đầm lầy trảng cỏ ngập nước", "Rừng khộp rụng lá theo mùa xen kẽ hồ nước tự nhiên"],
    locations: ["Khu bảo tồn thiên nhiên Yok Đôn, Đắk Lắk"],
    coordinates: [13.15, 107.60]
  },
  {
    id: "sarcogyps-calvus",
    scientificName: "Sarcogyps calvus",
    vietnameseName: "Kền kền đầu đỏ",
    englishName: "Red-headed Vulture",
    aliases: ["Kền kền chúa", "Ó tai"],
    isEndemic: false,
    endemicScope: "none",
    order: "Accipitriformes",
    orderVietnamese: "Bộ Ưng",
    family: "Accipitridae",
    familyVietnamese: "Họ Ưng",
    authority: "VAST (GS. Võ Quý) / Craik & Minh 2018 / Sách Đỏ Việt Nam 2007 (CR) / Nghị định 84/2021/NĐ-CP (Nhóm IB)",
    gbifTaxonKey: "2480717",
    avibaseId: "21D7169D28644CD4",
    iucn: "CR",
    vietnamRedList: "CR",
    legalFramework: {
      decree84Group: "IB",
      decree160Priority: true,
      directive04Flagship: false
    },
    conservationDescription: "Loài Cực kỳ nguy cấp (CR) trong Sách Đỏ Việt Nam và Nghị định 84/2021/NĐ-CP Nhóm IB. Quần thể tại Việt Nam suy giảm nghiêm trọng do mất nguồn thức ăn là thú móng guốc lớn và ngộ độc hóa chất.",
    morphologyOverview: "Loài kền kền cỡ trung bình-lớn (chiều dài 76-86 cm), nổi bật với đầu và cổ trần trụi màu đỏ tươi đến đỏ cam rực rỡ, hai bên cổ có yếm da trần rủ xuống giống hai tai.",
    diagnosticFeatures: [
      { part: "Đầu và tai da", description: "Đầu và cổ không có lông, da màu đỏ tươi nổi bật với hai nếp da trần rủ hai bên cổ tựa vành tai." },
      { part: "Bộ lông", description: "Lông thân chủ đạo màu đen tuyền tương phản với vệt lông tơ trắng muốt ở gốc cổ và hai bên gốc đùi." }
    ],
    ebaRegion: "kontum-plateau",
    elevation: "100 - 800m",
    habitats: ["Rừng khộp rụng lá thưa", "Trảng cây bụi vùng đồi núi thấp"],
    locations: ["Khu vực rừng rụng lá khộp Tây Nguyên"],
    coordinates: [12.90, 107.80]
  },
  {
    id: "gyps-tenuirostris",
    scientificName: "Gyps tenuirostris",
    vietnameseName: "Kền kền mỏ hẹp",
    englishName: "Slender-billed Vulture",
    aliases: [],
    isEndemic: false,
    endemicScope: "none",
    order: "Accipitriformes",
    orderVietnamese: "Bộ Ưng",
    family: "Accipitridae",
    familyVietnamese: "Họ Ưng",
    authority: "VAST (GS. Võ Quý) / Craik & Minh 2018 / Sách Đỏ Việt Nam 2007 (CR) / Nghị định 84/2021/NĐ-CP (Nhóm IB)",
    gbifTaxonKey: "4850076",
    avibaseId: "11324DC80E8BBB9F",
    iucn: "CR",
    vietnamRedList: "CR",
    legalFramework: {
      decree84Group: "IB",
      decree160Priority: true,
      directive04Flagship: false
    },
    conservationDescription: "Loài Cực kỳ nguy cấp (CR) trong Sách Đỏ Việt Nam và Nghị định 84/2021/NĐ-CP Nhóm IB. Trước đây tách ra từ Kền kền Ấn Độ (Gyps indicus), hiện đối mặt nguy cơ tuyệt chủng cao nhất khu vực Đông Dương.",
    morphologyOverview: "Loài kền kền cỡ lớn với cổ dài mảnh mai, mỏ dài và thon hẹp đặc trưng, đầu và cổ trần phủ da nhăn màu xám đen tối màu.",
    diagnosticFeatures: [
      { part: "Mỏ và đầu", description: "Mỏ dài, hẹp và thanh mảnh hơn các loài Gyps khác; đầu và cổ đen nhăn nheo không có lông tơ trắng." },
      { part: "Bộ lông thân", description: "Lông lưng và cánh màu nâu xám xỉn, lông bụng có các vệt sọc nhạt mờ, vòng lông cổ màu nâu xám." }
    ],
    ebaRegion: "kontum-plateau",
    elevation: "100 - 600m",
    habitats: ["Rừng thưa rụng lá lá rộng", "Khu vực đồng cỏ bán tự nhiên"],
    locations: ["Khu bảo tồn thiên nhiên Yok Đôn và vùng đồi núi Tây Nguyên"],
    coordinates: [13.20, 107.75]
  },
  {
    id: "gyps-bengalensis",
    scientificName: "Gyps bengalensis",
    vietnameseName: "Kền kền Bengal",
    englishName: "White-rumped Vulture",
    aliases: ["Kền kền mông trắng", "Kền kền lưng trắng"],
    isEndemic: false,
    endemicScope: "none",
    order: "Accipitriformes",
    orderVietnamese: "Bộ Ưng",
    family: "Accipitridae",
    familyVietnamese: "Họ Ưng",
    authority: "VAST (GS. Võ Quý) / Craik & Minh 2018 / Sách Đỏ Việt Nam 2007 (CR) / Nghị định 84/2021/NĐ-CP (Nhóm IB)",
    gbifTaxonKey: "2480383",
    avibaseId: "FC2346E6EF324F85",
    iucn: "CR",
    vietnamRedList: "CR",
    legalFramework: {
      decree84Group: "IB",
      decree160Priority: true,
      directive04Flagship: false
    },
    conservationDescription: "Loài Cực kỳ nguy cấp (CR) trong Sách Đỏ Việt Nam và Nghị định 84/2021/NĐ-CP Nhóm IB. Từng phân bố rộng khắp miền Nam và miền Trung nhưng hiện đã gần như biến mất hoàn toàn.",
    morphologyOverview: "Loài kền kền có kích thước trung bình trong chi Gyps (dài 75-85 cm), đặc trưng bởi mảng lông trắng muốt ở hông và lưng dưới tương phản sắc nét với thân mình màu đen xám.",
    diagnosticFeatures: [
      { part: "Lưng và hông", description: "Mảng lông trắng tinh nổi bật ở phần lưng dưới và hông, đặc biệt dễ nhận biết khi chim bay lượn trên cao." },
      { part: "Đầu và cổ", description: "Đầu trần màu xám đen, chân cổ có vòng lông bờm màu trắng bạc mịn bao quanh." }
    ],
    ebaRegion: "cochinchina",
    elevation: "Dưới 500m",
    habitats: ["Rừng rụng lá nhiệt đới", "Khu vực đồng cỏ bìa rừng"],
    locations: ["Rừng bán thường xanh và trảng cỏ Nam Bộ"],
    coordinates: [11.80, 107.20]
  },
  {
    id: "leptoptilos-dubius",
    scientificName: "Leptoptilos dubius",
    vietnameseName: "Già đẫy lớn",
    englishName: "Greater Adjutant",
    aliases: [],
    isEndemic: false,
    endemicScope: "none",
    order: "Ciconiiformes",
    orderVietnamese: "Bộ Hạc",
    family: "Ciconiidae",
    familyVietnamese: "Họ Hạc",
    authority: "VAST (GS. Võ Quý) / Craik & Minh 2018 / Sách Đỏ Việt Nam 2007 (CR) / Nghị định 84/2021/NĐ-CP (Nhóm IB)",
    gbifTaxonKey: "2481945",
    avibaseId: "81E1FC1CBA6C9F7F",
    iucn: "EN",
    vietnamRedList: "CR",
    legalFramework: {
      decree84Group: "IB",
      decree160Priority: true,
      directive04Flagship: false
    },
    conservationDescription: "Loài Cực kỳ nguy cấp (CR) trong Sách Đỏ Việt Nam và Nghị định 84/2021/NĐ-CP Nhóm IB. Loài hạc khổng lồ với số lượng toàn cầu chỉ còn khoảng 1.000 cá thể, thỉnh thoảng chỉ còn cá thể lang thang ghé vùng đất ngập nước Tây Nam Bộ.",
    morphologyOverview: "Một trong những loài hạc lớn nhất hành tinh với chiều cao lên tới 145-150 cm và sải cánh 250 cm, mỏ khổng lồ hình nêm hình tam giác màu vàng nhạt và túi hầu da trần lớn rủ trước cổ.",
    diagnosticFeatures: [
      { part: "Mỏ và túi hầu", description: "Mỏ rất to và dày hình nêm; trước cổ có túi da trần màu vàng cam rủ xuống dài tới 30 cm có thể phồng lên." },
      { part: "Bộ lông", description: "Lưng và cánh màu xám đen ánh kim loại, bụng màu trắng xám, lông bao cánh phụ có dải xám nhạt tương phản." }
    ],
    ebaRegion: "lower-mekong-basin",
    elevation: "Dưới 50m",
    habitats: ["Đầm lầy ngập nước nước ngọt", "Đồng trũng và bãi bồi ven sông"],
    locations: ["Vùng đất ngập nước Đồng Tháp Mười, Kiên Giang"],
    coordinates: [10.70, 105.50]
  },
  {
    id: "calidris-pygmaea",
    scientificName: "Calidris pygmaea",
    vietnameseName: "Rẽ mỏ thìa",
    englishName: "Spoon-billed Sandpiper",
    aliases: ["Dẽ mỏ thìa"],
    isEndemic: false,
    endemicScope: "none",
    order: "Charadriiformes",
    orderVietnamese: "Bộ Choi choi",
    family: "Scolopacidae",
    familyVietnamese: "Họ Dẽ",
    authority: "VAST (GS. Võ Quý) / Craik & Minh 2018 / IUCN Red List (CR) / Danh lục Đỏ VAST / Chỉ thị 04/CT-TTg",
    gbifTaxonKey: "10658506",
    avibaseId: "3FC8CA50CC50BAAD",
    iucn: "CR",
    vietnamRedList: "CR",
    legalFramework: {
      decree84Group: "IB",
      decree160Priority: true,
      directive04Flagship: true
    },
    conservationDescription: "Loài Cực kỳ nguy cấp (CR) toàn cầu và Danh lục Đỏ VAST. Một trong những loài chim di cư ven biển nguy cấp nhất thế giới (ước tính dưới 500 cá thể), bến đỗ trú đông trọng yếu tại bãi bồi Xuân Thủy (Nam Định) và Gò Công (Tiền Giang).",
    morphologyOverview: "Loài chim lội bờ biển nhỏ bé (chiều dài 14-16 cm), sở hữu đặc điểm nhận dạng độc nhất vô nhị là đầu mỏ dẹt rộng ngang hình chiếc thìa xúc.",
    diagnosticFeatures: [
      { part: "Mỏ dẹt hình thìa", description: "Đầu chót mỏ mở rộng sang hai bên tạo thành hình thìa dẹt độc nhất, dùng để quét lọc giáp xác nhỏ trong bùn lỏng." },
      { part: "Bộ lông mùa đông", description: "Mặt lưng màu xám tro nhạt viền trắng, trán và ngực bụng trắng tinh, chân và mỏ màu đen bóng." }
    ],
    ebaRegion: "annam-lowlands",
    elevation: "0m",
    habitats: ["Bãi bồi bùn cát ven biển", "Vùng đầm lầy ngập mặn và ruộng muối"],
    locations: ["Vườn quốc gia Xuân Thủy, Nam Định"],
    coordinates: [20.25, 106.55]
  },
  {
    id: "emberiza-aureola",
    scientificName: "Emberiza aureola",
    vietnameseName: "Sẻ đồng ngực vàng",
    englishName: "Yellow-breasted Bunting",
    aliases: [],
    isEndemic: false,
    endemicScope: "none",
    order: "Passeriformes",
    orderVietnamese: "Bộ Sẻ",
    family: "Emberizidae",
    familyVietnamese: "Họ Sẻ đồng",
    authority: "VAST (GS. Võ Quý) / Craik & Minh 2018 / IUCN Red List (CR) / Danh lục Đỏ VAST",
    gbifTaxonKey: "2491518",
    avibaseId: "7574C0E53A34CCFD",
    iucn: "CR",
    vietnamRedList: "CR",
    legalFramework: {
      decree84Group: "IIB",
      decree160Priority: false,
      directive04Flagship: false
    },
    conservationDescription: "Loài Cực kỳ nguy cấp (CR) toàn cầu và Danh lục Đỏ VAST. Từng là loài chim di cư mùa đông cực kỳ đông đúc nhưng sụt giảm thảm họa >90% trong 2 thập kỷ do nạn giăng lưới bẫy bắt thương mại ồ ạt tại Đông Á và Việt Nam.",
    morphologyOverview: "Loài chim sẻ đồng cỡ nhỏ (chiều dài 14-15 cm), con trống mùa sinh sản có ngực và bụng màu vàng tươi rực rỡ, vòng cổ màu hạt dẻ và mặt đen tuyền.",
    diagnosticFeatures: [
      { part: "Ngực và bụng", description: "Bụng và ngực màu vàng chanh sáng rực, ngăn cách với họng bởi một dải đai hẹp màu hạt dẻ đậm ở con trống." },
      { part: "Lưng và cánh", description: "Lưng màu nâu hạt dẻ sẫm có sọc đen, lông bao cánh có vệt trắng rộng rõ rệt khi quan sát thực địa." }
    ],
    ebaRegion: "annam-lowlands",
    elevation: "0 - 300m",
    habitats: ["Cánh đồng lúa sau thu hoạch", "Vùng cỏ ngập nước và bãi sậy ven sông"],
    locations: ["Đồng bằng sông Hồng và duyên hải miền Trung"],
    coordinates: [20.90, 105.80]
  }
];

async function runBatchIngestion() {
  console.log(`\n=============================================================`);
  console.log(`🚀 BẮT ĐẦU QUY TRÌNH NẠP BATCH 7 LOÀI CHIM CỰC KỲ NGUY CẤP (CR)`);
  console.log(`=============================================================\n`);

  for (let i = 0; i < CR_SPECIES_ENTRIES.length; i++) {
    const entry = CR_SPECIES_ENTRIES[i];
    console.log(`\n-------------------------------------------------------------`);
    console.log(`🐦 [${i + 1}/7] ĐANG XỬ LÝ LOÀI: ${entry.vietnameseName} (${entry.scientificName})`);
    console.log(`-------------------------------------------------------------`);

    // BƯỚC 1: ĐỒNG BỘ VÀO MASTER REGISTRY
    console.log(`📝 [1/4] Đồng bộ Master Registry...`);
    const masterList = JSON.parse(fs.readFileSync(MASTER_PATH, 'utf8'));
    const existingIndex = masterList.findIndex(m => m.id === entry.id || m.scientificName.toLowerCase() === entry.scientificName.toLowerCase());

    if (existingIndex >= 0) {
      masterList[existingIndex] = {
        ...masterList[existingIndex],
        ...entry,
        legalFramework: entry.legalFramework || masterList[existingIndex].legalFramework
      };
      console.log(`   ℹ️ Đã cập nhật bản ghi trong Master Registry.`);
    } else {
      masterList.push(entry);
      console.log(`   ➕ Đã bổ sung bản ghi mới vào Master Registry (Tổng: ${masterList.length} loài).`);
    }
    fs.writeFileSync(MASTER_PATH, JSON.stringify(masterList, null, 2), 'utf8');

    // BƯỚC 2: GIAI ĐOẠN 1 - THU THẬP API (HARVEST)
    console.log(`🌾 [2/4] Chạy Harvest API...`);
    const draftRecord = await harvestSpeciesData(entry.scientificName);

    // BƯỚC 3: GIAI ĐOẠN 2 - HÀNG RÀO KIỂM TOÁN CHỐT CHẶN (VERIFY)
    console.log(`🛡️ [3/4] Chạy Gatekeeper Audit...`);
    const verifyResult = await verifyCandidateSpecies(draftRecord);
    if (!verifyResult.isPassed) {
      console.error(`❌ DỪNG TOÀN BỘ QUY TRÌNH: Loài ${entry.scientificName} không đạt kiểm định!`);
      process.exit(1);
    }

    // BƯỚC 4: GIAI ĐOẠN 3 - NẠP NGUYÊN TỬ & TEST HỒI QUY (COMMIT)
    console.log(`💾 [4/4] Nạp nguyên tử vào Database...`);
    await commitCandidateSpecies();

    console.log(`✨ Hoàn tất thành công loài [${i + 1}/7]: ${entry.vietnameseName}`);
  }

  console.log(`\n=============================================================`);
  console.log(`🎉 CHÚC MỪNG! ĐÃ HOÀN TẤT NẠP TOÀN BỘ 7 LOÀI CR VÀO DATABASE!`);
  console.log(`=============================================================\n`);
}

runBatchIngestion().catch(err => {
  console.error('Lỗi thực thi batch:', err);
  process.exit(1);
});
