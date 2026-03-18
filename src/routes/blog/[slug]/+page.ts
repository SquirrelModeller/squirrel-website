import { error } from '@sveltejs/kit';

export const prerender = true;

const postModules = import.meta.glob('$lib/posts/*.md', { eager: true });

function slugFromPath(path: string) {
	return path.split('/').pop()!.replace('.md', '');
}

export function entries() {
	return Object.keys(postModules).map((path) => ({
		slug: slugFromPath(path)
	}));
}

export function load({ params }: { params: { slug: string } }) {
	for (const [path, mod] of Object.entries(postModules) as any) {
		const slug = slugFromPath(path);

		if (slug === params.slug) {
			return {
				component: mod.default,
				metadata: mod.metadata ?? {}
			};
		}
	}

	throw error(404, 'Post not found');
}
