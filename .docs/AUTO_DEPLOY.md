# 🚀 Panduan Auto Deploy: GitHub → VPS (Reusable)

> Panduan ini dibuat berdasarkan pengalaman deploy project React/Vite ke VPS Webuzo + Apache.
> Bisa digunakan ulang untuk project baru apapun.

---

## 📋 Gambaran Umum

```
git push origin main
       ↓
GitHub Actions (gratis, otomatis):
  ├─ npm ci               → install dependencies
  ├─ npm run build        → build ke folder dist/
  └─ SCP upload dist/*    → upload ke VPS
       ↓
VPS Apache: serve file terbaru
       ↓
https://domain-kamu.com update otomatis ✅
```

**Keuntungan:**
- 🆓 Build gratis di GitHub (tidak pakai resource VPS)
- ⚡ VPS hanya menerima file jadi (hemat CPU/RAM)
- 🔄 Otomatis setiap `git push` — tidak perlu SSH manual

---

## ⚙️ Yang Perlu Disiapkan

### Kebutuhan Minimal
- [x] Project React/Vite sudah ada di GitHub
- [x] VPS dengan domain yang sudah diarahkan
- [x] Akses SSH ke VPS (sebagai root)
- [x] Domain sudah dikonfigurasi di panel VPS (Webuzo/cPanel)

---

## LANGKAH 1 — Cek Document Root Domain di VPS

SSH ke VPS, lalu cari path document root domain kamu:

```bash
# Cari konfigurasi domain di Apache Webuzo
grep -A5 "nama-domain-kamu" /usr/local/apps/apache2/etc/conf.d/webuzoVH.conf | grep DocumentRoot
```

Catat nilai `DocumentRoot`-nya. Contoh:
```
DocumentRoot /home/staialmannan/madin.staialmannan.ac.id
```

> Di Webuzo, folder domain biasanya ada di `/home/USERNAME/nama-domain/`

---

## LANGKAH 2 — Generate SSH Key di VPS

```bash
# Generate RSA key (paling kompatibel dengan GitHub Actions)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_deploy_rsa -N ""

# Daftarkan public key agar GitHub bisa SSH ke VPS
cat ~/.ssh/github_deploy_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Tampilkan private key → COPY SEMUA ISINYA → paste ke GitHub Secrets
cat ~/.ssh/github_deploy_rsa
```

---

## LANGKAH 3 — Tambahkan GitHub Secrets

**GitHub Repo → Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Nilai |
|---|---|
| `VPS_SSH_KEY` | Seluruh isi private key dari Langkah 2 |
| `VPS_HOST` | IP VPS kamu |
| `GEMINI_API_KEY` | API key Gemini (jika project pakai AI) |

---

## LANGKAH 4 — Buat File Workflow

Buat file `.github/workflows/deploy.yml`:

```yaml
name: 🚀 Auto Deploy - nama-domain-kamu.com

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    name: 🌐 Deploy ke nama-domain-kamu.com
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout Repository
        uses: actions/checkout@v4

      - name: 🟢 Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 📦 Install Dependencies
        run: npm ci

      - name: 🏗️ Build Project
        run: npm run build
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}

      - name: 📤 Upload dist/ ke VPS
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.VPS_HOST }}
          username: root
          key: ${{ secrets.VPS_SSH_KEY }}
          port: 22
          source: "dist/*"
          target: "/home/USERNAME/nama-domain-kamu.com"   # ← Sesuaikan!
          strip_components: 1

      - name: ♻️ Reload Apache di VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: root
          key: ${{ secrets.VPS_SSH_KEY }}
          port: 22
          script: |
            /usr/local/apps/apache2/bin/apachectl graceful
            echo "✅ Deploy selesai!"

      - name: ✅ Deploy Berhasil
        if: success()
        run: echo "🎉 https://nama-domain-kamu.com sudah update!"

      - name: ❌ Deploy Gagal
        if: failure()
        run: echo "💥 Cek log di atas."
```

**Ganti:**
- `nama-domain-kamu.com` → domain aktual
- `/home/USERNAME/nama-domain-kamu.com` → document root dari Langkah 1

---

## LANGKAH 5 — Buat `.htaccess` untuk React Router

Buat file `public/.htaccess`:

```apache
# React Router SPA - Semua route diarahkan ke index.html
Options -MultiViews
RewriteEngine On

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```

---

## LANGKAH 6 — Commit dan Push

```bash
git add .github/workflows/deploy.yml public/.htaccess
git commit -m "feat: setup CI/CD auto deploy"
git push origin main
```

Pantau progress di: **GitHub → Actions tab** ✅

---

## 🔄 Deploy Selanjutnya (Cukup Ini)

```bash
git add .
git commit -m "update: deskripsi perubahan"
git push origin main
# ✅ Website update otomatis dalam ~1-2 menit
```

---

## 🛠️ Checklist Project Baru

```
[ ] Domain sudah dikonfigurasi di Webuzo
[ ] Catat DocumentRoot dari webuzoVH.conf
[ ] Generate RSA SSH key di VPS
[ ] Tambah public key ke authorized_keys
[ ] Buat 3 GitHub Secrets: VPS_SSH_KEY, VPS_HOST, GEMINI_API_KEY
[ ] Buat .github/workflows/deploy.yml (sesuaikan domain & path)
[ ] Buat public/.htaccess
[ ] Commit & push
[ ] Pantau GitHub Actions → semua hijau ✅
[ ] Verifikasi website berjalan
```

---

## 🔧 Troubleshooting

| Error | Penyebab | Solusi |
|---|---|---|
| `can't connect without a private SSH key` | Secret `VPS_SSH_KEY` belum diisi | Tambah/update secret di GitHub |
| `ssh: no key found` | Format key salah (newline hilang) | Generate ulang RSA key, paste ulang |
| `Permission denied (publickey)` | Public key belum di authorized_keys | `cat ~/.ssh/github_deploy_rsa.pub >> ~/.ssh/authorized_keys` |
| Website 404 setelah deploy | DocumentRoot salah | Cek lagi dengan `grep DocumentRoot webuzoVH.conf` |
| React Router refresh = 404 | `.htaccess` belum ada | Buat `public/.htaccess` seperti Langkah 5 |
| Fitur AI tidak jalan | `GEMINI_API_KEY` salah/kosong | Update secret dari https://aistudio.google.com/app/apikey |

---

*Dibuat berdasarkan pengalaman deploy ke VPS Hostinger + Webuzo + Apache, Juni 2026.*
