import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/admin/login', '/dashboard', '/chat'],
      },
    ],
    sitemap: 'https://nohu-lab.vercel.app/sitemap.xml',
  }
}
