# Aturan Workspace: LDK Al-Hidayah Web

## Workflow Push & Deploy

### Aturan Utama (WAJIB DIIKUTI)
Setiap kali selesai membuat perubahan / penyempurnaan apapun pada kode:

1. **Langsung commit** — jalankan `git add -A` dan `git commit -m "..."` dengan pesan yang jelas
2. **JANGAN jalankan `git push`** — biarkan USER yang menjalankan `git push` sendiri dari terminal mereka (karena mereka perlu memilih akun GitHub yang tepat: `muhluqmanhakim11-cloud`)
3. **JANGAN gunakan `vercel --prod` CLI** — CLI terhubung ke akun yang salah (`dehaakim-s-studio`). Deploy harus lewat GitHub integration otomatis
4. **Setelah user push**, pantau status build Vercel di: `https://vercel.com/muhluqmanhakim11-cloud/ldk-al-hidayah-web/deployments`

### Ringkasan Alur
```
Saya selesai coding
    ↓
git add -A + git commit (oleh AGENT)
    ↓
User jalankan git push dari terminal (pilih akun muhluqmanhakim11-cloud)
    ↓
Cek Vercel build status
```

## Konteks Proyek
- **Repo**: `muhluqmanhakim11-cloud/ldk-al-hidayah-web` (BUKAN dehaakims-studio)
- **Framework**: Next.js 16 (App Router)
- **Deploy**: Vercel via GitHub integration (otomatis dari push ke branch `main`)
- **Akun Vercel CLI**: Salah (dehaakim-s-studio) — jangan dipakai untuk deploy
