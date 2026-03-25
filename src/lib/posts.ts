const postModules = import.meta.glob('$lib/posts/*.md', { eager: true });

export type BlogPost = {
	slug: string;
	title: string;
	date: string | null;
	description: string;
	excerpt: string;
	thumbnail: string;
	thumbnail_alt: string;
	tags: string[];
	component?: unknown;
};

function slugFromPath(path: string) {
	return path.split('/').pop()!.replace('.md', '');
}

export function getAllPosts(): BlogPost[] {
	const posts = Object.entries(postModules).map(([path, mod]: [string, any]) => ({
		slug: slugFromPath(path),
		title: mod.metadata?.title ?? slugFromPath(path),
		date: mod.metadata?.date ?? null,
		description: mod.metadata?.description ?? '',
		excerpt: mod.metadata?.excerpt ?? '',
		thumbnail: mod.metadata?.thumbnail ?? '',
		thumbnail_alt: mod.metadata?.thumbnail_alt ?? '',
		tags: mod.metadata?.tags ?? [],
		component: mod.default
	}));

	posts.sort((a, b) => {
		const da = a.date ? new Date(a.date).getTime() : 0;
		const db = b.date ? new Date(b.date).getTime() : 0;
		return db - da;
	});

	return posts;
}

export function getPostBySlug(slug: string): BlogPost | null {
	return getAllPosts().find((post) => post.slug === slug) ?? null;
}

export function getAdjacentPosts(slug: string) {
	const posts = getAllPosts();
	const index = posts.findIndex((post) => post.slug === slug);

	if (index === -1) {
		return { prev: null, next: null };
	}

	return {
		prev: posts[index + 1] ?? null,
		next: posts[index - 1] ?? null
	};
}
