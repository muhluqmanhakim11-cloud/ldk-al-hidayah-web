"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    orgName: "",
    description: "",
    address: "",
    email: "",
    instagramUrl: "",
    youtubeUrl: "",
    tiktokUrl: "",
    facebookUrl: "",
    vercelBadgeUrl: ""
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
          description: data.description || "",
          address: data.address || "",
          email: data.email || "",
          instagramUrl: data.instagramUrl || "",
          youtubeUrl: data.youtubeUrl || "",
          tiktokUrl: data.tiktokUrl || "",
          facebookUrl: data.facebookUrl || "",
          vercelBadgeUrl: data.vercelBadgeUrl || ""
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Profil & Footer Website</h2>
            <p className="text-gray-500 mt-1">Ubah informasi organisasi yang tampil di bagian bawah halaman publik (Footer) dan halaman lainnya.</p>
          </div>

          {loading ? (
            <div className="p-10 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Organisasi</label>
                  <input
                    type="text"
                    name="orgName"
                    value={settings.orgName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="Contoh: LDK Al-Hidayah"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Singkat (Tampil di Footer)</label>
                  <textarea
                    name="description"
                    value={settings.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none"
                    placeholder="Unit Kegiatan Mahasiswa..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Lengkap</label>
                  <textarea
                    name="address"
                    value={settings.address}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none"
                    placeholder="Gedung Student Center..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Kontak</label>
                  <input
                    type="email"
                    name="email"
                    value={settings.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="halo@domain.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Link Instagram</label>
                  <input
                    type="url"
                    name="instagramUrl"
                    value={settings.instagramUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Link YouTube</label>
                  <input
                    type="url"
                    name="youtubeUrl"
                    value={settings.youtubeUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="https://youtube.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Link TikTok</label>
                  <input
                    type="url"
                    name="tiktokUrl"
                    value={settings.tiktokUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="https://tiktok.com/@..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Link Facebook</label>
                  <input
                    type="url"
                    name="facebookUrl"
                    value={settings.facebookUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 mt-6 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Pengaturan Server</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Vercel Status Badge URL</label>
                  <input
                    type="url"
                    name="vercelBadgeUrl"
                    value={settings.vercelBadgeUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="https://vercelbadge.vercel.app/api/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL status badge dari Vercel untuk menampilkan status server secara langsung di admin panel.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
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
