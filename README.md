# LDK Al-Hidayah Management System

Sistem Informasi Manajemen Lembaga Dakwah Kampus (LDK) Al-Hidayah adalah platform terpadu untuk mengelola seluruh aktivitas organisasi, meliputi manajemen pengurus, program kerja, publikasi berita/galeri, dan penerimaan anggota baru.

## Fitur Utama

- **Website Publik**: Menampilkan profil organisasi, struktur kepengurusan, kegiatan, berita, galeri, dan halaman pendaftaran rekrutmen.
- **Admin Dashboard**: Sistem Role-Based Access Control (RBAC) dengan tingkatan `SUPER_ADMIN`, `KETUA`, dan `ADMIN_BIDANG`.
- **Manajemen Organisasi**: CRUD periode, divisi, jabatan, dan pengurus.
- **Manajemen Konten**: CRUD program kerja, kegiatan, artikel berita, dan dokumentasi foto terintegrasi dengan Cloudinary.
- **Sistem Rekrutmen (Oprec)**: Formulir pendaftaran publik, serta dashboard admin untuk review dan persetujuan (Accept/Reject).

## Teknologi

- **Framework**: Next.js 16 (App Router, Server Components)
- **Bahasa**: TypeScript
- **Database**: PostgreSQL (via Drizzle ORM)
- **Autentikasi**: NextAuth.js (Session-based)
- **File Storage**: Cloudinary
- **Styling**: Tailwind CSS
- **Validasi**: Zod

## Dokumentasi Terkait

- [Panduan Instalasi (INSTALL.md)](INSTALL.md)
- [Panduan Deployment (DEPLOYMENT.md)](DEPLOYMENT.md)
- [Dokumentasi API (API.md)](API.md)
