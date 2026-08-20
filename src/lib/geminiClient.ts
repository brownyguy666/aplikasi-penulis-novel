import { 
  NovelProject, 
  OutlineChapter, 
  RevisionPassType, 
  ChapterRevisionReport,
  RevisionFeedbackItem
} from '@/types/novel';

interface StreamDraftOptions {
  apiKey?: string;
  model?: string;
  temperature?: number;
  project: NovelProject;
  chapter: OutlineChapter;
  currentDraftText?: string;
  mode: 'zero_draft' | 'continue_scene' | 'expand_scene' | 'dialogue_polish' | 'action_polish';
  selectedSnippet?: string;
  customPromptInstruction?: string;
  onChunk: (chunk: string) => void;
  onDone: (fullText: string) => void;
  onError: (error: string) => void;
}

export async function callGeminiRaw(params: {
  apiKey?: string;
  model?: string;
  temperature?: number;
  systemInstruction?: string;
  prompt: string;
}): Promise<string> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: params.apiKey,
      model: params.model || 'auto',
      temperature: params.temperature ?? 0.7,
      systemInstruction: params.systemInstruction,
      prompt: params.prompt,
      stream: false
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Gagal menghubungi Gemini API');
  }
  return data.text;
}

export async function callGeminiJson<T>(params: {
  apiKey?: string;
  model?: string;
  temperature?: number;
  systemInstruction?: string;
  prompt: string;
}): Promise<T> {
  const raw = await callGeminiRaw({
    ...params,
    prompt: `${params.prompt}\n\nIMPORTANT: Keluarkan HANYA format JSON valid murni tanpa teks pengantar dan tanpa markdown code fence.`
  });

  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }

  const firstBrace = cleaned.search(/[\{\[]/);
  const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error('Failed to parse Gemini JSON output:', cleaned, err);
    throw new Error('Format balasan AI tidak valid JSON. Coba klik sekali lagi.');
  }
}

