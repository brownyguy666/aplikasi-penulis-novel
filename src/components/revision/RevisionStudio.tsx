'use client';

import React, { useState } from 'react';
import { useNovelStore } from '@/store/useNovelStore';
import { runLayeredRevision } from '@/lib/geminiClient';
import { RevisionPassType, RevisionFeedbackItem } from '@/types/novel';
import { 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  Check, 
  ArrowRight, 
  Loader2, 
  SpellCheck,
  LucideIcon
} from 'lucide-react';

const PASS_META: Record<RevisionPassType, { title: string; subtitle: string; icon: LucideIcon; color: string; bg: string }> = {
  developmental: {
    title: '1. Developmental Edit',
    subtitle: 'Struktur Plot, Pacing & Arc Karakter',
    icon: Layers,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30'
  },
  line_edit: {
    title: '2. Line Edit',
    subtitle: 'Gaya Bahasa, Show-Don\'t-Tell & Diksi',
    icon: Edit3,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/30'
  },
  copyedit: {
    title: '3. Copyediting',
    subtitle: 'Tata Bahasa, Ejaan & Larangan Em-Dash',
    icon: SpellCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30'
  },
  proofread: {
    title: '4. Proofreading',
    subtitle: 'Pembersihan Final & Formatting Naskah',
    icon: CheckCircle2,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/30'
  }
};

