'use client';

import React, { useState } from 'react';
import { useNovelStore } from '@/store/useNovelStore';
import { streamDraftChapter } from '@/lib/geminiClient';
import { TiptapEditor } from './TiptapEditor';
import { 
  Sparkles, 
  Play, 
  Square, 
  FastForward, 
  Maximize2, 
  Minimize2, 
  Layers, 
  Users, 
  Globe, 
  AlertTriangle, 
  Sliders, 
  ArrowRight,
  ShieldCheck,
  History,
  Camera,
  RotateCcw,
  Trash2,
  X,
  Check,
  FileCode,
  Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DraftingStudio: React.FC = () => {
  const { 
    project, 
    updateChapterDraft, 
    setActiveChapter, 
    setPhase, 
    setActiveRevision,
    createChapterSnapshot,
    restoreChapterSnapshot,
    deleteChapterSnapshot,
    addGenerationLog,
    clearGenerationLogs,
    settings 
  } = useNovelStore();

  const activeChapterId = project.activeChapterId || project.chapters[0]?.id || '';
  const activeChapter = project.chapters.find((c) => c.id === activeChapterId) || project.chapters[0];
  const draft = project.drafts[activeChapterId] || {
    id: `draft-${activeChapterId}`,
    chapterId: activeChapterId,
    title: activeChapter?.title || 'Bab',
    contentHtml: '<p></p>',
    contentPlainText: '',
    wordCount: 0,
    targetWordCount: activeChapter?.targetWordCount || 1500,
    lastSavedAt: new Date().toISOString()
  };

  const [isAiStreaming, setIsAiStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [abortStreamFn, setAbortStreamFn] = useState<(() => void) | null>(null);
  const [selectedSnippet] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [sidebarTab, setSidebarTab] = useState<'beats' | 'characters' | 'world' | 'rules'>('beats');
  const [isZenMode, setIsZenMode] = useState(false);
  const [isIndentParagraphs, setIsIndentParagraphs] = useState(true);
  const [isTimeMachineOpen, setIsTimeMachineOpen] = useState(false);
  const [isPromptAuditOpen, setIsPromptAuditOpen] = useState(false);
  const [selectedAuditLogId, setSelectedAuditLogId] = useState<string | null>(null);
  const [copiedAuditLogId, setCopiedAuditLogId] = useState<string | null>(null);
  const [snapshotLabelInput, setSnapshotLabelInput] = useState('');
  const [snapshotNoteInput, setSnapshotNoteInput] = useState('');
  const [isSnapshotCreatedMsg, setIsSnapshotCreatedMsg] = useState(false);

  const chapterSnapshots = project.snapshots?.[activeChapterId] || [];

  // Check for forbidden em-dash violations in the current draft
  const emDashCount = (draft.contentPlainText.match(/—/g) || []).length;

  const handleEditorChange = (html: string, plainText: string, words: number) => {
    updateChapterDraft(activeChapterId, {
      contentHtml: html,
      contentPlainText: plainText,
      wordCount: words
    });
  };

  const handleFixEmDashes = () => {
    if (!draft.contentPlainText.includes('—')) return;
    const fixedPlain = draft.contentPlainText.replace(/—/g, ', ');
    const fixedHtml = draft.contentHtml.replace(/—/g, ', ');
    updateChapterDraft(activeChapterId, {
      contentHtml: fixedHtml,
      contentPlainText: fixedPlain
    });
    alert(`Berhasil mengganti ${emDashCount} tanda em dash (—) dengan tanda koma sesuai aturan penulisan.`);
  };

  const handleCreateSnapshot = () => {
    const label = snapshotLabelInput.trim() || `v1.${chapterSnapshots.length} - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    createChapterSnapshot(activeChapterId, label, snapshotNoteInput.trim());
    setSnapshotLabelInput('');
    setSnapshotNoteInput('');
    setIsSnapshotCreatedMsg(true);
    setTimeout(() => setIsSnapshotCreatedMsg(false), 2000);
  };

  const handleRestoreSnapshot = (snapshotId: string, versionLabel: string) => {
    if (confirm(`Pulihkan bab ke versi "${versionLabel}"? Naskah saat ini akan dicadangkan secara otomatis sebelum ditimpa.`)) {
      restoreChapterSnapshot(activeChapterId, snapshotId);
      setIsTimeMachineOpen(false);
      alert(`Berhasil memulihkan ke versi "${versionLabel}"!`);
    }
  };

  const handleStartAiDrafting = async (mode: 'zero_draft' | 'continue_scene' | 'expand_scene' | 'dialogue_polish') => {
    if (!activeChapter) return;
    setIsAiStreaming(true);
    setStreamingText('');

    try {
      const stopFn = await streamDraftChapter({
        apiKey: settings.geminiApiKey,
        model: settings.selectedModel,
        temperature: settings.temperature,
        project,
        chapter: activeChapter,
        currentDraftText: draft.contentPlainText,
        mode,
        selectedSnippet,
        customPromptInstruction: customPrompt,
        onChunk: (chunkText) => {
          setStreamingText(chunkText);
        },
        onDone: (finalText) => {
          setIsAiStreaming(false);
          setAbortStreamFn(null);
          setStreamingText('');

          if (finalText) {
            // Convert plain text paragraphs into HTML paragraphs for Tiptap
            const paragraphs = finalText
              .split(/\n\n+/)
              .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
              .join('');

            let combinedHtml = draft.contentHtml;
            let combinedPlain = draft.contentPlainText;

            if (mode === 'zero_draft') {
              combinedHtml = paragraphs;
              combinedPlain = finalText;
            } else {
              combinedHtml = `${draft.contentHtml}${paragraphs}`;
              combinedPlain = `${draft.contentPlainText}\n\n${finalText}`;
            }

            const wordCount = combinedPlain.split(/\s+/).filter(Boolean).length;
            updateChapterDraft(activeChapterId, {
              contentHtml: combinedHtml,
              contentPlainText: combinedPlain,
              wordCount
            });

            // Record audit log for generation history
            addGenerationLog({
              chapterId: activeChapterId,
              chapterTitle: activeChapter.title,
              mode,
              model: settings.selectedModel || 'auto',
              prompt: `Mode: ${mode}\nInstruksi Tambahan: ${customPrompt || 'Default Beat Expansion'}\nTarget Bab: ${activeChapter.title}\nPOV: ${project.rules.pov} | Tense: ${project.rules.tense}`,
              outputText: finalText,
              wordCount: finalText.split(/\s+/).filter(Boolean).length
            });

            // Trigger celebratory milestone confetti if target reached
            if (wordCount >= (activeChapter.targetWordCount || 1500)) {
              confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
            }
          }
        },
        onError: (err) => {
          setIsAiStreaming(false);
          setAbortStreamFn(null);
          alert(`Error AI Drafting: ${err}`);
        }
      });

      setAbortStreamFn(() => stopFn);
    } catch (err: unknown) {
      setIsAiStreaming(false);
      const message = err instanceof Error ? err.message : 'Gagal memulai drafting AI';
      alert(message);
    }
  };

  const handleStopStreaming = () => {
    if (abortStreamFn) {
      abortStreamFn();
      setIsAiStreaming(false);
    }
  };

  const handleGoToRevision = () => {
    setActiveRevision(activeChapterId, 'developmental');
    setPhase('revision');
  };

  const targetWords = activeChapter?.targetWordCount || 1500;
  const progressPercent = Math.min(100, Math.round((draft.wordCount / targetWords) * 100));

  return (
    <div className={`flex-1 flex flex-col min-h-0 bg-(--bg-primary) ${isZenMode ? 'fixed inset-0 z-50 p-4 bg-(--bg-primary)' : ''}`}>
      
      {/* Top Drafting Header Bar */}
      <div className="w-full bg-(--bg-secondary) border-b border-(--border-color) px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Chapter Selector & Title */}
          <div className="flex items-center gap-3">
            <select
              value={activeChapterId}
              onChange={(e) => setActiveChapter(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-(--bg-primary) border border-amber-500/40 text-amber-400 focus:outline-none"
            >
              {project.chapters.map((c, idx) => (
                <option key={c.id} value={c.id}>
                  Bab {idx + 1}: {c.title}
                </option>
              ))}
            </select>

            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="font-mono text-(--text-primary) font-bold">
                {draft.wordCount.toLocaleString()} / {targetWords.toLocaleString()} kata
              </span>
              <div className="w-24 h-2 bg-(--bg-primary) rounded-full overflow-hidden border border-(--border-color)">
                <div 
                  className="h-full bg-linear-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-amber-400 font-semibold">{progressPercent}%</span>
            </div>
          </div>

          {/* Action Buttons: Time Machine, Em Dash Warning, Indentation, Zen Mode, Proceed to Revision */}
          <div className="flex items-center gap-2">
            
            {/* Time Machine / Snapshots Button */}
            <button
              onClick={() => setIsTimeMachineOpen(true)}
              className="px-2.5 py-1 text-xs rounded-lg border border-(--border-color) bg-(--bg-primary) text-(--text-secondary) hover:text-(--text-primary) hover:border-amber-500/40 transition-colors flex items-center gap-1.5 font-medium"
              title="Riwayat Versi & Snapshot Naskah (Time Machine)"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Time Machine</span>
              {chapterSnapshots.length > 0 && (
                <span className="text-[10px] font-mono px-1 rounded-full bg-amber-500/20 text-amber-400">
                  {chapterSnapshots.length}
                </span>
              )}
            </button>

            {/* Generation Audit Log Button */}
            <button
              onClick={() => setIsPromptAuditOpen(true)}
              className="px-2.5 py-1 text-xs rounded-lg border border-(--border-color) bg-(--bg-primary) text-(--text-secondary) hover:text-(--text-primary) hover:border-cyan-500/40 transition-colors flex items-center gap-1.5 font-medium"
              title="Lihat Log Prompt & Riwayat Generasi AI"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Log AI</span>
              {(project.generationLogs?.length || 0) > 0 && (
                <span className="text-[10px] font-mono px-1 rounded-full bg-cyan-500/20 text-cyan-400">
                  {project.generationLogs?.length}
                </span>
              )}
            </button>

            {/* Em Dash Guardrail Warning */}
            {project.rules.noEmDash && emDashCount > 0 && (
              <button
                onClick={handleFixEmDashes}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1.5 animate-pulse"
                title="Klik untuk otomatis mengganti tanda em dash dengan koma"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{emDashCount} Em-Dash (—) Ditemukan</span>
              </button>
            )}

            {/* Paragraph Indent Toggle */}
            <button
              onClick={() => setIsIndentParagraphs(!isIndentParagraphs)}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                isIndentParagraphs 
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-medium' 
                  : 'bg-(--bg-primary) border-(--border-color) text-(--text-muted)'
              }`}
              title="Aktifkan Indentasi Paragraf Khas Novel"
            >
              Indentasi
            </button>

            {/* Zen Mode Button */}
            <button
              onClick={() => setIsZenMode(!isZenMode)}
              className="p-1.5 text-xs rounded-lg border border-(--border-color) bg-(--bg-primary) text-(--text-secondary) hover:text-(--text-primary) transition-colors"
              title={isZenMode ? 'Keluar Zen Mode (Esc)' : 'Zen Focus Mode (Layar Penuh)'}
            >
              {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Next Phase: Revision */}
            <button
              onClick={handleGoToRevision}
              className="px-3 py-1.5 rounded-xl bg-blue-500 text-slate-950 text-xs font-bold hover:bg-blue-400 transition-colors flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              <span>Masuk Revisi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Main Drafting Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
        
        {/* Left Side: Context & Beat Sheet Drawer */}
        {!isZenMode && (
          <div className="hidden lg:flex lg:col-span-3 flex-col rounded-2xl bg-(--bg-secondary) border border-(--border-color) overflow-hidden shadow-sm">
            
            {/* Context Tab Selector */}
            <div className="p-2 border-b border-(--border-color) flex items-center justify-between bg-(--bg-primary) text-xs">
              <button
                onClick={() => setSidebarTab('beats')}
                className={`p-1.5 rounded-lg flex items-center gap-1 font-semibold ${
                  sidebarTab === 'beats' ? 'bg-amber-500 text-slate-950' : 'text-(--text-muted) hover:text-(--text-primary)'
                }`}
                title="Poin Adegan Bab"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Adegan</span>
              </button>
              <button
                onClick={() => setSidebarTab('characters')}
                className={`p-1.5 rounded-lg flex items-center gap-1 font-semibold ${
                  sidebarTab === 'characters' ? 'bg-emerald-500 text-slate-950' : 'text-(--text-muted) hover:text-(--text-primary)'
                }`}
                title="Tokoh Terlibat"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Tokoh</span>
              </button>
              <button
                onClick={() => setSidebarTab('world')}
                className={`p-1.5 rounded-lg flex items-center gap-1 font-semibold ${
                  sidebarTab === 'world' ? 'bg-cyan-500 text-slate-950' : 'text-(--text-muted) hover:text-(--text-primary)'
                }`}
                title="Bible & Aturan"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Bible</span>
              </button>
              <button
                onClick={() => setSidebarTab('rules')}
                className={`p-1.5 rounded-lg flex items-center gap-1 font-semibold ${
                  sidebarTab === 'rules' ? 'bg-purple-500 text-slate-950' : 'text-(--text-muted) hover:text-(--text-primary)'
                }`}
                title="Guardrails"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Aturan</span>
              </button>
            </div>

            {/* Sidebar Tab Content */}
            <div className="p-3.5 flex-1 overflow-y-auto space-y-3 text-xs">
              
              {sidebarTab === 'beats' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">Ringkasan Bab Ini</span>
                    <p className="text-[11px] text-(--text-secondary) leading-relaxed bg-(--bg-primary) p-2.5 rounded-xl border border-(--border-color)">
                      {activeChapter?.summary || 'Belum ada ringkasan bab'}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold text-(--text-primary) text-[11px]">Poin Adegan Wajib:</span>
                    <div className="space-y-1.5">
                      {activeChapter?.keyEvents?.map((evt, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-(--bg-primary) border border-(--border-color) flex items-start gap-2">
                          <span className="w-4 h-4 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-[11px] text-(--text-secondary) leading-snug">{evt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {activeChapter?.emotionalShift && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px]">
                      <strong className="text-amber-400">Emotional Shift:</strong>
                      <p className="text-(--text-secondary) mt-0.5">{activeChapter.emotionalShift}</p>
                    </div>
                  )}
                </div>
              )}

              {sidebarTab === 'characters' && (
                <div className="space-y-2">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">Karakter Novel ({project.characters.length})</span>
                  {project.characters.map((c) => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-(--bg-primary) border border-(--border-color) space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-(--text-primary)">{c.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                          {c.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-(--text-muted) line-clamp-2">{c.appearance || c.occupation}</p>
                      {c.voiceTraits && (
                        <p className="text-[10px] text-amber-300/80 italic">Voice: {c.voiceTraits}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {sidebarTab === 'world' && (
                <div className="space-y-2">
                  <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px]">World Bible ({project.worldEntries.length})</span>
                  {project.worldEntries.map((w) => (
                    <div key={w.id} className="p-2.5 rounded-xl bg-(--bg-primary) border border-(--border-color) space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-(--text-primary)">{w.title}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400">
                          {w.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-(--text-secondary) line-clamp-3">{w.summary}</p>
                    </div>
                  ))}
                </div>
              )}

              {sidebarTab === 'rules' && (
                <div className="space-y-2.5">
                  <span className="font-bold text-purple-400 uppercase tracking-wider text-[10px]">Aturan Penulisan Fiksi</span>
                  <div className="p-2.5 rounded-xl bg-(--bg-primary) border border-(--border-color) space-y-2">
                    <div className="flex items-center justify-between">
                      <span>No Em-Dash (—)</span>
                      <span className={`font-bold ${project.rules.noEmDash ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {project.rules.noEmDash ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>POV</span>
                      <span className="font-bold text-amber-400">{project.rules.pov}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tense</span>
                      <span className="font-bold text-amber-400">{project.rules.tense}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Center: Manuscript Tiptap Editor */}
        <div className={`flex flex-col min-h-0 ${isZenMode ? 'col-span-12 max-w-4xl mx-auto w-full' : 'lg:col-span-6'}`}>
          <TiptapEditor
            contentHtml={draft.contentHtml}
            onChange={handleEditorChange}
            isIndentParagraphs={isIndentParagraphs}
          />
        </div>

        {/* Right: AI Drafting Copilot Toolbar */}
        {!isZenMode && (
          <div className="hidden lg:flex lg:col-span-3 flex-col rounded-2xl bg-(--bg-secondary) border border-(--border-color) p-4 space-y-4 shadow-sm overflow-y-auto text-xs">
            
            <div className="flex items-center justify-between border-b border-(--border-color) pb-3">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>AI Drafting Copilot</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30 font-mono">
                {settings.selectedModel}
              </span>
            </div>

            {/* AI Generator Buttons */}
            <div className="space-y-2">
              
              {/* Zero Draft Button */}
              <button
                onClick={() => handleStartAiDrafting('zero_draft')}
                disabled={isAiStreaming}
                className="w-full p-3 rounded-xl bg-linear-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-between shadow-md shadow-amber-500/20"
              >
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 fill-current" />
                  <div className="text-left">
                    <div className="leading-tight">Tulis Draf Kasar (Zero Draft)</div>
                    <div className="text-[10px] opacity-80 font-normal">Generate bab penuh dari outline</div>
                  </div>
                </div>
              </button>

              {/* Continue Scene Button */}
              <button
                onClick={() => handleStartAiDrafting('continue_scene')}
                disabled={isAiStreaming || !draft.contentPlainText.trim()}
                className="w-full p-2.5 rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) font-semibold hover:border-amber-500/50 disabled:opacity-40 transition-all flex items-center gap-2"
              >
                <FastForward className="w-4 h-4 text-emerald-400" />
                <span>Lanjutkan Adegan (+600 kata)</span>
              </button>

              {/* Expand Scene Button */}
              <button
                onClick={() => handleStartAiDrafting('expand_scene')}
                disabled={isAiStreaming}
                className="w-full p-2.5 rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) font-semibold hover:border-amber-500/50 disabled:opacity-40 transition-all flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Perkaya Deskripsi & Indrawi</span>
              </button>

              {/* Polish Dialogue Button */}
              <button
                onClick={() => handleStartAiDrafting('dialogue_polish')}
                disabled={isAiStreaming || !draft.contentPlainText.trim()}
                className="w-full p-2.5 rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) font-semibold hover:border-amber-500/50 disabled:opacity-40 transition-all flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>Pertajam & Poles Dialog</span>
              </button>
            </div>

            {/* Custom Direction Input */}
            <div className="space-y-1.5 pt-2 border-t border-(--border-color)">
              <label className="text-[11px] font-semibold text-(--text-secondary)">Instruksi Arah Adegan Tambahan</label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={2}
                placeholder="Misal: Buat Tariq merasa tertekan saat membuka silinder perkamen..."
                className="w-full p-2 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none resize-none"
              />
            </div>

            {/* Streaming Status Panel */}
            {isAiStreaming && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    Gemini Sedang Menulis...
                  </span>
                  <button
                    onClick={handleStopStreaming}
                    className="p-1 rounded bg-rose-500 text-white text-[10px] font-bold flex items-center gap-1 hover:bg-rose-600"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>Stop</span>
                  </button>
                </div>
                <div className="text-[11px] text-(--text-secondary) font-novel-serif max-h-36 overflow-y-auto leading-relaxed italic bg-(--bg-primary) p-2 rounded-lg">
                  {streamingText || 'Menyiapkan narasi...'}
                </div>
              </div>
            )}

            {/* Guardrail Checklist Indicator */}
            <div className="p-3 rounded-xl bg-(--bg-primary) border border-(--border-color) space-y-1.5 text-[11px] mt-auto">
              <div className="font-bold text-(--text-primary) flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Status Guardrails Bab Ini</span>
              </div>
              <div className="flex items-center justify-between text-(--text-muted)">
                <span>Em Dash (—):</span>
                <span className={emDashCount === 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {emDashCount === 0 ? '0 (Bersih)' : `${emDashCount} terdeteksi`}
                </span>
              </div>
              <div className="flex items-center justify-between text-(--text-muted)">
                <span>POV Konsisten:</span>
                <span className="text-emerald-400 font-semibold">{project.rules.pov}</span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Time Machine & Snapshots Modal */}
      {isTimeMachineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-(--bg-secondary) border border-(--border-color) shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-(--border-color) flex items-center justify-between bg-(--bg-primary)">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <History className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-(--text-primary)">
                    Time Machine & Snapshot: {activeChapter?.title}
                  </h3>
                  <p className="text-[11px] text-(--text-muted)">
                    Simpan titik versi naskah sebelum revisi besar dan pulihkan kapan saja dengan 1 klik.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsTimeMachineOpen(false)}
                className="p-1.5 rounded-lg text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Take Snapshot Card */}
              <div className="p-4 rounded-xl bg-(--bg-primary) border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                    <Camera className="w-4 h-4" />
                    <span>Ambil Snapshot Naskah Saat Ini ({draft.wordCount} kata)</span>
                  </span>
                  {isSnapshotCreatedMsg && (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Snapshot Tersimpan!</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={snapshotLabelInput}
                    onChange={(e) => setSnapshotLabelInput(e.target.value)}
                    placeholder="Label Versi (misal: v1.0 - Draft Awal)"
                    className="px-3 py-1.5 text-xs rounded-xl bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                  />
                  <input
                    type="text"
                    value={snapshotNoteInput}
                    onChange={(e) => setSnapshotNoteInput(e.target.value)}
                    placeholder="Catatan kecil (opsional)..."
                    className="px-3 py-1.5 text-xs rounded-xl bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleCreateSnapshot}
                    disabled={!draft.contentPlainText.trim()}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Simpan Titik Versi Baru</span>
                  </button>
                </div>
              </div>

              {/* Snapshots List */}
              <div className="space-y-3">
                <span className="font-bold text-(--text-primary) uppercase tracking-wider text-[11px]">
                  Riwayat Snapshot Tersimpan ({chapterSnapshots.length})
                </span>

                <div className="space-y-2.5">
                  {chapterSnapshots.map((snap) => (
                    <div
                      key={snap.id}
                      className="p-3.5 rounded-xl bg-(--bg-primary) border border-(--border-color) hover:border-amber-500/40 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-400 text-xs">
                            {snap.versionLabel}
                          </span>
                          <span className="text-[10px] font-mono text-(--text-muted)">
                            {snap.wordCount} kata
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleRestoreSnapshot(snap.id, snap.versionLabel)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 text-[11px] font-semibold transition-colors flex items-center gap-1"
                            title="Pulihkan naskah ke versi ini"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restore</span>
                          </button>

                          <button
                            onClick={() => deleteChapterSnapshot(activeChapterId, snap.id)}
                            className="p-1 rounded-lg text-(--text-muted) hover:text-red-400 hover:bg-(--bg-secondary) transition-colors"
                            title="Hapus snapshot ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {snap.note && (
                        <p className="text-[11px] text-(--text-secondary) italic">
                          Catatan: {snap.note}
                        </p>
                      )}

                      <div className="p-2 rounded-lg bg-(--bg-secondary) border border-(--border-color) text-[11px] font-novel-serif text-(--text-muted) line-clamp-2">
                        &ldquo;{snap.contentPlainText.slice(0, 200)}...&rdquo;
                      </div>

                      <div className="text-[10px] text-(--text-muted) font-mono text-right">
                        Disimpan: {new Date(snap.createdAt).toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}

                  {chapterSnapshots.length === 0 && (
                    <div className="p-6 text-center rounded-xl bg-(--bg-primary) border border-dashed border-(--border-color) text-xs text-(--text-muted)">
                      Belum ada snapshot tersimpan untuk bab ini. Klik &ldquo;Simpan Titik Versi Baru&rdquo; di atas untuk mencadangkan draf.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-(--border-color) flex justify-end bg-(--bg-primary)">
              <button
                onClick={() => setIsTimeMachineOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-(--bg-secondary) text-(--text-primary) hover:bg-(--border-color) transition-colors"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Prompt Audit & Generation Logs Modal */}
      {isPromptAuditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-4xl max-h-[85vh] bg-(--bg-secondary) border border-(--border-color) rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="p-5 border-b border-(--border-color) flex items-center justify-between bg-linear-to-r from-cyan-500/10 via-transparent to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-(--text-primary)">
                    Audit Log & Riwayat Prompt Generasi AI
                  </h3>
                  <p className="text-[11px] text-(--text-muted)">
                    Rekaman prompt, parameter model, dan hasil teks yang telah dihasilkan untuk novel ini
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(project.generationLogs?.length || 0) > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Hapus seluruh riwayat log generasi AI?')) {
                        clearGenerationLogs();
                      }
                    }}
                    className="px-2.5 py-1 text-xs rounded-lg text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Bersihkan Log</span>
                  </button>
                )}
                <button
                  onClick={() => setIsPromptAuditOpen(false)}
                  className="p-1.5 rounded-xl text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-primary) transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Log List Content */}
            <div className="p-6 overflow-y-auto space-y-4 max-h-[calc(85vh-140px)]">
              {(project.generationLogs || []).length > 0 ? (
                (project.generationLogs || []).map((log) => {
                  const isExpanded = selectedAuditLogId === log.id;
                  const isCopied = copiedAuditLogId === log.id;

                  return (
                    <div 
                      key={log.id}
                      className="p-4 rounded-2xl bg-(--bg-primary) border border-(--border-color) space-y-3 transition-all hover:border-cyan-500/30"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            {log.mode.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-bold text-(--text-primary)">
                            {log.chapterTitle || 'Bab'}
                          </span>
                          <span className="text-[11px] text-(--text-muted) font-mono">
                            ({log.wordCount} kata)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-(--text-muted) font-mono">
                            {new Date(log.createdAt).toLocaleString('id-ID')}
                          </span>

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(log.outputText);
                              setCopiedAuditLogId(log.id);
                              setTimeout(() => setCopiedAuditLogId(null), 2000);
                            }}
                            className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-(--bg-secondary) border border-(--border-color) text-(--text-secondary) hover:text-(--text-primary) flex items-center gap-1 transition-colors"
                            title="Salin hasil teks ke clipboard"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{isCopied ? 'Tersalin' : 'Salin Teks'}</span>
                          </button>

                          <button
                            onClick={() => setSelectedAuditLogId(isExpanded ? null : log.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500 hover:text-slate-950 transition-all"
                          >
                            {isExpanded ? 'Tutup Detail' : 'Lihat Prompt'}
                          </button>
                        </div>
                      </div>

                      {/* Prompt Details Expand */}
                      {isExpanded && (
                        <div className="space-y-2 pt-2 border-t border-(--border-color) animate-fade-in">
                          <div className="text-[11px] font-bold text-cyan-400 flex items-center justify-between">
                            <span>Prompt & Instruksi yang Dikirim ke Gemini ({log.model}):</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(log.prompt);
                                alert('Prompt berhasil disalin ke clipboard!');
                              }}
                              className="text-[10px] text-(--text-muted) hover:text-cyan-400 flex items-center gap-1 font-sans"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Salin Prompt</span>
                            </button>
                          </div>
                          <pre className="p-3 rounded-xl bg-(--bg-secondary) border border-(--border-color) text-[11px] text-(--text-secondary) font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                            {log.prompt}
                          </pre>
                        </div>
                      )}

                      {/* Output Text Snippet */}
                      <div className="p-3 rounded-xl bg-(--bg-secondary) border border-(--border-color) text-xs font-novel-serif text-(--text-secondary) leading-relaxed line-clamp-3">
                        &ldquo;{log.outputText}&rdquo;
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center rounded-2xl bg-(--bg-primary) border border-dashed border-(--border-color) space-y-2">
                  <FileCode className="w-8 h-8 mx-auto text-(--text-muted) opacity-50" />
                  <div className="text-xs font-bold text-(--text-primary)">Belum Ada Riwayat Log Generasi</div>
                  <p className="text-[11px] text-(--text-muted) max-w-sm mx-auto">
                    Setiap kali Anda menekan tombol &ldquo;Generate Draf Kasar&rdquo; atau &ldquo;Lanjutkan Adegan&rdquo;, prompt dan hasil generate akan otomatis dicatat di sini.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-(--border-color) flex justify-between items-center bg-(--bg-primary) text-xs text-(--text-muted)">
              <span>Total {project.generationLogs?.length || 0} riwayat generasi</span>
              <button
                onClick={() => setIsPromptAuditOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-(--bg-secondary) text-(--text-primary) hover:bg-(--border-color) transition-colors"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
