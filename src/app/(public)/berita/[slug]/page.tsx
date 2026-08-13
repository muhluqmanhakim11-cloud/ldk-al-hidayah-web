import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const article = await db.query.articles.findFirst({
    where: eq(articles.slug, slug),
  });

  if (!article) {
    return { title: "Artikel Tidak Ditemukan" };
  }

  return {
    title: article.title,
    description: (article.content || "").substring(0, 160).replace(/<[^>]+>/g, ''), // Strip HTML tags for meta description
    openGraph: {
      title: article.title,
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}

export default async function BeritaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  
  const article = await db.query.articles.findFirst({
    where: eq(articles.slug, slug),
    with: { author: true, division: true },
  });

  if (!article || article.status !== 'PUBLISHED') {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header / Hero for Article */}
      <div className="relative h-[40vh] md:h-[60vh] w-full bg-gray-900">
        {article.coverImage ? (
          <Image 
            src={article.coverImage} 
            alt={article.title} 
            fill 
            sizes="100vw"
            className="object-cover opacity-50" 
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-green-900 opacity-80" />
        )}
        
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container mx-auto px-4 lg:px-8 pb-12 md:pb-16 max-w-4xl">
            {article.division && (
              <span className="inline-block bg-green-600 text-white font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                {article.division.name}
              </span>
            )}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center text-gray-300 text-sm gap-4 md:gap-6 mt-6">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold mr-3 backdrop-blur-sm">
                  {article.author?.name ? article.author.name.charAt(0) : 'A'}
                </div>
                <span>Oleh <strong className="text-white">{article.author?.name || 'Admin'}</strong></span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }) : '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 mt-12 max-w-4xl">
        <article 
          className="prose prose-lg prose-green max-w-none prose-headings:font-bold prose-a:text-green-600"
          dangerouslySetInnerHTML={{ __html: article.content || "" }}
        />
        
        <div className="mt-16 pt-8 border-t">
          <Link href="/berita" className="inline-flex items-center text-green-600 hover:text-green-800 font-medium transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Kembali ke Daftar Berita
          </Link>
        </div>
      </div>
    </div>
  );
}
