import { OutlineBeat, OutlineStructureType } from '@/types/novel';

export const OUTLINE_TEMPLATES: Record<OutlineStructureType, { name: string; description: string; beats: Omit<OutlineBeat, 'id'>[] }> = {
  three_act: {
    name: 'Struktur 3 Babak Klasik',
    description: 'Setup (25%) → Konfrontasi (50%) → Resolusi (25%). Kerangka paling kokoh untuk sebagian besar novel.',
    beats: [
      // Act 1
      { actNumber: 1, actName: 'Babak 1: Setup & Pengenalan', beatName: '1. Status Quo / Dunia Normal', description: 'Memperkenalkan tokoh utama, dunia kesehariannya, dan kelemahan internalnya.', targetPacing: 'slow' },
      { actNumber: 1, actName: 'Babak 1: Setup & Pengenalan', beatName: '2. Inciting Incident (Pemicu)', description: 'Peristiwa yang mengganggu status quo dan memaksa tokoh bereaksi.', targetPacing: 'medium' },
      { actNumber: 1, actName: 'Babak 1: Setup & Pengenalan', beatName: '3. Plot Point 1 (Titik Masuk Babak 2)', description: 'Keputusan tokoh untuk melangkah ke dunia baru atau mengambil komitmen tanpa jalan kembali.', targetPacing: 'fast' },
      
      // Act 2
      { actNumber: 2, actName: 'Babak 2: Konfrontasi & Eskalasi', beatName: '4. Ujian & Sekutu Baru', description: 'Tokoh beradaptasi dengan aturan baru, bertemu rintangan awal dan sekutu/musuh.', targetPacing: 'medium' },
      { actNumber: 2, actName: 'Babak 2: Konfrontasi & Eskalasi', beatName: '5. Midpoint (Titik Tengah)', description: 'Perubahan paradigma besar atau taruhan dinaikkan secara dramatis; dari reaktif menjadi proaktif.', targetPacing: 'climax' },
      { actNumber: 2, actName: 'Babak 2: Konfrontasi & Eskalasi', beatName: '6. Tekanan Meningkat & All Hope is Lost', description: 'Rencana gagal total, tokoh mencapai titik terendah (Dark Night of the Soul).', targetPacing: 'slow' },
      { actNumber: 2, actName: 'Babak 2: Konfrontasi & Eskalasi', beatName: '7. Plot Point 2 (Inspirasi & Rencana Akhir)', description: 'Tokoh menemukan kebenaran sejati atau strategi baru untuk menghadapi babak akhir.', targetPacing: 'fast' },
      
      // Act 3
      { actNumber: 3, actName: 'Babak 3: Resolusi', beatName: '8. Klimaks / Pertarungan Utama', description: 'Konfrontasi puncak antara tokoh dan kekuatan antagonis.', targetPacing: 'climax' },
      { actNumber: 3, actName: 'Babak 3: Resolusi', beatName: '9. Resolusi & Dunia Baru', description: 'Dampak dari klimaks, resolusi hubungan, dan transformasi hidup tokoh.', targetPacing: 'slow' },
    ]
  },
  save_the_cat: {
    name: 'Save the Cat! (15 Beat Sheet)',
    description: '15 beat plot point mendalam yang dirancang untuk menjaga tempo dan taruhan dramatik.',
    beats: [
      { actNumber: 1, actName: 'Babak 1', beatName: '1. Opening Image', description: 'Kilas snapshot dunia tokoh sebelum perjalanan dimulai.', targetPacing: 'slow' },
      { actNumber: 1, actName: 'Babak 1', beatName: '2. Theme Stated', description: 'Petunjuk tema atau pertanyaan moral diutarakan (seringkali oleh karakter sekunder).', targetPacing: 'slow' },
      { actNumber: 1, actName: 'Babak 1', beatName: '3. Set-Up', description: 'Menunjukkan kehidupan normal, kebiasaan, dan cacat karakter yang harus diperbaiki.', targetPacing: 'slow' },
      { actNumber: 1, actName: 'Babak 1', beatName: '4. Catalyst (Pemicu)', description: 'Peristiwa pengubah hidup yang meruntuhkan status quo.', targetPacing: 'medium' },
      { actNumber: 1, actName: 'Babak 1', beatName: '5. Debate', description: 'Keraguan dan dilema tokoh: apakah harus mengambil risiko ini?', targetPacing: 'medium' },
      { actNumber: 2, actName: 'Babak 2A', beatName: '6. Break into Two', description: 'Tokoh membuat pilihan sadar dan memasuki dunia baru/misi baru.', targetPacing: 'fast' },
      { actNumber: 2, actName: 'Babak 2A', beatName: '7. B Story', description: 'Pengenalan karakter atau hubungan kunci yang membawa tema cinta/filsafat.', targetPacing: 'slow' },
      { actNumber: 2, actName: 'Babak 2A', beatName: '8. Fun and Games (Premise in Action)', description: 'Eksplorasi premis cerita secara maksimal; adegan-adegan paling menghibur.', targetPacing: 'medium' },
      { actNumber: 2, actName: 'Babak 2A', beatName: '9. Midpoint', description: 'Kemenangan palsu (false victory) atau kekalahan palsu (false defeat), taruhan melonjak.', targetPacing: 'climax' },
      { actNumber: 2, actName: 'Babak 2B', beatName: '10. Bad Guys Close In', description: 'Kekuatan antagonis mengencangkan jerat; keretakan internal antar sekutu.', targetPacing: 'fast' },
      { actNumber: 2, actName: 'Babak 2B', beatName: '11. All Is Lost', description: 'Kematian simbolik atau kehilangan paling telak.', targetPacing: 'slow' },
      { actNumber: 2, actName: 'Babak 2B', beatName: '12. Dark Night of the Soul', description: 'Momen hening dan keputusasaan sebelum pencerahan datang.', targetPacing: 'slow' },
      { actNumber: 3, actName: 'Babak 3', beatName: '13. Break into Three', description: 'Ide atau strategi baru ditemukan berkat integrasi tema.', targetPacing: 'fast' },
      { actNumber: 3, actName: 'Babak 3', beatName: '14. Finale', description: 'Rencana dieksekusi, menara pertahanan antagonis diterobos, pertarungan puncak.', targetPacing: 'climax' },
      { actNumber: 3, actName: 'Babak 3', beatName: '15. Final Image', description: 'Cermin dari Opening Image yang membuktikan transformasi nyata dunia dan tokoh.', targetPacing: 'slow' },
    ]
  },
  heros_journey: {
    name: "Hero's Journey (Monomit)",
    description: 'Cocok untuk cerita petualangan, transformasi spiritual, atau epik sejarah.',
    beats: [
      { actNumber: 1, actName: 'Keberangkatan', beatName: '1. Dunia Biasa', description: 'Kondisi awal sang tokoh.', targetPacing: 'slow' },
      { actNumber: 1, actName: 'Keberangkatan', beatName: '2. Panggilan Bertualang', description: 'Tantangan atau ancaman muncul.', targetPacing: 'medium' },
      { actNumber: 1, actName: 'Keberangkatan', beatName: '3. Penolakan Panggilan', description: 'Ketakutan atau keterikatan menahan tokoh.', targetPacing: 'slow' },
      { actNumber: 1, actName: 'Keberangkatan', beatName: '4. Bertemu Sang Mentor', description: 'Mendapat wejangan, pusaka, atau pelatihan.', targetPacing: 'medium' },
      { actNumber: 1, actName: 'Keberangkatan', beatName: '5. Melintasi Ambang Batas', description: 'Meninggalkan dunia lama seutuhnya.', targetPacing: 'fast' },
      { actNumber: 2, actName: 'Inisiasi', beatName: '6. Ujian, Sekutu, & Musuh', description: 'Menghadapi rintangan demi rintangan.', targetPacing: 'medium' },
      { actNumber: 2, actName: 'Inisiasi', beatName: '7. Mendekati Gua Terdalam', description: 'Persiapan menuju jantung bahaya.', targetPacing: 'slow' },
      { actNumber: 2, actName: 'Inisiasi', beatName: '8. Cobaan Mahaberat (Ordeal)', description: 'Pertarungan hidup mati dengan monster atau ketakutan terbesar.', targetPacing: 'climax' },
      { actNumber: 2, actName: 'Inisiasi', beatName: '9. Anugerah (Reward)', description: 'Mendapatkan eliksir, pemahaman rahasia, atau objek pusaka.', targetPacing: 'medium' },
      { actNumber: 3, actName: 'Kepulangan', beatName: '10. Jalan Pulang', description: 'Pengejaran sengit atau konsekuensi dari anugerah.', targetPacing: 'fast' },
      { actNumber: 3, actName: 'Kepulangan', beatName: '11. Kebangkitan (Resurrection)', description: 'Ujian terakhir yang menyucikan jati diri sang pahlawan.', targetPacing: 'climax' },
      { actNumber: 3, actName: 'Kepulangan', beatName: '12. Kembali Membawa Eliksir', description: 'Pulang membawa berkah bagi masyarakatnya.', targetPacing: 'slow' },
    ]
  },
  non_linear_mystery: {
    name: 'Struktur Non-Linear / Misteri Detektif',
    description: 'Mengaburkan kronologi dengan kilas balik (flashback), pengungkapan petunjuk tersembunyi, dan unreliable narrator.',
    beats: [
      { actNumber: 1, actName: 'Fase Investigasi Awal', beatName: '1. Penemuan Kasus / Tubuh Korban', description: 'Misteri dibuka langsung pada dampak kejahatan terbesar.', targetPacing: 'fast' },
      { actNumber: 1, actName: 'Fase Investigasi Awal', beatName: '2. Kilas Balik 1: Jam-Jam Sebelum Kejadian', description: 'Melihat interaksi misterius sebelum tragedi.', targetPacing: 'medium' },
      { actNumber: 1, actName: 'Fase Investigasi Awal', beatName: '3. Red Herring (Petunjuk Palsu)', description: 'Tersangka yang tampak paling bersalah namun memiliki alibi.', targetPacing: 'medium' },
      { actNumber: 2, actName: 'Fase Penggalian & Rahasia', beatName: '4. Pembongkaran Motif Tersembunyi', description: 'Mengungkap jaringan utang, dendam lama, atau rahasia silsilah.', targetPacing: 'slow' },
      { actNumber: 2, actName: 'Fase Penggalian & Rahasia', beatName: '5. Kilas Balik 2: Titik Buta Masa Lalu', description: 'Peristiwa puluhan tahun lalu yang melahirkan konspirasi.', targetPacing: 'medium' },
      { actNumber: 2, actName: 'Fase Penggalian & Rahasia', beatName: '6. Ancaman Nyata / Pembunuhan Kedua', description: 'Pelaku mulai bergerak untuk melenyapkan saksi.', targetPacing: 'fast' },
      { actNumber: 3, actName: 'Fase Deduksi & Konfrontasi', beatName: '7. Keping Puzzle yang Terlewat', description: 'Detektif/tokoh menyadari anomali kecil yang selama ini diabaikan.', targetPacing: 'climax' },
      { actNumber: 3, actName: 'Fase Deduksi & Konfrontasi', beatName: '8. Konfrontasi & Rekonstruksi Utuh', description: 'Pelaku asli disudutkan, rekonstruksi adegan sebenarnya terungkap.', targetPacing: 'climax' },
      { actNumber: 3, actName: 'Fase Deduksi & Konfrontasi', beatName: '9. Aftermath & Dampak Moral', description: 'Apakah keadilan sejati tercapai atau harus ada kompromi pahit?', targetPacing: 'slow' },
    ]
  },
  custom: {
    name: 'Kustom Bebas',
    description: 'Buat sendiri struktur beat sheet dan bab sesuai kebutuhan naskahmu.',
    beats: [
      { actNumber: 1, actName: 'Bagian Awal', beatName: 'Pembuka', description: 'Pengenalan situasi dan premis.', targetPacing: 'medium' },
      { actNumber: 2, actName: 'Bagian Tengah', beatName: 'Eskalasi', description: 'Konflik dan pengembangan.', targetPacing: 'fast' },
      { actNumber: 3, actName: 'Bagian Akhir', beatName: 'Klimaks & Penutup', description: 'Resolusi cerita.', targetPacing: 'climax' },
    ]
  }
};
