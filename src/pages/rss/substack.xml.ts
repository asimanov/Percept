// src/pages/rss/substack.xml.ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

function escapeCdata(value: string): string {
  return value.replace(/]]>/g, ']]]]><![CDATA[>');
}

function buildItem(options: {
  title: string;
  url: string;
  description?: string;
  pubDate: Date;
}) {
  const { title, url, description = '', pubDate } = options;

  return `
    <item>
      <title><![CDATA[${escapeCdata(title)}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate.toUTCString()}</pubDate>
      <description><![CDATA[${escapeCdata(description)}]]></description>
    </item>`;
}

export const GET: APIRoute = async (context) => {
  try {
    const site = context.site?.toString() || 'https://perceptindex.com';

    // Journal + Essays + Art
    const [journal, essays, art] = await Promise.all([
      getCollection('journal'),
      getCollection('essays'),
      getCollection('art'),
    ]);

    const all = [...journal, ...essays, ...art].sort((a, b) => {
      const da = new Date(a.data.updatedDate ?? a.data.pubDate).valueOf();
      const db = new Date(b.data.updatedDate ?? b.data.pubDate).valueOf();
      return db - da;
    });

    const items = all
      .map((entry) => {
        let basePath = '/journal';
        if (entry.collection === 'essays') basePath = '/essays';
        if (entry.collection === 'art') basePath = '/art';

        const url = new URL(
          `${basePath}/${entry.slug}/`,
          site
        ).toString();

        const title = entry.data.title || entry.slug;
        const description = entry.data.description || '';
        const pubDate = new Date(entry.data.updatedDate ?? entry.data.pubDate);

        return buildItem({
          title,
          url,
          description,
          pubDate,
        });
      })
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Percept Index — Email-ready feed</title>
  <link>${site}</link>
  <description>Selected journal entries, essays, and art from Percept Index for distribution on Substack.</description>
  ${items}
</channel>
</rss>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
      },
    });
  } catch {
    return new Response('RSS generation error', { status: 500 });
  }
};
