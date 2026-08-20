export type NovelGenre = 
  | 'historical_fiction'
  | 'political_thriller'
  | 'fiqh_based_islamic'
  | 'mystery_detective'
  | 'speculative_scifi'
  | 'fantasy_epic'
  | 'literary_drama'
  | 'custom';

export type OutlineStructureType = 
  | 'three_act'
  | 'save_the_cat'
  | 'heros_journey'
  | 'non_linear_mystery'
  | 'custom';

export type ResearchCategory = 
  | 'primary_source'
  | 'timeline'
  | 'technical_term'
  | 'material_culture'
  | 'historical_event'
  | 'theological_fiqh'
  | 'other';

export interface ResearchItem {
  id: string;
  title: string;
  category: ResearchCategory;
  content: string;
  tags: string[];
  sourceUrlOrCitation?: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  eraOrDate: string;
  title: string;
  description: string;
  impactOnPlot: string;
  orderIndex: number;
}

export interface Premise {
  logline: string;             // Satu-dua kalimat kompas utama
  protagonist: string;         // Siapa tokohnya
  goal: string;                // Apa yang diinginkannya
  obstacle: string;            // Apa yang menghalanginya
  stakes: string;              // Apa taruhannya jika gagal
  elevatorPitch: string;       // Penjelasan ringkas 1 paragraf
  coreConflict: string;        // Konflik internal vs eksternal
}

export interface ThemeConfig {
  centralTheme: string;        // Tema sentral (misal: "Keadilan vs Loyalitas")
  coreMessage: string;         // Pesan/argumen moral yang ingin disampaikan
  subThemes: string[];         // Tema turunan
  moralDilemma: string;        // Pertanyaan moral yang diuji dalam cerita
  symbolicMotifs: string[];    // Motif/simbol berulang
  filteringQuestions: string;  // Pertanyaan filter untuk setiap keputusan bab
}

export type CharacterRole = 'protagonist' | 'antagonist' | 'deuteragonist' | 'mentor' | 'supporting' | 'minor';

export interface CharacterRelationship {
  targetCharacterId: string;
  relationshipType: string;    // misal: 'Saudara & Rival', 'Mantan Guru', 'Sekutu Rahasia'
  description: string;
  dynamicChange: string;       // Bagaimana hubungan ini berkembang atau retak
}

export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  age?: string;
  occupation?: string;
  appearance?: string;
  imageUrl?: string;           // Foto profil / potret tokoh (Base64 atau URL)
  backstory: string;
  internalMotivation: string;  // Apa yang sebenarnya ia butuhkan (Need)
  externalGoal: string;        // Apa yang tampak ia inginkan (Want)
  fatalFlaw: string;           // Cacat/kelemahan utama & kontradiksi internal
  arcStart: string;            // Kondisi psikologis di awal cerita
  arcClimax: string;           // Titik balik/ujian terbesar
  arcEnd: string;              // Kondisi perubahan di akhir cerita
  voiceTraits: string;         // Gaya bicara, kosakata khas, nada suara
  relationships: CharacterRelationship[];
  avatarColor?: string;
}

export type WorldCategory = 
  | 'geography'
  | 'social_political'
  | 'culture_religion'
  | 'magic_technology'
  | 'rules_laws'
  | 'faction_org';

export interface WorldEntry {
  id: string;
  category: WorldCategory;
  title: string;
  summary: string;
  imageUrl?: string;           // Ilustrasi lokasi / peta / artefak (Base64 atau URL)
  detailedRules: string;
  secretsOrTaboos: string;
  tags: string[];
  relatedCharacterIds?: string[];
}

export interface OutlineBeat {
  id: string;
  actNumber: number;
  actName: string;
  beatName: string;
  description: string;
  targetPacing: 'slow' | 'medium' | 'fast' | 'climax';
  chapterId?: string;
}

export interface OutlineChapter {
  id: string;
  chapterNumber: number;
  title: string;
  beatId?: string;
  povCharacterId?: string;
  settingLocation?: string;
  summary: string;
  keyEvents: string[];
  emotionalShift: string;      // Contoh: 'Dari percaya diri menjadi panik'
  targetWordCount: number;
  status: 'planned' | 'drafting' | 'revised' | 'completed';
}

