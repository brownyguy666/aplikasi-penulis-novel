'use client';

import React, { useState } from 'react';
import { useNovelStore } from '@/store/useNovelStore';
import { 
  BookOpen, 
  Settings, 
  CheckCircle2, 
  FolderPlus, 
  RotateCcw,
  Sun,
  Moon,
  Coffee,
  Download,
  Upload,
  Feather,
  User
} from 'lucide-react';
import { SettingsModal } from '../settings/SettingsModal';
import { AuthModal } from '../auth/AuthModal';

export const Navbar: React.FC = () => {
  const { 
    project, 
    settings, 
    updateSettings, 
    updateProjectMeta, 
    createNewProject, 
    resetToSampleProject, 
    isSaving,
    lastSavedTime,
    exportProjectJson,
    importProjectJson,
    currentUser
  } = useNovelStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(project.title);

  // Calculate total project word count
  const totalWords = Object.values(project.drafts).reduce(
    (acc, draft) => acc + (draft.wordCount || 0), 
    0
  );

  const handleTitleSubmit = () => {
    if (tempTitle.trim()) {
      updateProjectMeta({ title: tempTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleThemeChange = (theme: 'dark' | 'light' | 'sepia') => {
    updateSettings({ theme });
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  };

  const handleExportJson = () => {
    const jsonStr = exportProjectJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_backup.novelproj.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importProjectJson(content);
        if (success) {
          alert('Proyek novel berhasil dimuat!');
        } else {
          alert('Gagal memuat file proyek. Format file tidak sesuai.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-(--border-color) bg-(--bg-secondary)/90 backdrop-blur-md px-4 py-2.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-tr from-amber-600 via-amber-500 to-yellow-400 text-black shadow-lg shadow-amber-500/20 font-bold">
              <Feather className="w-5 h-5 text-slate-950" />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={handleTitleSubmit}
                    onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                    autoFocus
                    className="px-2 py-0.5 text-sm font-semibold rounded border border-amber-500 bg-(--bg-primary) text-(--text-primary) focus:outline-none"
                  />
                ) : (
                  <button
                    onClick={() => {
                      setTempTitle(project.title);
                      setIsEditingTitle(true);
                    }}
                    className="text-sm md:text-base font-bold text-(--text-primary) truncate hover:text-amber-400 transition-colors flex items-center gap-1.5 text-left"
                    title="Klik untuk mengubah judul"
                  >
                    {project.title || 'Novel Tanpa Judul'}
                  </button>
                )}
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium border border-amber-500/30 whitespace-nowrap">
                  {project.genre === 'historical_fiction' ? 'Fiksi Sejarah' : project.customGenreName || project.genre}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-(--text-secondary)">
                <span>Oleh: <strong className="text-(--text-primary) font-medium">{project.author || 'Penulis'}</strong></span>
                <span className="text-(--border-color)">•</span>
                <span>{project.chapters.length} Bab</span>
                <span className="text-(--border-color)">•</span>
                <span className="text-amber-400 font-medium">{totalWords.toLocaleString()} kata</span>
              </div>
            </div>
          </div>

          {/* Right Actions: Auto-save, Theme, Project Switcher, Settings */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cloud & Auto-save status */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-(--text-secondary) px-2.5 py-1 rounded-lg bg-(--bg-primary) border border-(--border-color)">
                {isSaving ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Lokal {lastSavedTime ? `(${lastSavedTime})` : ''}</span>
                  </>
                )}
              </div>

              {settings.supabaseUrl && (
                <div 
                  className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                  title={`Supabase Cloud: ${settings.lastCloudSyncedAt ? 'Tersinkron ' + settings.lastCloudSyncedAt : 'Siap Sinkron'}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Cloud Ready</span>
                </div>
              )}
            </div>

            {/* Theme switcher */}
            <div className="flex items-center bg-(--bg-primary) p-0.5 rounded-lg border border-(--border-color) text-xs">
              <button
                onClick={() => handleThemeChange('dark')}
                title="Mode Gelap"
                className={`p-1.5 rounded-md transition-colors ${
                  settings.theme === 'dark' ? 'bg-amber-500/20 text-amber-400 font-semibold' : 'text-(--text-secondary) hover:text-(--text-primary)'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleThemeChange('sepia')}
                title="Mode Sepia (Kertas Kuno)"
                className={`p-1.5 rounded-md transition-colors ${
                  settings.theme === 'sepia' ? 'bg-amber-700/20 text-amber-600 font-semibold' : 'text-(--text-secondary) hover:text-(--text-primary)'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleThemeChange('light')}
                title="Mode Terang"
                className={`p-1.5 rounded-md transition-colors ${
                  settings.theme === 'light' ? 'bg-amber-500/20 text-amber-600 font-semibold' : 'text-(--text-secondary) hover:text-(--text-primary)'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Project Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-(--border-color) bg-(--bg-primary) text-(--text-primary) hover:border-amber-500/50 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Proyek</span>
              </button>

              {isProjectDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-(--bg-secondary) border border-(--border-color) shadow-2xl p-1.5 text-xs z-50 animate-fade-in"
                  onMouseLeave={() => setIsProjectDropdownOpen(false)}
                >
                  <button
                    onClick={() => {
                      const title = prompt('Masukkan Judul Proyek Novel Baru:');
                      if (title) createNewProject(title);
                      setIsProjectDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-(--bg-primary) text-(--text-primary) flex items-center gap-2 transition-colors"
                  >
                    <FolderPlus className="w-4 h-4 text-emerald-400" />
                    <span>Buat Novel Baru</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Muat ulang proyek demo "Kutukan Daulah Terakhir"?')) {
                        resetToSampleProject();
                      }
                      setIsProjectDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-(--bg-primary) text-(--text-primary) flex items-center gap-2 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-cyan-400" />
                    <span>Muat Proyek Sampel</span>
                  </button>

                  <div className="h-px bg-(--border-color) my-1" />

                  <button
                    onClick={() => {
                      handleExportJson();
                      setIsProjectDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-(--bg-primary) text-(--text-primary) flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Backup Proyek (.json)</span>
                  </button>

                  <label className="w-full text-left px-3 py-2 rounded-lg hover:bg-(--bg-primary) text-(--text-primary) flex items-center gap-2 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4 text-violet-400" />
                    <span>Import Proyek (.json)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJson}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Auth Button */}
            <button
              onClick={() => setIsAuthOpen(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-(--border-color) bg-(--bg-primary) text-(--text-primary) hover:border-amber-500/50 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title={currentUser ? `Akun: ${currentUser.email}` : 'Masuk / Autentikasi Akun'}
            >
              <User className={`w-4 h-4 ${currentUser ? 'text-emerald-400' : 'text-(--text-secondary)'}`} />
              <span className="hidden sm:inline">
                {currentUser ? (currentUser.email?.split('@')[0] || 'Akun Aktif') : 'Masuk'}
              </span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-(--border-color) bg-(--bg-primary) text-(--text-primary) hover:border-amber-500/50 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Pengaturan API Gemini & Gaya"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Pengaturan AI</span>
            </button>
          </div>

        </div>
      </header>

      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}

      {isAuthOpen && (
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      )}
    </>
  );
};
