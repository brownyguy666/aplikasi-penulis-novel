'use client';

import React, { useState } from 'react';
import { useNovelStore } from '@/store/useNovelStore';
import { callGeminiRaw, callGeminiJson } from '@/lib/geminiClient';
import { CharacterRole, CharacterRelationship } from '@/types/novel';
import { 
  Users, 
  Sparkles, 
  Trash2, 
  UserPlus, 
  Target, 
  ShieldAlert, 
  TrendingUp, 
  MessageSquare, 
  Link2, 
  Loader2,
  ChevronRight,
  UserCheck,
  ImageIcon,
  Camera,
  Copy,
  Check,
  X,
  Wand2,
  ArrowRight
} from 'lucide-react';

const ROLE_BADGES: Record<CharacterRole, { label: string; bg: string; text: string }> = {
  protagonist: { label: 'Protagonis Utama', bg: 'bg-emerald-500/20 border-emerald-500/40', text: 'text-emerald-400' },
  antagonist: { label: 'Antagonis', bg: 'bg-rose-500/20 border-rose-500/40', text: 'text-rose-400' },
  deuteragonist: { label: 'Deuteragonis / Pendamping Utama', bg: 'bg-blue-500/20 border-blue-500/40', text: 'text-blue-400' },
  mentor: { label: 'Mentor / Guru', bg: 'bg-amber-500/20 border-amber-500/40', text: 'text-amber-400' },
  supporting: { label: 'Tokoh Pendukung', bg: 'bg-purple-500/20 border-purple-500/40', text: 'text-purple-400' },
  minor: { label: 'Tokoh Figuran', bg: 'bg-slate-500/20 border-slate-500/40', text: 'text-slate-400' }
};

