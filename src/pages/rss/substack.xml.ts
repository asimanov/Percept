// src/pages/rss/substack.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export const prerender = true;

export async function GET(context: APIContext) {
  const site = context.site!;

  const [journal, essays, art] = await Promise.all([
    getCollection('journal', ({ data }) => data.exportToSubstack === true),
    getCollection('essays', ({ data }) => data.exportToSubstack === true),
    getCollection('art', ({ data }) => data.exportToSubstack === true),
  ]);

  const all = [...journal, ...essays, ...art];

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
      content: entry.body, // full content for Substack
    };
  });

  return rss({
    site,
    title: 'Percept Index — Substack export',
    description: 'Entries from Percept Index explicitly marked for Substack.',
    items,
  });
}
