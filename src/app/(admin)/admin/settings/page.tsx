"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    orgName: "",
    logoUrl: "",
    description: "",
    address: "",
    email: "",
    instagramUrl: "",
    youtubeUrl: "",
    tiktokUrl: "",
    facebookUrl: "",
    vercelBadgeUrl: "",
    popupEnabled: false,
    popupImage: "",
    popupDuration: 10
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          orgName: data.orgName || "",
          logoUrl: data.logoUrl || "",
          description: data.description || "",
          address: data.address || "",
          email: data.email || "",
          instagramUrl: data.instagramUrl || "",
          youtubeUrl: data.youtubeUrl || "",
          tiktokUrl: data.tiktokUrl || "",
          facebookUrl: data.facebookUrl || "",
          vercelBadgeUrl: data.vercelBadgeUrl || "",
          popupEnabled: data.popupEnabled || false,
          popupImage: data.popupImage || "",
          popupDuration: data.popupDuration || 10
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        alert("Pengaturan berhasil disimpan!");
        router.refresh();
      } else {
        alert("Gagal menyimpan pengaturan.");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>

      <div className="p-4 md:p-6 lg:p-8">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden max-w-4xl">
          <div className="p-6 border-b border-gray-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Profil & Footer Website</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Ubah informasi organisasi yang tampil di bagian bawah halaman publik (Footer) dan halaman lainnya.</p>
          </div>

          {loading ? (
            <div className="p-10 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Logo Organisasi</label>
                  <div className="flex items-center gap-4">
                    {settings.logoUrl ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200 dark:border-slate-700">
                        <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setSettings(prev => ({ ...prev, logoUrl: "" }))}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-400 border border-gray-200 dark:border-slate-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                    )}
                    <label className="cursor-pointer bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors">
                      <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      Unggah Logo
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          const formData = new FormData();
                          formData.append("file", file);
                          formData.append("folder", "ldk-alhidayah/logo");
                          
                          try {
                            const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
                            const data = await res.json();
                            if (res.ok) {
                              setSettings(prev => ({ ...prev, logoUrl: data.url }));
                            } else {
                              alert(data.error || "Upload gagal");
                            }
                          } catch (err) {
                            alert("Terjadi kesalahan saat upload");
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Organisasi</label>
                  <input
                    type="text"
                    name="orgName"
                    value={settings.orgName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="Contoh: LDK Al-Hidayah"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Deskripsi Singkat (Tampil di Footer)</label>
                  <textarea
                    name="description"
                    value={settings.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none"
                    placeholder="Unit Kegiatan Mahasiswa..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Alamat Lengkap</label>
                  <textarea
                    name="address"
                    value={settings.address}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none"
                    placeholder="Gedung Student Center..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Kontak</label>
                  <input
                    type="email"
                    name="email"
                    value={settings.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="halo@domain.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Link Instagram</label>
                  <input
                    type="url"
                    name="instagramUrl"
                    value={settings.instagramUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Link YouTube</label>
                  <input
                    type="url"
                    name="youtubeUrl"
                    value={settings.youtubeUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="https://youtube.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Link TikTok</label>
                  <input
                    type="url"
                    name="tiktokUrl"
                    value={settings.tiktokUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="https://tiktok.com/@..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Link Facebook</label>
                  <input
                    type="url"
                    name="facebookUrl"
                    value={settings.facebookUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>
              
              <div className="border-t border-gray-100 dark:border-slate-800 mt-6 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Pengaturan Popup Banner</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Kelola banner pengumuman atau ucapan yang muncul di atas layar ketika pengunjung membuka website.</p>
                
                <div className="bg-gray-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-slate-800 space-y-6">
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>Status Popup</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Aktifkan untuk menampilkan banner popup di halaman beranda saat situs pertama kali dibuka.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="popupEnabled"
                        checked={settings.popupEnabled}
                        onChange={(e) => setSettings(prev => ({ ...prev, popupEnabled: e.target.checked }))}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-900 after:border-gray-300 dark:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Banner Ucapan / Pengumuman</label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-6 text-center bg-white dark:bg-slate-900">
                        {settings.popupImage ? (
                          <div className="relative">
                            <img src={settings.popupImage} alt="Popup Banner" className="max-h-40 mx-auto rounded-lg" />
                            <button 
                              type="button" 
                              onClick={() => setSettings(prev => ({ ...prev, popupImage: "" }))}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-4">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-gray-400 mb-3">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                            <label className="cursor-pointer bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors">
                              <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                              Unggah Banner
                              <input 
                                type="file" 
                                accept="image/*"
                                className="hidden" 
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  
                                  const formData = new FormData();
                                  formData.append("file", file);
                                  formData.append("folder", "ldk-alhidayah/popup");
                                  
                                  try {
                                    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
                                    const data = await res.json();
                                    if (res.ok) {
                                      setSettings(prev => ({ ...prev, popupImage: data.url }));
                                    } else {
                                      alert(data.error || "Upload gagal");
                                    }
                                  } catch (err) {
                                    alert("Terjadi kesalahan saat upload");
                                  }
                                }}
                              />
                            </label>
                            <p className="text-[10px] text-gray-400 mt-2">Gunakan rasio gambar landscape atau persegi.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Durasi Penayangan (Detik)
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Tentukan berapa detik banner akan muncul sebelum tertutup secara otomatis.</p>
                      <input
                        type="number"
                        name="popupDuration"
                        value={settings.popupDuration}
                        onChange={handleChange}
                        min={3}
                        max={60}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        placeholder="10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Pengaturan"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