export async function streamDraftChapter(options: StreamDraftOptions): Promise<() => void> {
  const {
    apiKey,
    model = 'auto',
    temperature = 0.75,
    project,
    chapter,
    currentDraftText = '',
    mode,
    selectedSnippet = '',
    customPromptInstruction = '',
    onChunk,
    onDone,
    onError
  } = options;

  const controller = new AbortController();

  // Find previous chapter context
  const prevChapterIndex = project.chapters.findIndex((c) => c.id === chapter.id) - 1;
  const prevChapter = prevChapterIndex >= 0 ? project.chapters[prevChapterIndex] : null;
  const prevDraft = prevChapter ? project.drafts[prevChapter.id] : null;
  const prevDraftSnippet = prevDraft?.contentPlainText 
    ? prevDraft.contentPlainText.slice(-800) 
    : prevChapter?.summary || 'Bab pembuka (tidak ada bab sebelumnya)';

  // Format active characters
  const charactersSummary = project.characters.map((c) => 
    `- ${c.name} (${c.role}): ${c.occupation || ''}. Sifat/Voice: ${c.voiceTraits || ''}. Motivasi Internal: ${c.internalMotivation || ''}. Cacat/Flaw: ${c.fatalFlaw || ''}`
  ).join('\n');

  // Format relevant world entries
  const worldSummary = project.worldEntries.map((w) =>
    `- [${w.category}] ${w.title}: ${w.summary} | Aturan: ${w.detailedRules}`
  ).join('\n');

  // Compile strict writing guardrails
  const rules = project.rules;
  const guardrails = [
    `1. POV (Sudut Pandang): ${rules.pov === 'first_person' ? 'Orang Pertama (Aku/Saya)' : rules.pov === 'third_limited' ? 'Orang Ketiga Terbatas (Ia/Dia dengan fokus pada satu karakter)' : 'Orang Ketiga Serba Tahu'}.`,
    `2. Tense / Waktu: ${rules.tense === 'past' ? 'Past tense / Waktu lampau naratif' : 'Present tense / Waktu kini naratif'}.`,
    `3. Gaya Suara & Nada: ${rules.narratorVoice || 'Literer, imersif, dan kaya detail indrawi'}.`,
    rules.noEmDash ? `4. PERINGATAN KERAS: DILARANG MENGGUNAKAN TANDA PISAH EM DASH (—). Gunakan koma, titik, tanda hubung tunggal (-), atau pecah kalimat menjadi lebih ritmis.` : '',
    rules.showDontTellPriority ? `5. Utamakan prinsip Show, Don't Tell: gambarkan emosi lewat reaksi fisiologis, gerak-gerik mikro, dan lingkungan indrawi, bukan sekadar menyebut label emosi.` : '',
    rules.prohibitedWords?.length ? `6. HINDARI KATA-KATA KLISE INI: ${rules.prohibitedWords.join(', ')}.` : '',
    rules.customInstructions ? `7. Petunjuk Khusus Penulis: ${rules.customInstructions}` : ''
  ].filter(Boolean).join('\n');

  const systemInstruction = `Kamu adalah seorang novelis sastra dan editor fiksi kelas dunia yang menulis dalam Bahasa Indonesia bernutrisi tinggi, ritmis, elegan, dan kaya atmosfer.

Konteks Proyek:
- Judul Novel: "${project.title}" ${project.subtitle ? `(${project.subtitle})` : ''}
- Genre: ${project.customGenreName || project.genre}
- Tema Sentral: ${project.theme.centralTheme || 'Tidak dispesifikasi'} | Pesan Moral: ${project.theme.coreMessage || ''}
- Dilema Moral: ${project.theme.moralDilemma || ''}

Aturan Penulisan Wajib (Guardrails):
${guardrails}

Daftar Tokoh Kunci:
${charactersSummary || 'Belum ada karakter yang terdaftar'}

Ensiklopedia Dunia (Worldbuilding Bible):
${worldSummary || 'Belum ada entri ensiklopedia'}

Tugasmu adalah menghasilkan draf narasi fiksi bab dengan standar kepenulisan tinggi yang langsung siap pakai tanpa pengantar basa-basi meta.`;

  let prompt = '';

  if (mode === 'zero_draft') {
    prompt = `Tulis draf lengkap narasi untuk:
**${chapter.title}** (Target panjang: ~${chapter.targetWordCount || 1500} kata)

Konteks Bab Ini:
- Ringkasan Bab: ${chapter.summary}
- Poin-poin Adegan Wajib:
${chapter.keyEvents.map((e, idx) => `  ${idx + 1}. ${e}`).join('\n')}
- Pergeseran Emosional (Emotional Shift): ${chapter.emotionalShift || 'Meningkatnya ketegangan'}
- Lokasi / Setting: ${chapter.settingLocation || 'Sesuai konteks cerita'}

Konteks Penutup Bab Sebelumnya (untuk kesinambungan adegan):
"""
${prevDraftSnippet}
"""

Instruksi: Tulis narasi bab ini secara mengalir dari awal adegan sampai akhir beat bab ini. Bangun dialog yang hidup, deskripsi indrawi yang memukau, dan ritme kalimat yang natural. Jangan menulis catatan penjelasan atau prolog seperti "Berikut adalah bab..."; langsung mulai ceritanya.`;
  } else if (mode === 'continue_scene') {
    prompt = `Lanjutkan draf narasi berikut untuk **${chapter.title}**:

Draf yang Sudah Tertulis Sejauh Ini:
"""
${currentDraftText}
"""

Poin Adegan yang Masih Harus Dicapai di Bab Ini:
${chapter.keyEvents.map((e) => `  - ${e}`).join('\n')}
Pergeseran Emosional: ${chapter.emotionalShift}
${customPromptInstruction ? `Catatan Arah Adegan: ${customPromptInstruction}` : ''}

Instruksi: Lanjutkan persis dari kalimat terakhir di atas secara mulus (seamless) sebanyak 500-800 kata. Pertahankan nada dan ritme yang sudah terbangun.`;
  } else if (mode === 'expand_scene') {
    prompt = `Perkaya dan perpanjang bagian adegan berikut di dalam **${chapter.title}**:

Bagian yang Dipilih untuk Diperdalam:
"""
${selectedSnippet || currentDraftText.slice(-500)}
"""

${customPromptInstruction ? `Fokus Pengembangan: ${customPromptInstruction}` : 'Fokus: Tambahkan detail indrawi, gesekan emosi mikro antar tokoh, ketegangan psikologis batin, dan deskripsi atmosfer ruangan/lingkungan.'}

Instruksi: Tulis versi pengembangan yang lebih dramatis dan imersif.`;
  } else if (mode === 'dialogue_polish') {
    prompt = `Pertajam dialog pada adegan berikut agar terasa lebih berbobot, otentik dengan kepribadian karakter, dan memiliki subteks (tersirat):

Teks Adegan:
"""
${selectedSnippet || currentDraftText}
"""

Instruksi: Tulis ulang adegan ini dengan dialog yang lebih alami, mengurangi kata-kata mubazir, dan menonjolkan nada khas masing-masing tokoh.`;
  }

  (async () => {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          model,
          temperature,
          systemInstruction,
          prompt,
          stream: true
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Gagal memulai penulisan AI');
      }

      if (!response.body) {
        throw new Error('Response body tidak ditemukan');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') {
            onDone(accumulatedText);
            return;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              onError(parsed.error);
              return;
            }
            if (parsed.text) {
              accumulatedText += parsed.text;
              onChunk(accumulatedText);
            }
          } catch {
            // Ignore partial json parse errors
          }
        }
      }

      onDone(accumulatedText);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        onDone('');
      } else {
        const message = err instanceof Error ? err.message : 'Gagal menghubungkan ke AI';
        onError(message);
      }
    }
  })();

  return () => controller.abort();
}

