export const dynamic = 'force-dynamic';
import { Metadata } from "next";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Kegiatan & Agenda",
};

export default async function KegiatanPage() {
  const publishedEvents = await db.query.events.findMany({
    where: eq(events.status, 'PUBLISHED'),
    with: { division: true },
    orderBy: [desc(events.date)],
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-green-800 text-white pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Kegiatan & Agenda</h1>
          <p className="text-green-100 max-w-2xl mx-auto text-lg">Informasi terbaru mengenai agenda kegiatan LDK Al-Hidayah.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 mt-12 md:mt-16">
        {publishedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedEvents.map(event => (
              <div key={event.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="p-6 flex flex-col h-full">
                  <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">
                    {event.division?.name || 'Umum'}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors">{event.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">{event.description}</p>
                  
                  <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {event.date ? new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }) : '-'}
                    </div>
                    {event.time && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {event.time}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {event.location || '-'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white border border-dashed rounded-xl shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">Belum ada kegiatan</h3>
            <p className="mt-1 text-gray-500">Tidak ada agenda kegiatan yang dipublikasikan saat ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}

