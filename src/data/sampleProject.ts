import { NovelProject } from '@/types/novel';

export const SAMPLE_NOVEL_PROJECT: NovelProject = {
  id: 'proj-kutukan-daulah',
  title: 'Kutukan Daulah Terakhir',
  subtitle: 'Konspirasi di Balik Runtuhnya Kota Seribu Menara',
  author: 'Ajiry',
  genre: 'historical_fiction',
  customGenreName: 'Fiksi Sejarah Geopolitik & Misteri Fiqh',
  language: 'id',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  currentPhase: 'prewriting',
  prewritingSubTab: 'premise',
  activeChapterId: 'chap-1',
  activeRevisionChapterId: 'chap-1',
  activeRevisionPass: 'line_edit',
  
  premise: {
    logline: 'Seorang qadhi muda yang idealis menemukan naskah fatwa palsu di arsip istana yang membenarkan penyerahan benteng perbatasan, memaksanya memilih antara menyelamatkan ribuan nyawa rakyat atau membongkar pengkhianatan wazir agung yang mengancam kehancuran daulah.',
    protagonist: 'Tariq bin Mansur, qadhi muda pengarsip mahkamah tinggi yang berpegang teguh pada prinsip keadilan fiqh hukum publik.',
    goal: 'Membuktikan keabsahan fatwa perbatasan dan mengungkap dalang konspirasi di balik perundingan damai gelap dengan kekaisaran musuh.',
    obstacle: 'Birokrasi istana yang korup, ancaman pembunuh bayaran bayang-bayang (Hashashin), dan dilema moral bahwa pembongkaran skandal ini bisa memicu perang saudara sebelum musuh tiba.',
    stakes: 'Jika gagal, kota perbatasan jatuh ke tangan musuh tanpa perlawanan dan seluruh rakyat dijadikan budak jajahan; jika tergesa-gesa, daulah pecah dari dalam.',
    elevatorPitch: 'Kutukan Daulah Terakhir menggabungkan intrik geopolitik ala The Name of the Rose dengan ketegangan diplomatik Timur Tengah abad pertengahan. Cerita ini menelusuri bagaimana selembar stempel stempel segel lilin palsu bisa menentukan nasib sebuah imperium.',
    coreConflict: 'Konflik internal antara ketaatan mutlak pada hierarki kekuasaan (maslahat stabilitas semu) melawan keberanian menegakkan kebenaran faktual (maslahat keadilan sejati).'
  },

  researchItems: [
    {
      id: 'res-1',
      title: 'Protokol Penyegelan Piagam Istana Abad ke-13',
      category: 'primary_source',
      content: 'Stempel segel lilin merah menggunakan campuran damar khusus dan serbuk delima langka. Hanya juru tulis bersumpah yang memiliki cincin cap berukir kaligrafi kufik terbalik.',
      tags: ['arsip', 'stempel', 'protokol'],
      sourceUrlOrCitation: 'Kitab Subh al-Asha fi Sinaat al-Insha karya Al-Qalqashandi',
      createdAt: new Date().toISOString()
    },
    {
      id: 'res-2',
      title: 'Hukum Fiqh Siyasah Mengenai Perjanjian Gencatan Senjata',
      category: 'theological_fiqh',
      content: 'Klausul Muwadaah (gencatan senjata) mewajibkan persetujuan ahlul halli wal aqdi dan dilarang menyertakan syarat penyerahan kaum mustadh’afin tanpa jaminan keamanan mutlak.',
      tags: ['fiqh', 'hukum', 'siyasah'],
      sourceUrlOrCitation: 'Al-Ahkam as-Sultaniyyah - Al-Mawardi',
      createdAt: new Date().toISOString()
    },
    {
      id: 'res-3',
      title: 'Sistem Pengairan dan Pintu Air Benteng Qal’at ar-Rih',
      category: 'material_culture',
      content: 'Benteng pertahanan mengandalkan bendungan hidrolik kuno peninggalan Persia yang bisa membanjiri parit keliling dalam waktu setengah jam jika katup utama dibuka.',
      tags: ['benteng', 'geografi', 'arsitektur'],
      sourceUrlOrCitation: 'Catatan Perjalanan Ibnu Jubayr',
      createdAt: new Date().toISOString()
    }
  ],

  timelineEvents: [
    {
      id: 'time-1',
      eraOrDate: 'Bulan Rajab 655 H (6 Bulan Sebelum Cerita)',
      title: 'Kematian Misterius Mufti Besar Al-Baqir',
      description: 'Diumumkan wafat karena sakit tua, namun beberapa catatan fatwa terakhirnya lenyap dari perpustakaan mahkamah.',
      impactOnPlot: 'Membuka jalan bagi Wazir Kamil mengangkat qadhi pengganti yang mudah dikendalikan.',
      orderIndex: 1
    },
    {
      id: 'time-2',
      eraOrDate: '15 Syaban 655 H (Awal Cerita)',
      title: 'Penemuan Gulungan Segel Ungu',
      description: 'Tariq menemukan naskah fatwa rahasia terselip di balik lemari kitab ushul fiqh.',
      impactOnPlot: 'Memicu penyelidikan rahasia Tariq.',
      orderIndex: 2
    },
    {
      id: 'time-3',
      eraOrDate: '10 Ramadhan 655 H (Klimaks Cerita)',
      title: 'Tenggat Waktu Ratifikasi Perjanjian Damai',
      description: 'Sidang agung dewan daulah untuk menandatangani pakta penyerahan benteng perbatasan.',
      impactOnPlot: 'Batas waktu terakhir Tariq harus membongkar naskah asli di hadapan Sultan.',
      orderIndex: 3
    }
  ],

  theme: {
    centralTheme: 'Integritas Hukum di Hadapan Kepentingan Pragmatis Kekuasaan',
    coreMessage: 'Stabilitas yang dibangun di atas kebohongan dan kompromi palsu pada akhirnya akan melahirkan keruntuhan yang jauh lebih binasa daripada keberanian menghadapi kenyataan pahit.',
    subThemes: ['Harga dari kepatuhan buta', 'Batas ijtihad politik', 'Persahabatan yang diuji oleh ideologi'],
    moralDilemma: 'Apakah boleh menyembunyikan kejahatan penguasa demi mencegah kepanikan massal rakyat yang rentan?',
    symbolicMotifs: ['Tinta jelaga vs Tinta emas', 'Pintu air benteng yang perlahan bocor', 'Burung elang pengirim pesan yang terpotong sayapnya'],
    filteringQuestions: 'Apakah adegan ini memperlihatkan gesekan antara teks hukum kaku dengan realitas manusiawi yang berdarah-daging?'
  },

  characters: [
    {
      id: 'char-1',
      name: 'Tariq bin Mansur',
      role: 'protagonist',
      age: '29 tahun',
      occupation: 'Qadhi Muda & Pengarsip Mahkamah Tinggi',
      appearance: 'Tubuh ramping, jubah katun kelabu sederhana, bekas noda tinta permanen di jari telunjuk kanan, tatapan tajam dan penuh perhitungan.',
      backstory: 'Anak pedagang perkamen yang dididik beasiswa di madrasah agung. Menghormati mendiang Mufti Al-Baqir seperti ayahnya sendiri.',
      internalMotivation: 'Membuktikan bahwa hukum tegak bukan untuk melayani penguasa, melainkan melindungi orang-orang lemah yang tak bersuara.',
      externalGoal: 'Mencegah naskah fatwa palsu diratifikasi oleh Sultan dan membongkar jaringan pengkhianat.',
      fatalFlaw: 'Terlalu kaku dan naif meyakini bahwa semua orang akan tunduk pada bukti tekstual semata, sering meremehkan kelihaian manuver politik gelap.',
      arcStart: 'Seorang birokrat kutubuku yang percaya sistem kehakiman selalu bekerja sempurna jika aturan ditegakkan.',
      arcClimax: 'Menyadari bahwa demi menegakkan kebenaran, ia harus berani mempertaruhkan nyawa dan melanggar perintah atasan langsungnya.',
      arcEnd: 'Menjadi pemimpin sejati yang matang, mengerti batas antara hukum yang adil dengan kebijaksanaan praktis di medan laga.',
      voiceTraits: 'Bahasa Indonesia sastrawi yang santun, presisi, menggunakan perumpamaan fiqh dan logika analitis, jarang meninggikan suara.',
      relationships: [
        {
          targetCharacterId: 'char-2',
          relationshipType: 'Atasan & Musuh Terselubung',
          description: 'Wazir Kamil menganggap Tariq alat yang berguna, namun waspada terhadap ketelitian anak muda ini.',
          dynamicChange: 'Dari hubungan mentor-murid formal menjadi duel kecerdasan mematikan.'
        },
        {
          targetCharacterId: 'char-3',
          relationshipType: 'Sahabat Masa Kecil & Sekutu Militer',
          description: 'Malik adalah komandan garnisun gerbang selatan yang berdarah panas.',
          dynamicChange: 'Sempat berselisih paham saat Malik mendesak pemberontakan senjata, namun bersatu di babak akhir.'
        }
      ],
      avatarColor: '#10b981'
    },
    {
      id: 'char-2',
      name: 'Wazir Kamil al-Jahdari',
      role: 'antagonist',
      age: '54 tahun',
      occupation: 'Wazir Agung & Kepala Diwan Khusus',
      appearance: 'Jubah sutra ungu berbordir benang perak, janggut rapi terawat wangi gaharu, pembawaan tenang berwibawa namun menyimpan sorot mata dingin.',
      backstory: 'Berasal dari dinasti birokrat tua. Pernah menyaksikan keluarganya dibantai dalam perang saudara 20 tahun lalu, membuatnya trauma pada kekacauan.',
      internalMotivation: 'Mencegah kehancuran total daulah dengan cara apa pun, bahkan jika harus menjual benteng perbatasan kepada kekaisaran asing secara diam-diam.',
      externalGoal: 'Memastikan perjanjian damai ditandatangani dan melenyapkan siapa pun yang memegang dokumen fatwa asli.',
      fatalFlaw: 'Pragmatisme berlebihan yang menumpulkan nuraninya; meyakini bahwa pengorbanan rakyat kecil hanyalah angka statistik.',
      arcStart: 'Pemegang kendali penuh yang merasa tindakannya adalah penyelamatan daulah yang paling logis.',
      arcClimax: 'Terpojok saat rahasia keuntungannya dari upeti musuh dipertanyakan di hadapan seluruh dewan militer.',
      arcEnd: 'Tumbang oleh bukti hukum yang ia anggap sepele, terasing dalam kehinaan sejarah.',
      voiceTraits: 'Halus, diplomatik, bernada mengayomi tapi selalu tersirat ancaman otoritas terselubung.',
      relationships: [],
      avatarColor: '#ef4444'
    },
    {
      id: 'char-3',
      name: 'Malik bin Ziyad',
      role: 'deuteragonist',
      age: '31 tahun',
      occupation: 'Komandan Garnisun Pengawal Gerbang Selatan',
      appearance: 'Berperawakan kekar, baju zirah rantai besi tembaga, bekas luka gores pedang di pipi kiri.',
      backstory: 'Prajurit garis depan yang naik pangkat karena keberanian tempur, muak dengan intrik istana.',
      internalMotivation: 'Melindungi prajurit bawahannya agar tidak dikorbankan sebagai umpan sia-sia oleh para politisi istana.',
      externalGoal: 'Mendukung Tariq membawa bukti ke hadapan Sultan sebelum pasukannya diperintahkan mundur tanpa perlawanan.',
      fatalFlaw: 'Cepat tersulut amarah dan cenderung bertindak gegabah dengan pedang sebelum memeriksa strategi.',
      arcStart: 'Prajurit frustrasi yang bersiap membelot atau melakukan kudeta putus asa.',
      arcClimax: 'Menahan diri dari memenggal Wazir secara langsung demi membiarkan proses hukum membuktikan kebenaran.',
      arcEnd: 'Menjadi panglima agung baru yang menjunjung tinggi supremasi hukum.',
      voiceTraits: 'Tegas, lugas, bicaranya ceplas-ceplos tanpa basa-basi istana, kerap melontarkan humor kasar prajurit.',
      relationships: [],
      avatarColor: '#3b82f6'
    }
  ],

  worldEntries: [
    {
      id: 'world-1',
      category: 'social_political',
      title: 'Struktur Diwan dan Mahkamah Agung Daulah',
      summary: 'Kekuasaan tertinggi ada pada Sultan, namun fatwa keagamaan Mufti Besar dan stempel Wazir Agung memiliki hak veto atas pengeluaran anggaran perang.',
      detailedRules: '1. Sidang dewan hanya sah jika dihadiri tiga pilar: Wazir, Mufti/Qadhi Mahkamah, dan Panglima Jund.\n2. Segala keputusan luar negeri wajib dicatat dalam naskah rangkap tiga bertinta tahan air.',
      secretsOrTaboos: 'Ada faksi rahasia di dalam Diwan bernama "Lingkaran Gaharu" yang menerima suap perak batangan dari duta besar asing.',
      tags: ['politik', 'hukum', 'mahkamah']
    },
    {
      id: 'world-2',
      category: 'geography',
      title: 'Benteng Qal’at ar-Rih (Kastel Angin)',
      summary: 'Benteng batu kapur raksasa yang menjaga lembah sempit penghubung padang pasir utara dengan oasis ibu kota.',
      detailedRules: 'Benteng ini tidak bisa ditembus dari luar selama pasokan air dari bendungan hidrolik bawah tanah tidak diputus dari ruang katup pusat.',
      secretsOrTaboos: 'Terdapat lorong penyelundup rahasia di bawah menara barat yang hanya diketahui oleh keluarga pengarsip kuno.',
      tags: ['benteng', 'militer', 'lokasi']
    }
  ],

  outlineType: 'three_act',
  beats: [
    { id: 'b-1', actNumber: 1, actName: 'Babak 1: Setup', beatName: '1. Bau Tinta di Ruang Arsip', description: 'Pengenalan Tariq, rutinitas pengarsipan, dan bau aneh pada gulungan perkamen segel ungu.', targetPacing: 'slow' },
    { id: 'b-2', actNumber: 1, actName: 'Babak 1: Setup', beatName: '2. Kematian yang Tak Masuk Akal', description: 'Tariq menemukan catatan medis Mufti Al-Baqir yang disembunyikan.', targetPacing: 'medium' },
    { id: 'b-3', actNumber: 1, actName: 'Babak 1: Setup', beatName: '3. Garis Batas Tanpa Jalan Pulang', description: 'Rumah kontrakan Tariq digeledah preman bersenjata; Malik menyelamatkannya.', targetPacing: 'fast' },
    { id: 'b-4', actNumber: 2, actName: 'Babak 2: Konfrontasi', beatName: '4. Rahasia Pembuat Segel', description: 'Penyelidikan ke distrik pengrajin untuk melacak cincin stempel tiruan.', targetPacing: 'medium' },
    { id: 'b-5', actNumber: 2, actName: 'Babak 2: Konfrontasi', beatName: '5. Midpoint: Titik Balik di Menara Barat', description: 'Tariq menyadari pengkhianat bukan jenderal militer, melainkan Wazir Kamil sendiri.', targetPacing: 'climax' },
    { id: 'b-6', actNumber: 2, actName: 'Babak 2: Konfrontasi', beatName: '6. Surat Perintah Eksekusi', description: 'Tariq difitnah sebagai mata-mata musuh dan masuk daftar buronan istana.', targetPacing: 'fast' },
    { id: 'b-7', actNumber: 2, actName: 'Babak 2: Konfrontasi', beatName: '7. Malam Gelap Jiwa', description: 'Bersembunyi di gorong-gorong kota tua, hampir membakar naskah demi keselamatan diri.', targetPacing: 'slow' },
    { id: 'b-8', actNumber: 3, actName: 'Babak 3: Resolusi', beatName: '8. Mengguncang Sidang Dewan Agung', description: 'Penyusupan ke aula istana saat Sultan bersiap menandatangani pakta perdamaian.', targetPacing: 'climax' },
    { id: 'b-9', actNumber: 3, actName: 'Babak 3: Resolusi', beatName: '9. Fajar Baru di Atas Menara', description: 'Kebohongan terbongkar, benteng dipertahankan, babak baru penegakan hukum dimulai.', targetPacing: 'slow' }
  ],

  chapters: [
    {
      id: 'chap-1',
      chapterNumber: 1,
      title: 'Bab 1: Bau Tinta di Balik Lemari Gaharu',
      beatId: 'b-1',
      povCharacterId: 'char-1',
      settingLocation: 'Ruang Arsip Mahkamah Tinggi, Lantai Bawah Tanah',
      summary: 'Tariq bin Mansur memeriksa inventaris naskah lama di malam hari dan menemukan stempel segel merah yang tintanya belum sepenuhnya mengeras pada dokumen fatwa yang seharusnya berumur tiga tahun.',
      keyEvents: [
        'Tariq menyalakan lampu minyak zaitun di lorong arsip yang berdebu.',
        'Menemukan perbedaan ketebalan perkamen pada map berkas perbatasan Qal’at ar-Rih.',
        'Menganalisis serbuk delima palsu pada cap stempel menggunakan lup kaca cembung.',
        'Mendengar langkah kaki patroli pengawal wazir mendekati pintu arsip.'
      ],
      emotionalShift: 'Dari kejenuhan administratif rutin menjadi kecurigaan yang mencekam dan kewaspadaan tinggi.',
      targetWordCount: 1500,
      status: 'drafting'
    },
    {
      id: 'chap-2',
      chapterNumber: 2,
      title: 'Bab 2: Bayang-Bayang di Pasar Lilin',
      beatId: 'b-2',
      povCharacterId: 'char-1',
      settingLocation: 'Pasar Lilin dan Pembuat Damar Kota Tua',
      summary: 'Tariq menemui pengrajin damar tua untuk menanyakan asal usul lilin merah beraroma melati palsu.',
      keyEvents: [
        'Menyamar dengan gamis kusam menyusuri lorong pasar malam.',
        'Pengrajin tua ketakutan saat melihat contoh serpihan lilin.',
        'Pengrajin mengakui pesanan misterius datang dari utusan istana dalam.',
        'Pengejaran di atap pasar oleh pembunuh berbelati lengkung.'
      ],
      emotionalShift: 'Rasa ingin tahu akademis berubah menjadi teror ancaman pembunuhan nyata.',
      targetWordCount: 1800,
      status: 'planned'
    },
    {
      id: 'chap-3',
      chapterNumber: 3,
      title: 'Bab 3: Pedang yang Menolak Berkhianat',
      beatId: 'b-3',
      povCharacterId: 'char-3',
      settingLocation: 'Markas Garnisun Gerbang Selatan',
      summary: 'Komandan Malik menerima surat perintah mutasi mendadak yang memintanya menarik pasukan mundur dari pos pengintaian jurang.',
      keyEvents: [
        'Malik mencurigai stempel wazir tanpa cap pengesahan mufti.',
        'Tariq tiba di markas dengan luka sayat di lengan.',
        'Keduanya membandingkan naskah dan menyatukan kepingan konspirasi.'
      ],
      emotionalShift: 'Kekesalan prajurit beralih menjadi tekad perlawanan bersama.',
      targetWordCount: 1600,
      status: 'planned'
    }
  ],

  synopsis: {
    hookParagraph: 'Ketika sebuah imperium di ambang kepungan, ancaman terbesar tidak selalu datang dari pasukan berkuda di luar gerbang, melainkan dari guratan tinta seorang pengkhianat di atas meja marmer istana.',
    fullSynopsisText: `Kutukan Daulah Terakhir berkisah tentang Tariq bin Mansur, seorang qadhi muda pengarsip di Mahkamah Tinggi yang tanpa sengaja menemukan sebuah dokumen fatwa yang memalsukan persetujuan mendiang Mufti Besar untuk menyerahkan Benteng Qal'at ar-Rih kepada kekaisaran tetangga dengan dalih gencatan senjata darurat.

Didorong oleh rasa hormat kepada mendiang gurunya dan kepatuhan mutlak pada prinsip keadilan fiqh siyasah, Tariq memulai investigasi klandestin. Penyelidikan ini membawanya menelusuri lorong-lorong gelap pasar kimiawi, bengkel pembuat stempel terlarang, hingga berhadapan dengan jaringan pembunuh bayaran. Ia menemukan bahwa Wazir Kamil, orang nomor dua paling berkuasa di kekaisaran, telah membuat kesepakatan gelap untuk membagi wilayah kekuasaan demi menyelamatkan aset dinasti pribadinya.

Bersama sahabat masa kecilnya, Komandan Malik bin Ziyad, Tariq harus melewati kepungan fitnah, buronan penjara bawah tanah, dan keraguan nurani. Pada malam puncak sebelum Sultan menandatangani pakta perdamaian beracun, Tariq menyusup ke dalam aula agung istana untuk menghadapkan Wazir Kamil langsung dengan bukti forensik naskah asli.

Klimaks cerita memperlihatkan duel argumen hukum dan politik di hadapan Sultan dan para jenderal, di mana Tariq berhasil membuktikan bahwa keselamatan daulah tidak dapat dibeli dengan menjual kedaulatan dan keadilan. Novel ditutup dengan ditegakkannya kembali mahkamah independen dan kesiapan rakyat mempertahankan tanah air mereka dengan kepala tegak.`,
    targetAudience: 'Pembaca dewasa muda dan dewasa penyuka fiksi sejarah geopolitik berbobot, pecinta misteri detektif berlatar dunia Islam klasik, dan penggemar intrik intrik kekuasaan filosofis.',
    genre: 'Historical Fiction / Geopolitical Mystery',
    comparativeTitles: 'The Name of the Rose karya Umberto Eco bertemu The City & The City karya China Miéville.',
    endingSummary: 'Kebenaran dokumen fatwa asli terungkap tepat di detik-detik sebelum pena Sultan menyentuh perkamen ratifikasi. Wazir Kamil dicopot dan diadili secara terbuka, sementara benteng perbatasan berhasil dipertahankan dengan strategi hidrolik kuno.'
  },

  drafts: {
    'chap-1': {
      id: 'draft-chap-1',
      chapterId: 'chap-1',
      title: 'Bab 1: Bau Tinta di Balik Lemari Gaharu',
      contentHtml: `<p>Aroma minyak zaitun terbakar selalu berhasil menenangkan saraf Tariq bin Mansur, kecuali malam ini. Di kedalaman ruang arsip bawah tanah Mahkamah Tinggi—tempat di mana suara derap kereta kuda di jalanan ibu kota hanya terdengar seperti dengung lebah samar—hawa dingin merayap naik dari celah ubin pualam, menusuk langsung ke balik jubah katun kelabunya.</p>
<p>Lampu minyak berbahan kuningan di tangan kirinya bergetar pelan. Cahaya kuning temaram menyinari deretan lemari kayu gaharu setinggi tiga depa, tempat ribuan gulungan perkamen disimpan menurut tarikh dan segel urusan.</p>
<p>Tariq menghentikan langkahnya di depan rak bertanda huruf Jim: <em>Jund wa Thughur</em>—Urusan Ketentaraan dan Benteng Perbatasan.</p>
<p>Ia menarik napas panjang. Jemarinya yang berlepotan noda tinta permanen menyusuri punggung-punggung tabung kulit kambing. Matanya tertuju pada sebuah silinder kayu cendana yang seharusnya berisi salinan fatwa darurat perbatasan Qal’at ar-Rih yang diterbitkan tiga purnama sebelum wafatnya Mufti Besar Al-Baqir.</p>
<p>Ketika penutup tabung dibuka, bunyi desau udara kering menyemburkan bau yang janggal. Bukan wangi lapuk khas debu perkamen tua berumur tiga tahun, melainkan aroma manis yang pekat: getah damar segar bercampur ekstrak bunga melati.</p>
<p>Tariq menggelar perkamen tebal itu di atas meja baca marmer. Ia menyalakan lilin kedua agar bayangan kepalanya tidak menutupi tulisan kaligrafi kufik yang tertera rapi.</p>
<p>Di bagian bawah naskah, tepat di sebelah tanda tangan sang Mufti, tertera cap stempel lilin bundar berwarna merah tua. Tariq mengeluarkan kaca pembesar berlapis perak dari saku dalamnya. Ia mendekatkan lensa ke permukaan stempel lilin tersebut.</p>
<p>"Mustahil," bisiknya lirih ke udara hampa.</p>
<p>Lilin segel resmi Mahkamah Tinggi selalu menggunakan campuran serbuk batu delima dari Khurasan yang menghasilkan kilau ungu tembus pandang jika disorot api. Namun cap di hadapannya ini hanya menggunakan serbuk bata merah murahan yang disamarkan dengan minyak melati untuk menutupi bau arangnya. Lebih mengerikan lagi, saat ujung kukunya menyentuh tepi lilin, bahan itu masih terasa sedikit kenyal. Segel ini belum berumur tiga tahun. Segel ini baru dicap tidak lebih dari tiga hari yang lalu.</p>
<p>Dada Tariq berdegup kencang bagai tabuh perang. Naskah ini adalah fatwa yang menyatakan bahwa menyerahkan pintu air Benteng Qal’at ar-Rih kepada perwakilan kekaisaran utara adalah tindakan yang dibenarkan menurut syariat demi menghindari pertumpahan darah.</p>
<p>Seseorang telah mengganti fatwa asli sang Mufti dengan naskah palsu yang melegalkan pengkhianatan.</p>
<p>Tepat pada saat itu, bunyi derap sepatu bot berpelat besi terdengar menuruni tangga batu menuju ruang arsip. Jumlahnya bukan satu atau dua, melainkan regu pengawal bersenjata lengkap.</p>`,
      contentPlainText: `Aroma minyak zaitun terbakar selalu berhasil menenangkan saraf Tariq bin Mansur, kecuali malam ini. Di kedalaman ruang arsip bawah tanah Mahkamah Tinggi—tempat di mana suara derap kereta kuda di jalanan ibu kota hanya terdengar seperti dengung lebah samar—hawa dingin merayap naik dari celah ubin pualam, menusuk langsung ke balik jubah katun kelabunya.

Lampu minyak berbahan kuningan di tangan kirinya bergetar pelan. Cahaya kuning temaram menyinari deretan lemari kayu gaharu setinggi tiga depa, tempat ribuan gulungan perkamen disimpan menurut tarikh dan segel urusan.

Tariq menghentikan langkahnya di depan rak bertanda huruf Jim: Jund wa Thughur—Urusan Ketentaraan dan Benteng Perbatasan.

Ia menarik napas panjang. Jemarinya yang berlepotan noda tinta permanen menyusuri punggung-punggung tabung kulit kambing. Matanya tertuju pada sebuah silinder kayu cendana yang seharusnya berisi salinan fatwa darurat perbatasan Qal’at ar-Rih yang diterbitkan tiga purnama sebelum wafatnya Mufti Besar Al-Baqir.

Ketika penutup tabung dibuka, bunyi desau udara kering menyemburkan bau yang janggal. Bukan wangi lapuk khas debu perkamen tua berumur tiga tahun, melainkan aroma manis yang pekat: getah damar segar bercampur ekstrak bunga melati.

Tariq menggelar perkamen tebal itu di atas meja baca marmer. Ia menyalakan lilin kedua agar bayangan kepalanya tidak menutupi tulisan kaligrafi kufik yang tertera rapi.

Di bagian bawah naskah, tepat di sebelah tanda tangan sang Mufti, tertera cap stempel lilin bundar berwarna merah tua. Tariq mengeluarkan kaca pembesar berlapis perak dari saku dalamnya. Ia mendekatkan lensa ke permukaan stempel lilin tersebut.

"Mustahil," bisiknya lirih ke udara hampa.

Lilin segel resmi Mahkamah Tinggi selalu menggunakan campuran serbuk batu delima dari Khurasan yang menghasilkan kilau ungu tembus pandang jika disorot api. Namun cap di hadapannya ini hanya menggunakan serbuk bata merah murahan yang disamarkan dengan minyak melati untuk menutupi bau arangnya. Lebih mengerikan lagi, saat ujung kukunya menyentuh tepi lilin, bahan itu masih terasa sedikit kenyal. Segel ini belum berumur tiga tahun. Segel ini baru dicap tidak lebih dari tiga hari yang lalu.

Dada Tariq berdegup kencang bagai tabuh perang. Naskah ini adalah fatwa yang menyatakan bahwa menyerahkan pintu air Benteng Qal’at ar-Rih kepada perwakilan kekaisaran utara adalah tindakan yang dibenarkan menurut syariat demi menghindari pertumpahan darah.

Seseorang telah mengganti fatwa asli sang Mufti dengan naskah palsu yang melegalkan pengkhianatan.

Tepat pada saat itu, bunyi derap sepatu bot berpelat besi terdengar menuruni tangga batu menuju ruang arsip. Jumlahnya bukan satu atau dua, melainkan regu pengawal bersenjata lengkap.`,
      wordCount: 378,
      notes: 'Adegan pembuka untuk membangun atmosfer misteri dan taruhan geopolitik. Perlu diperpanjang dengan adegan penyelamatan diri Tariq dan pertemuan pertama dengan Malik di lorong rahasia.',
      lastSavedAt: new Date().toISOString(),
      isCompleted: false
    }
  },

  revisionReports: {
    'chap-1': [
      {
        id: 'rev-1',
        chapterId: 'chap-1',
        passType: 'line_edit',
        overallScore: 92,
        summary: 'Pacing pembuka sangat kuat, suasana misteri terbangun dengan baik melalui detail indrawi (bau damar, kilau ungu serbuk delima). Ada satu pelanggaran aturan teknis (penggunaan em-dash).',
        strengths: [
          'Detail indrawi (bau minyak zaitun, getah damar, suara derap kaki) sangat hidup.',
          'Prinsip show-don\'t-tell diterapkan efektif saat Tariq menguji keaslian lilin segel.',
          'Ketegangan di akhir adegan (cliffhanger) memikat pembaca untuk lanjut ke bab berikutnya.'
        ],
        weaknesses: [
          'Terdapat tanda em-dash (—) di paragraf 1 yang melanggar aturan gaya penulisan novel ini.',
          'Panjang kata masih 378 kata dari target 1500 kata; butuh pengembangan adegan interaksi atau pelarian.'
        ],
        items: [
          {
            id: 'item-1',
            type: 'em_dash_detected',
            severity: 'warning',
            locationSnippet: 'Mahkamah Tinggi—tempat di mana suara derap...',
            issue: 'Ditemukan tanda em dash (—). Sesuai aturan penulisan yang ditetapkan, tanda em dash dilarang.',
            suggestion: 'Ganti dengan tanda koma atau pecah menjadi dua klausa terpisah.',
            replacementText: 'Mahkamah Tinggi, tempat suara derap kereta kuda di jalanan ibu kota hanya terdengar seperti dengung lebah samar, hawa dingin...',
            applied: false
          },
          {
            id: 'item-2',
            type: 'pacing',
            severity: 'info',
            locationSnippet: 'Tepat pada saat itu, bunyi derap sepatu bot...',
            issue: 'Peralihan menuju bahaya terasa sedikit mendadak tanpa ada petunjuk suara pintu gerbang atas dibuka.',
            suggestion: 'Tambahkan satu kalimat pendengar suara engsel pintu besi di kejauhan sebelum derap langkah terdengar.',
            applied: false
          }
        ],
        createdAt: new Date().toISOString()
      }
    ]
  },

  snapshots: {},
  generationLogs: [],
  rules: {
    noEmDash: true,
    pov: 'third_limited',
    tense: 'past',
    narratorVoice: 'Literer, tajam, penuh detail material dan indrawi, ritmis, berbasis atmosfer sejarah Timur Tengah klasik yang otentik.',
    showDontTellPriority: true,
    prohibitedWords: ['tiba-tiba', 'merasa sangat sedih', 'sangat marah', 'secara harfiah', 'tak disangka-sangka'],
    dialogueStyle: 'Bahasa Indonesia sastrawi yang santun dan berbobot, dialog karakter mencerminkan status sosial dan kepakaran fiqh/militer mereka.',
    customInstructions: 'Jaga akurasi terminologi sejarah Arab/Persia abad pertengahan. Jangan gunakan istilah modern seperti "konfirmasi", "protokol digital", "birokrasi modern". Gunakan "diwan", "qalam", "nisbah", "ijazat", "maslahat", "wilayah". JANGAN GUNAKAN TANDA PISAH EM DASH (—).',
    dailyWordTarget: 1000
  }
};
