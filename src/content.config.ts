import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const art = defineCollection({
	loader: glob({ base: './src/content/art', pattern: '**/*.md' }),
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		author: z.string().optional(),
		tags: z.string().optional(),
		background: z.string().optional(),
		asset: z.string().optional(),
		thumb: z.string().optional(),
		collection: z.string().optional(),
		related: z.string().optional(),
		exportToSubstack: z.boolean().optional(),
	}),
});

const essays = defineCollection({
	loader: glob({ base: './src/content/essays', pattern: '**/*.md' }),
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		author: z.string().optional(),
		tags: z.string().optional(),
		background: z.string().optional(),
		exportToSubstack: z.boolean().optional(),
	}),
});

const M43 = defineCollection({
	loader: glob({ base: './src/content/M43', pattern: '**/*.md' }),
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		author: z.string().optional(),
		background: z.string().optional(),
		asset: z.string().optional(),
		thumb: z.string().optional(),
		related: z.string().optional(),
	}),
});

const fieldNotes = defineCollection({
	loader: glob({ base: './src/content/field-notes', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		author: z.string().optional(),
		tags: z.string().optional(),
		background: z.string().optional(),
		asset: z.string().optional(),
		thumb: z.string().optional(),
		related: z.string().optional(),
		exportToSubstack: z.boolean().optional(),
	}),
});

export const collections = { art, essays, M43, 'field-notes': fieldNotes };
