# Panduan Deployment

Sistem ini didesain untuk mudah di-deploy ke Vercel dengan database PostgreSQL di Neon/Supabase.

## Vercel Deployment

1. **Push kode** ke repository GitHub/GitLab.
2. Buka dashboard [Vercel](https://vercel.com/) dan buat project baru dari repository tersebut.
3. Di bagian **Environment Variables**, tambahkan:
   - `DATABASE_URL` (URL dari Neon / Supabase)
   - `NEXTAUTH_URL` (URL aplikasi di Vercel, contoh: `https://ldk-alhidayah.vercel.app`)
   - `NEXTAUTH_SECRET` (generate random string)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Deploy! Vercel akan otomatis mendeteksi konfigurasi Next.js dan menjalankan `npm run build`.

## Database (PostgreSQL)

Disarankan menggunakan managed PostgreSQL seperti:
- **Neon** (Serverless Postgres, gratis tier tersedia)
- **Supabase**

## Catatan Penting
- Pastikan tidak mengekspos variabel `CLOUDINARY_API_SECRET` ke client dengan awalan `NEXT_PUBLIC_`. Integrasi Cloudinary sudah dirancang sepenuhnya server-side.
- Cron Jobs: Jika Anda butuh menutup recruitment otomatis secara berbasis waktu, pertimbangkan untuk menambahkan Vercel Cron Jobs di `vercel.json`.
