import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Upload,
  Image as ImageIcon,
  BookOpen,
  Compass,
  Layers,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Feather,
  Bird,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useTaxonomy } from '../../context/TaxonomyContext';
import {
  chatWithNaturalist,
  identifyBirdImage,
  generateExpeditionLog,
  getGeminiApiKey,
  setGeminiApiKey,
  hasGeminiApiKey,
  ChatMessage,
  BirdIdentificationResult,
  GEMINI_MODEL_DEFAULT
} from '../../services/geminiService';

export type AITab = 'chat' | 'vision' | 'journal' | 'settings';

export interface GeminiNaturalistModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AITab;
}

export const GeminiNaturalistModal: React.FC<GeminiNaturalistModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'chat'
}) => {
  const { selectedSpecies, allSpecies, selectSpecies, setActiveView } = useTaxonomy();

  const [activeTab, setActiveTab] = useState<AITab>(initialTab);
  const [apiKeyInput, setApiKeyInput] = useState<string>(getGeminiApiKey());
  const [isKeySaved, setIsKeySaved] = useState<boolean>(false);

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Vision / Photo Identification State
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string>('image/jpeg');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isVisionLoading, setIsVisionLoading] = useState<boolean>(false);
  const [visionResult, setVisionResult] = useState<BirdIdentificationResult | null>(null);
  const [visionError, setVisionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Field Journal State
  const [journalContent, setJournalContent] = useState<string | null>(null);
  const [isJournalLoading, setIsJournalLoading] = useState<boolean>(false);
  const [journalError, setJournalError] = useState<string | null>(null);

  // Auto scroll chat
  useEffect(() => {
    if (chatBottomRef.current && activeTab === 'chat' && typeof chatBottomRef.current.scrollIntoView === 'function') {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isChatLoading, activeTab]);

  // Sync initial tab when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setApiKeyInput(getGeminiApiKey());
    }
  }, [isOpen, initialTab]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // --- Handlers ---
  const handleSaveApiKey = () => {
    setGeminiApiKey(apiKeyInput);
    setIsKeySaved(true);
    setTimeout(() => setIsKeySaved(false), 3000);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const messageToSend = customPrompt || inputMessage.trim();
    if (!messageToSend || isChatLoading) return;

    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: messageToSend }];
    setChatHistory(newHistory);
    if (!customPrompt) setInputMessage('');
    setIsChatLoading(true);
    setChatError(null);

    try {
      const reply = await chatWithNaturalist(chatHistory, messageToSend, selectedSpecies);
      setChatHistory([...newHistory, { role: 'model', text: reply }]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi kết nối với Gemini AI.';
      setChatError(errMsg);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setVisionError('Vui lòng chọn file hình ảnh (JPG, PNG, WebP).');
      return;
    }

    setSelectedImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreviewUrl(result);
      // Remove metadata prefix (e.g. data:image/jpeg;base64,)
      const base64Data = result.split(',')[1];
      setSelectedImageBase64(base64Data);
      setVisionResult(null);
      setVisionError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRunVisionIdentification = async () => {
    if (!selectedImageBase64 || isVisionLoading) return;
    setIsVisionLoading(true);
    setVisionError(null);
    setVisionResult(null);

    try {
      const result = await identifyBirdImage(selectedImageBase64, selectedImageMime, allSpecies);
      setVisionResult(result);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Không thể nhận diện hình ảnh lúc này.';
      setVisionError(errMsg);
    } finally {
      setIsVisionLoading(false);
    }
  };

  const handleGenerateJournal = async () => {
    if (!selectedSpecies || isJournalLoading) return;
    setIsJournalLoading(true);
    setJournalError(null);

    try {
      const log = await generateExpeditionLog(selectedSpecies);
      setJournalContent(log);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Không thể tạo nhật ký thực địa.';
      setJournalError(errMsg);
    } finally {
      setIsJournalLoading(false);
    }
  };

  const handleInspectIdentifiedSpecies = (speciesId: string) => {
    selectSpecies(speciesId);
    setActiveView('curator');
    onClose();
  };

  const isConfigured = hasGeminiApiKey();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink-900/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gemini-modal-title"
      data-testid="gemini-naturalist-modal"
    >
      <div className="relative w-full max-w-3xl h-[85vh] max-h-[750px] bg-paper-100 border border-paper-border rounded-2xl shadow-2xl flex flex-col overflow-hidden text-ink-900 font-sans">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-paper-200/90 border-b border-paper-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-natural-forest to-natural-moss text-paper-50 shadow-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="gemini-modal-title" className="font-serif font-bold text-base sm:text-lg text-ink-900">
                  Gemini Avian Naturalist
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Google AI Studio • {GEMINI_MODEL_DEFAULT}
                </span>
              </div>
              <p className="text-[11px] text-ink-600 font-sans">
                Trợ lý Điểu học &amp; Nhận diện Đa phương thức Chim Hoang dã Việt Nam
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="p-1.5 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-paper-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-2 bg-paper-100 border-b border-paper-border/80 flex items-center gap-2 shrink-0 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'chat'
                ? 'border-natural-moss text-natural-forest bg-paper-50 shadow-xs'
                : 'border-transparent text-ink-600 hover:text-ink-900 hover:bg-paper-200/50'
            }`}
          >
            <Feather className="w-3.5 h-3.5 text-natural-moss" />
            <span>Hỏi Đáp Giám Tuyển</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vision')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'vision'
                ? 'border-natural-moss text-natural-forest bg-paper-50 shadow-xs'
                : 'border-transparent text-ink-600 hover:text-ink-900 hover:bg-paper-200/50'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-natural-terracotta" />
            <span>Nhận Diện Ảnh Thực Địa</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('journal')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'journal'
                ? 'border-natural-moss text-natural-forest bg-paper-50 shadow-xs'
                : 'border-transparent text-ink-600 hover:text-ink-900 hover:bg-paper-200/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-natural-indigo" />
            <span>Nhật Ký Thám Hiểm</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`ml-auto px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-natural-moss text-natural-forest bg-paper-50 shadow-xs'
                : 'border-transparent text-ink-600 hover:text-ink-900 hover:bg-paper-200/50'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-natural-amber" />
            <span>API Key &amp; Cài Đặt</span>
            {!isConfigured && (
              <span className="w-2 h-2 rounded-full bg-natural-terracotta animate-ping" />
            )}
          </button>
        </div>

        {/* API Key Missing Warning Banner (If Not Configured) */}
        {!isConfigured && activeTab !== 'settings' && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-900 shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Chưa cấu hình Gemini API Key. Bạn có thể lấy key miễn phí từ Google AI Studio.</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className="text-amber-800 font-semibold underline hover:text-amber-950 ml-2 shrink-0 cursor-pointer"
            >
              Nhập API Key ↗
            </button>
          </div>
        )}

        {/* Main Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 min-h-0 bg-paper-50">
          
          {/* TAB 1: CHAT WITH NATURALIST */}
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col justify-between space-y-3">
              {/* Context Pill if species selected */}
              {selectedSpecies && (
                <div className="px-3 py-1.5 rounded-xl bg-natural-moss/10 border border-natural-moss/20 flex items-center justify-between text-xs shrink-0">
                  <div className="flex items-center gap-2 truncate">
                    <Bird className="w-4 h-4 text-natural-forest shrink-0" />
                    <span className="text-ink-600">Đang trao đổi về:</span>
                    <strong className="text-ink-900 font-serif font-bold truncate">
                      {selectedSpecies.vietnameseName} ({selectedSpecies.scientificName})
                    </strong>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-paper-50 px-1.5 py-0.5 rounded border border-natural-moss/30 text-natural-forest shrink-0 ml-2">
                    {selectedSpecies.isEndemic ? '★ Đặc Hữu' : selectedSpecies.distribution.ebaRegion}
                  </span>
                </div>
              )}

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {chatHistory.length === 0 ? (
                  <div className="py-8 text-center space-y-4 max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-natural-moss/15 text-natural-forest flex items-center justify-center mx-auto border border-natural-moss/30 shadow-xs">
                      <Feather className="w-6 h-6 transform -rotate-12" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-ink-900">
                        Xin chào! Tôi là Trợ lý Giám tuyển Điểu học
                      </h3>
                      <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                        Hãy đặt câu hỏi về tập tính sinh thái, phân loại học, tiếng hót hoặc nguồn gốc các loài chim quý hiếm của Việt Nam.
                      </p>
                    </div>

                    {/* Quick Suggestion Chips */}
                    <div className="space-y-2 pt-2 text-left">
                      <p className="text-[11px] font-mono uppercase text-ink-500 font-semibold text-center">
                        Gợi ý câu hỏi nhanh:
                      </p>
                      <button
                        type="button"
                        onClick={() => handleSendMessage(selectedSpecies ? `Hãy phân tích chi tiết đặc điểm hình thái và tập tính kiếm ăn của loài ${selectedSpecies.vietnameseName}.` : 'Tại sao Cao nguyên Đà Lạt lại là trung tâm phát sinh loài chim đặc hữu quan trọng nhất Việt Nam?')}
                        className="w-full text-left p-2.5 rounded-xl bg-paper-100 hover:bg-natural-moss/10 border border-paper-border hover:border-natural-moss/40 text-xs text-ink-800 transition-all cursor-pointer shadow-2xs"
                      >
                        💡 {selectedSpecies ? `Phân tích đặc điểm hình thái và tập tính loài ${selectedSpecies.vietnameseName}` : 'Tại sao Cao nguyên Đà Lạt có nhiều chim đặc hữu?'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendMessage('Hãy giải thích ý nghĩa sinh thái của 6 Vùng Chim Đặc Hữu (EBAs) tại Việt Nam theo tiêu chuẩn BirdLife International.')}
                        className="w-full text-left p-2.5 rounded-xl bg-paper-100 hover:bg-natural-moss/10 border border-paper-border hover:border-natural-moss/40 text-xs text-ink-800 transition-all cursor-pointer shadow-2xs"
                      >
                        🗺️ Ý nghĩa của 6 Vùng Chim Đặc Hữu (EBAs) tại Việt Nam
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendMessage('Những loài chim nào ở Việt Nam hiện đang nằm trong tình trạng Cực kỳ nguy cấp (CR) trong Sách Đỏ?')}
                        className="w-full text-left p-2.5 rounded-xl bg-paper-100 hover:bg-natural-moss/10 border border-paper-border hover:border-natural-moss/40 text-xs text-ink-800 transition-all cursor-pointer shadow-2xs"
                      >
                        🛡️ Các loài chim Cực kỳ nguy cấp (CR) tại Việt Nam
                      </button>
                    </div>
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2.5 ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.role === 'model' && (
                        <div className="w-7 h-7 rounded-lg bg-natural-forest text-paper-50 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Sparkles className="w-4 h-4 text-amber-300" />
                        </div>
                      )}
                      <div
                        className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                          msg.role === 'user'
                            ? 'bg-natural-forest text-paper-50 rounded-br-xs'
                            : 'bg-paper-100 border border-paper-border text-ink-900 rounded-bl-xs whitespace-pre-wrap font-serif'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}

                {isChatLoading && (
                  <div className="flex gap-2.5 items-center text-xs text-ink-600 italic pl-1">
                    <Loader2 className="w-4 h-4 animate-spin text-natural-moss" />
                    <span>Giám tuyển Gemini đang nghiên cứu dữ liệu và soạn câu trả lời...</span>
                  </div>
                )}

                {chatError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-800">
                    <strong>Lỗi:</strong> {chatError}
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="pt-2 border-t border-paper-border flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Hỏi bất cứ điều gì về điểu học Việt Nam..."
                  disabled={isChatLoading || !isConfigured}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-paper-100 border border-paper-border text-xs sm:text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-natural-moss/40 focus:border-natural-moss/80 transition-all disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isChatLoading || !isConfigured}
                  className="px-4 py-2.5 rounded-xl bg-natural-forest hover:bg-natural-moss text-paper-50 font-semibold text-xs transition-all shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>Gửi</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: MULTIMODAL VISION IDENTIFIER */}
          {activeTab === 'vision' && (
            <div className="space-y-4">
              <div className="text-center max-w-md mx-auto space-y-1">
                <h3 className="font-serif font-bold text-base text-ink-900">
                  Nhận Diện Loài Chim Qua Ảnh Thực Địa (Gemini Vision)
                </h3>
                <p className="text-xs text-ink-600 leading-relaxed">
                  Tải lên ảnh chụp chim ngoài thiên nhiên, Gemini Multimodal sẽ phân tích giải phẫu và đối chiếu trực tiếp với 68 loài chim trong cơ sở dữ liệu.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-natural-moss/40 hover:border-natural-moss bg-paper-100 hover:bg-natural-moss/5 rounded-2xl p-5 text-center cursor-pointer transition-all space-y-2 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {imagePreviewUrl ? (
                  <div className="space-y-2">
                    <div className="w-48 h-48 mx-auto rounded-xl overflow-hidden shadow-md border border-paper-border bg-paper-300">
                      <img
                        src={imagePreviewUrl}
                        alt="Ảnh cần nhận diện"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-natural-forest font-semibold">
                      Nhấn vào đây để chọn ảnh khác
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="w-12 h-12 rounded-2xl bg-natural-terracotta/10 text-natural-terracotta flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-xs text-ink-700">
                      <span className="font-semibold text-natural-forest">Tải ảnh lên</span> hoặc kéo thả ảnh vào đây
                    </div>
                    <p className="text-[10px] text-ink-500 font-mono">
                      Hỗ trợ: JPG, PNG, WEBP (Khuyên dùng ảnh thấy rõ đầu, mỏ và lông cánh)
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {selectedImageBase64 && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleRunVisionIdentification}
                    disabled={isVisionLoading || !isConfigured}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-natural-forest via-natural-moss to-natural-forest hover:opacity-95 text-paper-50 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isVisionLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                        <span>Gemini Vision đang phân tích hình thái...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Phân Tích &amp; Nhận Diện Bằng Gemini</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {visionError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-800">
                  <strong>Lỗi nhận diện:</strong> {visionError}
                </div>
              )}

              {/* Vision Identification Result Card */}
              {visionResult && (
                <div className="p-4 sm:p-5 rounded-2xl bg-paper-100 border-2 border-natural-moss/60 shadow-paper-card space-y-3 animate-fadeIn">
                  <div className="flex items-start justify-between gap-3 border-b border-paper-border/80 pb-3 flex-wrap">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-natural-forest tracking-wider">
                        KẾT QUẢ CHẨN ĐOÁN
                      </span>
                      <h4 className="font-serif font-bold text-base sm:text-lg text-ink-900 leading-tight">
                        {visionResult.speciesNameVi}
                      </h4>
                      <p className="font-serif italic text-xs text-natural-forest">
                        {visionResult.scientificName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right font-mono text-xs">
                        <span className="text-ink-500 block text-[10px]">Độ tin cậy:</span>
                        <strong className="text-natural-moss text-sm">{visionResult.confidence}%</strong>
                      </div>
                      {visionResult.isEndemicToVietnam && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          ★ Báu vật đặc hữu
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rationale & Observed Features */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <strong className="text-ink-900 font-semibold block mb-0.5">Lập luận giải phẫu:</strong>
                      <p className="text-ink-700 leading-relaxed font-sans bg-paper-50 p-2.5 rounded-xl border border-paper-border">
                        {visionResult.diagnosticRationale}
                      </p>
                    </div>

                    {visionResult.keyFeaturesObserved && visionResult.keyFeaturesObserved.length > 0 && (
                      <div>
                        <strong className="text-ink-900 font-semibold block mb-1">Đặc điểm hình thái nhận diện được:</strong>
                        <div className="flex flex-wrap gap-1.5">
                          {visionResult.keyFeaturesObserved.map((feat, fIdx) => (
                            <span
                              key={fIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-paper-200 text-ink-800 text-[11px] border border-paper-border"
                            >
                              <CheckCircle2 className="w-3 h-3 text-natural-moss" />
                              <span>{feat}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div className="p-2 rounded-lg bg-paper-50 border border-paper-border flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-natural-terracotta shrink-0" />
                        <span className="truncate">Vùng sinh thái: <strong>{visionResult.suggestedEba}</strong></span>
                      </div>
                      <div className="p-2 rounded-lg bg-paper-50 border border-paper-border flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-natural-amber shrink-0" />
                        <span className="truncate">Tình trạng: <strong>{visionResult.conservationNote}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Action CTA to switch view */}
                  {visionResult.matchedSpeciesId && (
                    <div className="pt-2 border-t border-paper-border/80 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleInspectIdentifiedSpecies(visionResult.matchedSpeciesId!)}
                        className="px-4 py-2 rounded-xl bg-natural-forest hover:bg-natural-moss text-paper-50 font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Mở Hồ Sơ Loài Này Trên Bảo Tàng</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EXPEDITION FIELD JOURNAL */}
          {activeTab === 'journal' && (
            <div className="space-y-4">
              <div className="text-center max-w-md mx-auto space-y-1">
                <h3 className="font-serif font-bold text-base text-ink-900">
                  Sinh Nhật Ký Thám Hiểm Thực Địa
                </h3>
                <p className="text-xs text-ink-600 leading-relaxed">
                  Tạo một trang nhật ký quan sát dã ngoại giàu chất thơ tự nhiên học cho loài chim đang chọn.
                </p>
              </div>

              {selectedSpecies ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-paper-100 border border-paper-border">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-ink-500">Mẫu vật ghi nhận:</span>
                      <h4 className="font-serif font-bold text-sm text-ink-900">
                        {selectedSpecies.vietnameseName} ({selectedSpecies.scientificName})
                      </h4>
                      <p className="text-[11px] text-natural-forest font-sans">
                        {selectedSpecies.distribution.ebaRegion} • {selectedSpecies.distribution.elevation}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateJournal}
                      disabled={isJournalLoading || !isConfigured}
                      className="px-4 py-2 rounded-xl bg-natural-forest hover:bg-natural-moss text-paper-50 font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isJournalLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                          <span>Đang viết nhật ký...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>{journalContent ? 'Tạo Lại Nhật Ký' : 'Tạo Nhật Ký Thực Địa'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {journalError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-800">
                      <strong>Lỗi:</strong> {journalError}
                    </div>
                  )}

                  {journalContent && (
                    <div className="p-5 rounded-2xl bg-paper-100 border border-paper-border shadow-paper-card font-serif text-ink-900 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap border-l-4 border-l-natural-moss animate-fadeIn">
                      {journalContent}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-ink-500 italic">
                  Vui lòng chọn một loài chim trên Bản đồ hoặc Cây phả hệ để sinh nhật ký thám hiểm.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: API KEY & SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto space-y-4 py-2">
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-base text-ink-900">
                  Cấu Hình Google Gemini API Key
                </h3>
                <p className="text-xs text-ink-600 leading-relaxed font-sans">
                  Để sử dụng các tính năng Trợ lý Điểu học, Nhận diện ảnh Vision và Sinh nhật ký, bạn cần cung cấp một Gemini API Key từ <strong>Google AI Studio</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-paper-100 border border-paper-border space-y-3 shadow-xs">
                <label htmlFor="gemini-api-key-input" className="block text-xs font-semibold text-ink-800">
                  Gemini API Key:
                </label>
                <div className="flex gap-2">
                  <input
                    id="gemini-api-key-input"
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-paper-50 border border-paper-border text-xs font-mono text-ink-900 focus:outline-none focus:ring-2 focus:ring-natural-moss/40 focus:border-natural-moss/80"
                  />
                  <button
                    type="button"
                    onClick={handleSaveApiKey}
                    className="px-4 py-2 rounded-xl bg-natural-forest hover:bg-natural-moss text-paper-50 font-semibold text-xs transition-all shadow-sm cursor-pointer shrink-0"
                  >
                    Lưu Key
                  </button>
                </div>

                {isKeySaved && (
                  <p className="text-xs text-natural-forest font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã lưu API Key thành công vào bộ nhớ cục bộ trình duyệt.</span>
                  </p>
                )}

                <div className="pt-2 border-t border-paper-border/60 text-[11px] text-ink-600 space-y-1 font-sans">
                  <p>
                    • Nhận key miễn phí 100% tại: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-natural-moss font-semibold underline inline-flex items-center gap-0.5">Google AI Studio Get API Key <ExternalLink className="w-2.5 h-2.5" /></a>
                  </p>
                  <p>
                    • API Key được lưu an toàn trong trình duyệt của bạn (LocalStorage) và chỉ gửi trực tiếp tới máy chủ Google Gen AI.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default GeminiNaturalistModal;
