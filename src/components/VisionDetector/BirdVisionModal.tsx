import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  ScanEye,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Feather,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { analyzeBirdImage, BirdVisionResult } from '../../services/birdVisionService';
import { matchSpeciesWithMuseum, SpeciesMatchResult } from '../../utils/speciesMatcher';
import { VISION_DEMO_SAMPLES, VisionSampleItem } from '../../data/visionSamples';
import { TaxonomyContext } from '../../context/TaxonomyContext';
import { speciesData } from '../../data';
import { ConservationBadge } from '../Common/ConservationBadge';
import { IUCNStatus, BirdSpecies } from '../../types/bird';

export interface BirdVisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSpecies?: (speciesId: string) => void;
}

export const BirdVisionModal: React.FC<BirdVisionModalProps> = ({
  isOpen,
  onClose,
  onSelectSpecies
}) => {
  const taxonomyContext = useContext(TaxonomyContext);
  const allSpeciesList: BirdSpecies[] = taxonomyContext?.allSpecies || (speciesData as BirdSpecies[]);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('Đang chuẩn bị ảnh & kết nối AI...');
  const [visionResult, setVisionResult] = useState<BirdVisionResult | null>(null);
  const [matchResult, setMatchResult] = useState<SpeciesMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [, setActiveSampleId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Reset state helper
  const resetState = () => {
    setSelectedImage(null);
    setIsAnalyzing(false);
    setVisionResult(null);
    setMatchResult(null);
    setError(null);
    setActiveSampleId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Execute Vision Analysis
  const runAnalysis = async (imageDataUrl: string, mimeType: string = 'image/jpeg') => {
    setIsAnalyzing(true);
    setError(null);
    setVisionResult(null);
    setMatchResult(null);
    setAnalysisStep('Đang tải ảnh và trích xuất dữ liệu...');

    const stepTimer1 = setTimeout(() => {
      setAnalysisStep('Đang quét lông vũ & cấu trúc mỏ...');
    }, 300);

    const stepTimer2 = setTimeout(() => {
      setAnalysisStep('Phân tích đặc điểm hình thái và sinh thái...');
    }, 700);

    const stepTimer3 = setTimeout(() => {
      setAnalysisStep('Đối chiếu cơ sở dữ liệu Bảo tàng số...');
    }, 1100);

    try {
      const result = await analyzeBirdImage(imageDataUrl, mimeType);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      setVisionResult(result);
      if (result.is_bird) {
        const match = matchSpeciesWithMuseum(result, allSpeciesList);
        setMatchResult(match);
      }
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setError(err?.message || 'Có lỗi xảy ra trong quá trình nhận diện hình ảnh.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // File selection handler
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setSelectedImage(dataUrl);
        setActiveSampleId(null);
        runAnalysis(dataUrl, file.type);
      }
    };
    reader.onerror = () => {
      setError('Không thể đọc dữ liệu file ảnh. Vui lòng thử lại.');
    };
    reader.readAsDataURL(file);
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Demo sample selector
  const handleSelectSample = (sample: VisionSampleItem) => {
    setSelectedImage(sample.imageUrl);
    setActiveSampleId(sample.id);
    runAnalysis(sample.imageUrl, 'image/jpeg');
  };

  // Navigate to curator view for a given species
  const handleOpenCurator = (speciesId: string) => {
    if (taxonomyContext) {
      taxonomyContext.selectSpecies(speciesId);
      taxonomyContext.setActiveView('curator');
    }
    if (onSelectSpecies) {
      onSelectSpecies(speciesId);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-stone-900/60 backdrop-blur-sm animate-fadeIn"
      data-testid="bird-vision-modal"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl lg:max-w-4xl max-h-[90vh] bg-paper-50 rounded-2xl border-2 border-paper-border shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-paper-100/95 border-b border-paper-border shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-natural-moss/10 text-natural-moss border border-natural-moss/20">
              <ScanEye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-ink-900">
                  Giám Định Loài Chim Bằng Thị Giác AI
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-natural-moss/10 text-natural-moss border border-natural-moss/20">
                  <Sparkles className="w-2.5 h-2.5" /> Google Gemini AI
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-ink-600 font-sans mt-0.5">
                Nhận diện hình thái, phân loại học IOC và liên kết trực tiếp mẫu vật Bảo tàng số
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-paper-200 text-ink-600 transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-ink-800 font-sans leading-relaxed">
          
          {/* Error Banner when invalid file is provided */}
          {!selectedImage && !isAnalyzing && error && (
            <div className="p-4 rounded-xl bg-red-50/90 border border-red-200 text-red-950 space-y-2 animate-in fade-in-50 duration-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-serif font-bold text-sm text-red-900">
                    Lỗi chọn tệp ảnh
                  </h3>
                  <p className="text-xs text-red-800 mt-0.5 leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STATE 1: No image selected — Dropzone & Quick Demo Samples */}
          {!selectedImage && !isAnalyzing && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              
              {/* Drag & Drop Upload Zone */}
              <div
                data-testid="vision-dropzone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-natural-moss bg-natural-moss/10 scale-[1.01]'
                    : 'border-paper-border hover:border-natural-moss/60 bg-paper-100/50 hover:bg-paper-100'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  data-testid="vision-file-input"
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  data-testid="vision-camera-input"
                />

                <div className="p-4 rounded-2xl bg-paper-50 border border-paper-border text-natural-moss shadow-sm">
                  <Upload className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-ink-900">
                    Kéo &amp; thả ảnh chim vào đây hoặc bấm để chọn tệp
                  </h3>
                  <p className="text-xs text-ink-500 mt-1">
                    Hỗ trợ định dạng JPG, PNG, WEBP (Ảnh chụp thực địa rõ nét phần đầu, mỏ hoặc toàn thân)
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-natural-forest hover:bg-natural-moss text-paper-50 font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Chọn tệp ảnh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-paper-50 hover:bg-paper-200 text-ink-800 border border-paper-border font-semibold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-natural-moss" />
                    <span>Chụp ảnh</span>
                  </button>
                </div>
              </div>

              {/* Quick Demo Samples Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-natural-terracotta" />
                    <h3 className="font-serif font-bold text-sm sm:text-base text-ink-900">
                      Ảnh Mẫu Thử Nghiệm Nhanh (3 Mẫu Vật Đặc Trưng)
                    </h3>
                  </div>
                  <span className="text-[11px] text-ink-500">Nhấn để giám định tức thì</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {VISION_DEMO_SAMPLES.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      aria-label={sample.title}
                      className="group p-3 bg-paper-100/80 hover:bg-paper-100 border border-paper-border hover:border-natural-moss/40 rounded-xl text-left transition-all shadow-2xs hover:shadow-sm cursor-pointer flex flex-col gap-2"
                    >
                      <div className="relative w-full h-28 rounded-lg overflow-hidden bg-paper-200 border border-paper-border/60">
                        <img
                          src={sample.imageUrl}
                          alt={sample.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                        <span className="absolute bottom-1.5 left-2 text-[10px] font-mono text-white/95 font-medium px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-xs">
                          Thử nghiệm
                        </span>
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-ink-900 group-hover:text-natural-forest transition-colors">
                          {sample.title}
                        </h4>
                        <p className="text-[11px] text-ink-600 line-clamp-2 mt-0.5">
                          {sample.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* STATE 2: Analyzing Pulse Radar Animation */}
          {selectedImage && isAnalyzing && (
            <div className="p-8 rounded-2xl bg-paper-100 border border-paper-border flex flex-col items-center justify-center gap-5 text-center animate-in fade-in-50 duration-200">
              <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-2xl overflow-hidden border-2 border-natural-moss/50 shadow-lg">
                <img
                  src={selectedImage}
                  alt="Ảnh đang phân tích"
                  className="w-full h-full object-cover"
                />
                
                {/* Radar / Laser Scan Sweep Animation */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-400/30 to-transparent animate-pulse pointer-events-none" />
                <div className="absolute inset-x-0 h-1 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce pointer-events-none" />
                
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                  <div className="p-3 rounded-full bg-natural-forest/80 text-paper-50 shadow-md animate-spin">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 max-w-md">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-natural-moss/10 text-natural-moss border border-natural-moss/30 font-semibold text-xs">
                  <ScanEye className="w-3.5 h-3.5 animate-pulse" />
                  <span>{analysisStep}</span>
                </div>
                <p className="text-xs text-ink-600">
                  Mô hình Google Gemini AI đang đối chiếu mẫu giải phẫu với danh lục 68 loài chim đặc hữu Việt Nam.
                </p>
              </div>
            </div>
          )}

          {/* STATE 3: Error Result */}
          {selectedImage && !isAnalyzing && error && (
            <div className="p-6 rounded-2xl bg-red-50/90 border border-red-200 text-red-950 space-y-4 animate-in fade-in-50 duration-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-red-900">
                    Không thể hoàn thành giám định hình ảnh
                  </h3>
                  <p className="text-xs text-red-800 mt-1 leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetState}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-800 hover:bg-red-900 text-paper-50 font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Thử lại với ảnh khác</span>
                </button>
              </div>
            </div>
          )}

          {/* STATE 4: AI Result Finished — Non-bird */}
          {selectedImage && !isAnalyzing && visionResult && !visionResult.is_bird && !error && (
            <div className="p-6 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 space-y-4 animate-in fade-in-50 duration-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-amber-900">
                    Không phát hiện thấy loài chim trong hình ảnh
                  </h3>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    {visionResult.brief_description || 'Hệ thống không nhận diện được đối tượng loài chim trong bức ảnh này.'}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetState}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-800 hover:bg-amber-900 text-paper-50 font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Thử lại với ảnh khác</span>
                </button>
              </div>
            </div>
          )}

          {/* STATE 5: AI Result Finished — Valid Bird Identified */}
          {selectedImage && !isAnalyzing && visionResult && visionResult.is_bird && !error && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              
              {/* Museum Match Banner */}
              {matchResult?.isMuseumSpecies && matchResult.matchedSpecies ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-xs sm:text-sm text-emerald-900">
                      ✨ Khớp với mẫu vật trong Bảo tàng số!
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 hidden sm:inline">
                    ID: {matchResult.matchedSpecies.id}
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-paper-100 border border-paper-border text-ink-800 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <Feather className="w-4 h-4 text-natural-terracotta shrink-0" />
                    <span className="font-semibold text-xs sm:text-sm text-ink-900">
                      🌿 Loài chim hoang dã (Chưa có mẫu vật trong bộ sưu tập 68 loài đặc hữu)
                    </span>
                  </div>
                </div>
              )}

              {/* Main Result Card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-5 rounded-2xl bg-paper-100 border border-paper-border">
                
                {/* Left Column: Image Thumbnail Preview */}
                <div className="md:col-span-4 flex flex-col gap-2.5">
                  <div className="w-full h-48 md:h-56 rounded-xl overflow-hidden bg-paper-200 border border-paper-border shadow-xs relative">
                    <img
                      src={selectedImage}
                      alt={visionResult.species_vietnamese || 'Chim được giám định'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={resetState}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-paper-50 hover:bg-paper-200 text-ink-700 border border-paper-border font-medium text-xs rounded-xl transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Chọn ảnh khác</span>
                  </button>
                </div>

                {/* Right Column: Taxonomy & Identification details */}
                <div className="md:col-span-8 flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    
                    {/* Header Names & Badges */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-natural-moss/10 text-natural-forest border border-natural-moss/30">
                          {visionResult.confidence_score}% Tự tin
                        </span>
                        <ConservationBadge
                          status={(matchResult?.matchedSpecies?.conservation.iucn || (visionResult.conservation_status as IUCNStatus) || 'LC')}
                          size="sm"
                        />
                      </div>

                      <h3 className="font-serif font-bold text-xl sm:text-2xl text-ink-900">
                        {visionResult.species_vietnamese || matchResult?.matchedSpecies?.vietnameseName || 'Chưa xác định tên Việt'}
                      </h3>
                      <p className="font-serif italic text-sm sm:text-base text-natural-forest font-semibold mt-0.5">
                        {visionResult.species_scientific || matchResult?.matchedSpecies?.scientificName || 'Unknown species'}
                      </p>
                    </div>

                    {/* Taxonomy Chips */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-paper-50 border border-paper-border text-ink-700 font-mono">
                        Bộ: <strong>{visionResult.order_scientific || matchResult?.matchedSpecies?.taxonomy.order || 'Aves'}</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-paper-50 border border-paper-border text-ink-700 font-mono">
                        Họ: <strong>{visionResult.family_scientific || matchResult?.matchedSpecies?.taxonomy.family || 'Unknown'}</strong>
                      </span>
                    </div>

                    {/* Diagnostic Features */}
                    {visionResult.diagnostic_features && visionResult.diagnostic_features.length > 0 && (
                      <div className="p-3 rounded-xl bg-paper-50 border border-paper-border space-y-1.5">
                        <div className="flex items-center gap-1.5 text-natural-moss font-semibold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>3 Đặc Điểm Hình Thái Nhận Dạng Then Chốt:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-ink-700 text-xs pl-1">
                          {visionResult.diagnostic_features.map((feature, idx) => (
                            <li key={idx} className="leading-snug">
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Habitat & Description */}
                    {visionResult.brief_description && (
                      <p className="text-xs text-ink-700 leading-relaxed italic bg-paper-50/60 p-2.5 rounded-xl border border-paper-border/60">
                        "{visionResult.brief_description}"
                      </p>
                    )}

                  </div>

                  {/* Action Button: Matched Species in Museum */}
                  {matchResult?.isMuseumSpecies && matchResult.matchedSpecies && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleOpenCurator(matchResult.matchedSpecies!.id)}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-natural-forest hover:bg-natural-moss text-paper-50 font-serif font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
                      >
                        <Sparkles className="w-4 h-4 text-natural-sand group-hover:scale-110 transition-transform" />
                        <span>👉 Mở Cẩm Nang Giám Tuyển &amp; Nghe Tiếng Hót</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}

                </div>
              </div>

              {/* Related Species Section (If Non-Museum Species) */}
              {!matchResult?.isMuseumSpecies && matchResult?.relatedMuseumSpecies && matchResult.relatedMuseumSpecies.length > 0 && (
                <div className="p-4 rounded-xl bg-paper-100 border border-paper-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-natural-moss font-serif font-bold text-xs sm:text-sm">
                      <Layers className="w-4 h-4" />
                      <h4>Mẫu vật cùng Họ/Chi có trong Bảo tàng:</h4>
                    </div>
                    <span className="text-[11px] text-ink-500">Nhấn để khám phá chi tiết</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {matchResult.relatedMuseumSpecies.map((rel) => (
                      <button
                        key={rel.id}
                        type="button"
                        onClick={() => handleOpenCurator(rel.id)}
                        className="p-2.5 bg-paper-50 hover:bg-paper-200/80 border border-paper-border rounded-xl text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer flex items-center gap-2.5 group"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-paper-200 border border-paper-border shrink-0">
                          <img
                            src={rel.illustration.thumbnailUrl || rel.illustration.imageUrl}
                            alt={rel.vietnameseName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-serif font-bold text-xs text-ink-900 truncate group-hover:text-natural-forest">
                            {rel.vietnameseName}
                          </div>
                          <div className="text-[10px] font-serif italic text-ink-600 truncate">
                            {rel.scientificName}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Minimalist Flat Status Footer */}
        <div className="px-5 sm:px-6 py-2.5 bg-paper-100/90 border-t border-paper-border flex items-center justify-between text-[11px] text-ink-500 font-mono shrink-0">
          <span>Avifauna of Vietnam AI Vision Curator • Google Gemini AI</span>
          <span className="hidden sm:inline">Nhấn ESC hoặc click ngoài để đóng</span>
        </div>
      </div>
    </div>
  );
};

export default BirdVisionModal;
