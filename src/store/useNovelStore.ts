import { create } from 'zustand';
import { get, set } from 'idb-keyval';
import { 
  NovelProject, 
  UserSettings, 
  Premise, 
  ResearchItem, 
  TimelineEvent, 
  ThemeConfig, 
  Character, 
  WorldEntry, 
  OutlineStructureType, 
  OutlineBeat, 
  OutlineChapter, 
  Synopsis, 
  ChapterDraft, 
  WritingRules, 
  ChapterRevisionReport,
  RevisionPassType,
  ChapterSnapshot,
  GenerationLog
} from '@/types/novel';
import { SAMPLE_NOVEL_PROJECT } from '@/data/sampleProject';
import { OUTLINE_TEMPLATES } from '@/lib/outlineTemplates';
import { pushProjectToSupabase, pullProjectFromSupabase, pushGenerationLogToSupabase } from '@/lib/supabaseClient';

const STORAGE_PROJECT_KEY = 'novel_builder_active_project_v1';
const STORAGE_SETTINGS_KEY = 'novel_builder_user_settings_v1';

export interface NovelStoreState {
  project: NovelProject;
  settings: UserSettings;
  isLoaded: boolean;
  isSaving: boolean;
  lastSavedTime: string | null;

  // Initialize
  initStore: () => Promise<void>;
  saveToStorage: () => Promise<void>;

  // Navigation
  setPhase: (phase: NovelProject['currentPhase']) => void;
  setPrewritingSubTab: (tab: NonNullable<NovelProject['prewritingSubTab']>) => void;
  setActiveChapter: (chapterId: string) => void;
  setActiveRevision: (chapterId: string, pass?: RevisionPassType) => void;

  // Project Meta
  updateProjectMeta: (meta: { title?: string; subtitle?: string; author?: string; genre?: NovelProject['genre']; customGenreName?: string }) => void;
  resetToSampleProject: () => void;
  createNewProject: (title?: string) => void;
  exportProjectJson: () => string;
  importProjectJson: (jsonString: string) => boolean;

  // Settings
  updateSettings: (settings: Partial<UserSettings>) => void;

  // Pre-Writing: Premise
  updatePremise: (premise: Partial<Premise>) => void;

  // Pre-Writing: Research & Timeline
  addResearchItem: (item: Omit<ResearchItem, 'id' | 'createdAt'>) => string;
  updateResearchItem: (id: string, item: Partial<ResearchItem>) => void;
  deleteResearchItem: (id: string) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'orderIndex'>) => string;
  updateTimelineEvent: (id: string, event: Partial<TimelineEvent>) => void;
  deleteTimelineEvent: (id: string) => void;

  // Pre-Writing: Theme
  updateTheme: (theme: Partial<ThemeConfig>) => void;

  // Pre-Writing: Character
  addCharacter: (character: Omit<Character, 'id'>) => string;
  updateCharacter: (id: string, character: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;

  // Pre-Writing: Worldbuilding
  addWorldEntry: (entry: Omit<WorldEntry, 'id'>) => string;
  updateWorldEntry: (id: string, entry: Partial<WorldEntry>) => void;
  deleteWorldEntry: (id: string) => void;

  // Pre-Writing: Outline & Chapters
  setOutlineStructure: (structureType: OutlineStructureType, applyTemplateBeats?: boolean) => void;
  updateBeats: (beats: OutlineBeat[]) => void;
  addBeat: (beat: Omit<OutlineBeat, 'id'>) => string;
  deleteBeat: (id: string) => void;
  addChapter: (chapter: Omit<OutlineChapter, 'id' | 'chapterNumber'>) => string;
  updateChapter: (id: string, chapter: Partial<OutlineChapter>) => void;
  deleteChapter: (id: string) => void;
  reorderChapters: (chapters: OutlineChapter[]) => void;

  // Pre-Writing: Synopsis
  updateSynopsis: (synopsis: Partial<Synopsis>) => void;

  // Drafting
  updateWritingRules: (rules: Partial<WritingRules>) => void;
  updateChapterDraft: (chapterId: string, draft: Partial<ChapterDraft>) => void;
  
  // Snapshots / Time Machine
  createChapterSnapshot: (chapterId: string, versionLabel: string, note?: string) => string;
  restoreChapterSnapshot: (chapterId: string, snapshotId: string) => boolean;
  deleteChapterSnapshot: (chapterId: string, snapshotId: string) => void;

  // Revision
  addRevisionReport: (report: ChapterRevisionReport) => void;
  applyRevisionItem: (chapterId: string, reportId: string, itemId: string, replacementText?: string) => void;

  // Generation Audit Logs
  addGenerationLog: (log: Omit<GenerationLog, 'id' | 'createdAt'>) => void;
  clearGenerationLogs: () => void;

  // Supabase Auth State
  currentUser: { id: string; email?: string } | null;
  setCurrentUser: (user: { id: string; email?: string } | null) => void;

  // Supabase Cloud Sync
  syncToCloud: () => Promise<{ success: boolean; message: string }>;
  pullFromCloud: () => Promise<{ success: boolean; message: string }>;
}

