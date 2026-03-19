export const prerender = true;

const postModules = import.meta.glob('$lib/posts/*.md', { eager: true });

function slugFromPath(path: string) {
	return path.split('/').pop()!.replace('.md', '');
}

export function load() {
	const posts = Object.entries(postModules).map(([path, mod]: any) => ({
		slug: slugFromPath(path),
		title: mod.metadata?.title ?? slugFromPath(path),
		date: mod.metadata?.date ?? null,
		description: mod.metadata?.description ?? '',
		thumbnail: mod.metadata?.thumbnail ?? '',
		thumbnail_alt: mod.metadata?.thumbnail ?? '',
		tags: mod.metadata?.tags ?? [],
		excerpt: mod.metadata?.excerpt ?? ''
	}));

	posts.sort((a, b) => {
		const da = a.date ? new Date(a.date).getTime() : 0;
		const db = b.date ? new Date(b.date).getTime() : 0;
		return db - da;
	});

	return { posts };
}
