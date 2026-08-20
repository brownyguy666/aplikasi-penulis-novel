'use client';

import React, { useState } from 'react';
import { useNovelStore } from '@/store/useNovelStore';
import { callGeminiJson } from '@/lib/geminiClient';
import { OutlineStructureType } from '@/types/novel';
import { OUTLINE_TEMPLATES } from '@/lib/outlineTemplates';
import { 
  GitCommit, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Users, 
  MapPin, 
  TrendingUp, 
  PenTool, 
  Layers, 
  ArrowRight,
  Loader2,
  Wand2,
  Check
} from 'lucide-react';

interface AutoChapterItem {
  title: string;
  summary: string;
  keyEvents: string[];
  emotionalShift: string;
  targetWordCount: number;
}

export const OutlineStudio: React.FC = () => {
  const { 
    project, 
    setOutlineStructure, 
    addChapter, 
    updateChapter, 
    deleteChapter, 
    setActiveChapter, 
    setPhase,
    settings,
    setPrewritingSubTab 
  } = useNovelStore();

  const [selectedChapterId, setSelectedChapterId] = useState<string>(project.chapters[0]?.id || '');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [newEventInput, setNewEventInput] = useState('');

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const activeChapter = project.chapters.find((c) => c.id === selectedChapterId) || project.chapters[0];

  const handleStructureChange = (newType: OutlineStructureType) => {
    if (confirm(`Ganti struktur plot ke "${OUTLINE_TEMPLATES[newType].name}"? Beat sheet akan diperbarui sesuai template.`)) {
      setOutlineStructure(newType, true);
    }
  };

  const handleCreateNewChapter = () => {
    const newId = addChapter({
      title: `Bab ${project.chapters.length + 1}: Judul Bab`,
      summary: '',
      keyEvents: ['Peristiwa pembuka adegan.'],
      emotionalShift: 'Kondisi emosi awal menuju akhir.',
      targetWordCount: 1500,
      status: 'planned'
    });
    setSelectedChapterId(newId);
  };

  const handleAddKeyEvent = () => {
    if (!activeChapter || !newEventInput.trim()) return;
    updateChapter(activeChapter.id, {
      keyEvents: [...(activeChapter.keyEvents || []), newEventInput.trim()]
    });
    setNewEventInput('');
  };

  const handleRemoveKeyEvent = (idx: number) => {
    if (!activeChapter) return;
    const updated = activeChapter.keyEvents.filter((_, i) => i !== idx);
    updateChapter(activeChapter.id, { keyEvents: updated });
  };

  // 1-Click: Generate complete sequential chapters from Premise, Structure, and Characters
  const handleAutoGenerateChapters = async () => {
    setIsAiLoading(true);
    setLoadingMessage(`Gemini AI sedang menyusun bab-bab novel mengikuti struktur ${OUTLINE_TEMPLATES[project.outlineType].name}...`);

    try {
      const charSummary = project.characters.map((c) => `${c.name} (${c.role})`).join(', ');
      const prompt = `Susunlah 5 sampai 7 bab kunci berurutan untuk novel berikut:
Judul: ${project.title}
Genre: ${project.customGenreName || project.genre}
Kerangka Struktur: ${OUTLINE_TEMPLATES[project.outlineType].name}
Premis: ${project.premise.logline || 'Novel intrik'}
Tokoh Utama: ${project.premise.protagonist || '-'}
Karakter yang Ada: ${charSummary || '-'}
Tema: ${project.theme.centralTheme || '-'}

Keluarkan dalam format JSON Array dengan objek persis berikut untuk setiap bab:
[
  {
    "title": "Bab 1: Judul Bab yang Puitis & Menggugah",
    "summary": "Ringkasan adegan utama yang terjadi di bab ini (2-3 kalimat padat).",
    "keyEvents": [
      "Poin kejadian penting 1",
      "Poin kejadian penting 2",
      "Poin kejadian penting 3"
    ],
    "emotionalShift": "Perubahan emosi tokoh utama (cth: Tenang & Percaya Diri -> Terkejut & Terancam)",
    "targetWordCount": 1800
  }
]`;

      const generated = await callGeminiJson<AutoChapterItem[]>({
        apiKey: settings.geminiApiKey,
        model: settings.selectedModel || 'auto',
        temperature: 0.8,
        systemInstruction: 'Kamu adalah master novelis dan perancang alur cerita dramatik profesional.',
        prompt
      });

      if (Array.isArray(generated) && generated.length > 0) {
        let firstId = '';
        generated.forEach((ch, idx) => {
          const id = addChapter({
            title: ch.title || `Bab ${idx + 1}`,
            summary: ch.summary || '',
            keyEvents: ch.keyEvents?.length ? ch.keyEvents : ['Adegan pembuka bab.'],
            emotionalShift: ch.emotionalShift || 'Kondisi emosi berkembang.',
            targetWordCount: ch.targetWordCount || 1800,
            status: 'planned'
          });
          if (idx === 0) firstId = id;
        });
        if (firstId) setSelectedChapterId(firstId);
        showToast(`Berhasil menyusun ${generated.length} bab naskah novel otomatis!`);
      }
    } catch (err: unknown) {
      console.error('Auto outline error:', err);
      const msg = err instanceof Error ? err.message : 'Gagal menyusun outline otomatis';
      alert(`Error Gemini AI: ${msg}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGoToDrafting = (chapterId: string) => {
    setActiveChapter(chapterId);
    setPhase('drafting');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <GitCommit className="w-4 h-4" />
            <span>Fase 1.F: Menyusun Struktur & Outline Bab</span>
          </div>
          <h2 className="text-lg font-bold text-(--text-primary)">
            Kerangka Plot, Peta Beat Sheet & Detail Adegan per Bab
          </h2>
          <p className="text-xs text-(--text-secondary) max-w-2xl">
            Pilih kerangka struktur (3-Babak, Save the Cat 15 Beats, Hero&apos;s Journey, atau Misteri Non-Linear) lalu petakan adegan per bab sebelum mulai menulis draf.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleAutoGenerateChapters}
            disabled={isAiLoading}
            className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            title="AI menyusun bab-bab novel mengikuti kerangka plot secara otomatis dari premis"
          >
            {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            <span>✨ Susun Rangkaian Bab Otomatis</span>
          </button>

          <button
            onClick={handleCreateNewChapter}
            className="px-3.5 py-2 rounded-xl bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) text-xs font-medium hover:border-amber-500/50 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Bab Manual</span>
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
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-400 animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin shrink-0 text-amber-400" />
          <div className="space-y-0.5">
            <div className="font-bold text-(--text-primary)">{loadingMessage || 'Gemini AI sedang berpikir...'}</div>
            <div className="text-[11px] text-(--text-muted)">Menghubungkan beat cerita, pergeseran emosi, dan ringkasan adegan</div>
          </div>
        </div>
      )}

      {/* Structure Selector Bar */}
      <div className="p-4 rounded-2xl bg-(--bg-secondary) border border-(--border-color) flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-xs font-bold text-(--text-primary)">Pilihan Kerangka Struktur Plot:</span>
            <p className="text-[11px] text-(--text-muted)">{OUTLINE_TEMPLATES[project.outlineType]?.description}</p>
          </div>
        </div>

        <select
          value={project.outlineType}
          onChange={(e) => handleStructureChange(e.target.value as OutlineStructureType)}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-(--bg-primary) border border-amber-500/40 text-amber-400 focus:outline-none shrink-0"
        >
          {Object.entries(OUTLINE_TEMPLATES).map(([k, v]) => (
            <option key={k} value={k}>{v.name}</option>
          ))}
        </select>
      </div>

      {/* Main Split Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Chapters Timeline */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-(--text-secondary) px-1">
            <span>DAFTAR BAB ({project.chapters.length})</span>
            <span className="text-[10px] text-amber-400">
              Total Target: {project.chapters.reduce((acc, c) => acc + (c.targetWordCount || 1500), 0).toLocaleString()} kata
            </span>
          </div>

          <div className="space-y-2">
            {project.chapters.map((chap, idx) => {
              const isSelected = chap.id === (activeChapter?.id || '');
              const draft = project.drafts[chap.id];
              const wordCount = draft?.wordCount || 0;

              return (
                <div
                  key={chap.id}
                  onClick={() => setSelectedChapterId(chap.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col space-y-2 ${
                    isSelected
                      ? 'bg-(--bg-secondary) border-amber-500/50 shadow-md shadow-amber-500/10'
                      : 'bg-(--bg-secondary)/60 border-(--border-color) hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Bab {idx + 1}
                    </span>
                    <span className="text-[11px] text-(--text-muted) font-mono">
                      {wordCount} / {chap.targetWordCount || 1500} kata
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-(--text-primary) truncate">
                    {chap.title}
                  </h4>

                  <p className="text-[11px] text-(--text-secondary) line-clamp-2">
                    {chap.summary || 'Belum ada ringkasan bab...'}
                  </p>

                  <div className="pt-2 border-t border-(--border-color)/60 flex items-center justify-between text-[10px]">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {chap.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGoToDrafting(chap.id);
                      }}
                      className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Drafting</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {project.chapters.length === 0 && (
            <div className="p-6 text-center rounded-2xl bg-(--bg-secondary) border border-dashed border-(--border-color) text-xs text-(--text-muted)">
              Belum ada bab. Klik &ldquo;Tambah Bab&rdquo; di atas.
            </div>
          )}
        </div>

        {/* Right Column: Active Chapter Detail Editor */}
        <div className="lg:col-span-8">
          {activeChapter ? (
            <div className="p-6 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-6 animate-fade-in shadow-sm">
              
              {/* Header Title, Beat Link, & Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-(--border-color)">
                <div className="flex-1 space-y-1">
                  <label className="text-[11px] font-bold text-(--text-muted) uppercase">Judul Bab</label>
                  <input
                    type="text"
                    value={activeChapter.title}
                    onChange={(e) => updateChapter(activeChapter.id, { title: e.target.value })}
                    className="w-full text-base font-bold px-3 py-1.5 rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGoToDrafting(activeChapter.id)}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Mulai Tulis di Drafting Studio</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Hapus bab "${activeChapter.title}"?`)) {
                        deleteChapter(activeChapter.id);
                      }
                    }}
                    className="p-2 rounded-xl text-(--text-muted) hover:text-red-400 hover:bg-(--bg-primary) transition-colors"
                    title="Hapus Bab"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Meta Row: POV, Location, Target Word Count */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-(--text-secondary) flex items-center gap-1">
                    <Users className="w-3 h-3 text-emerald-400" />
                    <span>Karakter POV (Sudut Pandang)</span>
                  </label>
                  <select
                    value={activeChapter.povCharacterId || ''}
                    onChange={(e) => updateChapter(activeChapter.id, { povCharacterId: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                  >
                    <option value="">Pilih Tokoh POV...</option>
                    {project.characters.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-(--text-secondary) flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>Setting / Lokasi Utama</span>
                  </label>
                  <input
                    type="text"
                    value={activeChapter.settingLocation || ''}
                    onChange={(e) => updateChapter(activeChapter.id, { settingLocation: e.target.value })}
                    placeholder="Ruang Arsip, Menara Barat..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-(--text-secondary) flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-amber-400" />
                    <span>Target Kata Bab</span>
                  </label>
                  <input
                    type="number"
                    value={activeChapter.targetWordCount || 1500}
                    onChange={(e) => updateChapter(activeChapter.id, { targetWordCount: parseInt(e.target.value) || 1000 })}
                    step="100"
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Chapter Summary */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-(--text-secondary)">Ringkasan Intrik / Alur Bab Ini</label>
                <textarea
                  value={activeChapter.summary}
                  onChange={(e) => updateChapter(activeChapter.id, { summary: e.target.value })}
                  rows={3}
                  placeholder="Apa yang terjadi dari awal sampai akhir bab ini..."
                  className="w-full p-3 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none leading-relaxed"
                />
              </div>

              {/* Key Events / Scene Beats */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-(--text-primary) flex items-center justify-between">
                  <span>Poin Adegan Kunci (Key Scene Beats)</span>
                  <span className="text-[10px] text-(--text-muted)">Urutan kejadian wajib di bab ini</span>
                </label>

                <div className="space-y-2">
                  {activeChapter.keyEvents?.map((evt, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-(--bg-primary) border border-(--border-color) flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="text-(--text-primary)">{evt}</span>
                      </div>

                      <button
                        onClick={() => handleRemoveKeyEvent(idx)}
                        className="text-(--text-muted) hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newEventInput}
                    onChange={(e) => setNewEventInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddKeyEvent()}
                    placeholder="Tambah adegan baru (misal: Tariq mendengar derap langkah patroli)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                  />
                  <button
                    onClick={handleAddKeyEvent}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold transition-colors"
                  >
                    Tambah Adegan
                  </button>
                </div>
              </div>

              {/* Emotional Shift */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-(--text-secondary)">
                  Pergeseran Emosional (Emotional Shift)
                </label>
                <input
                  type="text"
                  value={activeChapter.emotionalShift || ''}
                  onChange={(e) => updateChapter(activeChapter.id, { emotionalShift: e.target.value })}
                  placeholder="Contoh: Dari kejenuhan rutin menjadi ketakutan mencekam dan kecurigaan..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                />
              </div>

            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-(--bg-secondary) border border-(--border-color) text-xs text-(--text-muted)">
              Pilih bab di sebelah kiri atau klik &ldquo;Tambah Bab&rdquo;.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Step Forward Navigation */}
      <div className="pt-4 flex items-center justify-between border-t border-(--border-color)">
        <button
          onClick={() => setPrewritingSubTab('world')}
          className="px-3.5 py-2 text-xs text-(--text-secondary) hover:text-(--text-primary) transition-colors"
        >
          &larr; Kembali ke World Bible
        </button>
        <button
          onClick={() => setPrewritingSubTab('synopsis')}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-md shadow-emerald-500/20"
        >
          <span>Lanjut ke Sinopsis Lengkap (Fase 1.G)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
