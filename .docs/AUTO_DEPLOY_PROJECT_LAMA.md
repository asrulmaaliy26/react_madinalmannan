# 🔄 Menambahkan Auto Deploy ke Project Lama

> Untuk project yang **sudah berjalan di VPS** dan ingin ditambahkan CI/CD otomatis.
> SSH key dan konfigurasi domain sudah ada → prosesnya lebih cepat!

---

## Perbedaan dengan Project Baru

| Kondisi | Project Baru | Project Lama |
|---|---|---|
| SSH Key | Perlu generate | ✅ Sudah ada, tinggal pakai |
| Domain/VPS config | Perlu setup | ✅ Sudah berjalan |
| GitHub Repo | Buat baru | Mungkin sudah ada |
| Waktu setup | ~30 menit | ~10 menit |

---

## LANGKAH 1 — Pastikan Project Ada di GitHub

```bash
# Cek apakah sudah ada remote
git remote -v
```

**Jika belum ada**, buat repo di https://github.com/new lalu:
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

---

## LANGKAH 2 — Cek Document Root di VPS

```bash
grep -A5 "nama-domain-lama" /usr/local/apps/apache2/etc/conf.d/webuzoVH.conf | grep DocumentRoot
```

---

## LANGKAH 3 — SSH Key (Pakai Ulang yang Sudah Ada)

```bash
# Cek apakah sudah ada
ls ~/.ssh/github_deploy_rsa

# Jika ADA → langsung tampilkan
cat ~/.ssh/github_deploy_rsa

# Jika TIDAK ADA → generate baru
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_deploy_rsa -N ""
cat ~/.ssh/github_deploy_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
cat ~/.ssh/github_deploy_rsa
```

---

## LANGKAH 4 — GitHub Secrets

Buka: **GitHub Repo Lama → Settings → Secrets and variables → Actions**

| Secret | Nilai |
|---|---|
| `VPS_SSH_KEY` | Private key dari Langkah 3 (sama dengan project lain) |
| `VPS_HOST` | `72.61.143.19` (sama) |
| `GEMINI_API_KEY` | API key (jika dibutuhkan) |

---

## LANGKAH 5 — Tambahkan File Workflow

Buat `.github/workflows/deploy.yml`:

```yaml
name: 🚀 Auto Deploy - nama-domain-lama.com

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
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
          target: "/home/staialmannan/nama-domain-lama.com"   # ← Sesuaikan!
          strip_components: 1

      - name: ♻️ Reload Apache
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: root
          key: ${{ secrets.VPS_SSH_KEY }}
          port: 22
          script: |
            /usr/local/apps/apache2/bin/apachectl graceful
            echo "✅ Deploy selesai!"
```

---

## LANGKAH 6 — Buat `.htaccess`

Buat `public/.htaccess`:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```

---

## LANGKAH 7 — Backup & Deploy

```bash
# Backup dulu di VPS (SSH ke VPS)
cp -r /home/staialmannan/nama-domain-lama.com \
      /home/staialmannan/nama-domain-lama.com.backup-$(date +%Y%m%d)

# Lalu push dari lokal
git add .github/workflows/deploy.yml public/.htaccess
git commit -m "feat: tambah CI/CD auto deploy"
git push origin main
```

---

## 📊 Checklist

```
[ ] GitHub repo sudah ada / sudah dibuat
[ ] DocumentRoot domain sudah dicatat
[ ] SSH key sudah ada atau sudah di-generate
[ ] 3 GitHub Secrets sudah ditambahkan
[ ] deploy.yml sudah dibuat dan disesuaikan
[ ] public/.htaccess sudah dibuat
[ ] Backup file lama di VPS (opsional)
[ ] git push → semua step hijau ✅
[ ] Website berjalan normal
```

---

## 🔧 Output Build per Jenis Project

| Jenis Project | Perintah Build | Output Folder | Source di deploy.yml |
|---|---|---|---|
| React + Vite | `npm run build` | `dist/` | `dist/*` |
| Next.js (static) | `npm run build` | `out/` | `out/*` |
| Laravel + Vite | `npm run build` | `public/build/` | `public/build/*` |
| HTML statis | — (tidak perlu build) | `.` | `./*` |

---

*Lihat juga: [AUTO_DEPLOY.md](AUTO_DEPLOY.md) untuk panduan project baru dari awal.*
