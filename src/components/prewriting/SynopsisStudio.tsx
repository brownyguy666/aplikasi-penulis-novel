'use client';

import React, { useState } from 'react';
import { useNovelStore } from '@/store/useNovelStore';
import { callGeminiJson } from '@/lib/geminiClient';
import { 
  FileText, 
  Target, 
  BookMarked, 
  Flame, 
  Check, 
  Loader2,
  Wand2,
  ArrowRight,
  PenTool
} from 'lucide-react';

interface AutoSynopsisResponse {
  hookParagraph: string;
  targetAudience: string;
  comparativeTitles: string;
  endingSummary: string;
  fullSynopsisText: string;
}

export const SynopsisStudio: React.FC = () => {
  const { project, updateSynopsis, settings, setPrewritingSubTab, setPhase } = useNovelStore();
  const synopsis = project.synopsis;

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleAiGenerateSynopsis = async () => {
    setIsAiLoading(true);
    setLoadingMessage('Gemini AI sedang menyintesis seluruh data Fase 1 menjadi Sinopsis Lengkap yang kohesif...');

    try {
      const charSummary = project.characters.map((c) => `- ${c.name} (${c.role}): ${c.externalGoal || c.occupation}`).join('\n');
      const worldSummary = project.worldEntries.map((w) => `- [${w.category}] ${w.title}: ${w.summary}`).join('\n');
      const outlineSummary = project.chapters.map((c, i) => `${i + 1}. ${c.title}: ${c.summary}`).join('\n');

      const prompt = `Sebagai editor penerbitan novel fiksi profesional, sintesiskan seluruh informasi proyek Fase 1 (Pra-Menulis) berikut menjadi Sinopsis Lengkap 1-3 Halaman yang memukau:

Informasi Naskah:
- Judul: "${project.title}" ${project.subtitle ? `(${project.subtitle})` : ''}
- Penulis: ${project.author}
- Genre: ${project.customGenreName || project.genre}
- Premis: ${project.premise.logline || '-'}
- Tokoh Protagonis: ${project.premise.protagonist || '-'}
- Goal: ${project.premise.goal || '-'} | Rintangan: ${project.premise.obstacle || '-'} | Taruhan: ${project.premise.stakes || '-'}
- Tema Sentral: ${project.theme.centralTheme || '-'}
- Karakter Kunci:
${charSummary || '(Belum terdata)'}
- Worldbuilding:
${worldSummary || '(Belum terdata)'}
- Outline Bab yang Direncanakan:
${outlineSummary || '(Belum terdata)'}

Tugasmu:
Buatkan sinopsis utuh dari awal sampai akhir (termasuk resolusi ending) dalam format JSON persis berikut:
{
  "hookParagraph": "1 paragraf pembuka yang tajam dan menggugah rasa penasaran pembaca/editor",
  "targetAudience": "Target demografi pembaca (cth: Dewasa muda penyuka misteri dan intrik sejarah)",
  "comparativeTitles": "Judul pembanding pasar (cth: The Name of the Rose bertemu Game of Thrones)",
  "endingSummary": "Ringkasan resolusi klimaks dan nasib akhir tokoh utama",
  "fullSynopsisText": "Naskah sinopsis lengkap terstruktur dalam beberapa paragraf naratif yang mengalir (Act 1 Setup -> Act 2 Confrontation & Midpoint Crisis -> Act 3 Climax & Resolution)."
}`;

      const data = await callGeminiJson<AutoSynopsisResponse>({
        apiKey: settings.geminiApiKey,
        model: settings.selectedModel || 'auto',
        temperature: 0.75,
        systemInstruction: 'Kamu adalah editor senior penerbit fiksi sastra yang ahli menyusun sinopsis proposal naskah.',
        prompt
      });

      updateSynopsis({
        hookParagraph: data.hookParagraph || synopsis.hookParagraph,
        targetAudience: data.targetAudience || synopsis.targetAudience,
        comparativeTitles: data.comparativeTitles || synopsis.comparativeTitles,
        endingSummary: data.endingSummary || synopsis.endingSummary,
        fullSynopsisText: data.fullSynopsisText || synopsis.fullSynopsisText
      });

      showToast('Sinopsis lengkap berhasil disintesis otomatis oleh Gemini AI!');
    } catch (err: unknown) {
      console.error('Auto synopsis error:', err);
      const message = err instanceof Error ? err.message : 'Gagal memproses sinopsis AI';
      alert(`Error Gemini AI: ${message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
      
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Fase 1.G: Sinopsis Lengkap 1-3 Halaman</span>
          </div>
          <h2 className="text-lg font-bold text-(--text-primary)">
            Ringkasan Naratif Utuh dari Awal hingga Ending
          </h2>
          <p className="text-xs text-(--text-secondary) max-w-2xl">
            Sinopsis lengkap memastikan plot cerita utuh dari hulu ke hilir sebelum menulis draf panjang, sekaligus siap untuk proposal penerbitan dan kompetisi naskah.
          </p>
        </div>

        <button
          onClick={handleAiGenerateSynopsis}
          disabled={isAiLoading}
          className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 shrink-0"
          title="Sintesiskan seluruh data premis, karakter, tema, world, dan outline menjadi sinopsis utuh"
        >
          {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
          <span>✨ Sintesis Sinopsis Lengkap (1-Klik)</span>
        </button>
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
            <div className="text-[11px] text-(--text-muted)">Menggabungkan seluruh pilar cerita menjadi narasi sinopsis komprehensif</div>
          </div>
        </div>
      )}

      {/* Grid Meta Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Hook */}
        <div className="md:col-span-3 p-4 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-2">
          <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <Flame className="w-4 h-4" />
            <span>Hook Pembuka Sinopsis (1 Paragraf Daya Pikat)</span>
          </label>
          <textarea
            value={synopsis.hookParagraph}
            onChange={(e) => updateSynopsis({ hookParagraph: e.target.value })}
            rows={2}
            placeholder="Ketika sebuah imperium di ambang kepungan..."
            className="w-full p-2.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:ring-1 focus:ring-amber-500 focus:outline-none leading-relaxed font-novel-serif"
          />
        </div>

        {/* Target Audience */}
        <div className="p-4 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-1.5">
          <label className="text-xs font-bold text-(--text-primary) flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target Pembaca</span>
          </label>
          <input
            type="text"
            value={synopsis.targetAudience}
            onChange={(e) => updateSynopsis({ targetAudience: e.target.value })}
            placeholder="Dewasa muda & dewasa penyuka fiksi sejarah geopolitik..."
            className="w-full px-3 py-1.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
          />
        </div>

        {/* Comparative Titles */}
        <div className="p-4 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-1.5">
          <label className="text-xs font-bold text-(--text-primary) flex items-center gap-1.5">
            <BookMarked className="w-3.5 h-3.5 text-blue-400" />
            <span>Judul Pembanding (X meets Y)</span>
          </label>
          <input
            type="text"
            value={synopsis.comparativeTitles}
            onChange={(e) => updateSynopsis({ comparativeTitles: e.target.value })}
            placeholder="The Name of the Rose bertemu The City & The City..."
            className="w-full px-3 py-1.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
          />
        </div>

        {/* Ending Summary */}
        <div className="p-4 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-1.5">
          <label className="text-xs font-bold text-(--text-primary) flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-purple-400" />
            <span>Kunci Resolusi Ending</span>
          </label>
          <input
            type="text"
            value={synopsis.endingSummary}
            onChange={(e) => updateSynopsis({ endingSummary: e.target.value })}
            placeholder="Dokumen fatwa asli terbongkar, Wazir dicopot..."
            className="w-full px-3 py-1.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
          />
        </div>

      </div>

      {/* Main Full Synopsis Editor */}
      <div className="p-5 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            <span>Naskah Sinopsis Lengkap (1-3 Halaman)</span>
          </label>
          <span className="text-[11px] text-(--text-muted)">
            {synopsis.fullSynopsisText ? synopsis.fullSynopsisText.split(/\s+/).filter(Boolean).length : 0} kata
          </span>
        </div>

        <textarea
          value={synopsis.fullSynopsisText}
          onChange={(e) => updateSynopsis({ fullSynopsisText: e.target.value })}
          rows={16}
          placeholder="Tuliskan alur cerita lengkap dari pembuka, pemicu konflik, konfrontasi tengah, hingga penyelesaian ending secara utuh..."
          className="w-full p-4 text-xs sm:text-sm rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:ring-1 focus:ring-amber-500 focus:outline-none font-novel-serif leading-relaxed"
        />
      </div>

      {/* Bottom Step Forward Navigation: Phase 1 Finished -> Go to Phase 2 Drafting */}
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-(--border-color)">
        <button
          onClick={() => setPrewritingSubTab('outline')}
          className="px-3.5 py-2 text-xs text-(--text-secondary) hover:text-(--text-primary) transition-colors"
        >
          &larr; Kembali ke Struktur & Outline
        </button>

        <button
          onClick={() => setPhase('drafting')}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-linear-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-sm hover:from-amber-400 hover:to-amber-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 animate-pulse"
        >
          <PenTool className="w-4 h-4" />
          <span>Selesai Pra-Menulis: Masuk ke Fase 2: Drafting Studio</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
