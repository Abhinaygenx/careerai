import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/profile/', '/api/'],
      },
    ],
    sitemap: 'https://careerstart.in/sitemap.xml',
    host: 'https://careerstart.in',
  };
}
