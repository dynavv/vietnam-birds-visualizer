import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sparkles, Dices, ChevronRight, Compass, Trophy } from 'lucide-react';
import { useTaxonomy } from '../../context/TaxonomyContext';

export interface AvianFact {
  speciesId: string;
  speciesName: string;
  scientificName: string;
  fact: string;
  eba: string;
  isEndemic: boolean;
  iucn: string;
}

const AVIAN_FACTS: AvianFact[] = [
  {
    "speciesId": "trochalopteron-ngoclinhense",
    "speciesName": "Khướu Ngọc Linh",
    "scientificName": "Trochalopteron ngoclinhense",
    "fact": "Khướu Ngọc Linh là báu vật đặc hữu độc bản của Việt Nam — Loài khướu cỡ trung bình tuyệt đẹp với dải cánh màu vàng kim rực rỡ tương phản mạnh với bộ lông màu nâu hạt dẻ và chỏm đầu xám tro.",
    "eba": "Cao nguyên Kon Tum / Dãy Ngọc Linh & Kon Ka Kinh",
    "isEndemic": true,
    "iucn": "EN"
  },
  {
    "speciesId": "ianthocincla-konkakinhensis",
    "speciesName": "Khướu Kon Ka Kinh",
    "scientificName": "Ianthocincla konkakinhensis",
    "fact": "Khướu Kon Ka Kinh là báu vật đặc hữu độc bản của Việt Nam — Bộ lông có hoa văn vảy phức tạp màu nâu xám, nổi bật với mảng che tai màu hạt dẻ hung đỏ rực rỡ.",
    "eba": "Cao nguyên Kon Tum / Dãy Ngọc Linh & Kon Ka Kinh",
    "isEndemic": true,
    "iucn": "VU"
  },
  {
    "speciesId": "liochicla-langbianis",
    "speciesName": "Mi Langbiang",
    "scientificName": "Liochicla langbianis",
    "fact": "Mi Langbiang là báu vật đặc hữu độc bản của Việt Nam — Loài khướu nhỏ duyên dáng với vòng cổ màu hung cam, vệt cánh và mép đuôi màu đỏ thắm tương phản lông thân màu xám tro.",
    "eba": "Cao nguyên Đà Lạt / Lâm Viên",
    "isEndemic": true,
    "iucn": "EN"
  },
  {
    "speciesId": "trochalopteron-yersini",
    "speciesName": "Khướu đầu đen má xám",
    "scientificName": "Trochalopteron yersini",
    "fact": "Khướu đầu đen má xám là báu vật đặc hữu độc bản của Việt Nam — Thân hình to khỏe, đầu đen tuyền, má xám bạc sáng lóa, yếm ngực cam hạt dẻ và viền lông cánh vàng cam óng ánh.",
    "eba": "Cao nguyên Đà Lạt / Lâm Viên",
    "isEndemic": true,
    "iucn": "EN"
  },
  {
    "speciesId": "actinodura-sodangorum",
    "speciesName": "Khướu vằn đầu đen",
    "scientificName": "Actinodura sodangorum",
    "fact": "Khướu vằn đầu đen là báu vật đặc hữu độc bản của Việt Nam — Đặc trưng bởi mào đầu ngắn màu đen tuyền, cánh và đuôi có những dải vằn ngang đen trắng tinh xảo như phím đàn dương cầm.",
    "eba": "Cao nguyên Kon Tum / Dãy Ngọc Linh & Kon Ka Kinh",
    "isEndemic": true,
    "iucn": "VU"
  },
  {
    "speciesId": "lophura-edwardsi",
    "speciesName": "Gà lôi lam mào trắng",
    "scientificName": "Lophura edwardsi",
    "fact": "Gà lôi lam mào trắng là báu vật đặc hữu độc bản của Việt Nam — Chim trống toàn thân màu xanh lam ánh thép rực rỡ, mào lông đầu trắng tinh dựng đứng và vùng da mặt quanh mắt đỏ tươi.",
    "eba": "Vùng Đất thấp miền Trung",
    "isEndemic": true,
    "iucn": "CR"
  },
  {
    "speciesId": "polyplectron-germaini",
    "speciesName": "Gà tiền mặt đỏ",
    "scientificName": "Polyplectron germaini",
    "fact": "Gà tiền mặt đỏ là báu vật đặc hữu độc bản của Việt Nam — Bộ lông màu nâu đen điểm vô số đốm mắt màu xanh lục - tím óng ánh trên cánh và đuôi xòe hình quạt tuyệt đẹp.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": true,
    "iucn": "NT"
  },
  {
    "speciesId": "chloris-monguilloti",
    "speciesName": "Sẻ thông họng vàng",
    "scientificName": "Chloris monguilloti",
    "fact": "Sẻ thông họng vàng là báu vật đặc hữu độc bản của Việt Nam — Kích thước nhỏ nhắn, đầu màu đen huyền, họng và ngực màu vàng chanh tươi sáng, cánh có vệt vàng rực rỡ khi bay lượn.",
    "eba": "Cao nguyên Đà Lạt / Lâm Viên",
    "isEndemic": true,
    "iucn": "LC"
  },
  {
    "speciesId": "macronus-kelleyi",
    "speciesName": "Chích chạch má xám",
    "scientificName": "Mixornis kelleyi",
    "fact": "Chích chạch má xám là báu vật đặc hữu độc bản của Việt Nam — Thân nhỏ nhanh nhẹn, đỉnh đầu màu nâu hạt dẻ, má xám bạc và ức có các vệt sọc mảnh màu ô-liu.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": true,
    "iucn": "LC"
  },
  {
    "speciesId": "rimator-pasquieri",
    "speciesName": "Họa mi đất mỏ dài",
    "scientificName": "Rimator pasquieri",
    "fact": "Họa mi đất mỏ dài là báu vật đặc hữu độc bản của Việt Nam — Đuôi cực ngắn gần như cụt, mỏ dài cong mảnh khảnh dùng để luồn sâu vào thảm rêu và vỏ cây tìm sâu bọ, họng trắng tinh.",
    "eba": "Vùng núi Tây Bắc & Hoàng Liên Sơn / Fansipan",
    "isEndemic": true,
    "iucn": "EN"
  },
  {
    "speciesId": "stachyris-herberti",
    "speciesName": "Khướu đá mun",
    "scientificName": "Stachyris herberti",
    "fact": "Khướu đá mun là báu vật đặc hữu độc bản của Việt Nam — Toàn bộ lông màu nâu tro xám đen như than mun, ngực và họng nhạt màu hơn, móng chân to khỏe bám vách đá dốc đứng.",
    "eba": "Vùng Đất thấp miền Trung",
    "isEndemic": true,
    "iucn": "LC"
  },
  {
    "speciesId": "trochalopteron-formosum-greenwayi",
    "speciesName": "Khướu hông đỏ",
    "scientificName": "Trochalopteron formosum greenwayi",
    "fact": "Khướu hông đỏ là báu vật đặc hữu độc bản của Việt Nam — Thân hình đầy đặn, mảng cánh và đuôi có màu đỏ thắm ánh son rực rỡ, đỉnh đầu màu xám có vảy đen tinh tế.",
    "eba": "Vùng núi Tây Bắc & Hoàng Liên Sơn / Fansipan",
    "isEndemic": true,
    "iucn": "LC"
  },
  {
    "speciesId": "trochalopteron-milnei-sharpei",
    "speciesName": "Khướu đuôi đỏ",
    "scientificName": "Trochalopteron milnei sharpei",
    "fact": "Khướu đuôi đỏ là báu vật đặc hữu độc bản của Việt Nam — Mũ đầu màu đỏ son sáng chói, má trắng bạc, toàn bộ cánh và đuôi màu đỏ thắm tương phản lông lưng xám vảy đen.",
    "eba": "Vùng núi Tây Bắc & Hoàng Liên Sơn / Fansipan",
    "isEndemic": true,
    "iucn": "LC"
  },
  {
    "speciesId": "psittiparus-bakeri",
    "speciesName": "Khướu mỏ dẹt to",
    "scientificName": "Psittiparus bakeri",
    "fact": "Khướu mỏ dẹt to là báu vật đặc hữu độc bản của Việt Nam — Đầu to màu hung đỏ, chiếc mỏ dẹt màu ngà như mỏ vẹt, thân hình tròn trĩnh đuôi dài thích nghi thảm tre nứa núi cao.",
    "eba": "Cao nguyên Đà Lạt / Lâm Viên",
    "isEndemic": true,
    "iucn": "LC"
  },
  {
    "speciesId": "rheinardia-ocellata",
    "speciesName": "Trĩ sao",
    "scientificName": "Rheinardia ocellata",
    "fact": "Trĩ sao là báu vật đặc hữu độc bản của Việt Nam — Thân hình tráng lệ với bộ lông đen mun rắc hàng ngàn đốm trắng sao sa, mào lông dài dựng đứng và đuôi dài vô song uốn lượn.",
    "eba": "Vùng Đất thấp miền Trung",
    "isEndemic": true,
    "iucn": "CR"
  },
  {
    "speciesId": "garrulax-canorus",
    "speciesName": "Họa mi",
    "scientificName": "Garrulax canorus",
    "fact": "Thân màu nâu vàng ô-liu, ức có vệt sọc dọc mờ, nổi tiếng với viền mắt trắng kéo dài về phía sau gáy như nét vẽ điêu khắc.",
    "eba": "Vùng núi Đông Bắc & Đá vôi Bắc Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "cyornis-rubeculoides",
    "speciesName": "Đớp ruồi cằm đen",
    "scientificName": "Cyornis rubeculoides",
    "fact": "Mặt lưng màu xanh lam đậm ánh kim, ngực màu cam rực rỡ tương phản với cằm màu xanh đen và bụng trắng.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "aethopyga-saturata",
    "speciesName": "Hút mật họng đen",
    "scientificName": "Aethopyga saturata",
    "fact": "Thân hình nhỏ nhắn như ngón tay, ngực và họng đen tuyền ánh tím kim loại, vệt hông vàng chanh sáng chói và lưng đỏ thẫm.",
    "eba": "Vùng núi Tây Bắc & Hoàng Liên Sơn / Fansipan",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "lanius-schach",
    "speciesName": "Bách thanh đầu đen",
    "scientificName": "Lanius schach",
    "fact": "Đầu và mặt nạ màu đen bóng, lưng và hông màu hung cam ấm, mỏ có móc khoằm sắc bén như chim săn mồi.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "pitta-moluccensis",
    "speciesName": "Đuôi cụt cánh xanh",
    "scientificName": "Pitta moluccensis",
    "fact": "Viên ngọc rừng nhiệt đới với lưng xanh ngọc, mảng cánh xanh coban phát sáng, bụng vàng hung và vệt đỏ thắm ở hậu môn.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "oriolus-chinensis",
    "speciesName": "Vàng anh gáy đen",
    "scientificName": "Oriolus chinensis",
    "fact": "Toàn thân màu vàng hoàng yến rực rỡ, mỏ hồng san hô, dải lông đen hình móng ngựa vắt qua gáy nối liền hai bên mắt.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "copsychus-malabaricus",
    "speciesName": "Chích chòe lửa",
    "scientificName": "Copsychus malabaricus",
    "fact": "Đầu và lưng đen nhánh ánh thép bóng mượt, ngực và bụng màu cam đỏ hạt dẻ ấm áp, mảng hông trắng tuyết và đuôi cực dài.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "dicrurus-paradiseus",
    "speciesName": "Chèo bẻo đuôi cờ",
    "scientificName": "Dicrurus paradiseus",
    "fact": "Toàn thân màu đen ánh kim xanh tím rực rỡ, mào lông cong ngược về sau trên trán và hai chiếc đuôi cờ dài uốn lượn trong gió.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "garrulax-chinensis",
    "speciesName": "Khướu bạc má",
    "scientificName": "Garrulax chinensis",
    "fact": "Thân màu xám ô-liu, họng và trán màu đen tuyền, hai bên má có mảng trắng muốt như phấn vôi sáng chói.",
    "eba": "Vùng núi Đông Bắc & Đá vôi Bắc Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "psarisomus-dalhousiae",
    "speciesName": "Mỏ rộng xanh",
    "scientificName": "Psarisomus dalhousiae",
    "fact": "Thân màu xanh lục bảo non, đỉnh đầu đen có đốm xanh da trời và vàng nghệ như chiếc mũ bảo hiểm phi công, chiếc đuôi xanh coban dài thon.",
    "eba": "Vùng núi Đông Bắc & Đá vôi Bắc Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "lophura-diardi",
    "speciesName": "Gà lôi hông tía",
    "scientificName": "Lophura diardi",
    "fact": "Thân màu xám tro vân mịn, mảng lưng dưới màu vàng rơm và hông đỏ tía rực lửa, mào đầu xoăn đen tím và mặt đỏ tươi.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "polyplectron-bicalcaratum",
    "speciesName": "Gà tiền mặt vàng",
    "scientificName": "Polyplectron bicalcaratum",
    "fact": "Thân màu xám tro rắc hạt mịn, phủ dày đặc các đốm mắt tròn màu xanh lục ngọc bích óng ánh viền trắng và đen trên đuôi và cánh.",
    "eba": "Vùng núi Đông Bắc & Đá vôi Bắc Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "arborophila-brunneopectus",
    "speciesName": "Gà so họng trắng",
    "scientificName": "Arborophila brunneopectus",
    "fact": "Thân tròn mập, trán và lông mày màu hung vàng, họng trắng viền đen hạt tiêu và ức có mảng màu nâu hạt dẻ đậm.",
    "eba": "Cao nguyên Kon Tum / Dãy Ngọc Linh & Kon Ka Kinh",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "gallus-gallus",
    "speciesName": "Gà rừng tai trắng",
    "scientificName": "Gallus gallus",
    "fact": "Chim trống oai vệ với lông cổ màu vàng cam óng ả, lưng đỏ sẫm, đuôi xanh đen ánh kim cong vút và dái tai màu trắng tinh khiết.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "buceros-bicornis",
    "speciesName": "Hồng hoàng",
    "scientificName": "Buceros bicornis",
    "fact": "Thân hình to lớn đồ sộ, chiếc mỏ vàng khổng lồ đội mũ sừng hai sừng phía trước, dải cánh đen trắng và đuôi trắng có dải băng đen lớn.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "VU"
  },
  {
    "speciesId": "rhyticeros-undulatus",
    "speciesName": "Niệc mỏ vằn",
    "scientificName": "Rhyticeros undulatus",
    "fact": "Thân màu đen tuyền, đuôi trắng tinh hoàn toàn, chim trống có đầu hung đỏ, túi họng vàng chói và gốc mỏ có các nếp gấp lượn sóng.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "VU"
  },
  {
    "speciesId": "anorrhinus-tickelli",
    "speciesName": "Niệc nâu",
    "scientificName": "Anorrhinus tickelli",
    "fact": "Thân màu nâu xám sẫm, họng và ngực chim trống màu nâu hung vàng, mỏ màu vàng ngà có chóp đuôi trắng nhạt.",
    "eba": "Vùng Đất thấp miền Trung",
    "isEndemic": false,
    "iucn": "NT"
  },
  {
    "speciesId": "upupa-epops",
    "speciesName": "Đầu rìu",
    "scientificName": "Upupa epops",
    "fact": "Thân màu hồng nâu hạt dẻ, cánh và đuôi có các dải vằn đen trắng rộng tương phản mạnh, mào lông đầu xòe quạt và mỏ dài mảnh cong nhẹ.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "megaceryle-lugubris",
    "speciesName": "Bói cá lớn",
    "scientificName": "Megaceryle lugubris",
    "fact": "Thân hình to lớn, bộ lông hoa râm vằn đen trắng như áo dệt thổ cẩm, mào lông đầu dựng đứng bờm xờm và chiếc mỏ đen sắc như mũi giáo.",
    "eba": "Vùng núi Tây Bắc & Hoàng Liên Sơn / Fansipan",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "pelargopsis-capensis",
    "speciesName": "Sả mỏ rộng",
    "scientificName": "Pelargopsis capensis",
    "fact": "Đầu màu nâu xám, ức và bụng màu vàng nghệ rực rỡ, lưng xanh ngọc ánh lam chói lọi và mỏ đỏ tươi như ớt chín.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "halcyon-pileata",
    "speciesName": "Sả đầu đen",
    "scientificName": "Halcyon pileata",
    "fact": "Đỉnh đầu đen nhung tuyền, vòng cổ màu trắng tinh, lưng và cánh màu xanh tím coban đậm đà, mỏ và chân màu đỏ thắm.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "alcedo-hercules",
    "speciesName": "Bồng chanh rừng",
    "scientificName": "Alcedo hercules",
    "fact": "Thân màu xanh coban ánh kim sáng rực, ngực và bụng màu cam đỏ rực lửa, dải lưng giữa màu xanh ngọc bích phát quang.",
    "eba": "Vùng núi Tây Bắc & Hoàng Liên Sơn / Fansipan",
    "isEndemic": false,
    "iucn": "NT"
  },
  {
    "speciesId": "coracias-affinis",
    "speciesName": "Sả rừng",
    "scientificName": "Coracias affinis",
    "fact": "Đầu và lưng màu xanh ô-liu xám, ngực màu tím tím than đậm, cánh ngoài màu xanh lơ phát sáng như ngọc bích khi sải rộng.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "psilopogon-haemacephalus",
    "speciesName": "Cu rốc đầu đỏ",
    "scientificName": "Psilopogon haemacephalus",
    "fact": "Thân màu xanh lục cỏ, trán và yếm ngực đỏ tươi như ruby, họng vàng chanh, ức có vệt sọc xanh đậm, mỏ cứng chắc.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "psilopogon-faber",
    "speciesName": "Cu rốc đầu đen",
    "scientificName": "Psilopogon faber",
    "fact": "Thân xanh ngọc bích, mũ đầu đen tuyền, trán có đốm đỏ son, họng và sau gáy điểm sắc xanh da trời và đỏ thắm.",
    "eba": "Vùng núi Đông Bắc & Đá vôi Bắc Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "picus-rabieri",
    "speciesName": "Gõ kiến xanh hông đỏ",
    "scientificName": "Picus rabieri",
    "fact": "Thân màu xanh ô-liu đậm, toàn bộ đầu và cổ áo bao bọc bởi lớp lông màu đỏ son rực lửa kéo dài từ gáy xuống tận ức.",
    "eba": "Vùng Đất thấp miền Trung",
    "isEndemic": false,
    "iucn": "NT"
  },
  {
    "speciesId": "chrysocolaptes-guttacristatus",
    "speciesName": "Gõ kiến tam giác",
    "scientificName": "Chrysocolaptes guttacristatus",
    "fact": "Thân màu vàng kim óng ả, mào lông đầu đỏ chói dựng đứng, mặt có các dải sọc trắng đen song song, ức có vảy đen trắng tinh tế.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "ictinaetus-malaiensis",
    "speciesName": "Đại bàng đen",
    "scientificName": "Ictinaetus malaiensis",
    "fact": "Toàn thân phủ màu đen tuyền như nhung, sáp mỏ và chân màu vàng chanh sáng rực, móng vuốt chân duỗi thẳng thích nghi cướp tổ chim non.",
    "eba": "Cao nguyên Đà Lạt / Lâm Viên",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "spilornis-cheela",
    "speciesName": "Diều hoa Miến Điện",
    "scientificName": "Spilornis cheela",
    "fact": "Thân màu nâu sẫm lốm đốm sao trắng ở ức và bụng, mào xòe sau gáy lấm tấm chấm trắng, dải băng trắng to bản chạy dọc cánh và đuôi khi bay.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "pernis-ptilorhynchus",
    "speciesName": "Diều ăn ong",
    "scientificName": "Pernis ptilorhynchus",
    "fact": "Đầu nhỏ thon cổ dài như bồ câu, lớp lông mặt phủ vảy mịn chống ong đốt, mào lông nhỏ ở gáy và đuôi có hai dải băng đen sẫm.",
    "eba": "Vùng núi Đông Bắc & Đá vôi Bắc Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "elanus-caeruleus",
    "speciesName": "Diều trắng",
    "scientificName": "Elanus caeruleus",
    "fact": "Toàn thân trắng tinh khiết pha xám bạc nhẹ ở lưng, mảng vai đen tuyền nổi bật, mắt màu đỏ ruby rực lửa, khả năng đập cánh treo mình đứng yên giữa không trung.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "ketupa-zeylonensis",
    "speciesName": "Dù dì phương Đông",
    "scientificName": "Ketupa zeylonensis",
    "fact": "Thân hình to lớn đồ sộ, lông màu nâu hung rằn ri sọc đen, đôi tai lông dài vểnh ngang và chân trần không có lông phủ để tránh ướt nước khi vồ cá.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "otus-lettia",
    "speciesName": "Cú mèo khoang cổ",
    "scientificName": "Otus lettia",
    "fact": "Thân màu xám tro rằn ri như vỏ cây mục, vòng cổ màu vàng ngà nhạt vắt sau gáy tạo hình 'mặt giả' đánh lừa kẻ thù, đôi tai lông dựng đứng.",
    "eba": "Vùng núi Đông Bắc & Đá vôi Bắc Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "glaucidium-brodiei",
    "speciesName": "Cú vọ mặt hung",
    "scientificName": "Glaucidium brodiei",
    "fact": "Kích thước tí hon, đầu tròn không có tai lông, sau gáy có hai đốm đen viền trắng tròn xoe y như đôi mắt thứ hai để răn đe kẻ thù từ phía sau.",
    "eba": "Cao nguyên Đà Lạt / Lâm Viên",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "pseudibis-davisoni",
    "speciesName": "Cò quăm cánh xanh",
    "scientificName": "Pseudibis davisoni",
    "fact": "Thân màu nâu đen ánh thép, đầu trần trụi màu đen có vòng da cổ màu xanh da trời sáng rực, mảng lông vai màu trắng tinh nổi bật trên cánh đen.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "CR"
  },
  {
    "speciesId": "platalea-minor",
    "speciesName": "Cò thìa mặt đen",
    "scientificName": "Platalea minor",
    "fact": "Toàn thân trắng tinh khôi, mảng da mặt trần trụi màu đen tuyền quanh mắt, chiếc mỏ dẹt to bè hình muỗng/thìa màu xám nhăn nheo.",
    "eba": "Vùng núi Đông Bắc & Đá vôi Bắc Bộ",
    "isEndemic": false,
    "iucn": "EN"
  },
  {
    "speciesId": "leptoptilos-javanicus",
    "speciesName": "Già đới cổ hung",
    "scientificName": "Leptoptilos javanicus",
    "fact": "Thân cao lớn, lưng và cánh đen ánh kim xanh thép, đầu và cổ trần trụi da màu vàng hồng có vài sợi lông tơ thưa thớt, mỏ to dày màu ngà.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "VU"
  },
  {
    "speciesId": "gorsachius-melanolophus",
    "speciesName": "Vạc rừng",
    "scientificName": "Gorsachius melanolophus",
    "fact": "Thân màu nâu hạt dẻ ấm, cánh rằn ri vằn đen mịn, mào lông đen tuyền buông dài sau gáy và đôi mắt tròn xoe to màu vàng lục.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "antigone-antigone",
    "speciesName": "Sếu đầu đỏ",
    "scientificName": "Antigone antigone",
    "fact": "Thân cao lớn thanh thoát màu xám bạc, đầu và cổ trên trần trụi da màu đỏ tươi rực lửa, đỉnh đầu có mảng da xám tro và đôi chân dài miên man màu hồng.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "VU"
  },
  {
    "speciesId": "rallina-fasciata",
    "speciesName": "Cuốc ngực nâu",
    "scientificName": "Rallina fasciata",
    "fact": "Đầu, cổ và ngực màu đỏ hung hạt dẻ ấm áp, bụng và sườn có các dải sọc vằn đen trắng xen kẽ nổi bật, đôi chân đỏ thắm.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "porphyrio-poliocephalus",
    "speciesName": "Trích cồ",
    "scientificName": "Porphyrio poliocephalus",
    "fact": "Thân màu xanh lam tím ánh ngọc bích, đầu màu xám bạc, mào sừng trán và mỏ màu đỏ thắm, dưới đuôi có mảng lông trắng muốt giật giật khi bước đi.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "caloenas-nicobarica",
    "speciesName": "Bồ câu Nicobar",
    "scientificName": "Caloenas nicobarica",
    "fact": "Thân màu xanh lục ánh đồng lấp lánh như cầu vồng kim loại, lông bờm cổ dài thượt thướt tha, đuôi ngắn màu trắng tuyết và cục sừng tròn trên gốc mỏ.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "NT"
  },
  {
    "speciesId": "ducula-badia",
    "speciesName": "Gầm ghì lưng hung",
    "scientificName": "Ducula badia",
    "fact": "Thân hình to lớn đồ sộ, lưng và cánh màu nâu hạt dẻ hung đỏ đậm đà, đầu và ngực màu xám hồng thanh nhã, đuôi đen có dải xám ở chóp.",
    "eba": "Cao nguyên Đà Lạt / Lâm Viên",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "treron-apicauda",
    "speciesName": "Cu xanh đuôi nhọn",
    "scientificName": "Treron apicauda",
    "fact": "Thân màu xanh đọt chuối tươi mát, ngực phớt vàng cam dịu dàng, hai cọng lông đuôi giữa vươn dài nhọn hoắt, mỏ màu xanh lơ gốc mỏ phớt đỏ.",
    "eba": "Vùng núi Tây Bắc & Hoàng Liên Sơn / Fansipan",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "asarcornis-scutulata",
    "speciesName": "Vịt cánh trắng",
    "scientificName": "Asarcornis scutulata",
    "fact": "Thân hình to lớn sẫm màu đen bóng ánh lục, đầu và cổ lấm tấm trắng đen, mảng bao cánh màu trắng tinh khiết phát sáng khi bay.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "EN"
  },
  {
    "speciesId": "aix-galericulata",
    "speciesName": "Vịt uyên ương",
    "scientificName": "Aix galericulata",
    "fact": "Chim trống là bản giao hưởng màu sắc rực rỡ với mào lông tím - xanh, đôi 'cánh buồm' màu cam dựng đứng ở lưng và chiếc mỏ đỏ san hô.",
    "eba": "Vùng núi Đông Bắc & Đá vôi Bắc Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "hierococcyx-sparverioides",
    "speciesName": "Cu cu vằn",
    "scientificName": "Hierococcyx sparverioides",
    "fact": "Hình dáng và bộ lông sao chép hoàn hảo loài chim ưng với lưng xám tro, ức vằn đen trắng và mắt có vòng vàng sáng giúp xua đuổi chim chủ nhà khi đẻ trứng nhờ.",
    "eba": "Vùng núi Tây Bắc & Hoàng Liên Sơn / Fansipan",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "carpococcyx-renauldi",
    "speciesName": "Phướn đất mỏ đỏ",
    "scientificName": "Carpococcyx renauldi",
    "fact": "Thân to lớn đuôi dài màu xanh tím than ánh kim, ngực màu xám bạc tương phản với bụng đen, mỏ và chân đỏ san hô tươi tắn, da mặt xanh tím.",
    "eba": "Vùng Đất thấp miền Trung",
    "isEndemic": false,
    "iucn": "VU"
  },
  {
    "speciesId": "centropus-sinensis",
    "speciesName": "Bìm bịp lớn",
    "scientificName": "Centropus sinensis",
    "fact": "Thân màu đen ánh tím than, cánh màu nâu hạt dẻ hung đỏ sáng, đôi mắt đỏ rực như than hồng và chiếc đuôi đen dài bóng mượt.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "harpactes-erythrocephalus",
    "speciesName": "Nuốc bụng đỏ",
    "scientificName": "Harpactes erythrocephalus",
    "fact": "Đầu và toàn bộ bụng màu đỏ thắm chói lọi, vòng cổ màu trắng mảnh, lưng màu nâu quế ấm áp, vòng mi mắt trần màu xanh coban kỳ ảo.",
    "eba": "Vùng núi Đông Bắc & Đá vôi Bắc Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "harpactes-oreskios",
    "speciesName": "Nuốc đuôi vàng",
    "scientificName": "Harpactes oreskios",
    "fact": "Đầu màu xanh ô-liu ánh vàng, ngực màu cam tươi rực rỡ, bụng màu vàng chanh, lưng nâu hạt dẻ và vòng mắt màu xanh lơ.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "microhierax-melanoleucos",
    "speciesName": "Cắt nhỏ bụng trắng",
    "scientificName": "Microhierax melanoleucos",
    "fact": "Thân màu đen bóng tương phản với bụng và họng trắng tinh khiết, mặt nạ đen vắt qua mắt, mỏ quặp sắc lẻm như đại bàng thu nhỏ.",
    "eba": "Vùng núi Đông Bắc & Đá vôi Bắc Bộ",
    "isEndemic": false,
    "iucn": "LC"
  },
  {
    "speciesId": "caprimulgus-macrurus",
    "speciesName": "Cú muỗi đuôi dài",
    "scientificName": "Caprimulgus macrurus",
    "fact": "Thân màu nâu xám rằn ri như lá khô mục, miệng rộng hoác có ria mép dài bắt côn trùng khi bay đêm, đuôi dài có chóp trắng lớn ở góc đuôi.",
    "eba": "Vùng đồng bằng & rừng đất thấp Nam Bộ",
    "isEndemic": false,
    "iucn": "LC"
  }
];

