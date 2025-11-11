import { defineCollection, z } from 'astro:content';

const journal = defineCollection({
	type: 'content',
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

const art = defineCollection({
	type: 'content',
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
	type: 'content',
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
	type: 'content',
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

export const collections = { journal, art, essays, M43 };
