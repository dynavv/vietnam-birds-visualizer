# Task 2 Brief: Xây dựng Schema & Bộ Dữ liệu Chim Việt Nam (Species, Taxonomy, EBAs) & Test Kiểm thử

## Yêu cầu

### 1. `src/types/bird.ts`
Định nghĩa đầy đủ các interfaces chuẩn TypeScript:
- `BirdSpecies`:
  - `id`: string (kebab-case, e.g. `'trochalopteron-ngoclinhense'`)
  - `scientificName`: string (e.g. `'Trochalopteron ngoclinhense'`)
  - `vietnameseName`: string (e.g. `'Khướu Ngọc Linh'`)
  - `englishName`: string (e.g. `'Golden-winged Laughingthrush'`)
  - `taxonomy`: `{ clade: string[]; order: string; orderVietnamese: string; family: string; familyVietnamese: string; genus: string; species: string; }`
  - `isEndemic`: boolean
  - `conservation`: `{ iucn: 'CR' | 'EN' | 'VU' | 'NT' | 'LC'; vietnamRedList?: 'CR' | 'EN' | 'VU' | 'R' | 'LR'; description: string; }`
  - `morphologicalAnalysis`: `{ overview: string; diagnosticFeatures: { part: string; description: string; }[]; }`
  - `distribution`: `{ ebaRegion: string; elevation: string; habitats: string[]; locations: string[]; coordinates: [number, number]; }`
  - `illustration`: `{ imageUrl: string; artist: string; sourceBook?: string; }`
  - `audioCall`?: `{ audioUrl: string; duration?: string; recordist?: string; location?: string; }`
- `TaxonomyNode`:
  - `name`: string
  - `vietnameseName`?: string
  - `rank`: `'class' | 'order' | 'family' | 'genus' | 'species'`
  - `color`?: string
  - `speciesId`?: string
  - `children`?: `TaxonomyNode[]`
- `EBARegion`:
  - `id`: string
  - `name`: string
  - `vietnameseName`: string
  - `description`: string
  - `coordinates`: [number, number]
  - `zoomLevel`: number
  - `keySpeciesIds`: string[]
  - `habitats`: string[]

### 2. `src/data/species.json`
Tạo cơ sở dữ liệu chất lượng cao với **60 loài chim Việt Nam** gồm:
- **100% các loài đặc hữu nổi tiếng của Việt Nam (13–15 loài)**:
  1. *Khướu Ngọc Linh* (`trochalopteron-ngoclinhense` - EN)
  2. *Khướu Kon Ka Kinh / Khướu tai hung* (`ianthocincla-konkakinhensis` - VU)
  3. *Mi Langbiang* (`liochicla-langbianis` - EN)
  4. *Khướu đầu đen má xám* (`trochalopteron-yersini` - EN)
  5. *Khướu vằn đầu đen* (`actinodura-sodangorum` - VU)
  6. *Gà lôi lam mào trắng* (`lophura-edwardsi` - CR)
  7. *Gà tiền mặt đỏ* (`polyplectron-germaini` - NT)
  8. *Sẻ thông họng vàng / Sẻ thông Đà Lạt* (`chloris-monguilloti` - LC)
  9. *Chích chạch má xám* (`macronus-kelleyi` - LC)
  10. *Họa mi đất mỏ dài* (`rimator-pasquieri` - EN)
  11. *Khướu đá mun* (`stachyris-herberti` - LC)
  12. *Khướu hông đỏ* (`trochalopteron-formosum-greenwayi` - LC)
  13. *Khướu đuôi đỏ* (`trochalopteron-milnei-sharpei` - LC)
  14. *Khướu mỏ dẹt to* (`psittiparus-bakeri` - LC)
  15. *Trĩ sao* (`rheinardia-ocellata` - CR)