export interface Synopsis {
  fullSynopsisText: string;
  targetAudience: string;
  genre: string;
  comparativeTitles: string;   // "X meets Y"
  endingSummary: string;
  hookParagraph: string;
}

export interface WritingRules {
  noEmDash: boolean;           // Larangan tanda pisah em dash '—' (gunakan koma/hubung/restruktur)
  pov: 'first_person' | 'third_limited' | 'third_omniscient';
  tense: 'past' | 'present';
  narratorVoice: string;       // Deskripsi gaya narasi
  showDontTellPriority: boolean;
  prohibitedWords: string[];   // Kata-kata yang dihindari (klise/filler)
  dialogueStyle: string;       // Gaya dialog natural / formal
  customInstructions: string;  // Petunjuk khusus untuk AI Gemini
  dailyWordTarget: number;     // Target kata harian (misal: 1000)
}

export interface ChapterSnapshot {
  id: string;
  chapterId: string;
  versionLabel: string;        // Contoh: 'v1.0 - Draft Awal', 'v1.1 - Pasca Revisi AI'
  note?: string;
  createdAt: string;
  contentPlainText: string;
  contentHtml: string;
  wordCount: number;
}

export interface ChapterDraft {
  id: string;
  chapterId: string;
  title: string;
  contentHtml: string;
  contentPlainText: string;
  wordCount: number;
  notes: string;
  lastSavedAt: string;
  isCompleted: boolean;
}

export type RevisionPassType = 'developmental' | 'line_edit' | 'copyedit' | 'proofread';

export interface RevisionFeedbackItem {
  id: string;
  type: 
    | 'plot_hole' 
    | 'pacing' 
    | 'character_arc' 
    | 'show_tell' 
    | 'diction' 
    | 'rhythm' 
    | 'grammar_typo' 
    | 'rule_violation' 
    | 'em_dash_detected'
    | 'dialogue_authenticity';
  severity: 'info' | 'warning' | 'critical';
  locationSnippet?: string;
  issue: string;
  suggestion: string;
  replacementText?: string;
  applied: boolean;
}

export interface ChapterRevisionReport {
  id: string;
  chapterId: string;
  passType: RevisionPassType;
  overallScore: number;         // 1-100
  summary: string;
  strengths: string[];
  weaknesses: string[];
  items: RevisionFeedbackItem[];
  createdAt: string;
}

export interface GenerationLog {
  id: string;
  chapterId: string;
  chapterTitle: string;
  mode: 'zero_draft' | 'continue_scene' | 'expand_scene' | 'dialogue_polish' | 'action_polish';
  model: string;
  prompt: string;
  outputText: string;
  wordCount: number;
  createdAt: string;
}

export interface NovelProject {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  genre: NovelGenre;
  customGenreName?: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  currentPhase: 'prewriting' | 'drafting' | 'revision' | 'export';
  prewritingSubTab?: 'premise' | 'research' | 'theme' | 'character' | 'world' | 'outline' | 'synopsis';
  activeChapterId?: string;
  activeRevisionChapterId?: string;
  activeRevisionPass?: RevisionPassType;
  
  // Data Sections
  premise: Premise;
  researchItems: ResearchItem[];
  timelineEvents: TimelineEvent[];
  theme: ThemeConfig;
  characters: Character[];
  worldEntries: WorldEntry[];
  outlineType: OutlineStructureType;
  beats: OutlineBeat[];
  chapters: OutlineChapter[];
  synopsis: Synopsis;
  drafts: Record<string, ChapterDraft>;
  snapshots: Record<string, ChapterSnapshot[]>; // Riwayat snapshot versi per bab
  generationLogs?: GenerationLog[]; // Audit log rekaman prompt & output generasi AI
  revisionReports: Record<string, ChapterRevisionReport[]>;
  rules: WritingRules;
}

export interface UserSettings {
  geminiApiKey: string;
  selectedModel: string;
  customModelName?: string;
  temperature: number;
  theme: 'dark' | 'light' | 'sepia';
  fontFamily: 'serif' | 'sans';
  autoSaveIntervalMs: number;
  
  // Supabase Cloud Sync
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  cloudSyncEnabled?: boolean;
  lastCloudSyncedAt?: string;
}
