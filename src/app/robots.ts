import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ldk-al-hidayah.vercel.app";
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/login'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
