# PROJECT SPEC
# WEBSITE LDK AL-HIDAYAH STMIK IKMI CIREBON

## 1. TUJUAN PROJECT

Buat website resmi LDK Al-Hidayah STMIK IKMI Cirebon.

Tujuan utama website:

- memperkenalkan LDK kepada mahasiswa baru/camaba PKKMB
- menampilkan profil LDK
- menampilkan visi dan misi
- menampilkan struktur organisasi
- memperkenalkan setiap bidang/divisi
- menampilkan program kerja
- menampilkan agenda dan kegiatan
- menampilkan berita/artikel
- menampilkan dokumentasi kegiatan
- menyediakan informasi recruitment
- menarik mahasiswa agar tertarik bergabung dengan LDK

Website harus dapat digunakan kembali untuk periode kepengurusan berikutnya.


## 2. SUMBER DATA ORGANISASI

Gunakan file:

ORGANIZATION_DATA.md

sebagai sumber data organisasi.

Jangan mengarang:

- visi
- misi
- struktur
- nama pengurus
- jabatan
- bidang
- program kerja
- agenda organisasi

Jika data belum tersedia, gunakan:

"Data belum diisi"


## 3. TEKNOLOGI

Gunakan:

- Next.js
- TypeScript
- Tailwind CSS
- PostgreSQL Neon
- Drizzle ORM
- REST API
- Cloudinary
- GitHub
- Vercel

Deployment:

GitHub → Vercel

Database:

Neon PostgreSQL

Storage gambar:

Cloudinary


## 4. HALAMAN WEBSITE PUBLIC

Buat halaman:

/

Home

/profil

Profil LDK

/profil/visi-misi

Visi & Misi

/organisasi

Struktur Organisasi

/organisasi/bidang

Bidang/Divisi

/program-kerja

Program Kerja

/agenda

Agenda/Kegiatan

/berita

Berita

/artikel

Artikel

/dokumentasi

Dokumentasi/Galeri

/gabung

Recruitment

/kontak

Kontak


## 5. HOMEPAGE

Homepage harus dibuat menarik untuk mahasiswa baru.

Urutan:

1. Hero
2. Pengenalan LDK
3. Visi & Misi
4. Kenapa Bergabung
5. Bidang/Divisi
6. Program Kerja
7. Kegiatan Terbaru
8. Dokumentasi
9. Artikel Terbaru
10. CTA Gabung LDK
11. Footer

CTA utama:

"Gabung LDK"


## 6. PROFIL

Tampilkan:

- nama LDK
- deskripsi
- sejarah/profil
- visi
- misi
- nilai organisasi
- tujuan

Gunakan data dari ORGANIZATION_DATA.md.


## 7. STRUKTUR ORGANISASI

Tampilkan struktur:

- Pembina
- Dewan Penasehat
- Pengurus Harian
- Bidang/Divisi

Struktur harus berasal dari database.

Jangan hanya membuat struktur sebagai gambar.

Admin harus dapat mengubah struktur melalui dashboard.


## 8. BIDANG / DIVISI

Tampilkan setiap bidang secara terpisah.

Setiap bidang mempunyai:

- nama
- deskripsi
- koordinator
- anggota
- program kerja
- kegiatan
- dokumentasi

Setiap bidang harus mempunyai halaman detail.

Contoh:

/organisasi/bidang/dkm

/organisasi/bidang/kaderisasi

/organisasi/bidang/kominfo

dst.


## 9. PROGRAM KERJA

Program kerja berasal dari ORGANIZATION_DATA.md.

Program kerja harus disimpan di database.

Admin dapat:

- tambah
- lihat
- edit
- hapus
- publish

Data program:

- nama
- bidang
- periode
- deskripsi
- tujuan
- waktu
- status
- dokumentasi


## 10. AGENDA / KEGIATAN

Admin dapat membuat kegiatan.

Data:

- nama kegiatan
- tanggal
- waktu
- lokasi
- bidang
- program kerja
- deskripsi
- cover
- status

Public dapat melihat agenda kegiatan.


## 11. BERITA / ARTIKEL

Admin dapat:

- tambah
- edit
- hapus
- publish

Data:

- judul
- slug
- isi
- cover
- penulis
- bidang
- tanggal
- status

Gunakan editor yang nyaman untuk admin.


## 12. DOKUMENTASI / GALERI

Buat sistem galeri.

Struktur:

Kegiatan
→ Galeri
→ Banyak foto

Admin dapat:

- membuat galeri
- upload foto
- edit
- hapus
- menentukan cover
- memberikan deskripsi

Public dapat melihat dokumentasi dalam bentuk gallery.


## 13. RECRUITMENT

Buat halaman:

/gabung

Form:

- Nama
- NIM
- Program Studi
- Semester
- WhatsApp
- Email
- Bidang yang diminati
- Alasan bergabung

Data masuk ke admin dashboard.

Data recruitment bersifat PRIVATE.


## 14. ADMIN DASHBOARD

Route:

/admin

Menu:

- Dashboard
- Profil
- Periode
- Pengurus
- Struktur
- Bidang
- Program Kerja
- Agenda
- Berita
- Artikel
- Dokumentasi
- Galeri
- Recruitment
- User


Semua data utama harus dapat dikelola melalui CRUD.


## 15. ROLE / HAK AKSES

Gunakan:

SUPER_ADMIN
KETUA
ADMIN_BIDANG

SUPER_ADMIN:

Akses seluruh sistem.

KETUA:

Dapat melihat dan mengelola seluruh data organisasi
sesuai permission.

ADMIN_BIDANG:

