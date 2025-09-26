import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export const prerender = true;

export async function GET(context: APIContext) {
  // Load each collection
  const [journal, art, M43, essays] = await Promise.all([
    getCollection('journal'),
    getCollection('art'),
    getCollection('M43'),
    getCollection('essays'),
  ]);

  // Flatten. Do not create your own `collection` field.
  const all = [...journal, ...art, ...M43, ...essays];

  // Labels and base paths keyed by the built-in post.collection value
  const labels = {
    journal: 'Journal',
    art: 'Art',
    M43: 'M43',
    essays: 'Essays',
  } as const;

  const basePaths = {
    journal: '/journal/',
    art: '/art/',
    M43: '/M43/',
    essays: '/essays/',
  } as const;

  // Sort newest first by updatedDate, then pubDate
  all.sort((a, b) => {
    const da = new Date(a.data.updatedDate ?? a.data.pubDate).valueOf();
    const db = new Date(b.data.updatedDate ?? b.data.pubDate).valueOf();
    return db - da;
  });

  const recent = all.slice(0, 100);

  const items = recent.map((post) => {
    const name = post.collection as keyof typeof basePaths;
    const label = labels[name];
    const base = basePaths[name];

    const linkPath = `${base}${post.slug}`;
    const absLink = new URL(linkPath, context.site!).toString();

    const bg = post.data.background
      ? new URL(post.data.background, context.site!).toString()
      : null;

    const enclosure = bg ? `<enclosure url="${bg}" length="0" type="${inferMime(bg)}" />` : '';
    const author = post.data.author ? `<author>${escapeXml(post.data.author)}</author>` : '';
    const guid = `<guid isPermaLink="true">${absLink}</guid>`;
    const category = `<category>${escapeXml(label)}</category>`;

    return {
      title: post.data.title ?? post.slug,
      description: post.data.description ?? '',
      link: linkPath,
      pubDate: post.data.updatedDate ?? post.data.pubDate,
      customData: `${guid}${author}${category}${enclosure}`,
    };
  });

  return rss({
    site: context.site!, // site is set in astro.config.mjs
    title: 'Percept Index — All updates',
    description: 'New writing, art, photography, and essays from Percept Index',
    items,
  });
}

// ---- helpers ----
function inferMime(url: string): string {
  const u = url.toLowerCase();
  if (u.endsWith('.jpg') || u.endsWith('.jpeg')) return 'image/jpeg';
  if (u.endsWith('.png')) return 'image/png';
  if (u.endsWith('.webp')) return 'image/webp';
  if (u.endsWith('.gif')) return 'image/gif';
  return 'image/*';
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
