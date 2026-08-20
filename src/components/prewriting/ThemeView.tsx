'use client';

import React, { useState } from 'react';
import { useNovelStore } from '@/store/useNovelStore';
import { callGeminiRaw, callGeminiJson } from '@/lib/geminiClient';
import { 
  Sparkles, 
  Layers, 
  Flame, 
  Filter, 
  Tag, 
  X, 
  Check, 
  Loader2,
  Wand2,
  ArrowRight,
  Lightbulb,
  Copy
} from 'lucide-react';

interface AutoThemeResponse {
  centralTheme: string;
  coreMessage: string;
  moralDilemma: string;
  filteringQuestions: string;
  subThemes: string[];
  symbolicMotifs: string[];
}

export const ThemeView: React.FC = () => {
  const { project, updateTheme, settings, setPrewritingSubTab } = useNovelStore();
  const theme = project.theme;

  const [newSubTheme, setNewSubTheme] = useState('');
  const [newMotif, setNewMotif] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const [rawAiResult, setRawAiResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleAddSubTheme = () => {
    if (!newSubTheme.trim()) return;
    updateTheme({ subThemes: [...(theme.subThemes || []), newSubTheme.trim()] });
    setNewSubTheme('');
  };

  const handleRemoveSubTheme = (index: number) => {
    updateTheme({ subThemes: theme.subThemes.filter((_, idx) => idx !== index) });
  };

  const handleAddMotif = () => {
    if (!newMotif.trim()) return;
    updateTheme({ symbolicMotifs: [...(theme.symbolicMotifs || []), newMotif.trim()] });
    setNewMotif('');
  };

  const handleRemoveMotif = (index: number) => {
    updateTheme({ symbolicMotifs: theme.symbolicMotifs.filter((_, idx) => idx !== index) });
  };

  // 1-Click: Auto-fill all theme fields from premis
  const handleAutoGenerateTheme = async () => {
    setIsAiLoading(true);
    setLoadingMessage('Gemini AI sedang merumuskan tema, pesan moral, dan motif simbolik dari premis Anda...');
    setRawAiResult(null);

    try {
      const prompt = `Analisis novel berikut:
Judul: ${project.title}
Genre: ${project.customGenreName || project.genre}
Premis: ${project.premise.logline || 'Novel intrik kekuasaan'}
Tokoh: ${project.premise.protagonist || '-'}
Konflik: ${project.premise.coreConflict || '-'}

Rumuskan tema dan pesan cerita secara komprehensif dalam format JSON persis berikut:
{
  "centralTheme": "Tema Sentral / Gagasan Utama (1-2 kalimat padat)",
  "coreMessage": "Pesan Moral / Argumen Filosofis yang ingin diuji cerita",
  "moralDilemma": "Dilema moral paling sulit yang dihadapi tokoh",
  "filteringQuestions": "Pertanyaan filter adegan (contoh: Apakah adegan ini menguji kesetiaan tokoh terhadap kebenaran?)",
  "subThemes": ["Sub-tema 1", "Sub-tema 2", "Sub-tema 3"],
  "symbolicMotifs": ["Motif simbolik 1 (cth: Segel lilin hitam)", "Motif simbolik 2", "Motif simbolik 3"]
}`;

      const data = await callGeminiJson<AutoThemeResponse>({
        apiKey: settings.geminiApiKey,
        model: settings.selectedModel || 'auto',
        temperature: 0.75,
        systemInstruction: 'Kamu adalah master novelis dan analis tema sastra profesional.',
        prompt
      });

      updateTheme({
        centralTheme: data.centralTheme || theme.centralTheme,
        coreMessage: data.coreMessage || theme.coreMessage,
        moralDilemma: data.moralDilemma || theme.moralDilemma,
        filteringQuestions: data.filteringQuestions || theme.filteringQuestions,
        subThemes: data.subThemes?.length ? data.subThemes : theme.subThemes,
        symbolicMotifs: data.symbolicMotifs?.length ? data.symbolicMotifs : theme.symbolicMotifs
      });

      showToast('Semua kotak tema & motif berhasil dilengkapi otomatis oleh AI!');
    } catch (err: unknown) {
      console.error('Auto theme error:', err);
      const msg = err instanceof Error ? err.message : 'Gagal merumuskan tema otomatis';
      alert(`Error Gemini AI: ${msg}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiDeepenTheme = async () => {
    setIsAiLoading(true);
    setLoadingMessage('Gemini AI sedang menggali dimensi filosofis cerita...');
    setRawAiResult(null);

    try {
      const prompt = `Analisis dan perkuat tema untuk novel berikut:
Judul: ${project.title}
Genre: ${project.customGenreName || project.genre}
Premis: ${project.premise.logline}
Tema Sentral Saat Ini: ${theme.centralTheme || '-'}

Tugasmu:
1. Usulkan rumusan Pesan Moral / Argumen Filosofis Inti yang tajam dan tidak klise.
2. Usulkan Dilema Moral tersulit yang harus diuji pada tokoh utama.
3. Usulkan 3 Motif Simbolik Indrawi (benda, warna, atau fenomena alam berulang).
4. Usulkan 1 Pertanyaan Filter Adegan (pertanyaan untuk menguji apakah setiap bab relevan dengan tema).

Berikan dalam format teks terstruktur yang elegan dalam bahasa Indonesia.`;

      const result = await callGeminiRaw({
        apiKey: settings.geminiApiKey,
        model: settings.selectedModel || 'auto',
        temperature: 0.7,
        systemInstruction: 'Kamu adalah pakar struktur tema sastra dan konsultan naratif.',
        prompt
      });

      setRawAiResult(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memproses AI';
      alert(`Error Gemini AI: ${message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
      
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-linear-to-r from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Fase 1.C: Menentukan Tema & Pesan</span>
          </div>
          <h2 className="text-lg font-bold text-(--text-primary)">
            Jantung Filosofis & Filter Keputusan Plot
          </h2>
          <p className="text-xs text-(--text-secondary) max-w-2xl">
            Tema adalah jiwa cerita. Apa yang ingin disampaikan lewat karya ini? Tema menjadi filter agar cerita tidak sekadar rangkaian kejadian kosong tanpa makna.
          </p>
        </div>

        {/* 1-Click Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleAutoGenerateTheme}
            disabled={isAiLoading}
            className="px-3.5 py-2 rounded-xl bg-purple-500 text-slate-950 text-xs font-bold hover:bg-purple-400 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-purple-500/20"
            title="Isi otomatis semua kotak tema dan motif dari premis novel"
          >
            {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            <span>✨ Rumuskan Tema Otomatis</span>
          </button>

          <button
            onClick={handleAiDeepenTheme}
            disabled={isAiLoading}
            className="px-3.5 py-2 rounded-xl bg-(--bg-secondary) border border-purple-500/50 text-purple-400 text-xs font-semibold hover:bg-purple-500/10 disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Gali Kedalaman Tema</span>
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
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-3 text-xs text-purple-400 animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin shrink-0 text-purple-400" />
          <div className="space-y-0.5">
            <div className="font-bold text-(--text-primary)">{loadingMessage}</div>
            <div className="text-[11px] text-(--text-muted)">Merumuskan argumen moral, motif simbolik, dan pertanyaan filter bab</div>
          </div>
        </div>
      )}

      {/* AI Output Result Box */}
      {rawAiResult && (
        <div className="p-5 rounded-2xl bg-(--bg-secondary) border border-purple-500/40 space-y-3 animate-fade-in shadow-lg shadow-purple-500/5">
          <div className="flex items-center justify-between border-b border-(--border-color) pb-3">
            <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" />
              <span>Rekomendasi Tema & Motif dari Gemini AI:</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(rawAiResult);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-slate-950 text-[11px] font-semibold transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
              </button>
              <button
                onClick={() => setRawAiResult(null)}
                className="p-1 rounded-lg text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-primary)"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-xs text-(--text-primary) leading-relaxed whitespace-pre-wrap font-novel-serif bg-(--bg-primary) p-4 rounded-xl border border-(--border-color) max-h-96 overflow-y-auto">
            {rawAiResult}
          </div>
        </div>
      )}

      {/* Grid Theme Main Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Central Theme */}
        <div className="p-5 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-2">
          <label className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            <span>Tema Sentral (Gagasan Utama)</span>
          </label>
          <p className="text-[11px] text-(--text-muted)">
            Satu konsep besar yang memayungi seluruh novel (contoh: Bahaya fanatisme buta, Pengorbanan vs Ambisi).
          </p>
          <textarea
            value={theme.centralTheme}
            onChange={(e) => updateTheme({ centralTheme: e.target.value })}
            rows={3}
            placeholder="Kebenaran yang disembunyikan di balik jubah kekuasaan suci..."
            className="w-full p-3 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:ring-1 focus:ring-purple-500 focus:outline-none leading-relaxed font-novel-serif"
          />
        </div>

        {/* Core Message / Moral Argument */}
        <div className="p-5 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-2">
          <label className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4" />
            <span>Pesan & Argumen Moral (Core Message)</span>
          </label>
          <p className="text-[11px] text-(--text-muted)">
            Sikap atau pandangan filosofis yang ingin dibuktikan lewat perjalanan tokoh.
          </p>
          <textarea
            value={theme.coreMessage}
            onChange={(e) => updateTheme({ coreMessage: e.target.value })}
            rows={3}
            placeholder="Integritas nurani lebih tinggi nilainya daripada keselamatan jabatan semu..."
            className="w-full p-3 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:ring-1 focus:ring-purple-500 focus:outline-none leading-relaxed font-novel-serif"
          />
        </div>

        {/* Moral Dilemma */}
        <div className="p-5 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-2">
          <label className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-4 h-4" />
            <span>Dilema Moral Tokoh (Ujian Paling Sulit)</span>
          </label>
          <p className="text-[11px] text-(--text-muted)">
            Pilihan antara dua hal yang sama-sama benar atau dua hal yang sama-sama menyakitkan.
          </p>
          <textarea
            value={theme.moralDilemma}
            onChange={(e) => updateTheme({ moralDilemma: e.target.value })}
            rows={3}
            placeholder="Membongkar kebusukan guru yang membesarkannya atau membiarkan rakyat dizalimi..."
            className="w-full p-3 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:ring-1 focus:ring-purple-500 focus:outline-none leading-relaxed"
          />
        </div>

        {/* Filtering Question for Scenes */}
        <div className="p-5 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-2">
          <label className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-4 h-4" />
            <span>Pertanyaan Filter Adegan</span>
          </label>
          <p className="text-[11px] text-(--text-muted)">
            Pertanyaan uji untuk memastikan setiap adegan di bab novel relevan dengan tema.
          </p>
          <textarea
            value={theme.filteringQuestions}
            onChange={(e) => updateTheme({ filteringQuestions: e.target.value })}
            rows={3}
            placeholder="Apakah adegan ini menguji kesetiaan Tariq terhadap keadilan atau kenyamanan hidupnya?"
            className="w-full p-3 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:ring-1 focus:ring-purple-500 focus:outline-none leading-relaxed"
          />
        </div>

      </div>

      {/* Sub-Themes and Symbolic Motifs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Sub-Themes */}
        <div className="p-5 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-(--text-primary)">Sub-Tema Pendukung</label>
            <span className="text-[11px] text-(--text-muted)">Nuansa sekunder</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSubTheme}
              onChange={(e) => setNewSubTheme(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubTheme()}
              placeholder="Cth: Relasi Murid-Guru, Pengkhianatan Dinasti..."
              className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
            />
            <button
              onClick={handleAddSubTheme}
              className="px-3 py-1.5 rounded-xl bg-purple-500 text-slate-950 text-xs font-bold hover:bg-purple-400"
            >
              Tambah
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {theme.subThemes?.map((sub, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-xs rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1.5"
              >
                <span>{sub}</span>
                <button
                  onClick={() => handleRemoveSubTheme(idx)}
                  className="text-purple-400 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Symbolic Motifs */}
        <div className="p-5 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-(--text-primary)">Motif Simbolik Berulang</label>
            <span className="text-[11px] text-(--text-muted)">Benda, aroma, cuaca penanda tema</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newMotif}
              onChange={(e) => setNewMotif(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMotif()}
              placeholder="Cth: Cincin stempel berkarat, Tinta merah, Kabut senja..."
              className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
            />
            <button
              onClick={handleAddMotif}
              className="px-3 py-1.5 rounded-xl bg-purple-500 text-slate-950 text-xs font-bold hover:bg-purple-400"
            >
              Tambah
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {theme.symbolicMotifs?.map((motif, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1.5"
              >
                <span>{motif}</span>
                <button
                  onClick={() => handleRemoveMotif(idx)}
                  className="text-amber-400 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Step Forward Navigation */}
      <div className="pt-4 flex items-center justify-between border-t border-(--border-color)">
        <button
          onClick={() => setPrewritingSubTab('research')}
          className="px-3.5 py-2 text-xs text-(--text-secondary) hover:text-(--text-primary) transition-colors"
        >
          &larr; Kembali ke Riset
        </button>
        <button
          onClick={() => setPrewritingSubTab('character')}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-md shadow-emerald-500/20"
        >
          <span>Lanjut ke Karakter & Arcs (Fase 1.D)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
