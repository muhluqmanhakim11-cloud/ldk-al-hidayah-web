import { Metadata } from "next";
import { db } from "@/db";
import { recruitments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import RecruitmentStatusForm from "@/components/admin/RecruitmentStatusForm";

export const metadata: Metadata = {
  title: "Detail Pendaftar",
};

export default async function RecruitmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return redirect("/login");

  const { id } = await params;
  const recruitmentId = parseInt(id, 10);
  
  if (isNaN(recruitmentId)) {
    notFound();
  }

  const data = await db.query.recruitments.findFirst({
    where: eq(recruitments.id, recruitmentId),
    with: {
      period: true,
      interestedDivision: true,
      logs: {
        with: { changedByUser: true },
        orderBy: (logs, { desc }) => [desc(logs.createdAt)]
      }
    }
  });

  if (!data) notFound();

  // RBAC isolation for Admin Bidang
  if (session.user.role === 'ADMIN_BIDANG' && data.interestedDivisionId !== session.user.divisionId) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-6 rounded-xl border border-red-200">
          <h2 className="text-xl font-bold mb-2">Akses Ditolak</h2>
          <p>Anda tidak berhak melihat data pendaftar untuk divisi lain.</p>
          <Link href="/admin/recruitment" className="inline-block mt-4 text-red-800 dark:text-red-300 underline">Kembali ke Daftar</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/recruitment" className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 mb-2 inline-flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Kembali
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Detail Pendaftar: {data.name}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-bold
            ${data.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : ''}
            ${data.status === 'REVIEWED' ? 'bg-blue-100 text-blue-700 dark:text-blue-400' : ''}
            ${data.status === 'ACCEPTED' ? 'bg-green-100 text-green-700 dark:text-green-400' : ''}
            ${data.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:text-red-400' : ''}
          `}>
            {data.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Biodata */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b">Biodata Lengkap</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Nama Lengkap</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium">{data.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">NIM</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium">{data.nim}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Program Studi</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium">{data.studyProgram}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Semester</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium">{data.semester}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Email</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium">{data.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">WhatsApp</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium"><a href={`https://wa.me/${data.whatsapp?.replace(/^0/, '62')}`} target="_blank" rel="noreferrer" className="text-green-600 hover:underline">{data.whatsapp}</a></p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Divisi Diminati</p>
                <p className="text-gray-900 dark:text-gray-100 font-bold">{data.interestedDivision?.name || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Alasan Bergabung</p>
                <p className="text-gray-900 dark:text-gray-100 mt-1 whitespace-pre-wrap p-3 bg-gray-50 dark:bg-slate-950 rounded border">{data.reason}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b">Riwayat Perubahan Status</h3>
            {data.logs && data.logs.length > 0 ? (
              <ul className="space-y-4">
                {data.logs.map(log => (
                  <li key={log.id} className="flex items-start">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        Status diubah dari <span className="font-semibold">{log.oldStatus || 'NONE'}</span> menjadi <span className="font-semibold text-green-600">{log.newStatus}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Oleh: {log.changedByUser?.name} pada {new Date(log.createdAt).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada riwayat perubahan status.</p>
            )}
          </div>
        </div>

        {/* Right Column: Photo & Actions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border text-center">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b text-left">Pas Foto</h3>
            {data.photoUrl ? (
              <div className="relative w-48 h-64 mx-auto rounded-lg overflow-hidden border shadow-sm">
                <Image src={data.photoUrl} alt={`Foto ${data.name}`} fill className="object-cover" sizes="200px" />
              </div>
            ) : (
              <div className="w-48 h-64 mx-auto bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-gray-400 border border-dashed">
                Tidak ada foto
              </div>
            )}
          </div>

          <RecruitmentStatusForm 
             recruitmentId={data.id} 
             currentStatus={data.status} 
             userRole={session.user.role || ""} 
          />
        </div>
      </div>
    </div>
  );
}
