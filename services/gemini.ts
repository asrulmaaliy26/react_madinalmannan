import { GoogleGenAI } from "@google/genai";

const getApiKey = (): string => {
  const key =
    process.env.API_KEY ||
    process.env.GEMINI_API_KEY ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (import.meta as any).env?.GEMINI_API_KEY ||
    '';
  return key;
};

const getAiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-3-flash-preview', 'gemini-flash-latest'];

export const MADIN_AL_MANNAN_SYSTEM_INSTRUCTION = `
Anda adalah Asisten Virtual Resmi Madrasah Diniyah Takmiliyah (Madin) Al Mannan Kauman Tulungagung.
Anda bertugas melayani santri, wali santri, calon pendaftar, dan masyarakat umum dengan ramah, santun, solutif, serta bernuansa Islami dan kepesantrenan.

BASIS DATA RESMI MADIN AL MANNAN:

1. PROFIL LEMBAGA:
- Nama Institusi: Madrasah Diniyah (Madin) Takmiliyah Al Mannan.
- Naungan: Lembaga Pendidikan Islam (LPI) Al Hidayah / Yayasan Pendidikan Al Mannan.
- Fokus: Lembaga pendidikan keagamaan Islam non-formal berjenjang yang menyelenggarakan pendalaman kitab-kitab turats (kitab kuning), ilmu syariah, dan pembinaan akhlak santri.

2. PROGRAM & KURIKULUM:
- Pembelajaran Kitab Kuning / Turats Klasik: Nahwu, Shorof, Fiqih, Aqidah/Tauhid, Akhlak/Tasawuf, Hadits, dan Tajwid.
- Sorogan, Wetonan, dan Bandongan khas pesantren tradisional dengan metode sistematis.
- Penguatan Ibadah Praktis: Fasholatan, thaharah, doa-doa maqbul, serta adab sopan santun penuntut ilmu.
- Pembiasaan Bahasa Arab dan pembacaan syi'ir/nadhom keilmuan.

3. PENDAFTARAN & KELAS:
- Terbuka bagi anak-anak, remaja, santri asrama maupun santri kalong (non-asrama) di sekitar Kauman dan sekitarnya.
- Penempatan kelas disesuaikan dengan tingkat kemampuan baca tulis pegon dan kitab dasar.

4. KONTAK & ALAMAT RESMI:
- Alamat: Jl. KH. Hasyim Asy'ari 52 Gg 3, Desa Kauman, Kec. Kauman, Kab. Tulungagung, Jawa Timur.
- Narahubung WhatsApp: 0856-0722-4505 / https://wa.me/6285607224505
- Email: tpqalhidayahkauman@gmail.com
- Website Resmi: https://lpialhidayah.or.id

5. LEMBAGA SATU YAYASAN:
- TPQ Al Mannan (Pendidikan Al-Qur'an usia dini)
- MI Al Hidayah
- SMPT Al Mannan
- MA Al Hidayah
- Madin Al Mannan
- STAI Al-Mannan (Perguruan Tinggi Agama Islam)

PEDOMAN MENJAWAB:
- Awali selalu dengan salam Islami hangat ("Assalamu'alaikum Warahmatullahi Wabarakatuh...").
- Gunakan bahasa yang santun, bernuansa kepesantrenan dan akhlakul karimah.
- Jika ditanya nomor kontak atau lokasi, berikan nomor WhatsApp 0856-0722-4505 dan alamat di Jl. KH. Hasyim Asy'ari 52 Gg 3, Kauman, Tulungagung.
`;

