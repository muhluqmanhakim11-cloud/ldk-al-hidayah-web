# Panduan Instalasi Lokal

## Persyaratan Sistem

- Node.js versi 18 atau lebih baru
- PostgreSQL Server
- Akun Cloudinary (untuk storage gambar)

## Langkah-langkah

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd ldk-al-hidayah
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**
   Salin `.env.example` ke `.env.local` (atau buat file `.env.local`):
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/ldk_alhidayah"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   ```

4. **Migrasi Database**
   Jalankan migrasi skema Drizzle ORM:
   ```bash
   npx drizzle-kit push
   ```

5. **Jalankan Aplikasi**
   ```bash
   npm run dev
   ```

Aplikasi sekarang dapat diakses di `http://localhost:3000`.
Login admin awal bisa dibuat dengan langsung menambahkan baris di tabel `users` atau melalui seeder.
