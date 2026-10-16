const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://indoskysea.primadev.id';

export default function sitemap() {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
  ];
}
