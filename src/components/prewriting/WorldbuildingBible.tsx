'use client';

import React, { useState } from 'react';
import { useNovelStore } from '@/store/useNovelStore';
import { callGeminiRaw, callGeminiJson } from '@/lib/geminiClient';
import { WorldCategory } from '@/types/novel';
import { 
  Globe, 
  Plus, 
  Sparkles, 
  Trash2, 
  Search, 
  ShieldAlert, 
  Scroll, 
  MapPin, 
  Landmark, 
  Crown, 
  Lock, 
  Loader2, 
  ChevronRight, 
  LucideIcon,
  ImageIcon,
  Camera,
  Copy,
  Check,
  X,
  Wand2,
  ArrowRight
} from 'lucide-react';

const CATEGORY_META: Record<WorldCategory, { label: string; icon: LucideIcon; color: string }> = {
  geography: { label: 'Geografi & Lokasi', icon: MapPin, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  social_political: { label: 'Sistem Sosial & Politik', icon: Crown, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  culture_religion: { label: 'Budaya & Keyakinan', icon: Landmark, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  magic_technology: { label: 'Mekanika / Teknologi / Lore', icon: Sparkles, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  rules_laws: { label: 'Aturan Hukum & Protokol', icon: Scroll, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  faction_org: { label: 'Faksi & Organisasi Rahasia', icon: Lock, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' }
};

interface AutoWorldItem {
  category: WorldCategory;
  title: string;
  summary: string;
  detailedRules: string;
  secretsOrTaboos: string;
  tags: string[];
}

export const WorldbuildingBible: React.FC = () => {
  const { project, addWorldEntry, updateWorldEntry, deleteWorldEntry, settings, setPrewritingSubTab } = useNovelStore();
  const entries = project.worldEntries;

  const [selectedEntryId, setSelectedEntryId] = useState<string>(entries[0]?.id || '');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [imagePromptResult, setImagePromptResult] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const activeEntry = entries.find((e) => e.id === selectedEntryId) || entries[0];

  const handleCreateNewEntry = (category: WorldCategory = 'geography') => {
    const newId = addWorldEntry({
      category,
      title: 'Entri Dunia Baru',
      summary: '',
      detailedRules: '',
      secretsOrTaboos: '',
      tags: []
    });
    setSelectedEntryId(newId);
  };

  // 1-Click: Generate 3 Core World Entries from Premise & Genre
  const handleAutoGenerateWorldEntries = async () => {
    setIsAiLoading(true);
    setLoadingMessage('Gemini AI sedang membangun 3 entri World Bible (Lokasi Utama, Faksi Rahasia, Aturan Hukum)...');
    setRawAiExpandResult(null);

    try {
      const prompt = `Berdasarkan novel berikut:
Judul: ${project.title}
Genre: ${project.customGenreName || project.genre}
Premis: ${project.premise.logline || 'Novel intrik'}
Tema: ${project.theme.centralTheme || '-'}

Bangun 3 entri ensiklopedia dunia (World Bible) yang paling esensial dan menarik:
1. Lokasi / Landmark Geografis Utama (kategori: "geography")
2. Faksi / Organisasi / Lembaga Rahasia (kategori: "faction_org" atau "social_political")
3. Protokol / Aturan Hukum / Tabu Krusial (kategori: "rules_laws" atau "culture_religion")

Keluarkan dalam format JSON Array dengan 3 objek persis:
[
  {
    "category": "geography",
    "title": "Nama Lokasi / Faksi / Aturan",
    "summary": "Ringkasan atmosferik dan fungsi entri ini dalam dunia cerita (1-2 kalimat).",
    "detailedRules": "Detail cara kerja, deskripsi visual, dan konsistensi logika internalnya.",
    "secretsOrTaboos": "Satu rahasia terlarang atau celah berbahaya yang memicu intrik plot.",
    "tags": ["tag1", "tag2"]
  }
]
Kategori yang valid: "geography", "social_political", "culture_religion", "magic_technology", "rules_laws", "faction_org".`;

      const items = await callGeminiJson<AutoWorldItem[]>({
        apiKey: settings.geminiApiKey,
        model: settings.selectedModel || 'auto',
        temperature: 0.8,
        systemInstruction: 'Kamu adalah master worldbuilder fiksi spekulatif dan historis profesional.',
        prompt
      });

      if (Array.isArray(items) && items.length > 0) {
        let firstId = '';
        items.forEach((it, idx) => {
          const id = addWorldEntry({
            category: it.category || 'geography',
            title: it.title || `Entri ${idx + 1}`,
            summary: it.summary || '',
            detailedRules: it.detailedRules || '',
            secretsOrTaboos: it.secretsOrTaboos || '',
            tags: it.tags || ['world-lore']
          });
          if (idx === 0) firstId = id;
        });
        if (firstId) setSelectedEntryId(firstId);
        showToast(`Berhasil membangun ${items.length} entri World Bible otomatis dari premis!`);
      }
    } catch (err: unknown) {
      console.error('Auto world error:', err);
      const msg = err instanceof Error ? err.message : 'Gagal membuat worldbuilding otomatis';
      alert(`Error Gemini AI: ${msg}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeEntry) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateWorldEntry(activeEntry.id, { imageUrl: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateWorldPrompt = async () => {
    if (!activeEntry) return;
    setIsPromptLoading(true);
    setImagePromptResult(null);

    try {
      const prompt = `Sebagai concept artist lingkungan dan arsitektur untuk novel ${project.title} (${project.customGenreName || project.genre}), buatlah prompt visual bahasa Inggris detail untuk AI Image Generator (Imagen / Midjourney / DALL-E) guna mengilustrasikan lokasi/entri dunia berikut:

Kategori: ${CATEGORY_META[activeEntry.category].label}
Nama Lokasi / Entri: ${activeEntry.title}
Ringkasan: ${activeEntry.summary || '-'}
Aturan / Detail Geografis: ${activeEntry.detailedRules || '-'}

Buatkan:
1. Detailed English Visual Prompt (epic wide-angle landscape / architectural rendering / cinematic atmospheric lighting / period accurate / photorealistic 8k)
2. Negative Prompt (things to avoid)
3. Suggested Aspect Ratio (e.g. 16:9 for landscape/maps or 4:3)`;

      const result = await callGeminiRaw({
        apiKey: settings.geminiApiKey,
        model: settings.selectedModel,
        temperature: 0.7,
        systemInstruction: 'Kamu adalah concept artist lingkungan fantasi dan sejarah kelas dunia.',
        prompt
      });

      setImagePromptResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat prompt visual';
      alert(msg);
    } finally {
      setIsPromptLoading(false);
    }
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const [rawAiExpandResult, setRawAiExpandResult] = useState<string | null>(null);

  const handleAiExpandWorld = async () => {
    if (!activeEntry) return;
    setIsAiLoading(true);
    setRawAiExpandResult(null);

    try {
      const prompt = `Sebagai arsitek worldbuilding fiksi, kembangkan dan perinci entri ensiklopedia dunia (World Bible) berikut:
Judul Novel: ${project.title}
Genre: ${project.customGenreName || project.genre}
Kategori Entri: ${CATEGORY_META[activeEntry.category].label}
Nama Entri: ${activeEntry.title}
Ringkasan Saat Ini: ${activeEntry.summary || '-'}

Tolong berikan:
1. Deskripsi mendalam dan aturan konsistensi logika dunia (internal logic).
2. Detail sensoris (visual, aroma, atmosfer) yang bisa disisipkan penulis saat adegan di tempat/institusi ini.
3. Satu Rahasia / Tabu Tersembunyi yang berpotensi memicu konflik atau plot twist.

Gunakan bahasa Indonesia yang sastrawi dan imajinatif.`;

      const result = await callGeminiRaw({
        apiKey: settings.geminiApiKey,
        model: settings.selectedModel || 'auto',
        temperature: 0.7,
        systemInstruction: 'Kamu adalah pakar worldbuilding fiksi spekulatif dan historis.',
        prompt
      });

      setRawAiExpandResult(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memproses AI';
      alert(`Error Gemini AI: ${message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredEntries = entries.filter((item) => {
    const matchesCat = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch = searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-linear-to-r from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Globe className="w-4 h-4" />
            <span>Fase 1.E: Worldbuilding Bible & Ensiklopedia Visual</span>
          </div>
          <h2 className="text-lg font-bold text-(--text-primary)">
            Ensiklopedia Aturan, Geografi, Peta & Faksi Cerita
          </h2>
          <p className="text-xs text-(--text-secondary) max-w-2xl">
            Buat &ldquo;bible&rdquo; terpisah agar aturan dunia konsisten dari bab ke bab, lengkap dengan ilustrasi visual lokasi dan peta.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleAutoGenerateWorldEntries}
            disabled={isAiLoading}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            title="AI membuat 3 entri ensiklopedia kunci (Lokasi, Faksi, Aturan Hukum) dari premis"
          >
            {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            <span>✨ Generate 3 Entri World Bible</span>
          </button>

          {activeEntry && (
            <button
              onClick={handleAiExpandWorld}
              disabled={isAiLoading}
              className="px-3.5 py-2 rounded-xl bg-(--bg-secondary) border border-cyan-500/50 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/10 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Perluas Entri Ini</span>
            </button>
          )}

          <button
            onClick={() => handleCreateNewEntry('geography')}
            className="px-3.5 py-2 rounded-xl bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) text-xs font-medium hover:border-cyan-500/50 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Manual</span>
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Loading Indicator */}
      {isAiLoading && (
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-3 text-xs text-cyan-400 animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin shrink-0 text-cyan-400" />
          <div className="space-y-0.5">
            <div className="font-bold text-(--text-primary)">{loadingMessage || 'Gemini AI sedang berpikir...'}</div>
            <div className="text-[11px] text-(--text-muted)">Mengonstruksi detail sensorik, aturan hukum, dan tabu rahasia</div>
          </div>
        </div>
      )}

      {/* World Expand Result Box */}
      {rawAiExpandResult && (
        <div className="p-5 rounded-2xl bg-(--bg-secondary) border border-cyan-500/40 space-y-3 animate-fade-in shadow-lg shadow-cyan-500/5">
          <div className="flex items-center justify-between border-b border-(--border-color) pb-3">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Pengembangan Worldbuilding AI untuk &ldquo;{activeEntry?.title}&rdquo;:</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(rawAiExpandResult);
                  alert('Hasil worldbuilding berhasil disalin ke clipboard!');
                }}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 text-[11px] font-semibold transition-colors flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Salin Teks</span>
              </button>
              <button
                onClick={() => setRawAiExpandResult(null)}
                className="p-1 rounded-lg text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-primary)"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-xs text-(--text-primary) leading-relaxed whitespace-pre-wrap font-novel-serif bg-(--bg-primary) p-4 rounded-xl border border-(--border-color) max-h-96 overflow-y-auto">
            {rawAiExpandResult}
          </div>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: Filter & List */}
        <div className="lg:col-span-4 space-y-3">
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-(--text-muted)" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari entri bible..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) focus:outline-none"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-2 py-1.5 text-xs rounded-xl bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              {Object.entries(CATEGORY_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {filteredEntries.map((entry) => {
              const isSelected = entry.id === (activeEntry?.id || '');
              const meta = CATEGORY_META[entry.category] || CATEGORY_META.geography;
              const Icon = meta.icon;

              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntryId(entry.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-(--bg-secondary) border-cyan-500/50 shadow-md shadow-cyan-500/10'
                      : 'bg-(--bg-secondary)/60 border-(--border-color) hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {entry.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={entry.imageUrl}
                        alt={entry.title}
                        className="w-9 h-9 rounded-xl object-cover border border-(--border-color) shrink-0"
                      />
                    ) : (
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${meta.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    )}

                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-(--text-primary) truncate">
                        {entry.title}
                      </span>
                      <span className="text-[10px] text-(--text-muted) truncate">
                        {meta.label}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-cyan-400 translate-x-0.5' : 'text-(--text-muted)'}`} />
                </div>
              );
            })}
          </div>

          {filteredEntries.length === 0 && (
            <div className="p-6 text-center rounded-2xl bg-(--bg-secondary) border border-dashed border-(--border-color) text-xs text-(--text-muted)">
              Tidak ada entri bible yang cocok.
            </div>
          )}
        </div>

        {/* Right Editor: Active World Entry */}
        <div className="lg:col-span-8">
          {activeEntry ? (
            <div className="p-6 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-5 animate-fade-in shadow-sm">
              
              {/* Header Title & Category */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-(--border-color)">
                <div className="flex-1 space-y-1">
                  <label className="text-[11px] font-bold text-(--text-muted) uppercase">Nama Entri / Lokasi / Institusi</label>
                  <input
                    type="text"
                    value={activeEntry.title}
                    onChange={(e) => updateWorldEntry(activeEntry.id, { title: e.target.value })}
                    className="w-full text-base font-bold px-3 py-1.5 rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-(--text-muted) uppercase">Kategori</label>
                    <select
                      value={activeEntry.category}
                      onChange={(e) => updateWorldEntry(activeEntry.id, { category: e.target.value as WorldCategory })}
                      className="px-3 py-2 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                    >
                      {Object.entries(CATEGORY_META).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Hapus entri "${activeEntry.title}"?`)) {
                        deleteWorldEntry(activeEntry.id);
                      }
                    }}
                    className="p-2.5 rounded-xl text-(--text-muted) hover:text-red-400 hover:bg-(--bg-primary) transition-colors self-end"
                    title="Hapus Entri"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* World Visual Illustration & Prompt Generator */}
              <div className="p-4 rounded-xl bg-(--bg-primary) border border-(--border-color) space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-cyan-400 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    <span>Ilustrasi Visual & Peta Lokasi</span>
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <label className="px-2.5 py-1 rounded-lg bg-(--bg-secondary) border border-(--border-color) text-[11px] font-semibold text-(--text-primary) hover:border-cyan-500/50 transition-colors flex items-center gap-1 cursor-pointer">
                      <Camera className="w-3 h-3 text-cyan-400" />
                      <span>{activeEntry.imageUrl ? 'Ganti Gambar' : 'Unggah Ilustrasi'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      onClick={handleGenerateWorldPrompt}
                      disabled={isPromptLoading}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-semibold text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-colors flex items-center gap-1"
                    >
                      {isPromptLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      <span>Prompt Visual AI</span>
                    </button>
                  </div>
                </div>

                {activeEntry.imageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-(--border-color) max-h-56">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeEntry.imageUrl}
                      alt={activeEntry.title}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => updateWorldEntry(activeEntry.id, { imageUrl: undefined })}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                      title="Hapus Gambar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {imagePromptResult && (
                  <div className="p-3.5 rounded-xl bg-(--bg-secondary) border border-cyan-500/40 space-y-2 animate-fade-in text-xs">
                    <div className="flex items-center justify-between border-b border-(--border-color) pb-2">
                      <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Prompt Image Generator (Midjourney / Imagen / DALL-E)</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyPrompt(imagePromptResult)}
                          className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 font-semibold text-[10px] flex items-center gap-1 transition-colors"
                        >
                          {copiedPrompt ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedPrompt ? 'Tersalin' : 'Copy Prompt'}</span>
                        </button>
                        <button
                          onClick={() => setImagePromptResult(null)}
                          className="text-(--text-muted) hover:text-(--text-primary) text-[11px]"
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                    <div className="font-mono text-[11px] text-(--text-secondary) leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {imagePromptResult}
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-(--text-secondary)">Ringkasan / Definisi Entri</label>
                <textarea
                  value={activeEntry.summary}
                  onChange={(e) => updateWorldEntry(activeEntry.id, { summary: e.target.value })}
                  rows={3}
                  placeholder="Gambaran umum tempat, pranata, atau tradisi ini..."
                  className="w-full p-3 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none leading-relaxed"
                />
              </div>

              {/* Detailed Rules */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-(--text-secondary) flex items-center gap-1.5">
                  <Scroll className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Aturan Baku & Logika Konsistensi (Rules & Logic)</span>
                </label>
                <textarea
                  value={activeEntry.detailedRules}
                  onChange={(e) => updateWorldEntry(activeEntry.id, { detailedRules: e.target.value })}
                  rows={4}
                  placeholder="Aturan apa saja yang tidak boleh dilanggar dalam hal ini? (Contoh: Protokol gerbang hanya bisa dibuka dengan persetujuan 3 qadhi)..."
                  className="w-full p-3 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none leading-relaxed font-mono"
                />
              </div>

              {/* Secrets / Taboos */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Rahasia Tersembunyi & Tabu (Secrets / Plot Twist Seeds)</span>
                </label>
                <textarea
                  value={activeEntry.secretsOrTaboos}
                  onChange={(e) => updateWorldEntry(activeEntry.id, { secretsOrTaboos: e.target.value })}
                  rows={2}
                  placeholder="Fakta gelap atau mitos palsu yang sengaja disebarkan untuk menutupi kebenaran..."
                  className="w-full p-2.5 text-xs rounded-lg bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                />
              </div>

            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-(--bg-secondary) border border-(--border-color) text-xs text-(--text-muted)">
              Pilih entri di sebelah kiri atau buat entri baru.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Step Forward Navigation */}
      <div className="pt-4 flex items-center justify-between border-t border-(--border-color)">
        <button
          onClick={() => setPrewritingSubTab('character')}
          className="px-3.5 py-2 text-xs text-(--text-secondary) hover:text-(--text-primary) transition-colors"
        >
          &larr; Kembali ke Karakter
        </button>
        <button
          onClick={() => setPrewritingSubTab('outline')}
          className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all flex items-center gap-2 shadow-md shadow-amber-500/20"
        >
          <span>Lanjut ke Struktur & Outline (Fase 1.F)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
