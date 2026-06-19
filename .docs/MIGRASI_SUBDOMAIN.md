# 🔄 Panduan Migrasi Subdomain di Webuzo

Panduan ini digunakan jika terjadi **salah pengetikan subdomain** (misal: seharusnya `madin.lpialhidayah.or.id` tapi yang terbuat `madin.staialmannan.ac.id`) dan CI/CD (GitHub Actions) sudah terlanjur dibuat.

Karena server ini menggunakan **Webuzo**, pembuatan folder dan konfigurasi web server **tidak boleh dilakukan manual via SSH**. Webuzo harus yang menanganinya agar konfigurasi Apache dan SSL Let's Encrypt tergenerate otomatis.

---

## TAHAP 1 — Di VPS / Panel Webuzo

1. **Login ke Panel Webuzo**  
   Buka browser dan login ke panel Webuzo (biasanya di port `2004` atau `2002`, contoh: `http://72.61.143.19:2004`).

2. **Tambah Subdomain Baru**  
   * Cari menu **Domains** -> **Add Domain** (atau **Subdomain**).
   * Masukkan nama domain yang benar: `madin.lpialhidayah.or.id`.
   * Biarkan path/Document Root terisi otomatis (Webuzo akan membuatkan folder `/home/staialmannan/madin.lpialhidayah.or.id` secara otomatis).
   * Klik **Add Domain**.

3. **Install SSL (HTTPS)**  
   * Cari menu **Let's Encrypt** (atau SSL/TLS).
   * Pilih domain baru `madin.lpialhidayah.or.id`.
   * Klik **Install** untuk memasang SSL.
   * *(Sangat Disarankan)* Centang opsi **Force HTTPS** agar semua trafik HTTP dialihkan otomatis ke HTTPS.

4. **Hapus Subdomain Lama (Opsional)**  
   * Masuk ke menu **Manage Domains** di Webuzo.
   * Cari subdomain yang salah (`madin.staialmannan.ac.id`) dan hapus (Delete) jika memang sudah tidak digunakan lagi.

---

## TAHAP 2 — Di Komputer Lokal (Project / GitHub)

Setelah folder dan domain siap di VPS, kita hanya perlu mengubah target di file `deploy.yml`.

1. Buka file `.github/workflows/deploy.yml` di teks editor (VS Code).
2. Ubah baris `name:` agar sesuai dengan domain baru.
   ```yaml
   name: 🚀 Auto Deploy - madin.lpialhidayah.or.id
   ```
3. Ubah nama pada `jobs.deploy.name`:
   ```yaml
   name: 🌐 Deploy ke madin.lpialhidayah.or.id
   ```
4. **Paling Penting:** Ubah path `target` di langkah `Upload dist/ ke VPS`:
   ```yaml
   target: "/home/staialmannan/madin.lpialhidayah.or.id"
   ```
5. Ubah juga semua teks `echo` yang memunculkan nama domain lama.

---

## TAHAP 3 — Push Perubahan

Karena kita menggunakan VPS yang sama, **Secret di GitHub (seperti `VPS_HOST`, `MADIN_SECRET_KEY_SSH`, `GEMINI_API_KEY`) TIDAK PERLU DIUBAH.** Kita hanya perlu push kode terbaru untuk memicu auto-deploy.

Jalankan perintah ini di terminal:

```bash
git add .github/workflows/deploy.yml
git commit -m "fix: ganti subdomain ke madin.lpialhidayah.or.id"
git push origin main
```

---

## ✅ Verifikasi

1. Buka tab **Actions** di GitHub repository dan pastikan workflow berjalan sampai selesai (semua centang hijau ✅).
2. Buka browser dan kunjungi alamat yang baru: `https://madin.lpialhidayah.or.id`.
3. Coba lakukan *refresh* pada halaman web untuk memastikan `.htaccess` React Router berfungsi normal.
