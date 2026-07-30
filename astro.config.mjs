import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';

// https://astro.build/config
export default defineConfig({
	site: 'https://perceptindex.com',
	integrations: [mdx(), sitemap()],
	trailingSlash: 'ignore', // Options: 'always', 'never', or 'ignore'
	compressHTML: true,
	// Keep the pre-v7 remark/rehype markdown pipeline; the v7 default (Sätteri)
	// changes dash/quote typography and heading ids in rendered content.
	markdown: { processor: unified() },
});