export const getSchoolAssistantResponse = async (
  userPrompt: string,
  history: Array<{ role: 'user' | 'bot'; text: string }> = []
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Maaf, asisten AI sedang tidak tersedia (API Key missing).";

  const contents: any[] = [];
  const recentHistory = history.slice(-6);
  for (const msg of recentHistory) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    });
  }
  contents.push({
    role: 'user',
    parts: [{ text: userPrompt }]
  });

  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
          systemInstruction: MADIN_AL_MANNAN_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      if (response.text) {
        return response.text;
      }
    } catch (error: any) {
      lastError = error;
      console.warn(`Model ${model} failed, trying fallback...`, error?.message);
    }
  }

  console.error("All Gemini models failed:", lastError);
  return "Maaf, terjadi kendala koneksi layanan AI saat ini. Silakan coba sesaat lagi atau hubungi kami di WhatsApp 0856-0722-4505.";
};

export interface NewsPromptContext {
  briefDescription?: string;
  title?: string;
  category?: string;
  excerpt?: string;
  jenjang?: string;
  fakultas?: string;
  jurusan?: string;
  images?: (File | Blob | string | null | undefined)[];
}

// Convert File/Blob to Gemini inlineData base64 part
export const fileToGenerativePart = async (file: File | Blob): Promise<{ inlineData: { data: string; mimeType: string } } | null> => {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result as string;
        if (resultStr && resultStr.includes(',')) {
          const base64Data = resultStr.split(',')[1];
          resolve({
            inlineData: {
              data: base64Data,
              mimeType: file.type || 'image/jpeg'
            }
          });
        } else {
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    } catch {
      resolve(null);
    }
  });
};

// Convert image URL to Gemini inlineData base64 part
export const urlToGenerativePart = async (url: string): Promise<{ inlineData: { data: string; mimeType: string } } | null> => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await fileToGenerativePart(blob);
  } catch (e) {
    console.warn('Failed to fetch image URL for AI analysis:', url, e);
    return null;
  }
};