export const RevisionStudio: React.FC = () => {
  const { 
    project, 
    addRevisionReport, 
    applyRevisionItem, 
    setActiveRevision, 
    setPhase, 
    settings 
  } = useNovelStore();

  const activeChapterId = project.activeRevisionChapterId || project.activeChapterId || project.chapters[0]?.id || '';
  const activePass = project.activeRevisionPass || 'developmental';
  const activeChapter = project.chapters.find((c) => c.id === activeChapterId) || project.chapters[0];
  const draft = project.drafts[activeChapterId];

  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Find existing reports for this chapter & pass
  const chapterReports = project.revisionReports[activeChapterId] || [];
  const activeReport = chapterReports.find((r) => r.passType === activePass) || chapterReports[0];

  const handleRunRevision = async (passType: RevisionPassType) => {
    if (!activeChapter || !draft?.contentPlainText?.trim()) {
      alert('Bab ini belum memiliki naskah draf untuk direvisi.');
      return;
    }

    setIsLoadingAi(true);
    try {
      const report = await runLayeredRevision({
        apiKey: settings.geminiApiKey,
        model: settings.selectedModel,
        project,
        chapter: activeChapter,
        draftText: draft.contentPlainText,
        passType
      });

      addRevisionReport(report);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menjalankan evaluasi revisi AI';
      alert(message);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleApplyFix = (item: RevisionFeedbackItem) => {
    if (!activeReport) return;
    applyRevisionItem(activeChapterId, activeReport.id, item.id);
    alert('Perbaikan ditandai selesai.');
  };

  const currentMeta = PASS_META[activePass];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-(--bg-primary)">
      
      {/* Top Header Bar */}
      <div className="w-full bg-(--bg-secondary) border-b border-(--border-color) px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Chapter Picker */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-(--text-secondary)">Pilih Bab:</span>
            <select
              value={activeChapterId}
              onChange={(e) => setActiveRevision(e.target.value, activePass)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
            >
              {project.chapters.map((c, idx) => (
                <option key={c.id} value={c.id}>
                  Bab {idx + 1}: {c.title}
                </option>
              ))}
            </select>

            <span className="text-xs text-(--text-muted) font-mono">
              ({draft?.wordCount || 0} kata)
            </span>
          </div>

          {/* Action: Next Phase Export */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRunRevision(activePass)}
              disabled={isLoadingAi || !draft?.contentPlainText?.trim()}
              className="px-3.5 py-1.5 rounded-xl bg-linear-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-bold hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              {isLoadingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Jalankan Analisis {currentMeta.title.split('. ')[1]}</span>
            </button>

            <button
              onClick={() => setPhase('export')}
              className="px-3 py-1.5 rounded-xl bg-purple-500 text-slate-950 text-xs font-bold hover:bg-purple-400 transition-colors flex items-center gap-1.5 shadow-md shadow-purple-500/20"
            >
              <span>Kompilasi & Ekspor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Layer Navigation Tabs */}
      <div className="w-full bg-(--bg-secondary) border-b border-(--border-color) px-4 py-2">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-2">
          {(Object.entries(PASS_META) as [RevisionPassType, typeof currentMeta][]).map(([passKey, meta]) => {
            const isActive = activePass === passKey;
            const Icon = meta.icon;
            const passReport = chapterReports.find((r) => r.passType === passKey);

            return (
              <button
                key={passKey}
                onClick={() => setActiveRevision(activeChapterId, passKey)}
                className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2 ${
                  isActive
                    ? `${meta.bg} shadow-sm border-current`
                    : 'bg-(--bg-primary) border-(--border-color) text-(--text-secondary) hover:text-(--text-primary)'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? meta.color : 'text-(--text-muted)'}`} />
                    <span className={`text-xs font-bold ${isActive ? 'text-(--text-primary)' : ''}`}>
                      {meta.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-(--text-muted) line-clamp-1">{meta.subtitle}</p>
                </div>

                {passReport && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md font-mono ${
                    passReport.overallScore >= 90 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {passReport.overallScore}/100
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Layout: Left Manuscript Preview, Right Revision Report */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
        
        {/* Left: Chapter Manuscript View */}
        <div className="lg:col-span-6 flex flex-col rounded-2xl bg-(--bg-secondary) border border-(--border-color) overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-(--border-color) bg-(--bg-primary) flex items-center justify-between">
            <span className="text-xs font-bold text-(--text-primary)">
              Naskah {activeChapter?.title}
            </span>
            <button
              onClick={() => {
                setActiveRevision(activeChapterId, activePass);
                setPhase('drafting');
              }}
              className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Buka di Editor Tiptap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto font-novel-serif text-sm leading-relaxed text-(--text-primary) whitespace-pre-wrap selection:bg-amber-500/30">
            {draft?.contentPlainText || (
              <p className="text-xs text-(--text-muted) italic font-sans">
                Belum ada naskah. Tulis draf bab ini terlebih dahulu di Drafting Studio.
              </p>
            )}
          </div>
        </div>

        {/* Right: Revision Report & Actionable Feedback Items */}
        <div className="lg:col-span-6 flex flex-col rounded-2xl bg-(--bg-secondary) border border-(--border-color) overflow-hidden shadow-sm">
          
          <div className="px-4 py-3 border-b border-(--border-color) bg-(--bg-primary) flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${currentMeta.color}`}>
                Laporan {currentMeta.title}
              </span>
            </div>
            {activeReport && (
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                Skor Naskah: {activeReport.overallScore}/100
              </span>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {activeReport ? (
              <div className="space-y-4 animate-fade-in">
                
                {/* Summary Card */}
                <div className="p-3.5 rounded-xl bg-(--bg-primary) border border-(--border-color) space-y-2">
                  <span className="font-bold text-(--text-primary)">Ringkasan Evaluasi Editor:</span>
                  <p className="text-(--text-secondary) leading-relaxed">{activeReport.summary}</p>
                </div>

                {/* Strengths & Weaknesses Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeReport.strengths?.length > 0 && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                      <span className="font-bold text-emerald-400 flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Kekuatan Bab Ini
                      </span>
                      <ul className="space-y-1 text-[11px] text-(--text-secondary)">
                        {activeReport.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeReport.weaknesses?.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                      <span className="font-bold text-amber-400 flex items-center gap-1 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Area yang Perlu Diperbaiki
                      </span>
                      <ul className="space-y-1 text-[11px] text-(--text-secondary)">
                        {activeReport.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-400">•</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Actionable Feedback Items List */}
                <div className="space-y-2.5">
                  <span className="font-bold text-(--text-primary)">
                    Temuan Spesifik & Rekomendasi Solusi ({activeReport.items.length})
                  </span>

                  <div className="space-y-3">
                    {activeReport.items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                          item.applied 
                            ? 'bg-(--bg-primary)/40 border-(--border-color) opacity-60' 
                            : 'bg-(--bg-primary) border-(--border-color) hover:border-amber-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            item.severity === 'critical' || item.type === 'em_dash_detected'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : item.severity === 'warning'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {item.type.replace(/_/g, ' ')}
                          </span>

                          <button
                            onClick={() => handleApplyFix(item)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                              item.applied
                                ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                                : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>{item.applied ? 'Selesai' : 'Tandai Selesai'}</span>
                          </button>
                        </div>

                        {item.locationSnippet && (
                          <div className="p-2 rounded-lg bg-(--bg-secondary) border border-(--border-color) font-novel-serif text-[11px] text-(--text-secondary) italic">
                            &ldquo;{item.locationSnippet}&rdquo;
                          </div>
                        )}

                        <div className="space-y-1">
                          <p className="text-[11px] text-(--text-primary) font-medium">
                            <strong className="text-amber-400">Masalah:</strong> {item.issue}
                          </p>
                          <p className="text-[11px] text-(--text-secondary)">
                            <strong className="text-emerald-400">Solusi:</strong> {item.suggestion}
                          </p>
                          {item.replacementText && (
                            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-novel-serif">
                              <strong>Usulan Teks Pengganti:</strong> {item.replacementText}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-10 text-center rounded-2xl bg-(--bg-primary) border border-dashed border-(--border-color) space-y-3">
                <currentMeta.icon className={`w-8 h-8 mx-auto ${currentMeta.color} opacity-60`} />
                <div className="space-y-1">
                  <h4 className="font-bold text-(--text-primary)">Belum Ada Laporan {currentMeta.title}</h4>
                  <p className="text-xs text-(--text-secondary) max-w-sm mx-auto">
                    Klik tombol &ldquo;Jalankan Analisis&rdquo; di kanan atas untuk meminta Gemini AI mengevaluasi naskah bab ini.
                  </p>
                </div>
                <button
                  onClick={() => handleRunRevision(activePass)}
                  disabled={isLoadingAi || !draft?.contentPlainText?.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 disabled:opacity-50 transition-all inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                >
                  {isLoadingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Mulai Evaluasi Sekarang</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
