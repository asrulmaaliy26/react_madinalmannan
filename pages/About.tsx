
import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';

import { fetchNewsByCategory } from '../services/api';
import { AboutData, NewsItem } from '../types';
import { Target, Flag, Award, ShieldCheck, Heart, Star, BookOpen, GraduationCap, Calendar, Users, Building, Loader2, MapPin, Phone, User, BookMarked } from 'lucide-react';
import { LevelContext } from '../App';
import { useLevelConfig } from '../hooks/useLevelConfig';

const About: React.FC = () => {
  const { section } = useParams<{ section: string }>();
  const { activeLevel } = useContext(LevelContext);
  const LEVEL_CONFIG = useLevelConfig();
  const [aboutData, setAboutData] = React.useState<AboutData | null>(null);
  const [loading, setLoading] = React.useState(true);

  // State for Prestasi
  const [prestasiData, setPrestasiData] = React.useState<NewsItem[]>([]);
  const [prestasiLoading, setPrestasiLoading] = React.useState(false);

  React.useEffect(() => {
    const loadData = () => {
      setLoading(true);
      try {
        // Construct default data locally from ENV variables
        const envVisi = import.meta.env.VITE_ABOUT_VISI || '';
        const envHistory = import.meta.env.VITE_ABOUT_HISTORY || '';
        const envMisiStr = import.meta.env.VITE_ABOUT_MISI;
        const envStrukturStr = import.meta.env.VITE_ABOUT_STRUKTUR;

        const MADIN_MISI_DEFAULT = [
          "Membekali santri dalam ilmu agama ala Ahlussunnah Wal Jama'ah",
          "Menanamkan nilai-nilai syariah dalam kehidupan sehari-hari",
          "Mendidik dan membimbing santri dalam mengimplementasikan Al Qur'an dan Sunnah",
          "Mencetak generasi muda yang cerdas, moderat, intelektual, berwawasan islami, dan berakhlak qur'ani",
        ];

        let misi: string[] = MADIN_MISI_DEFAULT;
        try {
          if (envMisiStr) {
            const parsed = JSON.parse(envMisiStr);
            if (Array.isArray(parsed) && parsed.length > 0) misi = parsed;
          }
        } catch (e) {
          // Gunakan default jika parsing gagal
        }

        let struktur = {
          pimpinan: 'Pimpinan',
          nama: '-',
          staff: []
        };
        try {
          if (envStrukturStr) struktur = JSON.parse(envStrukturStr);
        } catch (e) {
          console.error('Error parsing VITE_ABOUT_STRUKTUR', e);
        }

        const data: AboutData = {
          visi: envVisi,
          history: envHistory,
          misi,
          struktur,
        };

        setAboutData(data);
      } catch (error) {
        console.error("Failed to load about data from env", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeLevel]);

  // Fetch Prestasi Data when section is 'prestasi'
  React.useEffect(() => {
    if (section === 'prestasi') {
      const loadPrestasi = async () => {
        setPrestasiLoading(true);
        try {
          // Fetch raw data for category 'Prestasi'
          // Note: The category name must match exactly what is in the DB, usually 'Prestasi'
          const news = await fetchNewsByCategory('Prestasi');

          // Filter by Active Level if not UMUM
          let filtered = news;
          if (activeLevel !== 'UMUM') {
            filtered = news.filter(n => n.jenjang === activeLevel);
          }

          setPrestasiData(filtered);
        } catch (error) {
          console.error("Failed to load prestasi data", error);
          setPrestasiData([]);
        } finally {
          setPrestasiLoading(false);
        }
      };

      loadPrestasi();
    }
  }, [section, activeLevel]);

  const theme = LEVEL_CONFIG[activeLevel];
  const content = aboutData;

  const isYayasan = activeLevel === 'UMUM';

  const renderVisiMisi = () => {
    const coreValues = [
      { title: 'Benteng Spiritual', desc: 'Membentuk imunitas moral santri di era modern.' },
      { title: 'Way of Life', desc: "Menjadikan Al-Qur'an sebagai pedoman hidup utama." },
      { title: 'Karakter Holistik', desc: 'Pengembangan spiritual, emosional, dan sosial.' },
      { title: 'Cinta Al-Qur\'an', desc: 'Menanamkan kecintaan mendalam sejak usia dini.' }
    ];

    return (
      <div className="space-y-16 animate-fadeIn">
        <div className={`${theme.bg} p-6 md:p-20 rounded-[4rem] text-white relative overflow-hidden shadow-2xl transition-colors duration-500`}>
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <p className="arabic-text text-3xl md:text-5xl text-islamic-gold-500 mb-8 md:mb-10">إِنَّ اللَّهَ مَعَ الَّذِينَ اتَّقَوْا وَالَّذِينَ هُمْ مُحْسِنُونَ</p>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.4em] mb-6 md:mb-8 text-islamic-gold-500/80">
              {isYayasan ? 'Visi Yayasan' : `Visi ${activeLevel}`}
            </h2>
            <p className="text-2xl md:text-5xl leading-tight font-black mb-8 md:mb-10">
              "{content.visi}"
            </p>
            <div className="h-1 w-24 bg-islamic-gold-500 mx-auto rounded-full opacity-50"></div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')]"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
          {/* Misi Section */}
          <div className="lg:col-span-2 bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl border border-slate-50 group hover:border-slate-200 transition-all">
            <div className={`${theme.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-10 text-white shadow-inner`}>
              <Flag className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-8">Misi Strategis</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              {content.misi.map((m: string, idx: number) => (
                <li key={idx} className="flex gap-6">
                  <span className={`flex-shrink-0 w-10 h-10 rounded-2xl ${theme.bg} text-white flex items-center justify-center font-black text-sm shadow-lg`}>0{idx + 1}</span>
                  <p className="text-slate-600 font-medium leading-relaxed">{m}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Values Section */}
          <div className="bg-islamic-gold-500 p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] text-white shadow-xl shadow-islamic-gold-100 flex flex-col justify-center overflow-hidden relative">
            <div className="relative z-10">
              <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-10 text-white shadow-xl">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black mb-8">Pilar Utama</h3>
              <div className="space-y-4">
                {coreValues.map(val => (
                  <div key={val.title} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                    <p className="font-black text-xl mb-1">{val.title}</p>
                    <p className="text-white/80 text-xs font-medium">{val.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')]"></div>
          </div>
        </div>
      </div>
    );
  };


  const renderProfil = () => {
    const identitas = [
      { label: 'Nama Lembaga', value: 'Madrasah Diniyah Al-Hidayah', icon: <Building className="w-5 h-5" /> },
      { label: 'Kepala Lembaga', value: 'Hj. Ana Rahmi Husnawiyah, S.Pd.I', icon: <User className="w-5 h-5" /> },
      { label: 'Berdiri Sejak', value: '17 Juli 2018', icon: <Calendar className="w-5 h-5" /> },
      { label: 'Jenis Pendidikan', value: 'Madrasah Diniyah Takmiliyah Awwaliyah (MDTA)', icon: <BookMarked className="w-5 h-5" /> },
      { label: 'Nomor Telepon', value: '085607224505', icon: <Phone className="w-5 h-5" /> },
      { label: 'Alamat', value: "Jl. KH. Hasyim Asy'ari 52 Gg 3, RT 02/02, Desa Kauman, Kec. Kauman, Kab. Tulungagung", icon: <MapPin className="w-5 h-5" /> },
    ];

    const highlights = [
      { title: 'Laboratorium Spiritual', desc: 'Proyeksi sebagai wadah utama pembentukan karakter Qurani di lingkungan Kauman sejak usia dini.', icon: <Star className="w-6 h-6" /> },
      { title: 'Program Tahfidz Bertahap', desc: 'Kurikulum hafalan Al-Qur\'an yang dirancang bertahap sesuai perkembangan usia dan kemampuan santri.', icon: <BookOpen className="w-6 h-6" /> },
      { title: 'Lingkungan Kondusif', desc: 'Berlokasi ~500m dari Jalan Raya Provinsi, jauh dari kebisingan, mendukung konsentrasi hafalan.', icon: <Heart className="w-6 h-6" /> },
      { title: 'Di Bawah Naungan Yayasan', value: 'Bagian dari ekosistem Yayasan Al-Mannan Kauman yang telah mapan sejak Pondok Pesantren Al-Mannan.', icon: <ShieldCheck className="w-6 h-6" /> },
    ];

    return (
      <div className="space-y-16 md:space-y-20 animate-fadeIn">

        {/* Header + Sejarah */}
        <div className="flex flex-col lg:flex-row gap-10 md:gap-16 items-start">
          <div className="lg:w-3/5">
            <div className={`inline-flex items-center gap-2 bg-slate-50 ${theme.text} px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase mb-6`}>
              Profil & Sejarah Lembaga
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 md:mb-8 leading-tight">
              Mencetak Generasi <span className={theme.text}>Qur'ani</span> Sejak Usia Dini
            </h2>
            <div className="space-y-5 text-slate-600 leading-relaxed text-base md:text-lg">
              <p>Madrasah Diniyah Takmiliyah Awwaliyah (MDTA) Al-Hidayah secara resmi beroperasi di bawah naungan Yayasan Pondok Pesantren Al Mannan Kauman. Pendirian ini merupakan langkah lanjutan setelah mapannya kegiatan di Pondok Pesantren Al-Mannan, dengan fokus pada intervensi pendidikan sejak usia prasekolah dan sekolah dasar.</p>
              <p>Latar belakang utama yang mendorong berdirinya Madrasah Diniyah ini adalah keprihatinan terhadap pergeseran nilai di era modern. Para pendiri memiliki keinginan luhur untuk menanamkan pemahaman syariah bukan sekadar sebagai subjek pelajaran, melainkan sebagai <strong className="text-slate-800">pedoman hidup (way of life)</strong>.</p>
              <p>Melalui program pembelajaran yang dirancang secara bertahap, MDTA Al-Hidayah diproyeksikan menjadi <strong className="text-slate-800">"laboratorium spiritual"</strong> pertama bagi generasi muda di lingkungan Kauman — membentuk benteng spiritual yang kokoh agar para santri memiliki imunitas moral dalam menghadapi perkembangan zaman yang semakin kompleks.</p>
            </div>
          </div>
          <div className="lg:w-2/5 relative w-full">
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-[8px] border-white relative z-10">
              <img
                src={import.meta.env.VITE_ABOUT_IMAGE}
                alt="Gedung Madrasah Diniyah Al-Hidayah"
                className="w-full h-full object-cover min-h-[300px] md:min-h-[400px]"
              />
            </div>
            <div className={`absolute -bottom-8 -right-8 w-64 h-64 bg-islamic-green-100 rounded-full blur-3xl -z-10 opacity-50`}></div>
          </div>
        </div>

        {/* Identitas Lembaga Card */}
        <div>
          <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <span className={`${theme.bg} p-2 rounded-xl text-white`}><Building className="w-6 h-6" /></span>
            Identitas Lembaga
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {identitas.map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex items-start gap-4 hover:shadow-lg transition-all">
                <div className={`${theme.bg} p-3 rounded-xl text-white flex-shrink-0 shadow-md`}>{item.icon}</div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="font-bold text-slate-800 leading-snug">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div>
          <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <span className="bg-islamic-gold-500 p-2 rounded-xl text-white"><Star className="w-6 h-6" /></span>
            Keunggulan Lembaga
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {highlights.map((h, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 group hover:-translate-y-1 transition-all duration-300">
                <div className={`${theme.bg} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>{h.icon}</div>
                <p className="font-black text-slate-900 text-xl mb-2">{h.title}</p>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  };

  const renderStruktur = () => {
    // Data Struktur Organisasi Madrasah Diniyah Al Hidayah
    const dewanPenasehat = [
      "Moh. Taufiq Hidayatulloh, S. Pd. (Penanggung Jawab)",
      "Hj. Awfa Nayli Fakhrina (Penasehat)"
    ];

    const pimpinan = {
      ketua: { role: "Kepala Lembaga / Ketua", name: "Hj. Ana Rahmi Husnawiyah, S.Pd.I" },
      sekretaris: [
        { role: "Sekretaris 1", name: "Nabila Nurkumala Khusna" },
        { role: "Sekretaris 2", name: "Ulfa Lailatul Fadhilah" }
      ],
      bendahara: [
        { role: "Bendahara 1", name: "Bidayatun Ni'mah" },
        { role: "Bendahara 2", name: "Ni'ma Ummu Abidah" }
      ]
    };

    const lembaga = [
      { role: "Waka Pengembangan", name: "Mei Rahayu Ningtias, M.Pd." },
      { role: "Waka Pendidikan", name: "Siti Maslihatul Hasanah, Nur Afifah" },
      { role: "Waka Kurikulum", name: "Rohmatul Fitria, Iqlima Chalawa" },
      { role: "Waka Kesantrian", name: "Hanik Nur 'Aini, dkk" }
    ];

    const pengajar = [
      { role: "Tenaga Pengajar", name: "Zidni Nuril Azka, S.Pd" },
      { role: "Tenaga Pengajar", name: "Siti Nurjanah, S.Pd" },
      { role: "Tenaga Pengajar", name: "Indana Zulfa, S.Pd" }
    ];

    return (
      <div className="space-y-24 animate-fadeIn text-center">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-10 md:mb-20 relative inline-block">
          Struktur Organisasi
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-1.5 w-24 bg-islamic-gold-500 rounded-full"></div>
        </h2>

        {/* Penasehat */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-8">Dewan Penasehat</h3>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {dewanPenasehat.map((name, idx) => (
              <div key={idx} className="bg-white px-6 md:px-8 py-4 rounded-2xl shadow-lg border-b-4 border-slate-100 min-w-[200px] md:min-w-[250px] hover:transform hover:-translate-y-1 transition-all duration-300">
                <p className="font-bold text-slate-700 text-sm md:text-base">{name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pimpinan */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-10">Pimpinan Lembaga</h3>

          {/* Ketua */}
          <div className="relative group max-w-sm mx-auto mb-10 md:mb-16">
            <div className={`${theme.bg} text-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl relative z-10 transition-transform duration-300 hover:scale-105`}>
              <div className="bg-islamic-gold-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl">
                <Building className="w-8 h-8" />
              </div>
              <p className="text-[10px] uppercase font-black text-islamic-gold-500 tracking-widest mb-2">{pimpinan.ketua.role}</p>
              <p className="text-xl md:text-2xl font-black leading-tight">{pimpinan.ketua.name}</p>
            </div>
            <div className="absolute inset-0 bg-slate-100 rounded-[3rem] translate-y-4 -z-10 group-hover:translate-y-6 transition-transform"></div>
          </div>

          {/* Sekretaris & Bendahara */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="space-y-4">
              <h4 className="font-black text-slate-400 uppercase tracking-widest text-xs mb-4">Sekretariat</h4>
              <div className="grid grid-cols-1 gap-4">
                {pimpinan.sekretaris.map((s, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
                    <p className={`text-[10px] uppercase font-black ${theme.text} mb-1`}>{s.role}</p>
                    <p className="font-bold text-slate-800">{s.name}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-black text-slate-400 uppercase tracking-widest text-xs mb-4">Kebendaharaan</h4>
              <div className="grid grid-cols-1 gap-4">
                {pimpinan.bendahara.map((b, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
                    <p className={`text-[10px] uppercase font-black ${theme.text} mb-1`}>{b.role}</p>
                    <p className="font-bold text-slate-800">{b.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Waka */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-10">Bidang & Departemen</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {lembaga.map((item, idx) => (
              <div key={idx} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300">
                <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center mx-auto mb-4 text-slate-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="font-black text-xs text-slate-400 mb-2 uppercase tracking-wide">{item.role}</p>
                <p className="font-bold text-slate-800 text-sm">{item.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tenaga Pengajar */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-10">Sebagian Tenaga Pengajar</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {pengajar.map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-xl border-t-4 border-islamic-green-500 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-islamic-green-500/5 rounded-bl-[3rem] -mr-4 -mt-4 transition-all group-hover:bg-islamic-green-500/10"></div>
                <div className="mb-4">
                  <GraduationCap className="w-8 h-8 text-islamic-green-600" />
                </div>
                <p className="text-xs font-bold text-islamic-green-600 uppercase tracking-wider mb-3">{item.role}</p>
                <p className="font-black text-slate-800 leading-tight text-lg">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPrestasi = () => {
    if (prestasiLoading) {
      return (
        <div className="flex justify-center py-20">
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="font-medium">Memuat data prestasi...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-16 animate-fadeIn">
        {prestasiData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {prestasiData.map(item => (
              <Link to={`/berita/${item.id}`} key={item.id} className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl border border-slate-50 hover:shadow-2xl transition-all flex flex-col group">
                <div className="flex justify-between items-start mb-8 md:mb-10">
                  <div className={`px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg ${item.level === 'Internasional' ? 'bg-islamic-gold-500 text-white' : theme.bg + ' text-white'
                    }`}>
                    Tingkat {item.level || 'Nasional'}
                  </div>
                  <span className={`${theme.text} font-black text-lg md:text-xl italic flex items-center gap-2`}>
                    <Calendar className="w-5 h-5" /> {item.date.split(' ').pop()}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 leading-tight group-hover:text-islamic-green-700 transition-colors">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium mb-8 md:mb-10 flex-grow text-sm md:text-base">{item.excerpt}</p>
                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div className={`h-full ${theme.bg} w-full rounded-full`}></div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <Award className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">Belum ada catatan prestasi spesifik untuk jenjang ini.</p>
          </div>
        )}
      </div>
    );
  };

  const getSectionContent = () => {
    switch (section) {
      case 'visi-misi': return renderVisiMisi();
      case 'profil': return renderProfil();
      case 'struktur': return renderStruktur();
      case 'prestasi': return renderPrestasi();
      default: return renderProfil();
    }
  };

  if (loading || !content) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-300"></div>
      </div>
    );
  }

  const getTitle = () => {
    const context = isYayasan ? 'Yayasan' : activeLevel;
    switch (section) {
      case 'visi-misi': return `Visi & Misi ${context}`;
      case 'profil': return `Profil Lengkap ${context}`;
      case 'struktur': return `Manajemen ${context}`;
      case 'prestasi': return `Capaian Juara ${context}`;
      default: return `Tentang ${context}`;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className={`${theme.bg} py-16 md:py-24 px-4 text-center relative overflow-hidden transition-colors duration-500`}>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-6xl font-black text-white mb-6 leading-tight animate-fadeIn">{getTitle()}</h1>
          <p className="text-white/80 text-base md:text-xl font-medium animate-fadeIn">
            {isYayasan ? 'Berkhidmat untuk kemajuan pendidikan bangsa berbasis nilai Qurani' : `Mewujudkan keunggulan pendidikan pada jenjang ${theme.type}`}
          </p>
        </div>
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')]"></div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10 md:py-20">
        {getSectionContent()}
      </main>
    </div>
  );
};

export default About;