export const generateNewsArticle = async (
  contextOrDescription: string | NewsPromptContext
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Gagal generate berita: API Key tidak ditemukan.";

  const ctx: NewsPromptContext = typeof contextOrDescription === 'string'
    ? { briefDescription: contextOrDescription }
    : (contextOrDescription || {});

  // 1. Convert all valid images (File, Blob, or URL string) to base64 inlineData
  const imageParts: { inlineData: { data: string; mimeType: string } }[] = [];
  if (ctx.images && Array.isArray(ctx.images)) {
    for (const img of ctx.images) {
      if (!img) continue;
      if (img instanceof File || img instanceof Blob) {
        const part = await fileToGenerativePart(img);
        if (part) {
          imageParts.push(part);
        }
      } else if (typeof img === 'string' && img.trim()) {
        const part = await urlToGenerativePart(img.trim());
        if (part) {
          imageParts.push(part);
        }
      }
    }
  }

  // 2. Build structured base prompt from form metadata
  const promptParts: string[] = [];
  promptParts.push(`Anda adalah jurnalis dan humas profesional untuk Madrasah Diniyah (MADIN) Al Mannan. Tugas Anda adalah menyusun artikel berita kegiatan yang lengkap, menarik, mendalam, dan bernuansa sekolah Islam unggul.`);

    if (imageParts.length > 0) {
    promptParts.push(`\n[ANALISIS FOTO DOKUMENTASI & POSTER - SANGAT PENTING]:
Ada ${imageParts.length} foto kegiatan / poster dokumentasi yang dilampirkan.
INSTRUKSI KHUSUS ANALISIS GAMBAR:
1. BACA SELURUH TEKS YANG TERCANTUM PADA SETIAP FOTO/POSTER!
2. Jika foto berupa poster ucapan selamat (congrats), piagam, atau dokumentasi prestasi:
   - WAJIB catat dan sebutkan SEMUA NAMA LENGKAP SISWA/SANTRI yang tercantum.
   - WAJIB catat dan sebutkan KATEGORI/PREDIKAT JUARA masing-masing (misal: Juara I, Juara II, Juara III, Juara Harapan I, II, III).
   - Cantumkan cabang lomba, kelas siswa, dan nama penyelenggara (seperti DPP AGPAII, Kemenag, dinas, dsb) jika tertera.
   - Sertakan semboyan/moto sekolah yang tertulis di poster (seperti "Mendidik Dengan Hati, Membangun Generasi Qur'ani").
3. Susun daftar rincian juara tersebut secara rapi dan terstruktur di dalam artikel berita menggunakan tag <ul> dan <li> dengan huruf tebal <strong> pada nama siswa dan juaranya.`);
  }

  const baseItems: string[] = [];
  if (ctx.title && ctx.title.trim() && ctx.title !== 'Judul Baru') {
    baseItems.push(`- Judul / Topik Berita: "${ctx.title.trim()}"`);
  }
  if (ctx.category && ctx.category.trim()) {
    baseItems.push(`- Kategori Kegiatan: ${ctx.category.trim()}`);
  }
  if (ctx.jenjang && ctx.jenjang.trim()) {
    baseItems.push(`- Jenjang: ${ctx.jenjang.trim()}`);
  }
  if (ctx.fakultas || ctx.jurusan) {
    baseItems.push(`- Fakultas/Jurusan: ${(ctx.fakultas || '')} ${(ctx.jurusan || '')}`);
  }
  if (ctx.excerpt && ctx.excerpt.trim()) {
    baseItems.push(`- Ringkasan / Poin Awal: "${ctx.excerpt.trim()}"`);
  }

  if (baseItems.length > 0) {
    promptParts.push(`\n[DATA & KONTEKS DASAR (BASE PROMPT)]:\n${baseItems.join('\n')}`);
  }

  if (ctx.briefDescription && ctx.briefDescription.trim()) {
    promptParts.push(`\n[POIN TAMBAHAN / INSTRUKSI KHUSUS DARI ADMIN]:\n"${ctx.briefDescription.trim()}"`);
  } else if (baseItems.length === 0 && imageParts.length === 0) {
    promptParts.push('\nBuatkan artikel berita kegiatan terkini yang menginspirasi.');
  }

    promptParts.push(`\n[KETENTUAN STRUKTUR DAN FORMAT ARTIKEL BERITA]:
1. Awali dengan judul berita yang kuat, menarik, dan representatif di dalam tag <h3>Judul Berita</h3>.
2. Paragraf 1 (Pembuka): Pembuka naratif yang hangat dan penuh rasa syukur atas capaian luar biasa, menyebutkan nama kegiatan dan lembaga penyelenggara.
3. Paragraf 2 (Latar Belakang & Persaingan): Gambaran umum kompetisi, ketatnya persaingan antar sekolah/peserta, dan kesiapan delegasi santri.
4. Paragraf 3 (Daftar Juara & Pemenang): Rincian lengkap prestasi para santri dalam daftar terstruktur (gunakan <ul><li> dengan <strong> untuk nama santri dan juaranya).
5. Paragraf 4 (Apresiasi & Sambutan): Kutipan ucapan selamat dan rasa bangga dari pimpinan sekolah atau guru pembimbing dengan tag <em>.
6. Paragraf 5 (Penutup & Doa): Harapan, motivasi bagi santri lain, doa keberkahan, serta penegasan komitmen mencetak generasi Qur'ani yang unggul.
7. Format output murni HTML. JANGAN sertakan tag <html>, <head>, atau <body>. Jangan gunakan wrapper markdown seperti \`\`\`html.`);

  const promptText = promptParts.join('\n');
  const contentsPayload: any[] = [...imageParts, { text: promptText }];

  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: contentsPayload.length === 1 && typeof contentsPayload[0].text === 'string'
          ? contentsPayload[0].text
          : contentsPayload,
        config: {
          temperature: 0.7,
        },
      });

      let text = response.text || "";
      text = text.replace(/^\`\`\`html\s*/i, '').replace(/\`\`\`\s*$/i, '').trim();
      if (text) {
        return text;
      }
    } catch (error: any) {
      lastError = error;
      console.warn(`Model ${model} failed for multimodal news generation, trying fallback...`, error?.message);
    }
  }

  console.error("Gemini News Generation Error:", lastError);
  throw new Error(lastError?.message || "Gagal memproses AI");
};
