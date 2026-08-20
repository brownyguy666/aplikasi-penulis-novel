'use client';

import React from 'react';
import { useNovelStore } from '@/store/useNovelStore';
import { 
  Compass, 
  PenTool, 
  Layers, 
  BookMarked, 
  ChevronRight 
} from 'lucide-react';

export const PhaseStepper: React.FC = () => {
  const { project, setPhase } = useNovelStore();

  const phases = [
    {
      id: 'prewriting',
      number: '1',
      title: 'Pra-Menulis',
      subtitle: 'Premis, Karakter, Outline',
      icon: Compass,
      color: 'amber'
    },
    {
      id: 'drafting',
      number: '2',
      title: 'Drafting Bab',
      subtitle: 'Gemini AI & Editor',
      icon: PenTool,
      color: 'emerald'
    },
    {
      id: 'revision',
      number: '3',
      title: 'Revisi Berlapis',
      subtitle: 'Struktur s/d Proofread',
      icon: Layers,
      color: 'blue'
    },
    {
      id: 'export',
      number: '4',
      title: 'Ekspor & Terbit',
      subtitle: 'MD, TXT, Format Final',
      icon: BookMarked,
      color: 'purple'
    }
  ] as const;

  return (
    <div className="w-full bg-(--bg-secondary) border-b border-(--border-color) px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
        {phases.map((p, idx) => {
          const isActive = project.currentPhase === p.id;
          const Icon = p.icon;

          return (
            <React.Fragment key={p.id}>
              <button
                onClick={() => setPhase(p.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all whitespace-nowrap text-left group ${
                  isActive
                    ? 'bg-linear-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/40 text-amber-400 shadow-sm'
                    : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-primary) border border-transparent'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : 'bg-(--bg-primary) border border-(--border-color) text-(--text-muted)'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold tracking-wide uppercase opacity-70">
                      Fase {p.number}
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${isActive ? 'text-(--text-primary)' : ''}`}>
                    {p.title}
                  </span>
                  <span className="text-[10px] text-(--text-muted) hidden lg:inline">
                    {p.subtitle}
                  </span>
                </div>
              </button>

              {idx < phases.length - 1 && (
                <ChevronRight className="w-4 h-4 text-(--text-muted) opacity-40 shrink-0 hidden sm:block" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
