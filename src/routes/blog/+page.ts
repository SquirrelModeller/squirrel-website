import { getAllPosts } from '$lib/posts';

export const prerender = true;

export function load() {
	return {
		posts: getAllPosts().map(({ component, ...post }) => post)
	};
}