export const CharacterStudio: React.FC = () => {
  const { project, addCharacter, updateCharacter, deleteCharacter, settings, setPrewritingSubTab } = useNovelStore();
  const characters = project.characters;

  const [selectedCharId, setSelectedCharId] = useState<string>(characters[0]?.id || '');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [imagePromptResult, setImagePromptResult] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // New relationship input state
  const [newRelTargetId, setNewRelTargetId] = useState('');
  const [newRelType, setNewRelType] = useState('');
  const [newRelDesc, setNewRelDesc] = useState('');

  const activeChar = characters.find((c) => c.id === selectedCharId) || characters[0];

  const [loadingMessage, setLoadingMessage] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [rawDeepenResult, setRawDeepenResult] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleCreateNewCharacter = () => {
    const newId = addCharacter({
      name: 'Karakter Baru',
      role: 'supporting',
      age: '',
      occupation: '',
      appearance: '',
      backstory: '',
      internalMotivation: '',
      externalGoal: '',
      fatalFlaw: '',
      arcStart: '',
      arcClimax: '',
      arcEnd: '',
      voiceTraits: '',
      relationships: [],
      avatarColor: '#3b82f6'
    });
    setSelectedCharId(newId);
  };

  // 1-Click: Generate 3 Core Characters (Protagonist, Antagonist, Mentor)
  const handleAutoGenerateCharacters = async () => {
    setIsAiLoading(true);
    setLoadingMessage('Gemini AI sedang merancang 3 tokoh kunci (Protagonis, Antagonis, Mentor) beserta busur transformasi & relasinya...');
    setRawDeepenResult(null);

    try {
      const prompt = `Berdasarkan novel berikut:
Judul: ${project.title}
Genre: ${project.customGenreName || project.genre}
Premis: ${project.premise.logline || 'Novel intrik'}
Tokoh Utama di Premis: ${project.premise.protagonist || '-'}
Goal: ${project.premise.goal || '-'}
Rintangan: ${project.premise.obstacle || '-'}
Tema: ${project.theme.centralTheme || '-'}

Rancang 3 tokoh kunci yang saling berbenturan dan melengkapi secara dinamis:
1. Tokoh Protagonis Utama
2. Tokoh Antagonis Utama
3. Tokoh Deuteragonis / Mentor

Keluarkan dalam format JSON Array dengan 3 objek persis:
[
  {
    "name": "Nama Tokoh",
    "role": "protagonist",
    "age": "32 tahun",
    "occupation": "Profesi / Jabatan Tokoh",
    "appearance": "Ciri fisik, sorot mata, pakaian khas, dan gestur tubuh",
    "backstory": "Latar belakang masa lalu yang membentuk motivasinya",
    "internalMotivation": "Kebutuhan batin / luka psikologis yang belum sembuh",
    "externalGoal": "Tujuan nyata yang ingin dicapai dalam cerita",
    "fatalFlaw": "Kelemahan fatal / titik buta karakternya",
    "arcStart": "Keadaan psikologis di awal cerita",
    "arcClimax": "Ujian tersulit di titik krisis/klimaks",
    "arcEnd": "Transformasi di akhir cerita",
    "voiceTraits": "Gaya bicara, diksi khas, dan intonasi dialog",
    "avatarColor": "#10b981"
  }
]
Peran (role) yang valid: "protagonist", "antagonist", "deuteragonist", "mentor", "supporting".`;

      const generated = await callGeminiJson<Array<{
        name: string;
        role: CharacterRole;
        age: string;
        occupation: string;
        appearance: string;
        backstory: string;
        internalMotivation: string;
        externalGoal: string;
        fatalFlaw: string;
        arcStart: string;
        arcClimax: string;
        arcEnd: string;
        voiceTraits: string;
        avatarColor: string;
      }>>({
        apiKey: settings.geminiApiKey,
        model: settings.selectedModel || 'auto',
        temperature: 0.8,
        systemInstruction: 'Kamu adalah master novelis dan perancang penokohan fiksi profesional.',
        prompt
      });

      if (Array.isArray(generated) && generated.length > 0) {
        let firstId = '';
        generated.forEach((ch, idx) => {
          const id = addCharacter({
            name: ch.name || `Tokoh ${idx + 1}`,
            role: ch.role || 'supporting',
            age: ch.age || '',
            occupation: ch.occupation || '',
            appearance: ch.appearance || '',
            backstory: ch.backstory || '',
            internalMotivation: ch.internalMotivation || '',
            externalGoal: ch.externalGoal || '',
            fatalFlaw: ch.fatalFlaw || '',
            arcStart: ch.arcStart || '',
            arcClimax: ch.arcClimax || '',
            arcEnd: ch.arcEnd || '',
            voiceTraits: ch.voiceTraits || '',
            relationships: [],
            avatarColor: ch.avatarColor || (ch.role === 'protagonist' ? '#10b981' : ch.role === 'antagonist' ? '#f43f5e' : '#3b82f6')
          });
          if (idx === 0) firstId = id;
        });
        if (firstId) setSelectedCharId(firstId);
        showToast(`Berhasil merancang ${generated.length} tokoh utama otomatis dari premis!`);
      }
    } catch (err: unknown) {
      console.error('Auto characters error:', err);
      const msg = err instanceof Error ? err.message : 'Gagal membuat karakter otomatis';
      alert(`Error Gemini AI: ${msg}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChar) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateCharacter(activeChar.id, { imageUrl: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateImagePrompt = async () => {
    if (!activeChar) return;
    setIsPromptLoading(true);
    setImagePromptResult(null);

    try {
      const prompt = `Sebagai concept artist dan art director novel ${project.title} (${project.customGenreName || project.genre}), buatlah prompt visual bahasa Inggris detail untuk AI Image Generator (Imagen / Midjourney / DALL-E) guna membuat potret karakter berikut:

Nama: ${activeChar.name}
Peran: ${activeChar.role}
Usia/Profesi: ${activeChar.age || '-'}, ${activeChar.occupation || '-'}
Deskripsi Fisik & Pakaian: ${activeChar.appearance || '-'}
Kepribadian & Nuansa Emosi: ${activeChar.voiceTraits || '-'}

Buatkan:
1. Detailed English Visual Prompt (photorealistic / cinematic lighting / period-accurate medieval historical portrait / 8k)
2. Negative Prompt (things to avoid)
3. Suggested Aspect Ratio (e.g. 1:1 or 4:5)`;

      const result = await callGeminiRaw({
        apiKey: settings.geminiApiKey,
        model: settings.selectedModel || 'auto',
        temperature: 0.7,
        systemInstruction: 'Kamu adalah master concept artist dan character visualizer.',
        prompt
      });

      setImagePromptResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat prompt visual';
      alert(`Error Gemini AI: ${msg}`);
    } finally {
      setIsPromptLoading(false);
    }
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleAddRelationship = () => {
    if (!activeChar || !newRelTargetId || !newRelType.trim()) return;
    const newRel: CharacterRelationship = {
      targetCharacterId: newRelTargetId,
      relationshipType: newRelType.trim(),
      description: newRelDesc.trim(),
      dynamicChange: ''
    };
    updateCharacter(activeChar.id, {
      relationships: [...(activeChar.relationships || []), newRel]
    });
    setNewRelType('');
    setNewRelDesc('');
  };

  const handleRemoveRelationship = (index: number) => {
    if (!activeChar) return;
    const updated = activeChar.relationships.filter((_, idx) => idx !== index);
    updateCharacter(activeChar.id, { relationships: updated });
  };

  const handleAiDeepenCharacter = async () => {
    if (!activeChar) return;
    setIsAiLoading(true);
    setRawDeepenResult(null);

    try {
      const prompt = `Sebagai konsultan penokohan novel fiksi, perdalam profil karakter berikut:
Judul Novel: ${project.title}
Genre: ${project.customGenreName || project.genre}
Tema: ${project.theme.centralTheme}
Nama Karakter: ${activeChar.name}
Peran: ${activeChar.role}
Pekerjaan: ${activeChar.occupation || '-'}
Latar Belakang Singkat: ${activeChar.backstory || '-'}
Goal Saat Ini: ${activeChar.externalGoal || '-'}

Tolong berikan rekomendasi mendalam untuk:
1. Motivasi Batin (Internal Need) yang bertentangan dengan Goal Lahiriahnya (External Want).
2. Cacat Kepribadian / Kontradiksi Internal (Fatal Flaw).
3. Busur Perubahan Karakter (Character Arc):
   - Awal (Start): Titik buta psikologisnya.
   - Puncak (Climax): Pilihan tersulit yang memaksanya berubah.
   - Akhir (End): Wujud kedewasaan atau kehancuran tragisnya.
4. Gaya Suara & Diksi Khas Dialog (Voice Traits).

Format respon dalam poin-poin yang tajam dan siap diterapkan.`;

      const result = await callGeminiRaw({
        apiKey: settings.geminiApiKey,
        model: settings.selectedModel || 'auto',
        temperature: 0.7,
        systemInstruction: 'Kamu adalah editor karakter fiksi sastra berpengalaman.',
        prompt
      });

      setRawDeepenResult(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memproses AI';
      alert(`Error Gemini AI: ${message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Fase 1.D: Pengembangan Karakter & Visualizer</span>
          </div>
          <h2 className="text-lg font-bold text-(--text-primary)">
            Character Sheet, Visual Tokoh & Dinamika Relasi
          </h2>
          <p className="text-xs text-(--text-secondary) max-w-2xl">
            Karakter yang hidup memiliki motivasi batin (Need), tujuan luar (Want), potret visual yang khas, dan busur transformasi dari awal hingga akhir cerita.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleAutoGenerateCharacters}
            disabled={isAiLoading}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            title="AI merancang 3 tokoh kunci (Protagonis, Antagonis, Mentor) secara otomatis dari premis"
          >
            {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            <span>✨ Generate 3 Tokoh Kunci</span>
          </button>

          {activeChar && (
            <button
              onClick={handleAiDeepenCharacter}
              disabled={isAiLoading}
              className="px-3.5 py-2 rounded-xl bg-(--bg-secondary) border border-emerald-500/50 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/10 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Perdalam Karakter Ini</span>
            </button>
          )}

          <button
            onClick={handleCreateNewCharacter}
            className="px-3 py-2 rounded-xl bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) text-xs font-medium hover:border-emerald-500/50 transition-colors flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Manual</span>
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Loading Indicator */}
      {isAiLoading && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-400 animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin shrink-0 text-emerald-400" />
          <div className="space-y-0.5">
            <div className="font-bold text-(--text-primary)">{loadingMessage || 'Gemini AI sedang berpikir...'}</div>
            <div className="text-[11px] text-(--text-muted)">Menganalisis internal need, fatal flaw, dan character arc</div>
          </div>
        </div>
      )}

      {/* Deepen Character Result Box */}
      {rawDeepenResult && (
        <div className="p-5 rounded-2xl bg-(--bg-secondary) border border-emerald-500/40 space-y-3 animate-fade-in shadow-lg shadow-emerald-500/5">
          <div className="flex items-center justify-between border-b border-(--border-color) pb-3">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Rekomendasi Penokohan Mendalam dari Gemini AI untuk &ldquo;{activeChar?.name}&rdquo;:</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(rawDeepenResult);
                  alert('Rekomendasi karakter berhasil disalin ke clipboard!');
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 text-[11px] font-semibold transition-colors flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Salin Teks</span>
              </button>
              <button
                onClick={() => setRawDeepenResult(null)}
                className="p-1 rounded-lg text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-primary)"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-xs text-(--text-primary) leading-relaxed whitespace-pre-wrap font-novel-serif bg-(--bg-primary) p-4 rounded-xl border border-(--border-color) max-h-96 overflow-y-auto">
            {rawDeepenResult}
          </div>
        </div>
      )}

      {/* Main Studio Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: Character List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-(--text-secondary) px-1">
            <span>DAFTAR TOKOH ({characters.length})</span>
          </div>

          <div className="space-y-2">
            {characters.map((char) => {
              const isSelected = char.id === (activeChar?.id || '');
              const roleMeta = ROLE_BADGES[char.role] || ROLE_BADGES.supporting;

              return (
                <div
                  key={char.id}
                  onClick={() => setSelectedCharId(char.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-(--bg-secondary) border-emerald-500/50 shadow-md shadow-emerald-500/10'
                      : 'bg-(--bg-secondary)/60 border-(--border-color) hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {char.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={char.imageUrl}
                        alt={char.name}
                        className="w-10 h-10 rounded-xl object-cover border border-(--border-color) shrink-0 shadow-inner"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-inner"
                        style={{ backgroundColor: char.avatarColor || '#10b981' }}
                      >
                        {char.name.charAt(0) || 'K'}
                      </div>
                    )}

                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-(--text-primary) truncate">
                        {char.name}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border w-fit mt-0.5 ${roleMeta.bg} ${roleMeta.text}`}>
                        {roleMeta.label}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-emerald-400 translate-x-0.5' : 'text-(--text-muted)'}`} />
                </div>
              );
            })}
          </div>

          {characters.length === 0 && (
            <div className="p-6 text-center rounded-2xl bg-(--bg-secondary) border border-dashed border-(--border-color) text-xs text-(--text-muted)">
              Belum ada karakter. Klik &ldquo;Tambah Tokoh&rdquo; di atas.
            </div>
          )}
        </div>

        {/* Right Editor: Active Character Deep Profile */}
        <div className="lg:col-span-8">
          {activeChar ? (
            <div className="p-6 rounded-2xl bg-(--bg-secondary) border border-(--border-color) space-y-6 animate-fade-in shadow-sm">
              
              {/* Top Row: Avatar Visual + Name + Role */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-(--border-color)">
                
                {/* Character Portrait & Image Upload */}
                <div className="relative group shrink-0">
                  {activeChar.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={activeChar.imageUrl}
                      alt={activeChar.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-md"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-md"
                      style={{ backgroundColor: activeChar.avatarColor || '#10b981' }}
                    >
                      {activeChar.name.charAt(0) || 'K'}
                    </div>
                  )}

                  <label 
                    className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-[9px] text-white font-semibold"
                    title="Unggah Foto Profil Karakter"
                  >
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>Ganti</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 space-y-1 w-full">
                  <label className="text-[11px] font-bold text-(--text-muted) uppercase">Nama Karakter</label>
                  <input
                    type="text"
                    value={activeChar.name}
                    onChange={(e) => updateCharacter(activeChar.id, { name: e.target.value })}
                    className="w-full text-base font-bold px-3 py-1.5 rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-(--text-muted) uppercase">Peran</label>
                    <select
                      value={activeChar.role}
                      onChange={(e) => updateCharacter(activeChar.id, { role: e.target.value as CharacterRole })}
                      className="px-3 py-2 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                    >
                      {Object.entries(ROLE_BADGES).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-(--text-muted) uppercase">Aksen</label>
                    <input
                      type="color"
                      value={activeChar.avatarColor || '#10b981'}
                      onChange={(e) => updateCharacter(activeChar.id, { avatarColor: e.target.value })}
                      className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer block"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Hapus karakter "${activeChar.name}"?`)) {
                        deleteCharacter(activeChar.id);
                      }
                    }}
                    className="p-2.5 rounded-xl text-(--text-muted) hover:text-red-400 hover:bg-(--bg-primary) transition-colors self-end"
                    title="Hapus Karakter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bio & Appearance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-(--text-secondary)">Usia & Pekerjaan/Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={activeChar.age || ''}
                      onChange={(e) => updateCharacter(activeChar.id, { age: e.target.value })}
                      placeholder="Usia (misal: 29 tahun)"
                      className="px-3 py-1.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                    />
                    <input
                      type="text"
                      value={activeChar.occupation || ''}
                      onChange={(e) => updateCharacter(activeChar.id, { occupation: e.target.value })}
                      placeholder="Profesi (misal: Qadhi Mahkamah)"
                      className="px-3 py-1.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-(--text-secondary)">Ciri Fisik & Penampilan Khas</label>
                    <button
                      onClick={handleGenerateImagePrompt}
                      disabled={isPromptLoading}
                      className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {isPromptLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                      <span>Prompt Visual AI</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={activeChar.appearance || ''}
                    onChange={(e) => updateCharacter(activeChar.id, { appearance: e.target.value })}
                    placeholder="Jubah katun kelabu, bekas noda tinta di jari, tatapan tajam..."
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                  />
                </div>
              </div>

              {/* AI Image Prompt Card Result */}
              {imagePromptResult && (
                <div className="p-4 rounded-xl bg-(--bg-primary) border border-emerald-500/40 space-y-2 animate-fade-in text-xs">
                  <div className="flex items-center justify-between border-b border-(--border-color) pb-2">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Prompt AI Image Generator (Midjourney / Imagen / DALL-E)</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyPrompt(imagePromptResult)}
                        className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-semibold text-[10px] flex items-center gap-1 transition-colors"
                      >
                        {copiedPrompt ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedPrompt ? 'Tersalin' : 'Copy Prompt'}</span>
                      </button>
                      <button
                        onClick={() => setImagePromptResult(null)}
                        className="text-(--text-muted) hover:text-(--text-primary) text-[11px]"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                  <div className="font-mono text-[11px] text-(--text-secondary) leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {imagePromptResult}
                  </div>
                </div>
              )}

              {/* Backstory */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-(--text-secondary)">Latar Belakang & Asal-usul (Backstory)</label>
                <textarea
                  value={activeChar.backstory}
                  onChange={(e) => updateCharacter(activeChar.id, { backstory: e.target.value })}
                  rows={2}
                  placeholder="Peristiwa penting di masa lalu yang membentuk pandangan hidupnya..."
                  className="w-full p-2.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                />
              </div>

              {/* Psychology: Need vs Want & Flaw */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-(--bg-primary) border border-(--border-color) space-y-1.5">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    Goal Lahiriah (Want)
                  </label>
                  <p className="text-[10px] text-(--text-muted)">Apa yang tampak ia kejar secara fisik di cerita.</p>
                  <textarea
                    value={activeChar.externalGoal}
                    onChange={(e) => updateCharacter(activeChar.id, { externalGoal: e.target.value })}
                    rows={2}
                    placeholder="Membongkar fatwa palsu..."
                    className="w-full p-2 text-xs rounded-lg bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) focus:outline-none resize-none"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-(--bg-primary) border border-(--border-color) space-y-1.5">
                  <label className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    Motivasi Batin (Need)
                  </label>
                  <p className="text-[10px] text-(--text-muted)">Kebutuhan emosional/moral terdalam yang ia butuhkan.</p>
                  <textarea
                    value={activeChar.internalMotivation}
                    onChange={(e) => updateCharacter(activeChar.id, { internalMotivation: e.target.value })}
                    rows={2}
                    placeholder="Menyadari keadilan bukan sekadar teks..."
                    className="w-full p-2 text-xs rounded-lg bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) focus:outline-none resize-none"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-(--bg-primary) border border-(--border-color) space-y-1.5">
                  <label className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Cacat / Kontradiksi (Flaw)
                  </label>
                  <p className="text-[10px] text-(--text-muted)">Kelemahan atau ilusi yang menghambat pertumbuhannya.</p>
                  <textarea
                    value={activeChar.fatalFlaw}
                    onChange={(e) => updateCharacter(activeChar.id, { fatalFlaw: e.target.value })}
                    rows={2}
                    placeholder="Terlalu kaku dan naif terhadap politik..."
                    className="w-full p-2 text-xs rounded-lg bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Character Arc Start -> Climax -> End */}
              <div className="p-4 rounded-xl bg-(--bg-primary) border border-emerald-500/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>Busur Transformasi Tokoh (Character Arc)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-(--text-secondary)">1. Kondisi Awal (Arc Start)</span>
                    <textarea
                      value={activeChar.arcStart}
                      onChange={(e) => updateCharacter(activeChar.id, { arcStart: e.target.value })}
                      rows={2}
                      placeholder="Birokrat taat aturan yang naif..."
                      className="w-full p-2 text-xs rounded-lg bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) focus:outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-(--text-secondary)">2. Ujian Terbesar (Arc Climax)</span>
                    <textarea
                      value={activeChar.arcClimax}
                      onChange={(e) => updateCharacter(activeChar.id, { arcClimax: e.target.value })}
                      rows={2}
                      placeholder="Dipaksa melanggar hukum demi menegakkan keadilan sejati..."
                      className="w-full p-2 text-xs rounded-lg bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) focus:outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-(--text-secondary)">3. Wujud Akhir (Arc End)</span>
                    <textarea
                      value={activeChar.arcEnd}
                      onChange={(e) => updateCharacter(activeChar.id, { arcEnd: e.target.value })}
                      rows={2}
                      placeholder="Menjadi qadhi independen yang berani bersuara..."
                      className="w-full p-2 text-xs rounded-lg bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Voice & Dialogue Traits */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-(--text-secondary) flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gaya Bicara & Karakteristik Suara (Voice Traits)</span>
                </label>
                <input
                  type="text"
                  value={activeChar.voiceTraits}
                  onChange={(e) => updateCharacter(activeChar.id, { voiceTraits: e.target.value })}
                  placeholder="Bahasa santun, presisi, menggunakan perumpamaan fiqh dan logika analitis..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                />
              </div>

              {/* Relationships Matrix */}
              <div className="space-y-3 pt-2 border-t border-(--border-color)">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-(--text-primary) flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Dinamika Relasi dengan Tokoh Lain</span>
                  </label>
                </div>

                <div className="space-y-2">
                  {activeChar.relationships?.map((rel, idx) => {
                    const target = characters.find((c) => c.id === rel.targetCharacterId);
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-(--bg-primary) border border-(--border-color) flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-(--text-primary)">{target?.name || 'Tokoh Lain'}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                              {rel.relationshipType}
                            </span>
                          </div>
                          <p className="text-[11px] text-(--text-secondary)">{rel.description}</p>
                          {rel.dynamicChange && (
                            <p className="text-[10px] text-amber-300"><em>Perubahan:</em> {rel.dynamicChange}</p>
                          )}
                        </div>

                        <button
                          onClick={() => handleRemoveRelationship(idx)}
                          className="text-(--text-muted) hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Add Relationship Form */}
                <div className="p-3 rounded-xl bg-(--bg-primary) border border-(--border-color) flex flex-col sm:flex-row items-center gap-2">
                  <select
                    value={newRelTargetId}
                    onChange={(e) => setNewRelTargetId(e.target.value)}
                    className="w-full sm:w-1/3 px-2.5 py-1.5 text-xs rounded-lg bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                  >
                    <option value="">Pilih Tokoh Sasaran...</option>
                    {characters.filter((c) => c.id !== activeChar.id).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={newRelType}
                    onChange={(e) => setNewRelType(e.target.value)}
                    placeholder="Status Relasi (misal: Sahabat & Rival)"
                    className="w-full sm:w-1/3 px-2.5 py-1.5 text-xs rounded-lg bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                  />

                  <input
                    type="text"
                    value={newRelDesc}
                    onChange={(e) => setNewRelDesc(e.target.value)}
                    placeholder="Rincian dinamika..."
                    className="w-full sm:w-1/3 px-2.5 py-1.5 text-xs rounded-lg bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                  />

                  <button
                    onClick={handleAddRelationship}
                    disabled={!newRelTargetId || !newRelType.trim()}
                    className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 disabled:opacity-50 transition-colors shrink-0"
                  >
                    Tambah
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-(--bg-secondary) border border-(--border-color) text-xs text-(--text-muted)">
              Pilih karakter di sebelah kiri atau klik &ldquo;Tambah Tokoh&rdquo;.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Step Forward Navigation */}
      <div className="pt-4 flex items-center justify-between border-t border-(--border-color)">
        <button
          onClick={() => setPrewritingSubTab('theme')}
          className="px-3.5 py-2 text-xs text-(--text-secondary) hover:text-(--text-primary) transition-colors"
        >
          &larr; Kembali ke Tema & Pesan
        </button>
        <button
          onClick={() => setPrewritingSubTab('world')}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-md shadow-cyan-500/20"
        >
          <span>Lanjut ke World Bible (Fase 1.E)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
