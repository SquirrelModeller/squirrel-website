import { error } from '@sveltejs/kit';
import { getAdjacentPosts, getAllPosts, getPostBySlug } from '$lib/posts';

export const prerender = true;

export function entries() {
	return getAllPosts().map((post) => ({
		slug: post.slug
	}));
}

export function load({ params }: { params: { slug: string } }) {
	const post = getPostBySlug(params.slug);

	if (!post) {
		throw error(404, 'Post not found');
	}

	const { prev, next } = getAdjacentPosts(params.slug);

	return {
		component: post.component,
		metadata: {
			title: post.title,
			date: post.date,
			description: post.description,
			excerpt: post.excerpt,
			thumbnail: post.thumbnail,
			thumbnail_alt: post.thumbnail_alt,
			tags: post.tags
		},
		prev,
		next
	};
}
