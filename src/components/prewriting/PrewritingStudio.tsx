'use client';

import React, { useState } from 'react';
import { useNovelStore } from '@/store/useNovelStore';
import { callGeminiJson } from '@/lib/geminiClient';
import { NovelProject, ResearchCategory, WorldCategory, CharacterRole } from '@/types/novel';
import { 
  Compass, 
  BookOpen, 
  Layers, 
  Users, 
  Globe, 
  GitCommit, 
  FileText,
  CheckCircle2,
  LucideIcon,
  Zap,
  Wand2,
  Loader2,
  Check
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

interface MasterNovelPlan {
  premise: {
    logline: string;
    protagonist: string;
    goal: string;
    obstacle: string;
    stakes: string;
    elevatorPitch: string;
    coreConflict: string;
  };
  research: Array<{
    title: string;
    category: ResearchCategory;
    content: string;
    tags: string[];
    sourceUrlOrCitation?: string;
  }>;
  timeline: Array<{
    eraOrDate: string;
    title: string;
    description: string;
    impactOnPlot: string;
  }>;
  theme: {
    centralTheme: string;
    coreMessage: string;
    subThemes: string[];
    moralDilemma: string;
    symbolicMotifs: string[];
  };
  characters: Array<{
    name: string;
    role: string;
    occupation: string;
    internalNeed: string;
    externalGoal: string;
    fatalFlaw: string;
    backstory: string;
    arcStart: string;
    arcClimax: string;
    arcEnd: string;
    voiceTraits: string;
  }>;
  world: Array<{
    category: WorldCategory;
    title: string;
    summary: string;
    detailedRules: string;
    secretsOrTaboos: string;
    tags: string[];
  }>;
  chapters: Array<{
    title: string;
    summary: string;
    keyEvents: string[];
    emotionalShift: string;
    targetWordCount: number;
  }>;
  synopsis: {
    hookParagraph: string;
    targetAudience: string;
    comparativeTitles: string;
    endingSummary: string;
    fullSynopsisText: string;
  };
}

export const PrewritingStudio: React.FC = () => {
  const { 
    project, 
    setPrewritingSubTab, 
    updatePremise,
    addResearchItem,
    addTimelineEvent,
    updateTheme,
    addCharacter,
    addWorldEntry,
    addChapter,
    updateSynopsis,
    settings 
  } = useNovelStore();

  const currentTab = project.prewritingSubTab || 'premise';
  const [isMasterLoading, setIsMasterLoading] = useState(false);
  const [masterSuccessMsg, setMasterSuccessMsg] = useState<string | null>(null);

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

  // 1-Click Master Generator (1 Request generates entire Phase 1)
  const handleMasterGenerate = async () => {
    setIsMasterLoading(true);
    setMasterSuccessMsg(null);

    try {
      const prompt = `Sebagai konsultan sastra dan arsitek novel profesional, susunlah arsitektur penulisan novel LENGKAP untuk proyek berikut:
Judul: "${project.title}"
Genre: ${project.customGenreName || project.genre}
Bahasa: ${project.language}
Premis Eksisting (jika ada): ${project.premise.logline || 'Buat konsep orisinal berkualitas tinggi'}

Bangun dan keluarkan SELURUH komponen Fase 1 dalam satu JSON terpadu persis dengan struktur berikut:
{
  "premise": {
    "logline": "1-2 kalimat premis utama yang padat dan memikat",
    "protagonist": "Nama dan deskripsi peran protagonis",
    "goal": "Tujuan spesifik yang dikejar protagonis",
    "obstacle": "Hambatan utama dan kekuatan antagonis",
    "stakes": "Taruhan kehancuran jika protagonis gagal",
    "elevatorPitch": "Paragraf ringkasan daya tarik cerita",
    "coreConflict": "Konflik batin vs konflik eksternal"
  },
  "research": [
    { "title": "Topik Riset Primer", "category": "primary_source", "content": "Catatan ringkas penting", "tags": ["sejarah", "primer"] },
    { "title": "Istilah & Terminologi Otentik", "category": "technical_term", "content": "Daftar istilah penting", "tags": ["istilah"] },
    { "title": "Budaya Material & Suasana", "category": "material_culture", "content": "Detail sensorik pakaian/senjata/arsitektur", "tags": ["budaya"] }
  ],
  "timeline": [
    { "eraOrDate": "Tahun Awal", "title": "Peristiwa Pembuka", "description": "Latar belakang awal", "impactOnPlot": "Pemicu keadaan" },
    { "eraOrDate": "Tahun Konflik", "title": "Insiden Krusial", "description": "Peristiwa titik balik", "impactOnPlot": "Memicu petualangan tokoh" },
    { "eraOrDate": "Masa Kini Cerita", "title": "Konvergensi Krisis", "description": "Situasi kritis saat bab 1 dimulai", "impactOnPlot": "Tokoh dipaksa bertindak" }
  ],
  "theme": {
    "centralTheme": "Tema sentral (misal: Keadilan vs Loyalitas)",
    "coreMessage": "Argumen moral cerita",
    "subThemes": ["Pengorbanan", "Kebenaran"],
    "moralDilemma": "Dilema moral terbesar yang dihadapi tokoh",
    "symbolicMotifs": ["Cermin retak", "Api lilin"]
  },
  "characters": [
    {
      "name": "Nama Protagonis",
      "role": "Protagonis",
      "occupation": "Profesi",
      "internalNeed": "Kebutuhan batin terdalam",
      "externalGoal": "Goal nyata yang dikejar",
      "fatalFlaw": "Kelemahan fatal",
      "backstory": "Latar belakang singkat",
      "arcStart": "Kondisi di awal",
      "arcClimax": "Ujian terberat di klimaks",
      "arcEnd": "Transformasi di akhir",
      "voiceTraits": "Gaya bicara & pembawaan"
    },
    {
      "name": "Nama Antagonis",
      "role": "Antagonis",
      "occupation": "Profesi",
      "internalNeed": "Rasa takut atau obsesi batin",
      "externalGoal": "Rencana yang bertabrakan dengan protagonis",
      "fatalFlaw": "Arogansi atau keputusasaan",
      "backstory": "Latar belakang luka masa lalu",
      "arcStart": "Kekuasaan penuh",
      "arcClimax": "Konfrontasi puncak",
      "arcEnd": "Kejatuhan / takdir akhir",
      "voiceTraits": "Gaya bicara tajam berwibawa"
    },
    {
      "name": "Nama Mentor / Sekutu",
      "role": "Mentor / Sekutu",
      "occupation": "Profesi",
      "internalNeed": "Menebus kesalahan masa lalu",
      "externalGoal": "Membimbing protagonis",
      "fatalFlaw": "Rahasia masa lalu",
      "backstory": "Pengalaman lama",
      "arcStart": "Penasihat setia",
      "arcClimax": "Pengorbanan penting",
      "arcEnd": "Warisan moral",
      "voiceTraits": "Bijak dan tenang"
    }
  ],
  "world": [
    { "category": "geography", "title": "Lokasi Utama", "summary": "Deskripsi visual lokasi", "detailedRules": "Suasana dan fungsi", "secretsOrTaboos": "Rahasia terlarang", "tags": ["lokasi"] },
    { "category": "faction_org", "title": "Faksi / Organisasi", "summary": "Deskripsi pengaruh faksi", "detailedRules": "Cara kerja ordo", "secretsOrTaboos": "Tujuan tersembunyi", "tags": ["faksi"] },
    { "category": "rules_laws", "title": "Aturan Hukum / Tabu", "summary": "Hukum yang mengikat", "detailedRules": "Konsekuensi pelanggaran", "secretsOrTaboos": "Celah berbahaya", "tags": ["hukum"] }
  ],
  "chapters": [
    { "title": "Bab 1: Pemicu Api", "summary": "Perkenalan dunia dan insiden pembuka", "keyEvents": ["Adegan awal", "Penemuan masalah", "Keputusan darurat"], "emotionalShift": "Tenang -> Terkejut", "targetWordCount": 1800 },
    { "title": "Bab 2: Jejak Pertama", "summary": "Penyelidikan awal yang berbahaya", "keyEvents": ["Menemukan petunjuk", "Konfrontasi kecil", "Rintangan baru"], "emotionalShift": "Ragu -> Bertekad", "targetWordCount": 1800 },
    { "title": "Bab 3: Titik Tanpa Kembali", "summary": "Midpoint krisis di mana taruhan melonjak", "keyEvents": ["Pengkhianatan terbongkar", "Jebakan musuh", "Pelarian sempit"], "emotionalShift": "Percaya diri -> Terpojok", "targetWordCount": 1800 },
    { "title": "Bab 4: Malam Tergelap", "summary": "All hope is lost sebelum konfrontasi final", "keyEvents": ["Kehilangan terbesar", "Pencerahan batin", "Menyusun strategi akhir"], "emotionalShift": "Putus asa -> Kebangkitan tekad", "targetWordCount": 1800 },
    { "title": "Bab 5: Fajar Resolusi", "summary": "Klimaks dan resolusi cerita tuntas", "keyEvents": ["Konfrontasi puncak", "Kemenangan berharga", "Babak baru dimulai"], "emotionalShift": "Tegang ekstrem -> Kedamaian baru", "targetWordCount": 2000 }
  ],
  "synopsis": {
    "hookParagraph": "1 paragraf hook pembuka yang menggugah",
    "targetAudience": "Target demografi pembaca",
    "comparativeTitles": "Judul pembanding (X meets Y)",
    "endingSummary": "Ringkasan resolusi klimaks",
    "fullSynopsisText": "Sinopsis lengkap naratif mengalir (Act 1 -> Act 2 -> Act 3 resolusi)"
  }
}`;

      const data = await callGeminiJson<MasterNovelPlan>({
        apiKey: settings.geminiApiKey,
        model: settings.selectedModel || 'auto',
        temperature: 0.8,
        systemInstruction: 'Kamu adalah master novelis dan perancang arsitektur fiksi profesional.',
        prompt
      });

      if (data) {
        if (data.premise) updatePremise(data.premise);
        if (data.theme) updateTheme(data.theme);
        if (data.synopsis) updateSynopsis(data.synopsis);

        if (Array.isArray(data.research)) {
          data.research.forEach((r) => addResearchItem(r));
        }
        if (Array.isArray(data.timeline)) {
          data.timeline.forEach((t) => addTimelineEvent({
            eraOrDate: t.eraOrDate || '',
            title: t.title || '',
            description: t.description || '',
            impactOnPlot: t.impactOnPlot || ''
          }));
        }
        if (Array.isArray(data.characters)) {
          const normalizeRole = (r: string): CharacterRole => {
            const lower = (r || '').toLowerCase();
            if (lower.includes('protag')) return 'protagonist';
            if (lower.includes('antag')) return 'antagonist';
            if (lower.includes('mentor')) return 'mentor';
            if (lower.includes('deut')) return 'deuteragonist';
            return 'supporting';
          };

          data.characters.forEach((c) => addCharacter({
            ...c,
            role: normalizeRole(c.role),
            internalMotivation: c.internalNeed || 'Kebutuhan batin',
            relationships: []
          }));
        }
        if (Array.isArray(data.world)) {
          data.world.forEach((w) => addWorldEntry(w));
        }
        if (Array.isArray(data.chapters)) {
          data.chapters.forEach((ch) => addChapter({
            ...ch,
            status: 'planned'
          }));
        }

        setMasterSuccessMsg('🎉 Seluruh 7 Modul Fase 1 (Premis, Riset, Tema, Tokoh, World, Outline, & Sinopsis) berhasil dibangun dalam 1 Request API yang sangat hemat kuota!');
        setTimeout(() => setMasterSuccessMsg(null), 6000);
      }
    } catch (err: unknown) {
      console.error('Master generate error:', err);
      const msg = err instanceof Error ? err.message : 'Gagal menjalankan Master Builder';
      alert(`Error Master Generator: ${msg}`);
    } finally {
      setIsMasterLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-(--bg-primary)">
      
      {/* Master Builder Quick Banner (High API Efficiency) */}
      <div className="bg-linear-to-r from-amber-500/15 via-emerald-500/10 to-transparent border-b border-(--border-color) px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-(--text-primary)">
                  ⚡ Master AI Novel Architect (Hemat Kuota: 1 API Call)
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  1 Request = Seluruh 7 Modul
                </span>
              </div>
              <p className="text-[11px] text-(--text-muted)">
                Susun Premis, Riset, Tema, Tokoh, World Bible, 5 Bab Outline, dan Sinopsis sekaligus dalam satu klik hemat kuota.
              </p>
            </div>
          </div>

          <button
            onClick={handleMasterGenerate}
            disabled={isMasterLoading}
            className="px-4 py-2 rounded-xl bg-linear-to-r from-amber-500 to-amber-400 text-slate-950 text-xs font-bold hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 shrink-0"
          >
            {isMasterLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Membangun Seluruh Fase 1...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>✨ Bangun Seluruh Fase 1 Sekaligus</span>
              </>
            )}
          </button>
        </div>

        {/* Master Success Alert */}
        {masterSuccessMsg && (
          <div className="mt-2.5 max-w-7xl mx-auto p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{masterSuccessMsg}</span>
          </div>
        )}
      </div>

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
