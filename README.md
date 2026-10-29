# 🕌 Web LDK Al-Hidayah

<div align="center">

![LDK Al-Hidayah](https://img.shields.io/badge/LDK-Al--Hidayah-green?style=for-the-badge&logo=mosque)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)

**Website resmi UKM Lembaga Dakwah Kampus Al-Hidayah**  
Platform digital untuk manajemen organisasi dakwah kampus secara modern dan terintegrasi.

</div>

---

## 📋 Deskripsi

Website **LDK Al-Hidayah** adalah platform web full-stack yang dibangun untuk mendukung kegiatan operasional dan administratif Lembaga Dakwah Kampus (LDK) Al-Hidayah. Website ini menyediakan halaman publik untuk menyebarkan informasi kegiatan dakwah sekaligus dashboard admin untuk manajemen organisasi secara internal.

---

## ✨ Fitur Utama

### 🌐 Halaman Publik
- **Beranda** — Informasi umum dan sambutan LDK Al-Hidayah
- **Profil Organisasi** — Sejarah, visi misi, dan struktur kepengurusan
- **Program Kegiatan** — Daftar program dakwah dan kegiatan rutin
- **Galeri** — Dokumentasi foto kegiatan
- **Kontak** — Formulir kontak dan informasi LDK

### 🔐 Dashboard Admin
- **Manajemen DKM**
  - Inventaris barang (CRUD + drag-and-drop)
  - Jadwal piket pengurus
  - Catatan ketua
- **Program Sosial (Pensos)**
  - Manajemen data bansos
- **Autentikasi** — Login aman berbasis NextAuth.js
- **Manajemen Media** — Upload foto via Cloudinary

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Bahasa** | TypeScript 5 |
| **Styling** | TailwindCSS 4 |
| **Database** | Neon (PostgreSQL Serverless) |
| **ORM** | Drizzle ORM |
| **Auth** | NextAuth.js v4 |
| **Media Storage** | Cloudinary |
| **Rate Limiting** | Upstash Redis + Ratelimit |
| **UI Components** | Lucide React, DnD Kit |
| **Form Handling** | React Hook Form + Zod |
| **Notifikasi** | React Hot Toast |
| **Email** | Nodemailer |
| **Deploy** | Vercel |

---

## 🚀 Cara Menjalankan Lokal

### Prasyarat
- Node.js >= 18
- npm atau yarn
- Akun Neon Database
- Akun Cloudinary
- Akun Upstash Redis

### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/muhluqmanhakim11-cloud/ldk-al-hidayah-web.git
   cd ldk-al-hidayah-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Isi `.env.local` dengan konfigurasi berikut:
   ```env
   # Database
   DATABASE_URL=your_neon_database_url

   # NextAuth
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Upstash Redis (Rate Limiting)
   UPSTASH_REDIS_REST_URL=your_upstash_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_token
   ```

4. **Jalankan migrasi database**
   ```bash
   npx drizzle-kit push
   ```

5. **Jalankan development server**
   ```bash
   npm run dev
   ```

6. **Buka browser** dan akses `http://localhost:3000`

---

## 📁 Struktur Project

```
ldk-al-hidayah/
├── src/
│   ├── app/
│   │   ├── (admin)/          # Route group admin (protected)
│   │   │   └── admin/
│   │   │       ├── dkm/      # Fitur DKM (inventaris, piket, dll)
│   │   │       └── pensos/   # Fitur program sosial
│   │   ├── (public)/         # Route group halaman publik
│   │   │   ├── profil/
│   │   │   └── ...
│   │   ├── api/              # API Routes (REST)
│   │   │   ├── admin/
│   │   │   └── auth/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/           # Shared components
│   ├── lib/                  # Utilities & helpers
│   └── db/                   # Drizzle ORM schema & config
├── public/                   # Static assets
├── .agents/                  # Agent configuration
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🌍 Deploy

Project ini di-deploy otomatis ke **Vercel** melalui GitHub integration.

- **Production**: Push ke branch `main` → auto-deploy ke Vercel
- **Preview**: Push ke branch lain → preview deployment

---

## 🔧 Scripts

```bash
npm run dev      # Jalankan development server
npm run build    # Build untuk production
npm run start    # Jalankan production server
npm run lint     # Jalankan ESLint
```

---

## 👥 Kontributor

Dikembangkan dengan ❤️ untuk UKM **LDK Al-Hidayah**.

---

## 📄 Lisensi

Project ini bersifat **private** dan diperuntukkan khusus untuk kebutuhan internal LDK Al-Hidayah.

---

<div align="center">
  <sub>🌙 Semoga bermanfaat untuk dakwah dan umat • LDK Al-Hidayah</sub>
</div>
