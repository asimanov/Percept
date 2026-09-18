import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import os from 'node:os';
import path from 'node:path';

// https://astro.build/config
export default defineConfig({
	site: 'https://perceptindex.com',
	integrations: [mdx(), sitemap()],
	trailingSlash: 'ignore', // Options: 'always', 'never', or 'ignore'
	compressHTML: true,
	// Keep the pre-v7 remark/rehype markdown pipeline; the v7 default (Sätteri)
	// changes dash/quote typography and heading ids in rendered content.
	markdown: { processor: unified() },
	vite: {
		// Vite's dep-optimizer cache defaults to node_modules/.vite, which lives
		// inside the Dropbox tree. Dropbox's file watcher (and Defender) briefly
		// lock that folder during the `deps_temp_* -> deps` rename, causing the
		// intermittent "EBUSY: resource busy or locked, rename ..." build failures.
		// Point the cache at a local path outside Dropbox so the rename is never
		// contended.
		cacheDir: path.join(os.homedir(), '.cache', 'vite-percept-index'),
	},
});
