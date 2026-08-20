'use client';

import React, { useState } from 'react';
import { useNovelStore } from '@/store/useNovelStore';
import { callGeminiRaw, callGeminiJson } from '@/lib/geminiClient';
import { ResearchCategory } from '@/types/novel';
import { 
  BookOpen, 
  Clock, 
  Plus, 
  Sparkles, 
  Trash2, 
  Search, 
  ExternalLink,
  Loader2,
  BookmarkPlus,
  Calendar,
  Wand2,
  Check,
  ArrowRight
} from 'lucide-react';

const CATEGORY_LABELS: Record<ResearchCategory, { label: string; color: string }> = {
  primary_source: { label: 'Sumber Primer / Kitab / Dokumen', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  timeline: { label: 'Tarikh & Kronologi Sejarah', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  technical_term: { label: 'Istilah Teknis & Jargon Kuno', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  material_culture: { label: 'Budaya Material & Arsitektur', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  theological_fiqh: { label: 'Kaidah Fiqh & Fatwa', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  historical_event: { label: 'Peristiwa & Tokoh Nyata', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  other: { label: 'Riset Lainnya', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' }
};

interface AutoResearchItem {
  title: string;
  category: ResearchCategory;
  content: string;
  sourceUrlOrCitation: string;
  tags: string[];
}

interface AutoTimelineItem {
  eraOrDate: string;
  title: string;
  description: string;
  impactOnPlot: string;
}

export const ResearchView: React.FC = () => {
  const { 
    project, 
    addResearchItem, 
    deleteResearchItem,
    addTimelineEvent,
    deleteTimelineEvent,
    settings,
    setPrewritingSubTab
  } = useNovelStore();

  const [activeSubSection, setActiveSubSection] = useState<'notes' | 'timeline'>('notes');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New Item State
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ResearchCategory>('primary_source');
  const [newContent, setNewContent] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newTags, setNewTags] = useState('');

  // New Timeline Event State
  const [isAddingTimeline, setIsAddingTimeline] = useState(false);
  const [newEraDate, setNewEraDate] = useState('');
  const [newTimeTitle, setNewTimeTitle] = useState('');
  const [newTimeDesc, setNewTimeDesc] = useState('');
  const [newTimeImpact, setNewTimeImpact] = useState('');

  // AI Loading & Results
  const [aiTopic, setAiTopic] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleSaveNote = () => {
    if (!newTitle.trim()) return;
    addResearchItem({
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      sourceUrlOrCitation: newSource.trim(),
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean)
    });
    setNewTitle('');
    setNewContent('');
    setNewSource('');
    setNewTags('');
    setIsAddingNote(false);
    showToast('Catatan riset berhasil disimpan!');
  };

  const handleSaveTimeline = () => {
    if (!newTimeTitle.trim() || !newEraDate.trim()) return;
    addTimelineEvent({
      eraOrDate: newEraDate.trim(),
      title: newTimeTitle.trim(),
      description: newTimeDesc.trim(),
      impactOnPlot: newTimeImpact.trim()
    });
    setNewEraDate('');
    setNewTimeTitle('');
    setNewTimeDesc('');
    setNewTimeImpact('');
    setIsAddingTimeline(false);
    showToast('Tonggak kronologi tarikh berhasil ditambahkan!');
  };

  // 1-Click: Generate 3 smart research cards automatically
  const handleAutoGenerateResearchCards = async () => {
    setIsAiLoading(true);
    setLoadingMessage('Gemini AI sedang merekomendasikan 3 catatan riset esensial dari premis Anda...');
    setAiResult(null);

    try {
      const prompt = `Berdasarkan novel berikut:
Judul: ${project.title}
Genre: ${project.customGenreName || project.genre}
Premis: ${project.premise.logline || 'Novel sejarah / intrik kekuasaan'}
Tokoh: ${project.premise.protagonist || '-'}

Buatkan 3 catatan riset esensial, ringkas, dan aplikatif (tidak kepanjangan) untuk membantu penulis pemula.
Kategori yang diperbolehkan: "primary_source", "technical_term", "material_culture", "theological_fiqh", "historical_event".
Keluarkan dalam format JSON Array dengan objek persis:
[
  {
    "title": "Judul Catatan Riset yang Spesifik",
    "category": "technical_term",
    "content": "Poin-poin ringkasan fakta penting dan bagaimana menerapkannya dalam dialog/adegan (1-2 paragraf padat).",
    "sourceUrlOrCitation": "Kitab / Dokumen / Rujukan Akademik Terkait",
    "tags": ["tag1", "tag2"]
  }
]`;

      const items = await callGeminiJson<AutoResearchItem[]>({
        apiKey: settings.geminiApiKey,
        model: settings.selectedModel || 'auto',
        temperature: 0.7,
        systemInstruction: 'Kamu adalah sejarawan dan konsultan riset novel fiksi profesional.',
        prompt
      });

      if (Array.isArray(items)) {
        items.forEach((it) => {
          addResearchItem({
            title: it.title,
            category: it.category || 'primary_source',
            content: it.content,
            sourceUrlOrCitation: it.sourceUrlOrCitation || 'Rekomendasi AI Riset',
            tags: it.tags || ['ai-research']
          });
        });
        showToast(`Berhasil menambahkan ${items.length} kartu catatan riset otomatis!`);
        setActiveSubSection('notes');
      }
    } catch (err: unknown) {
      console.error('Auto research error:', err);
      const msg = err instanceof Error ? err.message : 'Gagal membuat kartu riset otomatis';
      alert(`Error Gemini AI: ${msg}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // 1-Click: Generate 4 timeline milestones automatically
  const handleAutoGenerateTimeline = async () => {
    setIsAiLoading(true);
    setLoadingMessage('Gemini AI sedang menyusun 4 tonggak kronologis tarikh sejarah...');
    setAiResult(null);

    try {
      const prompt = `Berdasarkan novel berikut:
Judul: ${project.title}
Genre: ${project.customGenreName || project.genre}
Premis: ${project.premise.logline || 'Novel intrik sejarah'}
Tokoh: ${project.premise.protagonist || '-'}

Buatkan 4 peristiwa kronologi timeline (tarikh) sejarah yang menjadi latar belakang peristiwa atau memicu konflik plot novel ini secara berurutan.
Keluarkan dalam format JSON Array dengan objek persis:
[
  {
    "eraOrDate": "Tahun / Era Sejarah (Contoh: 656 H / 1258 M)",
    "title": "Nama Peristiwa Sejarah / Titik Balik",
    "description": "Ringkasan ringkas kejadian apa yang terjadi di dunia cerita saat ini.",
    "impactOnPlot": "Pengaruh langsung peristiwa ini terhadap motivasi tokoh atau konflik cerita."
  }
]`;

      const items = await callGeminiJson<AutoTimelineItem[]>({
        apiKey: settings.geminiApiKey,
        model: settings.selectedModel || 'auto',
        temperature: 0.7,
        systemInstruction: 'Kamu adalah sejarawan dan perancang alur cerita historis profesional.',
        prompt
      });

      if (Array.isArray(items)) {
        items.forEach((it) => {
          addTimelineEvent({
            eraOrDate: it.eraOrDate,
            title: it.title,
            description: it.description,
            impactOnPlot: it.impactOnPlot
          });
        });
        showToast(`Berhasil menyusun ${items.length} tonggak kronologi tarikh otomatis!`);
        setActiveSubSection('timeline');
      }
    } catch (err: unknown) {
      console.error('Auto timeline error:', err);
      const msg = err instanceof Error ? err.message : 'Gagal menyusun timeline otomatis';
      alert(`Error Gemini AI: ${msg}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Custom AI Search Query
  const handleAiResearchQuery = async () => {
    if (!aiTopic.trim()) return;
    setIsAiLoading(true);
    setLoadingMessage(`Gemini AI sedang meriset topik: "${aiTopic}"...`);
    setAiResult(null);

    try {
      const prompt = `Lakukan riset mendalam dan aplikatif untuk novel:
Judul Novel: ${project.title}
Topik Riset yang Diminta: "${aiTopic}"

Sajikan riset dalam format terstruktur:
1. Ringkasan Fakta Sejarah / Konsep Kunci
2. Sumber Primer / Kitab Rujukan Terkait
3. Istilah Teknis Asli (Terminologi historis yang otentik)
4. Detail Budaya Material / Sensori (pakaian, aroma, alat, arsitektur, atmosfer)
5. Gagasan Integrasi Dramatis ke dalam Plot Novel

Gunakan bahasa Indonesia yang akademis namun siap pakai untuk fiksi.`;

      const result = await callGeminiRaw({
        apiKey: settings.geminiApiKey,
        model: settings.selectedModel || 'auto',
        temperature: 0.5,
        systemInstruction: 'Kamu adalah sejarawan dan konsultan riset novel fiksi berpengalaman.',
        prompt
      });

      setAiResult(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memanggil asisten riset AI';
      alert(`Error Gemini AI: ${message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveAiAsNote = () => {
    if (!aiResult) return;
    addResearchItem({
      title: `Riset AI: ${aiTopic}`,
      category: 'primary_source',
      content: aiResult,
      sourceUrlOrCitation: 'Hasil Sintesis Asisten Riset Gemini AI',
      tags: ['ai-research', 'historis']
    });
    showToast('Catatan riset AI berhasil disimpan ke berkas riset!');
    setAiResult(null);
    setAiTopic('');
  };

  const filteredNotes = project.researchItems.filter((item) => {
    const matchesCat = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
      
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-linear-to-r from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Fase 1.B: Riset, Sumber Primer & Timeline</span>
          </div>
          <h2 className="text-lg font-bold text-(--text-primary)">
            Dokumentasi Fakta, Istilah Kuno & Kronologi Sejarah
          </h2>
          <p className="text-xs text-(--text-secondary) max-w-2xl">
            Riset yang matang di awal menghemat revisi besar di belakang: catat sumber primer, rujukan fiqh, istilah teknis, dan timeline sejarah.
          </p>
        </div>

        {/* 1-Click AI Helpers & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleAutoGenerateResearchCards}
            disabled={isAiLoading}
            className="px-3.5 py-2 rounded-xl bg-blue-500 text-slate-950 text-xs font-bold hover:bg-blue-400 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            title="AI membuat 3 kartu riset esensial secara otomatis"
          >
            {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            <span>✨ Rekomendasikan 3 Kartu Riset</span>
          </button>

          <button
            onClick={handleAutoGenerateTimeline}
            disabled={isAiLoading}
            className="px-3.5 py-2 rounded-xl bg-(--bg-secondary) border border-blue-500/50 text-blue-400 text-xs font-semibold hover:bg-blue-500/10 disabled:opacity-50 transition-all flex items-center gap-1.5"
            title="AI menyusun 4 tonggak kronologi tarikh otomatis"
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>✨ Susun Timeline Otomatis</span>
          </button>
        </div>
      </div>

      {/* Sub-Section Switcher Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center bg-(--bg-secondary) p-1 rounded-xl border border-(--border-color) text-xs">
          <button
            onClick={() => setActiveSubSection('notes')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
              activeSubSection === 'notes' ? 'bg-blue-500 text-slate-950 shadow-sm' : 'text-(--text-secondary) hover:text-(--text-primary)'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Koleksi Catatan Riset ({project.researchItems.length})</span>
          </button>
          <button
            onClick={() => setActiveSubSection('timeline')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
              activeSubSection === 'timeline' ? 'bg-blue-500 text-slate-950 shadow-sm' : 'text-(--text-secondary) hover:text-(--text-primary)'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Timeline / Tarikh ({project.timelineEvents.length})</span>
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
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-3 text-xs text-blue-400 animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin shrink-0 text-blue-400" />
          <div className="space-y-0.5">
            <div className="font-bold text-(--text-primary)">{loadingMessage}</div>
            <div className="text-[11px] text-(--text-muted)">Menghasilkan kartu riset terstruktur siap pakai</div>
          </div>
        </div>
      )}

      {/* Custom AI Research Assistant Bar */}
      <div className="p-4 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Tanya Spesifik Asisten Riset Sejarah & Fiqh Gemini AI
          </span>
          <span className="text-[11px] text-(--text-muted)">Tanyakan istilah kuno, tata cara istana, atau budaya material</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiResearchQuery()}
            placeholder="Contoh: Bagaimana tata cara penyegelan dokumen istana Abbasiyah abad 13 dan jenis tinta yang dipakai?"
            className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={handleAiResearchQuery}
            disabled={isAiLoading || !aiTopic.trim()}
            className="px-4 py-2 rounded-xl bg-blue-500 text-slate-950 text-xs font-bold hover:bg-blue-400 disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-blue-500/20"
          >
            {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Riset Topik</span>
          </button>
        </div>

        {/* AI Research Output Card */}
        {aiResult && (
          <div className="p-4 rounded-xl bg-(--bg-primary) border border-blue-500/30 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-(--border-color) pb-2">
              <span className="text-xs font-bold text-(--text-primary)">Hasil Riset: {aiTopic}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveAiAsNote}
                  className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-slate-950 text-[11px] font-semibold transition-all flex items-center gap-1"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Simpan ke Berkas Riset</span>
                </button>
                <button
                  onClick={() => setAiResult(null)}
                  className="text-xs text-(--text-muted) hover:text-(--text-primary)"
                >
                  Tutup
                </button>
              </div>
            </div>
            <div className="text-xs text-(--text-primary) leading-relaxed whitespace-pre-wrap font-novel-serif max-h-96 overflow-y-auto">
              {aiResult}
            </div>
          </div>
        )}
      </div>

      {/* SUB-SECTION 1: NOTES LIST */}
      {activeSubSection === 'notes' && (
        <div className="space-y-4">
          
          {/* Controls Bar: Search, Category Filter, Add Note Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-(--text-muted)" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari riset / tag..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) focus:outline-none"
              >
                <option value="all">Semua Kategori</option>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsAddingNote(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-500 text-slate-950 text-xs font-bold hover:bg-blue-400 transition-colors flex items-center gap-1.5 shrink-0 shadow-md shadow-blue-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Catatan Riset Manual</span>
            </button>
          </div>

          {/* Form Add Note */}
          {isAddingNote && (
            <div className="p-4 rounded-2xl bg-(--bg-secondary) border border-blue-500/50 space-y-3 animate-fade-in">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Tambah Catatan Riset Baru</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Judul Catatan (cth: Struktur Mahkamah Baghdad)..."
                  className="px-3 py-2 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ResearchCategory)}
                  className="px-3 py-2 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={4}
                placeholder="Rincian fakta, kutipan kitab, atau data material yang ditemukan..."
                className="w-full p-3 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="Sumber / Sitasi (cth: Tarikh Al-Rusul wa Al-Muluk, Tabari)..."
                  className="px-3 py-2 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                />
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Tag dipisah koma (cth: tarikh, siyasah, hukum)..."
                  className="px-3 py-2 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsAddingNote(false)}
                  className="px-3 py-1.5 text-xs text-(--text-secondary) hover:bg-(--bg-primary) rounded-lg"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={!newTitle.trim()}
                  className="px-4 py-1.5 text-xs font-bold bg-blue-500 text-slate-950 hover:bg-blue-400 rounded-lg disabled:opacity-50"
                >
                  Simpan Catatan
                </button>
              </div>
            </div>
          )}

          {/* Cards Grid */}
          {filteredNotes.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-(--bg-secondary) border border-(--border-color) text-xs text-(--text-muted) space-y-2">
              <p>Belum ada catatan riset yang dibuat.</p>
              <p>Klik tombol <strong>&ldquo;✨ Rekomendasikan 3 Kartu Riset&rdquo;</strong> di atas untuk membuat kartu riset otomatis.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.map((item) => {
                const meta = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.other;
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-(--bg-secondary) border border-(--border-color) hover:border-blue-500/40 transition-colors flex flex-col justify-between gap-3 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${meta.color}`}>
                          {meta.label}
                        </span>
                        <button
                          onClick={() => deleteResearchItem(item.id)}
                          className="text-(--text-muted) hover:text-red-400 transition-colors p-1"
                          title="Hapus Catatan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-sm font-bold text-(--text-primary)">{item.title}</h4>
                      <p className="text-xs text-(--text-secondary) leading-relaxed line-clamp-4 font-novel-serif">
                        {item.content}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-(--border-color)/50 space-y-1.5 text-[11px]">
                      {item.sourceUrlOrCitation && (
                        <div className="flex items-center gap-1.5 text-(--text-muted) truncate">
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate italic">{item.sourceUrlOrCitation}</span>
                        </div>
                      )}
                      {item.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((t, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 text-[10px] rounded bg-(--bg-primary) text-(--text-muted)">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* SUB-SECTION 2: TIMELINE / TARIKH */}
      {activeSubSection === 'timeline' && (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-(--text-secondary)">
              Susunan kronologi peristiwa sejarah & titik balik narasi.
            </span>
            <button
              onClick={() => setIsAddingTimeline(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-500 text-slate-950 text-xs font-bold hover:bg-blue-400 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Titik Waktu Manual</span>
            </button>
          </div>

          {/* Form Add Timeline */}
          {isAddingTimeline && (
            <div className="p-4 rounded-2xl bg-(--bg-secondary) border border-blue-500/50 space-y-3 animate-fade-in">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Tambah Titik Waktu Kronologi</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newEraDate}
                  onChange={(e) => setNewEraDate(e.target.value)}
                  placeholder="Era / Tahun (cth: 656 H / 1258 M)..."
                  className="px-3 py-2 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                />
                <input
                  type="text"
                  value={newTimeTitle}
                  onChange={(e) => setNewTimeTitle(e.target.value)}
                  placeholder="Nama Peristiwa..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                />
              </div>
              <textarea
                value={newTimeDesc}
                onChange={(e) => setNewTimeDesc(e.target.value)}
                rows={2}
                placeholder="Rincian kejadian apa yang terjadi pada waktu ini..."
                className="w-full p-2.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
              />
              <input
                type="text"
                value={newTimeImpact}
                onChange={(e) => setNewTimeImpact(e.target.value)}
                placeholder="Dampaknya terhadap alur cerita / plot..."
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsAddingTimeline(false)}
                  className="px-3 py-1.5 text-xs text-(--text-secondary) hover:bg-(--bg-primary) rounded-lg"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveTimeline}
                  disabled={!newTimeTitle.trim() || !newEraDate.trim()}
                  className="px-4 py-1.5 text-xs font-bold bg-blue-500 text-slate-950 hover:bg-blue-400 rounded-lg disabled:opacity-50"
                >
                  Simpan Titik Waktu
                </button>
              </div>
            </div>
          )}

          {/* Timeline List */}
          {project.timelineEvents.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-(--bg-secondary) border border-(--border-color) text-xs text-(--text-muted) space-y-2">
              <p>Belum ada tonggak kronologi tarikh.</p>
              <p>Klik tombol <strong>&ldquo;✨ Susun Timeline Otomatis&rdquo;</strong> di atas untuk menyusun kronologi dari premis Anda.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-(--border-color)">
              {project.timelineEvents.map((evt) => (
                <div key={evt.id} className="relative group">
                  <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-(--bg-primary) ring-2 ring-blue-500/30 group-hover:scale-125 transition-transform" />
                  <div className="p-4 rounded-2xl bg-(--bg-secondary) border border-(--border-color) group-hover:border-blue-500/40 transition-colors space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {evt.eraOrDate}
                      </span>
                      <button
                        onClick={() => deleteTimelineEvent(evt.id)}
                        className="text-(--text-muted) hover:text-red-400 p-1"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="text-sm font-bold text-(--text-primary)">{evt.title}</h4>
                    <p className="text-xs text-(--text-secondary) leading-relaxed">{evt.description}</p>
                    {evt.impactOnPlot && (
                      <div className="text-[11px] p-2 rounded-lg bg-(--bg-primary) text-amber-300 border border-amber-500/20">
                        <strong>Dampak Plot:</strong> {evt.impactOnPlot}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Bottom Step Forward Navigation */}
      <div className="pt-4 flex items-center justify-between border-t border-(--border-color)">
        <button
          onClick={() => setPrewritingSubTab('premise')}
          className="px-3.5 py-2 text-xs text-(--text-secondary) hover:text-(--text-primary) transition-colors"
        >
          &larr; Kembali ke Premis
        </button>
        <button
          onClick={() => setPrewritingSubTab('theme')}
          className="px-4 py-2.5 rounded-xl bg-purple-500 text-slate-950 font-bold text-xs hover:bg-purple-400 transition-all flex items-center gap-2 shadow-md shadow-purple-500/20"
        >
          <span>Lanjut ke Tema & Pesan (Fase 1.C)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
