# Dokumentasi API Internal

Sebagian besar data fetching dilakukan melalui Server Components langsung ke database via Drizzle. Namun, beberapa operasi state-mutating difasilitasi oleh API Routes di Next.js App Router.

## `POST /api/public/recruitments`
- **Fungsi**: Mendaftarkan anggota baru.
- **Body**: JSON sesuai skema form.
- **Rate Limit**: Hanya memperbolehkan unik NIM dalam periode aktif (dicek via database constraint `period_nim_idx`).

## `/api/admin/*`
Semua route di bawah `api/admin/` membutuhkan **sesi login yang valid**.

### `GET /api/admin/divisions`
Mendapatkan daftar divisi aktif.

### `POST /api/admin/galleries/[id]/images`
- **Fungsi**: Upload gambar ke Cloudinary dan simpan metadata di database.
- **Tipe Input**: `FormData` dengan field `image`.
- **Role**: `SUPER_ADMIN` atau `KETUA` atau `ADMIN_BIDANG` (untuk galerinya sendiri).

### `PATCH /api/admin/recruitments/[id]/status`
- **Fungsi**: Mengubah status pendaftar (PENDING, REVIEWED, ACCEPTED, REJECTED).
- **Body**: `{ newStatus: string }`
- **Role**:
  - `SUPER_ADMIN`, `KETUA` dapat mengubah semua status.
  - `ADMIN_BIDANG` hanya dapat mengubah ke `REVIEWED` jika pendaftar melamar ke bidangnya.

*Untuk endpoint lainnya, cek `src/app/api/admin/`.*
