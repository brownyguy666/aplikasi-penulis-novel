'use client';

import React, { useEffect } from 'react';
import { useNovelStore } from '@/store/useNovelStore';
import { Navbar } from '@/components/layout/Navbar';
import { PhaseStepper } from '@/components/layout/PhaseStepper';
import { PrewritingStudio } from '@/components/prewriting/PrewritingStudio';
import { DraftingStudio } from '@/components/drafting/DraftingStudio';
import { RevisionStudio } from '@/components/revision/RevisionStudio';
import { ExportStudio } from '@/components/export/ExportStudio';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { project, isLoaded, initStore, settings } = useNovelStore();

  useEffect(() => {
    initStore();
  }, [initStore]);

  // Synchronize initial theme attribute
  useEffect(() => {
    if (typeof document !== 'undefined' && settings?.theme) {
      document.documentElement.setAttribute('data-theme', settings.theme);
    }
  }, [settings?.theme]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-(--bg-primary) text-amber-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-xs font-semibold tracking-wider text-(--text-secondary)">
          Menyiapkan NovelBuilder Studio...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-(--bg-primary) text-(--text-primary)">
      {/* Top Main Navigation */}
      <Navbar />

      {/* 4-Phase Stepper Indicator */}
      <PhaseStepper />

      {/* Active Phase Workspace */}
      <main className="flex-1 flex flex-col min-h-0">
        {project.currentPhase === 'prewriting' && <PrewritingStudio />}
        {project.currentPhase === 'drafting' && <DraftingStudio />}
        {project.currentPhase === 'revision' && <RevisionStudio />}
        {project.currentPhase === 'export' && <ExportStudio />}
      </main>
    </div>
  );
}
