import { Metadata } from "next";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Berita & Artikel",
};

export default async function BeritaPage() {
  const publishedArticles = await db.query.articles.findMany({
    where: eq(articles.status, 'PUBLISHED'),
    with: { author: true, division: true },
    orderBy: [desc(articles.publishedAt)],
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-green-800 text-white pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Berita & Artikel</h1>
          <p className="text-green-100 max-w-2xl mx-auto text-lg">Kumpulan wawasan, berita organisasi, dan tulisan keislaman.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 mt-12 md:mt-16">
        {publishedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedArticles.map(article => (
              <Link href={`/berita/${article.slug}`} key={article.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col">
                <div className="relative h-56 bg-gray-200 w-full overflow-hidden">
                  {article.coverImage ? (
                    <Image 
                      src={article.coverImage} 
                      alt={article.title} 
                      fill 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">Tanpa Gambar</div>
                  )}
                  {article.division && (
                    <div className="absolute top-4 left-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                      {article.division.name}
                    </div>
                  )}
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors line-clamp-2">{article.title}</h3>
                  <div className="text-sm text-gray-600 line-clamp-3 mb-4" dangerouslySetInnerHTML={{ __html: (article.content || "").substring(0, 150) + "..." }} />
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs mr-3">
                        {article.author?.name ? article.author.name.charAt(0) : 'A'}
                      </div>
                      <div className="text-xs">
                        <p className="font-medium text-gray-900">{article.author?.name || 'Admin'}</p>
                        <p className="text-gray-500">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }) : '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white border border-dashed rounded-xl shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">Belum ada artikel</h3>
            <p className="mt-1 text-gray-500">Belum ada tulisan atau berita yang dipublikasikan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
