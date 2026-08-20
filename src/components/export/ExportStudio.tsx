'use client';

import React, { useState } from 'react';
import { useNovelStore } from '@/store/useNovelStore';
import { 
  BookMarked, 
  Download, 
  FileText, 
  Copy, 
  Printer, 
  Check, 
  Archive, 
  Layers, 
  Eye, 
  FileCode
} from 'lucide-react';

export const ExportStudio: React.FC = () => {
  const { project, exportProjectJson } = useNovelStore();

  const [includeFrontMatter, setIncludeFrontMatter] = useState(true);
  const [includeSynopsis, setIncludeSynopsis] = useState(true);
  const [includeWorldBible, setIncludeWorldBible] = useState(false);
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>(
    project.chapters.map((c) => c.id)
  );
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const toggleChapterSelection = (id: string) => {
    if (selectedChapterIds.includes(id)) {
      setSelectedChapterIds(selectedChapterIds.filter((cId) => cId !== id));
    } else {
      setSelectedChapterIds([...selectedChapterIds, id]);
    }
  };

  const selectAllChapters = () => {
    setSelectedChapterIds(project.chapters.map((c) => c.id));
  };

  // Generate Compiled Markdown Output
  const generateMarkdownManuscript = (): string => {
    const lines: string[] = [];

    // Title & Front Matter
    if (includeFrontMatter) {
      lines.push(`# ${project.title}`);
      if (project.subtitle) lines.push(`*${project.subtitle}*`);
      lines.push(`\n**Penulis:** ${project.author || 'Penulis'}`);
      lines.push(`**Genre:** ${project.customGenreName || project.genre}`);
      lines.push(`**Tema:** ${project.theme.centralTheme || '-'}`);
      lines.push(`\n---\n`);
    }

    // Synopsis
    if (includeSynopsis && project.synopsis.fullSynopsisText) {
      lines.push(`## Sinopsis`);
      lines.push(project.synopsis.fullSynopsisText);
      lines.push(`\n---\n`);
    }

    // World & Character Bible
    if (includeWorldBible) {
      lines.push(`## Catatan Tokoh & Dunia Cerita`);
      lines.push(`### Tokoh Utama`);
      project.characters.forEach((c) => {
        lines.push(`- **${c.name}** (${c.role}): ${c.backstory || ''} | Motivasi: ${c.internalMotivation || ''}`);
      });
      lines.push(`\n### Ensiklopedia Dunia`);
      project.worldEntries.forEach((w) => {
        lines.push(`- **${w.title}** (${w.category}): ${w.summary}`);
      });
      lines.push(`\n---\n`);
    }

    // Chapters
    project.chapters.forEach((chap, idx) => {
      if (!selectedChapterIds.includes(chap.id)) return;
      const draft = project.drafts[chap.id];
      const text = draft?.contentPlainText || chap.summary || '*(Draf bab ini belum ditulis)*';

      lines.push(`\n## ${chap.title || `Bab ${idx + 1}`}\n`);
      lines.push(text);
      lines.push(`\n\n* * *\n`);
    });

    return lines.join('\n');
  };

  // Generate Plain Text Output
  const generatePlainTextManuscript = (): string => {
    const lines: string[] = [];

    if (includeFrontMatter) {
      lines.push(project.title.toUpperCase());
      if (project.subtitle) lines.push(project.subtitle);
      lines.push(`Oleh: ${project.author || 'Penulis'}`);
      lines.push(`\n========================================\n`);
    }

    if (includeSynopsis && project.synopsis.fullSynopsisText) {
      lines.push(`SINOPSIS`);
      lines.push(project.synopsis.fullSynopsisText);
      lines.push(`\n========================================\n`);
    }

    project.chapters.forEach((chap, idx) => {
      if (!selectedChapterIds.includes(chap.id)) return;
      const draft = project.drafts[chap.id];
      const text = draft?.contentPlainText || chap.summary || '(Draf bab ini belum ditulis)';

      lines.push(`\n\n${chap.title.toUpperCase() || `BAB ${idx + 1}`}\n`);
      lines.push(text);
      lines.push(`\n\n- - -\n`);
    });

    return lines.join('\n');
  };

  const handleDownloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = (content: string, formatName: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFormat(formatName);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const slugTitle = (project.title || 'novel').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const totalCompiledWords = selectedChapterIds.reduce(
    (acc, id) => acc + (project.drafts[id]?.wordCount || 0),
    0
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-(--bg-primary) p-4 md:p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full space-y-6 animate-fade-in">
        
        {/* Header Banner */}
        <div className="p-5 rounded-2xl bg-linear-to-r from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <BookMarked className="w-4 h-4" />
              <span>Fase 4: Ekspor, Kompilasi & Publikasi</span>
            </div>
            <h2 className="text-lg font-bold text-(--text-primary)">
              Kompilasi Naskah Siap Terbit dalam Format Bersih
            </h2>
            <p className="text-xs text-(--text-secondary) max-w-2xl">
              Susun bab-bab naskah fiksi Anda ke dalam format <strong>Markdown (.md)</strong>, <strong>Plain Text (.txt)</strong>, atau cetak siap serah ke editor penerbit.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
              {totalCompiledWords.toLocaleString()} Kata Terpilih
            </span>
          </div>
        </div>

        {/* Export Options & Chapter Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Options & Checkboxes */}
          <div className="p-5 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-4 shadow-sm text-xs">
            <h3 className="font-bold text-(--text-primary) uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Komponen yang Disertakan</span>
            </h3>

            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFrontMatter}
                  onChange={(e) => setIncludeFrontMatter(e.target.checked)}
                  className="rounded text-purple-500 focus:ring-purple-500"
                />
                <span className="text-(--text-primary) font-medium">Halaman Judul & Front Matter</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSynopsis}
                  onChange={(e) => setIncludeSynopsis(e.target.checked)}
                  className="rounded text-purple-500 focus:ring-purple-500"
                />
                <span className="text-(--text-primary) font-medium">Sinopsis Lengkap</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeWorldBible}
                  onChange={(e) => setIncludeWorldBible(e.target.checked)}
                  className="rounded text-purple-500 focus:ring-purple-500"
                />
                <span className="text-(--text-primary) font-medium">Karakter & World Bible</span>
              </label>
            </div>

            <div className="pt-3 border-t border-(--border-color) space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-(--text-primary)">Pilih Bab ({selectedChapterIds.length}/{project.chapters.length})</span>
                <button
                  onClick={selectAllChapters}
                  className="text-purple-400 hover:underline text-[11px]"
                >
                  Pilih Semua
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {project.chapters.map((chap, idx) => (
                  <label
                    key={chap.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-(--bg-primary) border border-(--border-color) cursor-pointer hover:border-purple-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <input
                        type="checkbox"
                        checked={selectedChapterIds.includes(chap.id)}
                        onChange={() => toggleChapterSelection(chap.id)}
                        className="rounded text-purple-500 focus:ring-purple-500"
                      />
                      <span className="truncate text-(--text-primary)">
                        Bab {idx + 1}: {chap.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-(--text-muted) font-mono shrink-0">
                      {project.drafts[chap.id]?.wordCount || 0} kata
                    </span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Column 2: Export Action Cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Markdown Export */}
              <div className="p-5 rounded-2xl bg-(--bg-secondary) border border-(--border-color) hover:border-purple-500/50 transition-all space-y-3 shadow-sm flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                      <FileCode className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      FORMAT UTAMA
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-(--text-primary)">Markdown (.md)</h4>
                  <p className="text-xs text-(--text-secondary)">
                    Format universal untuk Obsidian, Ulysses, GitHub, Scrivener, atau editor teks modern.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleDownloadFile(generateMarkdownManuscript(), `${slugTitle}_naskah.md`, 'text/markdown')}
                    className="flex-1 px-3 py-2 rounded-xl bg-purple-500 text-slate-950 text-xs font-bold hover:bg-purple-400 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .md</span>
                  </button>

                  <button
                    onClick={() => handleCopyClipboard(generateMarkdownManuscript(), 'md')}
                    className="p-2 rounded-xl border border-(--border-color) bg-(--bg-primary) text-(--text-secondary) hover:text-(--text-primary) transition-colors"
                    title="Copy Markdown ke Clipboard"
                  >
                    {copiedFormat === 'md' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Plain Text Export */}
              <div className="p-5 rounded-2xl bg-(--bg-secondary) border border-(--border-color) hover:border-amber-500/50 transition-all space-y-3 shadow-sm flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                      <FileText className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      STANDAR PENERBIT
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-(--text-primary)">Plain Text (.txt)</h4>
                  <p className="text-xs text-(--text-secondary)">
                    Naskah murni tanpa tag sintaks untuk diserahkan ke penerbit, layout artist, atau email.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleDownloadFile(generatePlainTextManuscript(), `${slugTitle}_naskah.txt`, 'text/plain')}
                    className="flex-1 px-3 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .txt</span>
                  </button>

                  <button
                    onClick={() => handleCopyClipboard(generatePlainTextManuscript(), 'txt')}
                    className="p-2 rounded-xl border border-(--border-color) bg-(--bg-primary) text-(--text-secondary) hover:text-(--text-primary) transition-colors"
                    title="Copy Text ke Clipboard"
                  >
                    {copiedFormat === 'txt' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Print / Save as PDF */}
              <div className="p-5 rounded-2xl bg-(--bg-secondary) border border-(--border-color) hover:border-cyan-500/50 transition-all space-y-3 shadow-sm flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 inline-block">
                    <Printer className="w-5 h-5" />
                  </span>
                  <h4 className="text-sm font-bold text-(--text-primary)">Cetak / Simpan PDF</h4>
                  <p className="text-xs text-(--text-secondary)">
                    Gunakan dialog print browser untuk menyimpan PDF dengan tipografi novel yang rapi.
                  </p>
                </div>

                <button
                  onClick={handlePrint}
                  className="w-full px-3 py-2 rounded-xl bg-(--bg-primary) border border-cyan-500/40 text-cyan-400 text-xs font-bold hover:bg-cyan-500 hover:text-slate-950 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Buka Dialog Cetak</span>
                </button>
              </div>

              {/* Project JSON Backup */}
              <div className="p-5 rounded-2xl bg-(--bg-secondary) border border-(--border-color) hover:border-emerald-500/50 transition-all space-y-3 shadow-sm flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 inline-block">
                    <Archive className="w-5 h-5" />
                  </span>
                  <h4 className="text-sm font-bold text-(--text-primary)">Proyek Utuh (.json)</h4>
                  <p className="text-xs text-(--text-secondary)">
                    Cadangkan seluruh premis, riset, bible, karakter, outline, draf, dan riwayat revisi.
                  </p>
                </div>

                <button
                  onClick={() => handleDownloadFile(exportProjectJson(), `${slugTitle}_backup.novelproj.json`, 'application/json')}
                  className="w-full px-3 py-2 rounded-xl bg-(--bg-primary) border border-emerald-500/40 text-emerald-400 text-xs font-bold hover:bg-emerald-500 hover:text-slate-950 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup JSON</span>
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Live Manuscript Preview Box */}
        <div className="p-6 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-(--border-color) pb-3">
            <span className="text-xs font-bold text-(--text-primary) flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <span>Pratinjau Naskah Hasil Kompilasi</span>
            </span>
            <span className="text-[11px] text-(--text-muted)">
              Tipografi Sastra Standar
            </span>
          </div>

          <div className="p-6 sm:p-8 rounded-xl bg-(--bg-primary) border border-(--border-color) font-novel-serif text-sm leading-relaxed text-(--text-primary) whitespace-pre-wrap max-h-96 overflow-y-auto">
            {generateMarkdownManuscript()}
          </div>
        </div>

      </div>
    </div>
  );
};
