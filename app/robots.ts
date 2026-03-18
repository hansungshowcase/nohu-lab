import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/admin/login'],
      },
    ],
    sitemap: 'https://nohu-lab.vercel.app/sitemap.xml',
  }
}