Hanya dapat mengelola konten bidangnya sendiri.


Contoh:

ADMIN_KOMINFO
→ konten Kominfo

ADMIN_KADERISASI
→ konten Kaderisasi

ADMIN_DKM
→ konten DKM


Gunakan RBAC.

Jangan hanya menyembunyikan menu frontend.
Permission harus diperiksa di server/API.


## 16. MULTI PERIODE

Website harus mendukung banyak periode.

Contoh:

2026/2027
2027/2028
2028/2029

Buat tabel:

periods

Data organisasi seperti:

- pengurus
- struktur
- program kerja
- kegiatan

harus dapat dikaitkan dengan periode.


Jangan menghapus data periode sebelumnya.


## 17. DATABASE NEON

Gunakan Neon PostgreSQL.

Gunakan Drizzle ORM.

Minimal tabel:

users
periods
divisions
members
positions
programs
events
articles
galleries
gallery_images
recruitments
media_assets

Gunakan foreign key dan index yang diperlukan.


## 18. API

Gunakan REST API.

Contoh:

GET    /api/programs
POST   /api/programs
GET    /api/programs/:id
PATCH  /api/programs/:id
DELETE /api/programs/:id

Buat API untuk:

- users
- members
- divisions
- programs
- events
- articles
- galleries
- recruitments

Client tidak boleh langsung mengakses database.


## 19. CLOUDINARY

Gunakan Cloudinary untuk semua gambar.

Jangan menyimpan file gambar di Neon.

Neon hanya menyimpan:

- public_id
- secure_url
- format
- width
- height
- ukuran file
- metadata yang diperlukan


Folder Cloudinary:

ldk-al-hidayah/
├── members/
├── programs/
├── events/
├── articles/
├── galleries/
└── branding/


## 20. OPTIMASI GAMBAR

Karena menggunakan Cloudinary Free:

- gunakan q_auto
- gunakan f_auto
- gunakan responsive image
- gunakan Next/Image
- lazy loading
- jangan menampilkan file original besar jika tidak diperlukan

Kualitas gambar harus tetap bagus.

Maksimal ukuran upload awal:

10 MB.

Jangan melakukan kompresi berlebihan sampai gambar terlihat pecah.


## 21. REALTIME CONTENT

Admin harus dapat mengubah:

- berita
- artikel
- program kerja
- agenda
- dokumentasi
- struktur
- pengurus

tanpa harus mengubah source code.

Setelah admin menyimpan perubahan:

Admin
→ API
→ Neon
→ website mendapatkan data terbaru

Gunakan cache/revalidation yang sesuai dengan Next.js.


## 22. SECURITY

Gunakan:

- authentication
- RBAC
- validation
- password hashing
- HTTP-only session/cookie
- environment variables

Jangan menyimpan secret di GitHub.

Jangan expose:

DATABASE_URL
CLOUDINARY_API_SECRET
AUTH_SECRET


## 23. SEO

Buat:

- metadata
- sitemap
- robots.txt
- Open Graph
- favicon

Website harus SEO friendly.


## 24. DESIGN

Gaya website:

- modern
- islami
- profesional
- youthful
- clean
- tidak terlalu ramai

Mobile first.

Target utama:

mahasiswa baru/camaba PKKMB.

Website harus terasa menarik,
modern, dan membuat mahasiswa ingin
mengenal serta bergabung dengan LDK.


## 25. GITHUB

Gunakan GitHub sebagai repository.

Struktur sederhana:

main
develop

Feature branch jika diperlukan.

Jangan commit:

.env
.env.local
secret
API key


Buat:

.env.example


## 26. VERCEL

Deployment:

GitHub → Vercel

Production:

main

Preview:

develop / feature branch

Environment variable diatur melalui Vercel.


## 27. TAHAP PENGERJAAN

Jangan membuat seluruh project sekaligus.

Tahap 1:
Setup Next.js + TypeScript + Tailwind

Tahap 2:
Database Neon + Drizzle

Tahap 3:
Authentication + RBAC

Tahap 4:
Admin Dashboard

Tahap 5:
CRUD organisasi

Tahap 6:
CRUD program + kegiatan

Tahap 7:
Cloudinary + dokumentasi

Tahap 8:
Public website

Tahap 9:
Recruitment

Tahap 10:
SEO + responsive + testing

Tahap 11:
GitHub + Vercel


## 28. ATURAN PENTING

1. Jangan mengarang data organisasi.
2. Gunakan ORGANIZATION_DATA.md sebagai sumber data.
3. Jangan hard-code data dinamis.
4. Semua data utama harus melalui database.
5. Jangan menyimpan gambar di database.
6. Jangan menyimpan secret di GitHub.
7. Jangan memberikan akses seluruh sistem kepada admin bidang.
8. Jangan menghapus data periode lama.
9. Website harus dapat digunakan oleh pengurus periode berikutnya.
10. Jangan menambahkan fitur besar di luar scope tanpa persetujuan.


## 29. INSTRUKSI AWAL UNTUK ANTIGRAVITY

Baca:

PROJECT_SPEC.md

dan:

ORGANIZATION_DATA.md

terlebih dahulu.

Jangan langsung membuat seluruh website.

Untuk tahap pertama lakukan:

1. Analisis kebutuhan.
2. Buat struktur folder.
3. Buat rancangan database Neon.
4. Buat relasi tabel.
5. Buat rancangan API.
6. Buat rancangan Role & Permission.

Setelah selesai, tampilkan hasil rancangan.

JANGAN lanjut coding seluruh fitur sebelum
rancangan tersebut direview dan disetujui.


# END PROJECT SPEC