- **Các loài tiêu biểu cho các Bộ chim lớn tại Việt Nam**:
  - Passeriformes (Bộ Sẻ): *Họa mi, Đớp ruồi cằm đen, Hút mật họng đen, Bách thanh đầu đen, Đuôi cụt cánh xanh, Vàng anh gáy đen, Khướu ngực đốm, Yến hót, Chích chòe lửa...*
  - Galliformes (Bộ Gà): *Gà lôi hông tía, Gà tiền mặt vàng, Gà so họng trắng, Gà rừng tai trắng...*
  - Bucerotiformes (Bộ Hồng hoàng): *Hồng hoàng (Buceros bicornis), Niệc mỏ vằn (Rhyticeros undulatus), Niệc nâu...*
  - Coraciiformes (Bộ Bói cá): *Bói cá lớn, Sả mỏ rộng, Sả đầu đen, Bồng chanh rừng...*
  - Piciformes (Bộ Gõ kiến): *Cu rốc đầu đỏ, Cu rốc đầu đen, Gõ kiến xanh hông đỏ...*
  - Accipitriformes (Bộ Ưng): *Đại bàng đen, Diều hoa Miến Điện, Diều ăn ong...*
  - Strigiformes (Bộ Cú): *Dù dì phương Đông, Cú mèo khoang cổ...*
  - Pelecaniformes / Ciconiiformes: *Cò quăm cánh xanh (Thaumatibis davisoni - CR), Cò thìa mặt đen, Già đới cổ hung...*
  - Gruiformes (Bộ Sếu): *Sếu đầu đỏ (Antigone antigone sharpii - VU), Cuốc ngực nâu...*
  - Columbiformes (Bộ Bồ câu): *Bồ câu Nicobar, Gầm ghì lưng hung, Cu xanh đuôi nhọn...*
  - Anseriformes (Bộ Vịt): *Vịt mốc, Vịt trời...*
  - Cuculiformes (Bộ Cu cu): *Đỗ quyên lớn, Phướn đất mỏ đỏ...*
  - Trogoniformes (Bộ Nuốc): *Nuốc bụng đỏ, Nuốc đầu đỏ...*

Mỗi loài phải có hình ảnh minh họa nghệ thuật chất lượng cao (sử dụng các URL minh họa naturalist công cộng hoặc Wikimedia Commons / Open Naturalist Archive), phân tích hình thái học chi tiết (overview, 2-3 diagnosticFeatures), tọa độ địa lý Việt Nam chính xác, và thông tin âm thanh mô phỏng / xeno-canto call.

### 3. `src/data/taxonomy.json`
Cấu trúc cây phân cấp D3 Sunburst:
- Root: `name: "Aves", vietnameseName: "Lớp Chim", rank: "class"`
- Cấp 1: Các Bộ (`rank: "order"`, e.g. *Passeriformes*, *Galliformes*, *Bucerotiformes*...) với mã màu `color` sinh thái riêng biệt.
- Cấp 2: Các Họ (`rank: "family"`, e.g. *Leiothrichidae*, *Phasianidae*...).
- Cấp 3: Các Chi (`rank: "genus"`).
- Cấp 4 (Lá): Từng Loài (`rank: "species"`, `speciesId: "..."`).

### 4. `src/data/ebas.json`
Định nghĩa 6 vùng chim đặc hữu (EBAs) & Vườn Quốc Gia chính tại Việt Nam:
1. `dalat-plateau`: Cao nguyên Đà Lạt / Lâm Viên (Lạc Dương, Bidoup - Núi Bà)
2. `kontum-plateau`: Cao nguyên Kon Tum / Dãy Ngọc Linh & Kon Ka Kinh
3. `annam-lowlands`: Vùng Đất thấp miền Trung (Kẻ Gỗ, Vũ Quang, Phong Nha - Kẻ Bàng, Bạch Mã)
4. `hoang-lien-son`: Vùng núi Tây Bắc & Hoàng Liên Sơn / Fansipan
5. `cochinchina`: Vùng đồng bằng & rừng đất thấp Nam Bộ (Cát Tiên, Tràm Chim, Đất Mũi)
6. `northeast-mountains`: Vùng núi Đông Bắc (Ba Bể, Pù Mát, Cúc Phương)

### 5. `src/data/validateData.test.ts`
Viết test kiểm tra:
- Có ít nhất 50 loài chim trong `species.json`.
- 100% loài có đầy đủ các trường bắt buộc (id, scientificName, vietnameseName, englishName, taxonomy, isEndemic, conservation, morphologicalAnalysis, distribution, illustration).
- Có ít nhất 12 loài đặc hữu (`isEndemic: true`).
- 100% loài trong `species.json` đều tồn tại một nút lá tương ứng trong `taxonomy.json` với đúng `speciesId`.
- 100% vùng EBA trong `ebas.json` đều có `keySpeciesIds` hợp lệ tồn tại trong `species.json`.

### 6. Thực thi & Commit
- Chạy `npm test` bằng vitest để đảm bảo test PASS 100%.
- Commit code: `git add . && git commit -m "feat: add complete species, taxonomy and ebas dataset with integrity test"`.
- Ghi báo cáo vào: `/home/dynav/.gemini/antigravity/scratch/vietnam-birds-visualizer/.superpowers/sdd/2026-08-27-vietnam-birds-visualizer-plan/task-2-report.md`.