export const AvianFunFactsRibbon: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { allSpecies, selectSpecies, discoveredSpeciesIds } = useTaxonomy();
  const [factIndex, setFactIndex] = useState<number>(() => Math.floor(Math.random() * AVIAN_FACTS.length));
  const [isFading, setIsFading] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const currentFact = useMemo(() => {
    return AVIAN_FACTS[factIndex] || AVIAN_FACTS[0];
  }, [factIndex]);

  const handleNextFact = useCallback(() => {
    setIsFading(true);
    setTimeout(() => {
      setFactIndex(prev => (prev + 1 + Math.floor(Math.random() * (AVIAN_FACTS.length - 1))) % AVIAN_FACTS.length);
      setIsFading(false);
    }, 200);
  }, []);

  // Auto-cycle every 14 seconds when not hovered
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(handleNextFact, 14000);
    return () => clearInterval(timer);
  }, [isPaused, handleNextFact]);

  const handleExploreSpecies = () => {
    if (currentFact.speciesId) {
      selectSpecies(currentFact.speciesId);
    }
  };

  const discoveredCount = discoveredSpeciesIds.length;
  const totalSpeciesCount = allSpecies.length || 68;
  const isAllUnlocked = discoveredCount >= totalSpeciesCount;

  return (
    <div
      className={`border-b border-paper-border/80 bg-paper-200/50 backdrop-blur-xs py-1 px-3 sm:px-6 select-none transition-colors duration-300 ${className}`}
      data-testid="avian-fun-facts-ribbon"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        
        {/* Left: Sparkle Badge & Interactive Fact Ticker */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={handleNextFact}
            title="Đổi sang sự thật ngẫu nhiên khác (Click to roll)"
            aria-label="Đổi sang sự thật ngẫu nhiên khác"
            className="group flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-natural-moss/10 hover:bg-natural-moss/20 text-natural-forest border border-natural-moss/20 transition-all shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-natural-moss group-hover:rotate-45 transition-transform" />
            <span className="font-serif font-bold text-[11px] hidden xs:inline text-natural-moss">Kỳ thú</span>
          </button>

          {/* Fact Content Text with smooth opacity transition */}
          <div
            className={`min-w-0 flex-1 flex items-center gap-2 text-ink-800 transition-opacity duration-200 ${
              isFading ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <p className="truncate text-[11px] sm:text-xs leading-tight">
              <strong className="font-serif font-semibold text-ink-900 mr-1.5">
                {currentFact.speciesName} ({currentFact.scientificName}):
              </strong>
              <span className="text-ink-700 italic font-serif">
                "{currentFact.fact}"
              </span>
            </p>

            {/* Quick action button to inspect this species */}
            <button
              type="button"
              onClick={handleExploreSpecies}
              className="hidden md:inline-flex items-center gap-1 text-[10.5px] font-semibold text-natural-forest hover:text-natural-moss hover:underline shrink-0 transition-colors"
            >
              <span>Xem loài này</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right: Explorer Passport Progress Counter */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            title={`Bạn đã khám phá ${discoveredCount}/${totalSpeciesCount} loài chim Việt Nam`}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-medium transition-all ${
              isAllUnlocked
                ? 'bg-natural-amber/15 text-natural-amber border-natural-amber/40 shadow-xs'
                : 'bg-paper-100 text-ink-700 border-paper-border shadow-xs'
            }`}
          >
            {isAllUnlocked ? (
              <Trophy className="w-3 h-3 text-natural-amber animate-pulse" />
            ) : (
              <Compass className="w-3 h-3 text-natural-moss" />
            )}
            <span>
              <strong className="text-ink-900">{discoveredCount}</strong> / {totalSpeciesCount} loài
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextFact}
            title="Đổi sự thật khác"
            aria-label="Đổi sự thật khác"
            className="p-1 rounded-md text-ink-500 hover:text-natural-moss hover:bg-paper-100 transition-colors"
          >
            <Dices className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default AvianFunFactsRibbon;
