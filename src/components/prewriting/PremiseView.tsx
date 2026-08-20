'use client';

import React, { useState } from 'react';
import { useNovelStore } from '@/store/useNovelStore';
import { callGeminiRaw, callGeminiJson } from '@/lib/geminiClient';
import { 
  Compass, 
  Sparkles, 
  Target, 
  Flame, 
  ShieldAlert, 
  Lightbulb, 
  Check, 
  Loader2,
  Copy,
  X,
  Wand2,
  Dices,
  ArrowRight,
  User,
  Flag,
  AlertTriangle
} from 'lucide-react';

interface PremiseAutoFillResponse {
  logline: string;
  protagonist: string;
  goal: string;
  obstacle: string;
  stakes: string;
  elevatorPitch: string;
  coreConflict: string;
}

export const PremiseView: React.FC = () => {
  const { project, updatePremise, settings, setPrewritingSubTab } = useNovelStore();
  const premise = project.premise;

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Gemini AI sedang berpikir...');
  const [rawAiResult, setRawAiResult] = useState<string | null>(null);
  const [activePromptType, setActivePromptType] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // 1-Click: Generate complete fresh premise from scratch
  const handleGenerateFreshPremise = async () => {
    setIsAiLoading(true);
    setLoadingMessage('Gemini AI sedang menciptakan ide premis & kompas novel baru...');
    setActivePromptType('auto_generate');
    setRawAiResult(null);

    try {
      const prompt = `Ciptakan 1 konsep novel baru yang sangat orisinal, bernutrisi sastra tinggi, dan memikat untuk genre: "${project.customGenreName || project.genre}".
Keluarkan dalam format JSON dengan kunci-kunci persis berikut:
{
  "logline": "1-2 kalimat premis kompas yang tajam [Tokoh] + [Goal] + [Rintangan] + [Stakes]",
  "protagonist": "Nama tokoh, profesi, latar status sosial, dan luka masa lalu singkatnya",
  "goal": "Tujuan spesifik yang mendorong aksi aktif cerita",
  "obstacle": "Kekuatan oposisi, lawan utama, atau sistem yang menghalanginya",
  "stakes": "Konsekuensi fatal dan taruhan jika tokoh ini gagal",
  "elevatorPitch": "1 paragraf sinopsis ringkas yang memikat jika novel ini dipresentasikan ke penerbit",
  "coreConflict": "Kontradiksi tajam antara dorongan internal nurani vs tekanan eksternal"
}`;

      const data = await callGeminiJson<PremiseAutoFillResponse>({
        apiKey: settings.geminiApiKey,
        model: settings.selectedModel || 'auto',
        temperature: 0.85,
        systemInstruction: 'Kamu adalah master novelis dan konsultan cerita fiksi profesional.',
        prompt
      });

      updatePremise({
        logline: data.logline || premise.logline,
        protagonist: data.protagonist || premise.protagonist,
        goal: data.goal || premise.goal,
        obstacle: data.obstacle || premise.obstacle,
        stakes: data.stakes || premise.stakes,
        elevatorPitch: data.elevatorPitch || premise.elevatorPitch,
        coreConflict: data.coreConflict || premise.coreConflict
      });

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3500);
    } catch (err: unknown) {
      console.error('Auto premise error:', err);
      const msg = err instanceof Error ? err.message : 'Gagal membuat ide otomatis';
      alert(`Error Gemini AI: ${msg}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // 1-Click: Decompose & auto-fill all detail boxes from the existing logline
  const handleAutoFillFromLogline = async () => {
    if (!premise.logline.trim()) {
      alert('Ketikkan dulu ide / logline Anda di kotak atas atau gunakan tombol "Buat Ide Baru Otomatis".');
      return;
    }

    setIsAiLoading(true);
    setLoadingMessage('Gemini AI sedang membedah logline Anda dan melengkapi semua pilar cerita...');
    setActivePromptType('decompose_logline');
    setRawAiResult(null);

    try {
      const prompt = `Analisis dan bedah logline novel berikut:
"${premise.logline}"
Genre: ${project.customGenreName || project.genre}

Keluarkan dalam format JSON dengan kunci-kunci persis berikut untuk melengkapi formulir novel secara mendalam:
{
  "protagonist": "Siapa tokoh utamanya, profesi, identitas, dan status sosialnya berdasarkan logline di atas",
  "goal": "Tujuan/keinginan spesifik yang ingin dicapai tokoh",
  "obstacle": "Rintangan, lawan, atau intrik yang menghadangnya",
  "stakes": "Taruhan fatal (pribadi maupun dunia/masyarakat) jika ia gagal",
  "elevatorPitch": "1 paragraf ringkas elevator pitch naskah",
  "coreConflict": "Konflik batin internal vs tekanan luar yang dialami tokoh"
}`;

      const data = await callGeminiJson<Partial<PremiseAutoFillResponse>>({
        apiKey: settings.geminiApiKey,
        model: settings.selectedModel || 'auto',
        temperature: 0.75,
        systemInstruction: 'Kamu adalah editor sastra yang membantu melengkapi formulir penulisan novel pemula.',
        prompt
      });

      updatePremise({
        protagonist: data.protagonist || premise.protagonist,
        goal: data.goal || premise.goal,
        obstacle: data.obstacle || premise.obstacle,
        stakes: data.stakes || premise.stakes,
        elevatorPitch: data.elevatorPitch || premise.elevatorPitch,
        coreConflict: data.coreConflict || premise.coreConflict
      });

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3500);
    } catch (err: unknown) {
      console.error('Decompose error:', err);
      const msg = err instanceof Error ? err.message : 'Gagal melengkapi kotak otomatis';
      alert(`Error Gemini AI: ${msg}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Advisory / Consulting AI: Refine or Stakes
  const handleAiConsult = async (type: 'refine' | 'stakes') => {
    setIsAiLoading(true);
    setLoadingMessage(type === 'refine' ? 'Gemini AI sedang merumuskan variasi pertajaman logline...' : 'Gemini AI sedang menganalisis eskalasi taruhan cerita...');
    setActivePromptType(type);
    setRawAiResult(null);

    try {
      let prompt = '';
      if (type === 'refine') {
        prompt = `Sebagai konsultan naskah novel profesional, pertajam dan evaluasi premis/logline berikut:
Judul: ${project.title}
Genre: ${project.customGenreName || project.genre}
Logline Saat Ini: "${premise.logline || 'Belum diisi'}"
Tokoh: ${premise.protagonist || '-'}
Goal: ${premise.goal || '-'}
Rintangan: ${premise.obstacle || '-'}
Taruhan (Stakes): ${premise.stakes || '-'}

Berikan 3 variasi logline kompas yang jauh lebih bertenaga, dramatis, dan memiliki kontras tajam (1-2 kalimat per variasi) dalam bahasa Indonesia yang memikat. Berikan penjelasan singkat mengapa masing-masing variasi bekerja efektif.`;
      } else {
        prompt = `Bantu naikkan taruhan (raise the stakes) untuk novel:
Judul: ${project.title}
Tokoh: ${premise.protagonist || '-'}
Keinginan: ${premise.goal || '-'}
Rintangan: ${premise.obstacle || '-'}

Berikan 3 kemungkinan konsekuensi paling mengerikan (pribadi, sosial/komunal, dan politis/nasional) jika tokoh ini gagal mencapai tujuannya, agar urgensi cerita menjadi sangat mendesak.`;
      }

      const result = await callGeminiRaw({
        apiKey: settings.geminiApiKey,
        model: settings.selectedModel || 'auto',
        temperature: 0.75,
        systemInstruction: 'Kamu adalah master editor fiksi dan konsultan cerita sastra berpengalaman.',
        prompt
      });

      setRawAiResult(result);
    } catch (err: unknown) {
      console.error('Consult AI error:', err);
      const message = err instanceof Error ? err.message : 'Gagal memanggil Gemini AI';
      alert(`Error Gemini AI: ${message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
      
      {/* Header Banner with 1-Click AI Actions */}
      <div className="p-5 rounded-2xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Fase 1.A: Menemukan Premis & Kompas Cerita</span>
          </div>
          <h2 className="text-lg font-bold text-(--text-primary)">
            Rumuskan Kompas Cerita dalam 1-2 Kalimat
          </h2>
          <p className="text-xs text-(--text-secondary) max-w-2xl">
            Premis yang kuat adalah kompas utama saat draf mulai melebar. Formula dasar: <em>[Siapa tokohnya] + [Apa yang diinginkannya] + [Apa rintangan/antagonisnya] + [Apa taruhannya jika gagal].</em>
          </p>
        </div>

        {/* 1-Click Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleGenerateFreshPremise}
            disabled={isAiLoading}
            className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            title="Klik jika belum punya ide, AI akan mengisi otomatis semua kotak"
          >
            {isAiLoading && activePromptType === 'auto_generate' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Dices className="w-3.5 h-3.5" />
            )}
            <span>✨ Buat Ide Premis Otomatis</span>
          </button>

          <button
            onClick={handleAutoFillFromLogline}
            disabled={isAiLoading || !premise.logline.trim()}
            className="px-3.5 py-2 rounded-xl bg-(--bg-secondary) border border-amber-500/50 text-amber-400 text-xs font-semibold hover:bg-amber-500/10 disabled:opacity-40 transition-all flex items-center gap-1.5"
            title="Lengkapi 6 kotak di bawah otomatis dari logline yang diketik"
          >
            {isAiLoading && activePromptType === 'decompose_logline' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
            <span>🪄 Lengkapi Kotak Otomatis</span>
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span><strong>Berhasil!</strong> Semua kotak premis cerita telah dilengkapi otomatis oleh Gemini AI. Anda bebas mengeditnya kembali sesuai keinginan.</span>
        </div>
      )}

      {/* Loading Indicator Banner */}
      {isAiLoading && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-400 animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin shrink-0 text-amber-400" />
          <div className="space-y-0.5">
            <div className="font-bold text-(--text-primary)">{loadingMessage}</div>
            <div className="text-[11px] text-(--text-muted)">Menghasilkan data terstruktur berstandar sastra profesional</div>
          </div>
        </div>
      )}

      {/* AI Consulting Result Box */}
      {rawAiResult && (
        <div className="p-5 rounded-2xl bg-(--bg-secondary) border border-amber-500/40 space-y-3 animate-fade-in shadow-lg shadow-amber-500/5">
          <div className="flex items-center justify-between border-b border-(--border-color) pb-3">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" />
              <span>Saran Rekomendasi Konsultasi Gemini AI:</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(rawAiResult);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 text-[11px] font-semibold transition-colors flex items-center gap-1"
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

      {/* Main Logline Highlight Input */}
      <div className="p-5 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>Logline / Premis Inti (Kompas Utama Novel)</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAiConsult('refine')}
              disabled={isAiLoading}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>Pertajam Logline</span>
            </button>
            <button
              onClick={() => handleAiConsult('stakes')}
              disabled={isAiLoading}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
            >
              <Flame className="w-3 h-3" />
              <span>Naikkan Taruhan (Stakes)</span>
            </button>
          </div>
        </div>

        <textarea
          value={premise.logline}
          onChange={(e) => updatePremise({ logline: e.target.value })}
          rows={3}
          placeholder="Contoh: Seorang qadhi muda yang idealis menemukan naskah fatwa palsu di arsip istana..."
          className="w-full p-3.5 text-sm rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:ring-1 focus:ring-amber-500 focus:outline-none leading-relaxed font-novel-serif"
        />
        <div className="flex items-center justify-between text-[11px] text-(--text-muted)">
          <span>Formula: [Tokoh] + [Tujuan/Goal] + [Rintangan] + [Taruhan/Stakes]</span>
          <span>{premise.logline.length} karakter</span>
        </div>
      </div>

      {/* 4 Pillars Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Pillar 1: Protagonist */}
        <div className="p-4 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-2">
          <label className="text-xs font-bold text-(--text-primary) flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">1</span>
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Siapa Tokoh Utamanya? (Protagonis)</span>
          </label>
          <p className="text-[11px] text-(--text-muted)">Identitas, profesi, dan status sosial awal sang tokoh.</p>
          <textarea
            value={premise.protagonist}
            onChange={(e) => updatePremise({ protagonist: e.target.value })}
            rows={2}
            placeholder="Tariq bin Mansur, qadhi muda pengarsip mahkamah..."
            className="w-full p-2.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:ring-1 focus:ring-amber-500 focus:outline-none leading-relaxed"
          />
        </div>

        {/* Pillar 2: Goal */}
        <div className="p-4 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-2">
          <label className="text-xs font-bold text-(--text-primary) flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">2</span>
            <Flag className="w-3.5 h-3.5 text-cyan-400" />
            <span>Apa yang Diinginkannya? (Goal / Want)</span>
          </label>
          <p className="text-[11px] text-(--text-muted)">Tujuan spesifik yang mendorong aksi aktif cerita.</p>
          <textarea
            value={premise.goal}
            onChange={(e) => updatePremise({ goal: e.target.value })}
            rows={2}
            placeholder="Membuktikan fatwa palsu dan membongkar dalang..."
            className="w-full p-2.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:ring-1 focus:ring-amber-500 focus:outline-none leading-relaxed"
          />
        </div>

        {/* Pillar 3: Obstacle */}
        <div className="p-4 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-2">
          <label className="text-xs font-bold text-(--text-primary) flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">3</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Apa yang Menghalanginya? (Rintangan & Antagonis)</span>
          </label>
          <p className="text-[11px] text-(--text-muted)">Kekuatan oposisi, lawan politik, intrik, atau kelemahan internal.</p>
          <textarea
            value={premise.obstacle}
            onChange={(e) => updatePremise({ obstacle: e.target.value })}
            rows={2}
            placeholder="Birokrasi korup, pembunuh bayaran bayang-bayang..."
            className="w-full p-2.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:ring-1 focus:ring-amber-500 focus:outline-none leading-relaxed"
          />
        </div>

        {/* Pillar 4: Stakes */}
        <div className="p-4 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-2">
          <label className="text-xs font-bold text-(--text-primary) flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-red-500/20 text-red-400 flex items-center justify-center text-[10px] font-bold">4</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>Apa Taruhannya Jika Gagal? (Stakes)</span>
          </label>
          <p className="text-[11px] text-(--text-muted)">Konsekuensi fatal yang membuat cerita ini krusial untuk diceritakan.</p>
          <textarea
            value={premise.stakes}
            onChange={(e) => updatePremise({ stakes: e.target.value })}
            rows={2}
            placeholder="Benteng jatuh ke tangan musuh dan daulah pecah perang saudara..."
            className="w-full p-2.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:ring-1 focus:ring-amber-500 focus:outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* Pitch & Conflict Depth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-2">
          <label className="text-xs font-bold text-(--text-primary) flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            Elevator Pitch (1 Paragraf Sinopsis Ringkas)
          </label>
          <textarea
            value={premise.elevatorPitch}
            onChange={(e) => updatePremise({ elevatorPitch: e.target.value })}
            rows={3}
            placeholder="Penjelasan ringkas saat mempresentasikan novel ini..."
            className="w-full p-2.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:ring-1 focus:ring-amber-500 focus:outline-none leading-relaxed"
          />
        </div>

        <div className="p-4 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-2">
          <label className="text-xs font-bold text-(--text-primary) flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            Konflik Internal vs Eksternal
          </label>
          <textarea
            value={premise.coreConflict}
            onChange={(e) => updatePremise({ coreConflict: e.target.value })}
            rows={3}
            placeholder="Perbenturan antara kepatuhan birokrasi vs panggilan hati nurani..."
            className="w-full p-2.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:ring-1 focus:ring-amber-500 focus:outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* Bottom Step Forward Navigation */}
      <div className="pt-4 flex items-center justify-between border-t border-(--border-color)">
        <span className="text-xs text-(--text-muted)">
          Langkah 1 dari 7 Fase Pra-Menulis
        </span>
        <button
          onClick={() => setPrewritingSubTab('research')}
          className="px-4 py-2.5 rounded-xl bg-blue-500 text-slate-950 font-bold text-xs hover:bg-blue-400 transition-all flex items-center gap-2 shadow-md shadow-blue-500/20"
        >
          <span>Lanjut ke Riset & Timeline (Fase 1.B)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