export async function runLayeredRevision(params: {
  apiKey?: string;
  model?: string;
  project: NovelProject;
  chapter: OutlineChapter;
  draftText: string;
  passType: RevisionPassType;
}): Promise<ChapterRevisionReport> {
  const { apiKey, model = 'gemini-2.5-flash', project, chapter, draftText, passType } = params;

  if (!draftText.trim()) {
    throw new Error('Draf bab masih kosong. Tulis atau generate draf terlebih dahulu sebelum revisi.');
  }

  let passDescription = '';
  let focusInstructions = '';

  if (passType === 'developmental') {
    passDescription = 'Developmental Edit (Struktur & Plot)';
    focusInstructions = `Evaluasi gambar besar dari bab ini:
1. Logika alur cerita & plot holes.
2. Pacing (apakah terlalu terburu-buru atau bertele-tele).
3. Perkembangan arc karakter dan konsistensi motivasi.
4. Keterkaitan dengan tema utama novel "${project.theme.centralTheme}".`;
  } else if (passType === 'line_edit') {
    passDescription = 'Line Edit (Gaya Bahasa & Kalimat)';
    focusInstructions = `Evaluasi level kalimat dan paragraf:
1. Penerapan prinsip Show, Don't Tell vs telling yang membosankan.
2. Variasi panjang kalimat dan ritme prosa.
3. Kealamian dialog dan subteks.
4. Ketajaman diksi dan penghapusan kata mubazir / klise.`;
  } else if (passType === 'copyedit') {
    passDescription = 'Copyediting (Tata Bahasa, Ejaan, & Aturan Teknis)';
    focusInstructions = `Pengecekan teknis naskah:
1. Ejaan bahasa Indonesia (EYD/PUEBI), tanda baca, dan typo.
2. Konsistensi istilah, nama tokoh, dan latar.
3. PEMERIKSAAN ATURAN KHUSUS: Cek apakah ada penggunaan tanda em dash (—). Sesuai aturan novel ini, tanda em dash DILARANG. Jika ada, tandai sebagai temuan 'em_dash_detected'.`;
  } else if (passType === 'proofread') {
    passDescription = 'Proofreading (Pembersihan Final)';
    focusInstructions = `Pengecekan akhir sebelum naskah dianggap siap terbit:
1. Typo sisa yang terlewat.
2. Spasi ganda atau format dialog yang tidak rapi.
3. Kerapian transisi adegan.`;
  }

  const prompt = `Lakukan analisis **${passDescription}** profesional terhadap draf bab berikut.

Konteks Proyek:
- Judul: ${project.title}
- Bab: ${chapter.title} (Nomor: ${chapter.chapterNumber})
- Target Outline: ${chapter.summary}
- Poin Adegan Kunci: ${chapter.keyEvents.join('; ')}
- Aturan Penulisan: No Em-Dash: ${project.rules.noEmDash}, POV: ${project.rules.pov}, Tense: ${project.rules.tense}

Naskah Bab:
"""
${draftText}
"""

Instruksi Khusus:
${focusInstructions}

Keluarkan hasil analisis dalam format JSON murni yang valid tanpa bungkus markdown backtick (\`\`\`json).
Struktur JSON yang wajib diikuti:
{
  "overallScore": number (1-100),
  "summary": "Ringkasan penilaian menyeluruh dalam 2-3 kalimat",
  "strengths": ["Kekuatan 1", "Kekuatan 2"],
  "weaknesses": ["Kelemahan/Area perbaikan 1", "Kelemahan/Area perbaikan 2"],
  "items": [
    {
      "id": "rev-item-1",
      "type": "plot_hole" | "pacing" | "character_arc" | "show_tell" | "diction" | "rhythm" | "grammar_typo" | "rule_violation" | "em_dash_detected" | "dialogue_authenticity",
      "severity": "info" | "warning" | "critical",
      "locationSnippet": "Kutipan kalimat bermasalah dari teks",
      "issue": "Penjelasan mengapa ini perlu diperbaiki",
      "suggestion": "Saran perbaikan konkret",
      "replacementText": "Opsional: kalimat pengganti yang sudah diperbaiki"
    }
  ]
}`;

  const rawJson = await callGeminiRaw({
    apiKey,
    model,
    temperature: 0.3,
    systemInstruction: 'Kamu adalah editor naskah novel profesional. Kamu selalu merespons dengan JSON murni yang valid.',
    prompt
  });

  try {
    // Clean potential markdown blocks
    const cleaned = rawJson.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const report: ChapterRevisionReport = {
      id: `rev-${Date.now()}`,
      chapterId: chapter.id,
      passType,
      overallScore: typeof parsed.overallScore === 'number' ? parsed.overallScore : 85,
      summary: parsed.summary || 'Analisis selesai.',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      items: Array.isArray(parsed.items) ? parsed.items.map((it: Partial<RevisionFeedbackItem>, idx: number) => ({
        id: `item-${Date.now()}-${idx}`,
        type: it.type || 'diction',
        severity: it.severity || 'warning',
        locationSnippet: it.locationSnippet || '',
        issue: it.issue || '',
        suggestion: it.suggestion || '',
        replacementText: it.replacementText || '',
        applied: false
      })) : [],
      createdAt: new Date().toISOString()
    };

    return report;
  } catch (err: unknown) {
    console.error('Failed to parse revision JSON:', rawJson, err);
    throw new Error('Gagal memproses format laporan editor dari AI. Silakan coba kembali.');
  }
}
