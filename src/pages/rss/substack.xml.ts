// src/pages/rss/substack.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export const prerender = true;

export async function GET(context: APIContext) {
  const site = context.site!;
  
  // Journal + Essays + Art
  const [journal, essays, art] = await Promise.all([
    getCollection('journal'),
    getCollection('essays'),
    getCollection('art'),
  ]);

  const all = [...journal, ...essays, ...art];

  // Sort newest first using updatedDate fallback to pubDate
  all.sort((a, b) => {
    const da = new Date(a.data.updatedDate ?? a.data.pubDate).valueOf();
    const db = new Date(b.data.updatedDate ?? b.data.pubDate).valueOf();
    return db - da;
  });

  const items = all.map((entry) => {
    let basePath = '/journal/';
    if (entry.collection === 'essays') basePath = '/essays/';
    if (entry.collection === 'art') basePath = '/art/';

    const link = `${basePath}${entry.slug}`;

    return {
      title: entry.data.title ?? entry.slug,
      pubDate: entry.data.updatedDate ?? entry.data.pubDate,
      link,
      description: entry.data.description ?? '',
      // Key part: full body for Substack to import as the post content
      content: entry.body,
    };
  });

  return rss({
    site,
    title: 'Percept Index — Email-ready feed',
    description: 'Journal entries, essays, and art from Percept Index for distribution on Substack.',
    items,
  });
}