const DEFAULT_SETTINGS: UserSettings = {
  geminiApiKey: '',
  selectedModel: 'auto',
  customModelName: '',
  temperature: 0.7,
  theme: 'dark',
  fontFamily: 'serif',
  autoSaveIntervalMs: 2000,
  supabaseUrl: 'https://xxeegyireqgxshtazkzh.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZWVneWlyZXFneHNodGF6a3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNTgyNTcsImV4cCI6MjEwMjYzNDI1N30.IQBFa0zfHY5FTkr9Flf8oy2YQawy2UwswnBuBAqpLDE',
  cloudSyncEnabled: true
};

export const useNovelStore = create<NovelStoreState>((setStore, getStore) => ({
  project: SAMPLE_NOVEL_PROJECT,
  settings: DEFAULT_SETTINGS,
  isLoaded: false,
  isSaving: false,
  lastSavedTime: null,
  currentUser: null,
  setCurrentUser: (user) => setStore({ currentUser: user }),

  initStore: async () => {
    try {
      let savedProject = await get<NovelProject>(STORAGE_PROJECT_KEY);
      let savedSettings = await get<UserSettings>(STORAGE_SETTINGS_KEY);

      // Fallback to localStorage if indexedDB is empty on first load
      if (!savedProject && typeof window !== 'undefined') {
        const localP = localStorage.getItem(STORAGE_PROJECT_KEY);
        if (localP) savedProject = JSON.parse(localP);
        const localS = localStorage.getItem(STORAGE_SETTINGS_KEY);
        if (localS) savedSettings = JSON.parse(localS);
      }

      const activeProject = savedProject || SAMPLE_NOVEL_PROJECT;
      // Ensure snapshots object is present
      if (!activeProject.snapshots) {
        activeProject.snapshots = {};
      }
      if (!activeProject.generationLogs) {
        activeProject.generationLogs = [];
      }

      const activeSettings = savedSettings ? { ...DEFAULT_SETTINGS, ...savedSettings } : DEFAULT_SETTINGS;
      
      // Auto-migrate outdated/deprecated models to active 3.x auto model
      if (!activeSettings.selectedModel || ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-pro'].includes(activeSettings.selectedModel)) {
        activeSettings.selectedModel = 'auto';
      }

      setStore({
        project: activeProject,
        settings: activeSettings,
        isLoaded: true
      });
    } catch (e) {
      console.warn('Failed to load storage, using default sample:', e);
      setStore({ project: SAMPLE_NOVEL_PROJECT, isLoaded: true });
    }
  },

  saveToStorage: async () => {
    const { project, settings } = getStore();
    setStore({ isSaving: true });
    try {
      await set(STORAGE_PROJECT_KEY, project);
      await set(STORAGE_SETTINGS_KEY, settings);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_PROJECT_KEY, JSON.stringify(project));
        localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
      }
      setStore({ 
        isSaving: false, 
        lastSavedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
      });
    } catch (e) {
      console.error('Failed to save to storage:', e);
      setStore({ isSaving: false });
    }
  },

  setPhase: (phase) => {
    setStore((state) => ({
      project: { ...state.project, currentPhase: phase }
    }));
    getStore().saveToStorage();
  },

  setPrewritingSubTab: (tab) => {
    setStore((state) => ({
      project: { ...state.project, prewritingSubTab: tab }
    }));
    getStore().saveToStorage();
  },

  setActiveChapter: (chapterId) => {
    setStore((state) => ({
      project: { ...state.project, activeChapterId: chapterId }
    }));
    getStore().saveToStorage();
  },

  setActiveRevision: (chapterId, pass = 'developmental') => {
    setStore((state) => ({
      project: { 
        ...state.project, 
        activeRevisionChapterId: chapterId,
        activeRevisionPass: pass
      }
    }));
    getStore().saveToStorage();
  },

  updateProjectMeta: (meta) => {
    setStore((state) => ({
      project: {
        ...state.project,
        ...meta,
        updatedAt: new Date().toISOString()
      }
    }));
    getStore().saveToStorage();
  },

  resetToSampleProject: () => {
    setStore({ project: SAMPLE_NOVEL_PROJECT });
    getStore().saveToStorage();
  },

  createNewProject: (title = 'Novel Tanpa Judul') => {
    const newProj: NovelProject = {
      id: `proj-${Date.now()}`,
      title,
      subtitle: '',
      author: '',
      genre: 'historical_fiction',
      language: 'id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentPhase: 'prewriting',
      prewritingSubTab: 'premise',
      activeChapterId: 'chap-1',
      activeRevisionChapterId: 'chap-1',
      activeRevisionPass: 'developmental',
      premise: {
        logline: '',
        protagonist: '',
        goal: '',
        obstacle: '',
        stakes: '',
        elevatorPitch: '',
        coreConflict: ''
      },
      researchItems: [],
      timelineEvents: [],
      theme: {
        centralTheme: '',
        coreMessage: '',
        subThemes: [],
        moralDilemma: '',
        symbolicMotifs: [],
        filteringQuestions: ''
      },
      characters: [],
      worldEntries: [],
      outlineType: 'three_act',
      beats: OUTLINE_TEMPLATES.three_act.beats.map((b, i) => ({ ...b, id: `beat-${i + 1}` })),
      chapters: [
        {
          id: 'chap-1',
          chapterNumber: 1,
          title: 'Bab 1: Permulaan',
          summary: 'Adegan pembuka novel.',
          keyEvents: ['Peristiwa awal.'],
          emotionalShift: 'Tenang menjadi waspada.',
          targetWordCount: 1500,
          status: 'planned'
        }
      ],
      synopsis: {
        fullSynopsisText: '',
        targetAudience: '',
        genre: '',
        comparativeTitles: '',
        endingSummary: '',
        hookParagraph: ''
      },
      drafts: {
        'chap-1': {
          id: 'draft-chap-1',
          chapterId: 'chap-1',
          title: 'Bab 1: Permulaan',
          contentHtml: '<p></p>',
          contentPlainText: '',
          wordCount: 0,
          notes: '',
          lastSavedAt: new Date().toISOString(),
          isCompleted: false
        }
      },
      snapshots: {},
      revisionReports: {},
      rules: {
        noEmDash: true,
        pov: 'third_limited',
        tense: 'past',
        narratorVoice: 'Jernih, presisi, atmosferik.',
        showDontTellPriority: true,
        prohibitedWords: ['tiba-tiba'],
        dialogueStyle: 'Natural dan berkarakter.',
        customInstructions: 'DILARANG menggunakan tanda em dash (—).',
        dailyWordTarget: 1000
      }
    };

    setStore({ project: newProj });
    getStore().saveToStorage();
  },

  exportProjectJson: () => {
    return JSON.stringify(getStore().project, null, 2);
  },

  importProjectJson: (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString) as NovelProject;
      if (parsed.id && parsed.title && parsed.premise) {
        if (!parsed.snapshots) parsed.snapshots = {};
        setStore({ project: parsed });
        getStore().saveToStorage();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  updateSettings: (settingsUpdate) => {
    setStore((state) => ({
      settings: { ...state.settings, ...settingsUpdate }
    }));
    getStore().saveToStorage();
  },

  // Pre-Writing: Premise
  updatePremise: (premiseUpdate) => {
    setStore((state) => ({
      project: {
        ...state.project,
        premise: { ...state.project.premise, ...premiseUpdate },
        updatedAt: new Date().toISOString()
      }
    }));
    getStore().saveToStorage();
  },

  // Pre-Writing: Research & Timeline
  addResearchItem: (item) => {
    const id = `res-${Date.now()}`;
    setStore((state) => ({
      project: {
        ...state.project,
        researchItems: [
          ...state.project.researchItems,
          { ...item, id, createdAt: new Date().toISOString() }
        ],
        updatedAt: new Date().toISOString()
      }
    }));
    getStore().saveToStorage();
    return id;
  },

  updateResearchItem: (id, itemUpdate) => {
    setStore((state) => ({
      project: {
        ...state.project,
        researchItems: state.project.researchItems.map((r) =>
          r.id === id ? { ...r, ...itemUpdate } : r
        ),
        updatedAt: new Date().toISOString()
      }
    }));
    getStore().saveToStorage();
  },

  deleteResearchItem: (id) => {
    setStore((state) => ({
      project: {
        ...state.project,
        researchItems: state.project.researchItems.filter((r) => r.id !== id),
        updatedAt: new Date().toISOString()
      }
    }));
    getStore().saveToStorage();
  },

  addTimelineEvent: (event) => {
    const id = `time-${Date.now()}`;
    setStore((state) => ({
      project: {
        ...state.project,
        timelineEvents: [
          ...state.project.timelineEvents,
          { ...event, id, orderIndex: state.project.timelineEvents.length }
        ],
        updatedAt: new Date().toISOString()
      }
    }));
    getStore().saveToStorage();
    return id;
  },

  updateTimelineEvent: (id, eventUpdate) => {
    setStore((state) => ({
      project: {
        ...state.project,
        timelineEvents: state.project.timelineEvents.map((t) =>
          t.id === id ? { ...t, ...eventUpdate } : t
        ),
        updatedAt: new Date().toISOString()
      }
    }));
    getStore().saveToStorage();
  },

  deleteTimelineEvent: (id) => {
    setStore((state) => ({
      project: {
        ...state.project,
        timelineEvents: state.project.timelineEvents.filter((t) => t.id !== id),
        updatedAt: new Date().toISOString()
      }
    }));
    getStore().saveToStorage();
  },

  // Pre-Writing: Theme
  updateTheme: (themeUpdate) => {
    setStore((state) => ({
      project: {
        ...state.project,
        theme: { ...state.project.theme, ...themeUpdate },
        updatedAt: new Date().toISOString()
      }
    }));
    getStore().saveToStorage();
  },

  // Pre-Writing: Character
  addCharacter: (charData) => {
    const id = `char-${Date.now()}`;
    setStore((state) => ({
      project: {
        ...state.project,
        characters: [...state.project.characters, { ...charData, id }],
        updatedAt: new Date().toISOString()
      }
    }));
    getStore().saveToStorage();
    return id;
  },

  updateCharacter: (id, charUpdate) => {
    setStore((state) => ({
      project: {
        ...state.project,
        characters: state.project.characters.map((c) =>
          c.id === id ? { ...c, ...charUpdate } : c
        ),
        updatedAt: new Date().toISOString()
      }
    }));
    getStore().saveToStorage();
  },

  deleteCharacter: (id) => {
    setStore((state) => ({
      project: {
        ...state.project,
        characters: state.project.characters.filter((c) => c.id !== id),
        updatedAt: new Date().toISOString()
      }
    }));
    getStore().saveToStorage();
  },

  // Pre-Writing: Worldbuilding
  addWorldEntry: (entryData) => {
    const id = `world-${Date.now()}`;
    setStore((state) => ({
      project: {
        ...state.project,
        worldEntries: [...state.project.worldEntries, { ...entryData, id }],
        updatedAt: new Date().toISOString()
      }
    }));
    getStore().saveToStorage();
    return id;
  },

  updateWorldEntry: (id, entryUpdate) => {
    setStore((state) => ({
      project: {
        ...state.project,
        worldEntries: state.project.worldEntries.map((w) =>
          w.id === id ? { ...w, ...entryUpdate } : w
        ),
        updatedAt: new Date().toISOString()
      }
    }));
    getStore().saveToStorage();
  },

  deleteWorldEntry: (id) => {
    setStore((state) => ({
      project: {
        ...state.project,
        worldEntries: state.project.worldEntries.filter((w) => w.id !== id),
        updatedAt: new Date().toISOString()
      }
    }));
    getStore().saveToStorage();
  },

  // Pre-Writing: Outline & Chapters
  setOutlineStructure: (structureType, applyTemplateBeats = true) => {
    setStore((state) => {
      let newBeats = state.project.beats;
      if (applyTemplateBeats && OUTLINE_TEMPLATES[structureType]) {
        newBeats = OUTLINE_TEMPLATES[structureType].beats.map((b, idx) => ({
          ...b,
          id: `beat-${idx + 1}`
        }));
      }
      return {
        project: {
          ...state.project,
          outlineType: structureType,
          beats: newBeats,
          updatedAt: new Date().toISOString()
        }
      };
    });
    getStore().saveToStorage();
  },

  updateBeats: (beats) => {
    setStore((state) => ({
      project: { ...state.project, beats, updatedAt: new Date().toISOString() }
    }));
    getStore().saveToStorage();
  },

  addBeat: (beat) => {
    const id = `beat-${Date.now()}`;
    setStore((state) => ({
      project: {
        ...state.project,
        beats: [...state.project.beats, { ...beat, id }],
        updatedAt: new Date().toISOString()
      }
    }));
    getStore().saveToStorage();
    return id;
  },

  deleteBeat: (id) => {
    setStore((state) => ({
      project: {
        ...state.project,
        beats: state.project.beats.filter((b) => b.id !== id),
        updatedAt: new Date().toISOString()
      }
    }));
    getStore().saveToStorage();
  },

  addChapter: (chapterData) => {
    const id = `chap-${Date.now()}`;
    setStore((state) => {
      const chapterNumber = state.project.chapters.length + 1;
      const newChapter: OutlineChapter = {
        ...chapterData,
        id,
        chapterNumber
      };

      const initialDraft: ChapterDraft = {
        id: `draft-${id}`,
        chapterId: id,
        title: newChapter.title,
        contentHtml: `<p></p>`,
        contentPlainText: '',
        wordCount: 0,
        notes: '',
        lastSavedAt: new Date().toISOString(),
        isCompleted: false
      };

      return {
        project: {
          ...state.project,
          chapters: [...state.project.chapters, newChapter],
          drafts: {
            ...state.project.drafts,
            [id]: initialDraft
          },
          updatedAt: new Date().toISOString()
        }
      };
    });
    getStore().saveToStorage();
    return id;
  },

  updateChapter: (id, chapter) => {
    setStore((state) => ({
      project: {
        ...state.project,
        chapters: state.project.chapters.map((c) => (c.id === id ? { ...c, ...chapter } : c)),
        updatedAt: new Date().toISOString()
      }
    }));
    getStore().saveToStorage();
  },

  deleteChapter: (id) => {
    setStore((state) => {
      const filteredChapters = state.project.chapters
        .filter((c) => c.id !== id)
        .map((c, idx) => ({ ...c, chapterNumber: idx + 1 }));

      const { [id]: deletedDraft, ...remainingDrafts } = state.project.drafts;
      void deletedDraft;

      return {
        project: {
          ...state.project,
          chapters: filteredChapters,
          drafts: remainingDrafts,
          activeChapterId: state.project.activeChapterId === id ? (filteredChapters[0]?.id || '') : state.project.activeChapterId,
          updatedAt: new Date().toISOString()
        }
      };
    });
    getStore().saveToStorage();
  },

  reorderChapters: (chapters) => {
    const renumbered = chapters.map((c, idx) => ({ ...c, chapterNumber: idx + 1 }));
    setStore((state) => ({
      project: { ...state.project, chapters: renumbered, updatedAt: new Date().toISOString() }
    }));
    getStore().saveToStorage();
  },

  updateSynopsis: (synopsis) => {
    setStore((state) => ({
      project: {
        ...state.project,
        synopsis: { ...state.project.synopsis, ...synopsis },
        updatedAt: new Date().toISOString()
      }
    }));
    getStore().saveToStorage();
  },

  // Drafting
  updateWritingRules: (rules) => {
    setStore((state) => ({
      project: {
        ...state.project,
        rules: { ...state.project.rules, ...rules },
        updatedAt: new Date().toISOString()
      }
    }));
    getStore().saveToStorage();
  },

  updateChapterDraft: (chapterId, draftUpdate) => {
    setStore((state) => {
      const existing = state.project.drafts[chapterId] || {
        id: `draft-${chapterId}`,
        chapterId,
        title: state.project.chapters.find((c) => c.id === chapterId)?.title || 'Bab',
        contentHtml: '',
        contentPlainText: '',
        wordCount: 0,
        notes: '',
        lastSavedAt: new Date().toISOString(),
        isCompleted: false
      };

      const updatedDraft: ChapterDraft = {
        ...existing,
        ...draftUpdate,
        lastSavedAt: new Date().toISOString()
      };

      return {
        project: {
          ...state.project,
          drafts: {
            ...state.project.drafts,
            [chapterId]: updatedDraft
          },
          updatedAt: new Date().toISOString()
        }
      };
    });
    getStore().saveToStorage();
  },

  // Snapshots / Time Machine
  createChapterSnapshot: (chapterId, versionLabel, note = '') => {
    const id = `snap-${Date.now()}`;
    const draft = getStore().project.drafts[chapterId];
    if (!draft) return id;

    const newSnapshot: ChapterSnapshot = {
      id,
      chapterId,
      versionLabel,
      note,
      createdAt: new Date().toISOString(),
      contentPlainText: draft.contentPlainText,
      contentHtml: draft.contentHtml,
      wordCount: draft.wordCount
    };

    setStore((state) => {
      const existing = state.project.snapshots?.[chapterId] || [];
      return {
        project: {
          ...state.project,
          snapshots: {
            ...(state.project.snapshots || {}),
            [chapterId]: [newSnapshot, ...existing]
          },
          updatedAt: new Date().toISOString()
        }
      };
    });
    getStore().saveToStorage();
    return id;
  },

  restoreChapterSnapshot: (chapterId, snapshotId) => {
    const state = getStore();
    const snapshots = state.project.snapshots?.[chapterId] || [];
    const target = snapshots.find((s) => s.id === snapshotId);
    if (!target) return false;

    // Automatically snapshot current state before restoring
    getStore().createChapterSnapshot(
      chapterId, 
      `Otomatis Sebelum Restore (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      'Cadangan otomatis yang dibuat sebelum memulihkan snapshot lain.'
    );

    setStore((s) => ({
      project: {
        ...s.project,
        drafts: {
          ...s.project.drafts,
          [chapterId]: {
            ...s.project.drafts[chapterId],
            contentPlainText: target.contentPlainText,
            contentHtml: target.contentHtml,
            wordCount: target.wordCount,
            lastSavedAt: new Date().toISOString()
          }
        },
        updatedAt: new Date().toISOString()
      }
    }));
    getStore().saveToStorage();
    return true;
  },

  deleteChapterSnapshot: (chapterId, snapshotId) => {
    setStore((state) => {
      const existing = state.project.snapshots?.[chapterId] || [];
      return {
        project: {
          ...state.project,
          snapshots: {
            ...(state.project.snapshots || {}),
            [chapterId]: existing.filter((s) => s.id !== snapshotId)
          },
          updatedAt: new Date().toISOString()
        }
      };
    });
    getStore().saveToStorage();
  },

  // Revision
  addRevisionReport: (report) => {
    setStore((state) => {
      const existingReports = state.project.revisionReports[report.chapterId] || [];
      return {
        project: {
          ...state.project,
          revisionReports: {
            ...state.project.revisionReports,
            [report.chapterId]: [report, ...existingReports]
          },
          updatedAt: new Date().toISOString()
        }
      };
    });
    getStore().saveToStorage();
  },

  applyRevisionItem: (chapterId, reportId, itemId, replacementText) => {
    setStore((state) => {
      const reports = state.project.revisionReports[chapterId] || [];
      const updatedReports = reports.map((rep) => {
        if (rep.id !== reportId) return rep;
        return {
          ...rep,
          items: rep.items.map((item) => {
            if (item.id !== itemId) return item;
            return { ...item, applied: true };
          })
        };
      });

      let updatedDrafts = state.project.drafts;
      if (replacementText) {
        const draft = state.project.drafts[chapterId];
        if (draft) {
          updatedDrafts = {
            ...state.project.drafts,
            [chapterId]: {
              ...draft,
              contentPlainText: replacementText,
              lastSavedAt: new Date().toISOString()
            }
          };
        }
      }

      return {
        project: {
          ...state.project,
          revisionReports: {
            ...state.project.revisionReports,
            [chapterId]: updatedReports
          },
          drafts: updatedDrafts,
          updatedAt: new Date().toISOString()
        }
      };
    });
    getStore().saveToStorage();
  },

  // Supabase Cloud Sync
  syncToCloud: async () => {
    const { project, settings } = getStore();
    const result = await pushProjectToSupabase(
      project,
      settings.supabaseUrl,
      settings.supabaseAnonKey
    );
    if (result.success) {
      setStore((state) => ({
        settings: {
          ...state.settings,
          lastCloudSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      }));
      getStore().saveToStorage();
    }
    return result;
  },

  pullFromCloud: async () => {
    const { project, settings } = getStore();
    const result = await pullProjectFromSupabase(
      project.id,
      settings.supabaseUrl,
      settings.supabaseAnonKey
    );
    if (result.success && result.project) {
      if (!result.project.snapshots) result.project.snapshots = {};
      setStore({ project: result.project });
      getStore().saveToStorage();
    }
    return {
      success: result.success,
      message: result.message
    };
  },

  // Generation Audit Logs
  addGenerationLog: (logInput) => {
    const newLog: GenerationLog = {
      ...logInput,
      id: 'gen-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString()
    };
    const current = getStore().project;
    const logs = [newLog, ...(current.generationLogs || [])].slice(0, 50);
    const updated = {
      ...current,
      generationLogs: logs,
      updatedAt: new Date().toISOString()
    };
    setStore({ project: updated });
    getStore().saveToStorage();

    if (getStore().settings.cloudSyncEnabled) {
      pushGenerationLogToSupabase(
        current.id,
        newLog,
        getStore().settings.supabaseUrl,
        getStore().settings.supabaseAnonKey
      );
    }
  },

  clearGenerationLogs: () => {
    const current = getStore().project;
    const updated = {
      ...current,
      generationLogs: [],
      updatedAt: new Date().toISOString()
    };
    setStore({ project: updated });
    getStore().saveToStorage();
  }
}));
