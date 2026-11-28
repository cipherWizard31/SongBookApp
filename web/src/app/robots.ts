import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/login', '/api/admin'],
    },
    sitemap: 'https://selahkignit.vercel.app/sitemap.xml',
  };
}

