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
    imageUrl: '/samples/edwardsi.jpg'
  },
  {
    id: 'sample-oreskios',
    title: 'Nuốc bụng vàng',
    speciesId: 'harpactes-oreskios',
    description: 'Chim Nuốc rừng thường xanh đất thấp',
    imageUrl: '/samples/oreskios.jpg'
  },
  {
    id: 'sample-langbianis',
    title: 'Mi Langbiang',
    speciesId: 'liochicla-langbianis',
    description: 'Chim đặc hữu nguy cấp (EN) cao nguyên Lâm Viên',
    imageUrl: '/samples/langbianis.jpg'
  }
];

export function getVisionSampleById(id: string): VisionSampleItem | undefined {
  return VISION_DEMO_SAMPLES.find(sample => sample.id === id);
}

export function getVisionSampleBySpeciesId(speciesId: string): VisionSampleItem | undefined {
  return VISION_DEMO_SAMPLES.find(sample => sample.speciesId === speciesId);
}
