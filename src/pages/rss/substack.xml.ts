// src/pages/rss/substack.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export const prerender = true;

export async function GET(context: APIContext) {
  const site = context.site!;

  // Only entries explicitly marked for Substack
  const [journal, essays, art] = await Promise.all([
    getCollection('journal', ({ data }) => data.exportToSubstack === true),
    getCollection('essays', ({ data }) => data.exportToSubstack === true),
    getCollection('art', ({ data }) => data.exportToSubstack === true),
  ]);

  const all = [...journal, ...essays, ...art];

  // Newest first by updatedDate fallback to pubDate
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
      content: markdownToHtml(entry.body), // HTML for Substack
    };
  });

  return rss({
    site,
    title: 'Percept Index — Substack export',
    description: 'Entries from Percept Index explicitly marked for Substack.',
    items,
  });
}

/**
 * Minimal markdown → HTML converter tailored for your content.
 * - Keeps existing raw HTML lines as-is (Field Notes header, etc.).
 * - Converts # / ## / ### headings.
 * - Converts bullet lists (-, *, +).
 * - Wraps other non-empty lines in <p>.
 * This is intentionally simple to avoid surprises.
 */
function markdownToHtml(md: string): string {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;

  const flushList = () => {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine;

    // Preserve raw HTML blocks untouched
    if (line.trim().startsWith('<') && line.trim().endsWith('>')) {
      flushList();
      out.push(line);
      continue;
    }

    // Headings: # .. ######
    const hMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (hMatch) {
      flushList();
      const level = hMatch[1].length;
      const text = escapeHtml(hMatch[2].trim());
      out.push(`<h${level}>${text}</h${level}>`);
      continue;
    }

    // Bullet list items: -, *, +
    if (/^\s*[-*+]\s+/.test(line)) {
      const text = line.replace(/^\s*[-*+]\s+/, '').trim();
      if (!inList) {
        inList = true;
        out.push('<ul>');
      }
      out.push(`<li>${escapeHtml(text)}</li>`);
      continue;
    }

    // Blank line -> close list / paragraph gap
    if (line.trim() === '') {
      flushList();
      out.push('');
      continue;
    }

    // Regular paragraph
    flushList();
    out.push(`<p>${escapeHtml(line.trim())}</p>`);
  }

  flushList();
  return out.join('\n');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
