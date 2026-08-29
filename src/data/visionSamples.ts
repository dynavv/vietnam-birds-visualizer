export interface VisionSampleItem {
  id: string;
  title: string;
  speciesId: string;
  description: string;
  imageUrl: string;
}

export const VISION_DEMO_SAMPLES: VisionSampleItem[] = [
  {
    id: 'sample-edwardsi',
    title: 'Gà lôi lam mào trắng',
    speciesId: 'lophura-edwardsi',
    description: 'Chim trĩ đặc hữu cực kỳ nguy cấp (CR) miền Trung',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Lophura_edwardsi_-London_Zoo%2C_England-8a.jpg/800px-Lophura_edwardsi_-London_Zoo%2C_England-8a.jpg'
  },
  {
    id: 'sample-oreskios',
    title: 'Nuốc bụng vàng',
    speciesId: 'harpactes-oreskios',
    description: 'Chim Nuốc rừng thường xanh đất thấp',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Orange-breasted_trogon_%28Harpactes_oreskios_stellae%29_male.jpg/800px-Orange-breasted_trogon_%28Harpactes_oreskios_stellae%29_male.jpg'
  },
  {
    id: 'sample-langbianis',
    title: 'Mi Langbiang',
    speciesId: 'liochicla-langbianis',
    description: 'Chim đặc hữu nguy cấp (EN) cao nguyên Lâm Viên',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Grey-crowned_Crocias.jpg/800px-Grey-crowned_Crocias.jpg'
  }
];

export function getVisionSampleById(id: string): VisionSampleItem | undefined {
  return VISION_DEMO_SAMPLES.find(sample => sample.id === id);
}

export function getVisionSampleBySpeciesId(speciesId: string): VisionSampleItem | undefined {
  return VISION_DEMO_SAMPLES.find(sample => sample.speciesId === speciesId);
}
