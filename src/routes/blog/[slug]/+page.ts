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
  const posts = Object.entries(postModules)
    .map(([path, mod]: any) => ({
      slug: slugFromPath(path),
      title: mod.metadata?.title ?? slugFromPath(path),
      date: mod.metadata?.date ?? null,
    }))
    .sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });

  const index = posts.findIndex((p) => p.slug === params.slug);

  for (const [path, mod] of Object.entries(postModules) as any) {
    const slug = slugFromPath(path);
    if (slug === params.slug) {
      return {
        component: mod.default,
        metadata: mod.metadata ?? {},
        prev: posts[index + 1] ?? null,
        next: posts[index - 1] ?? null,
      };
    }
  }

  throw error(404, 'Post not found');
}
