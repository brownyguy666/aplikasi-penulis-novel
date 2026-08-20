'use client';

import React from 'react';
import { useNovelStore } from '@/store/useNovelStore';
import { NovelProject } from '@/types/novel';
import { 
  Compass, 
  BookOpen, 
  Layers, 
  Users, 
  Globe, 
  GitCommit, 
  FileText,
  CheckCircle2,
  LucideIcon
} from 'lucide-react';
import { PremiseView } from './PremiseView';
import { ResearchView } from './ResearchView';
import { ThemeView } from './ThemeView';
import { CharacterStudio } from './CharacterStudio';
import { WorldbuildingBible } from './WorldbuildingBible';
import { OutlineStudio } from './OutlineStudio';
import { SynopsisStudio } from './SynopsisStudio';

type PrewritingTabId = NonNullable<NovelProject['prewritingSubTab']>;

interface SubTabItem {
  id: PrewritingTabId;
  title: string;
  icon: LucideIcon;
  count?: number;
  isDone: boolean;
}

export const PrewritingStudio: React.FC = () => {
  const { project, setPrewritingSubTab } = useNovelStore();
  const currentTab = project.prewritingSubTab || 'premise';

  const subTabs: SubTabItem[] = [
    {
      id: 'premise',
      title: 'Premis & Logline',
      icon: Compass,
      isDone: Boolean(project.premise.logline)
    },
    {
      id: 'research',
      title: 'Riset & Timeline',
      icon: BookOpen,
      count: project.researchItems.length + project.timelineEvents.length,
      isDone: project.researchItems.length > 0
    },
    {
      id: 'theme',
      title: 'Tema & Pesan',
      icon: Layers,
      isDone: Boolean(project.theme.centralTheme)
    },
    {
      id: 'character',
      title: 'Karakter & Arcs',
      icon: Users,
      count: project.characters.length,
      isDone: project.characters.length > 0
    },
    {
      id: 'world',
      title: 'World Bible',
      icon: Globe,
      count: project.worldEntries.length,
      isDone: project.worldEntries.length > 0
    },
    {
      id: 'outline',
      title: 'Struktur & Outline',
      icon: GitCommit,
      count: project.chapters.length,
      isDone: project.chapters.length > 0
    },
    {
      id: 'synopsis',
      title: 'Sinopsis Lengkap',
      icon: FileText,
      isDone: Boolean(project.synopsis.fullSynopsisText)
    }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-(--bg-primary)">
      
      {/* Sub-tab Navigation Bar */}
      <div className="w-full bg-(--bg-secondary) border-b border-(--border-color) px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {subTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setPrewritingSubTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-primary)'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{tab.title}</span>
                {typeof tab.count === 'number' && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-(--bg-primary) text-(--text-muted) border border-(--border-color)'}`}>
                    {tab.count}
                  </span>
                )}
                {tab.isDone && !isActive && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 opacity-80" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {currentTab === 'premise' && <PremiseView />}
        {currentTab === 'research' && <ResearchView />}
        {currentTab === 'theme' && <ThemeView />}
        {currentTab === 'character' && <CharacterStudio />}
        {currentTab === 'world' && <WorldbuildingBible />}
        {currentTab === 'outline' && <OutlineStudio />}
        {currentTab === 'synopsis' && <SynopsisStudio />}
      </div>

    </div>
  );
};
