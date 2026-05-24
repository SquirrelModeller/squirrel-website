import type { RequestHandler } from './$types';
import { getAllPosts } from '$lib/posts';

export const prerender = true;

const SITE_URL = 'https://squirrel.talosvault.net';

const staticPages = [
	{ url: '/', priority: '1.0', changefreq: 'weekly' },
	{ url: '/blog/', priority: '0.9', changefreq: 'weekly' },
	{ url: '/about/', priority: '0.7', changefreq: 'monthly' },
	{ url: '/contact/', priority: '0.5', changefreq: 'yearly' }
];

export const GET: RequestHandler = async () => {
	const posts = getAllPosts();

	const postEntries = posts.map((post) => {
		const lastmod = post.date
			? `\n    <lastmod>${new Date(post.date).toISOString().slice(0, 10)}</lastmod>`
			: '';
		return `  <url>
    <loc>${SITE_URL}/blog/${post.slug}/</loc>${lastmod}
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
	});

	const staticEntries = staticPages.map(
		({ url, priority, changefreq }) => `  <url>
    <loc>${SITE_URL}${url}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
	);

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...postEntries].join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' }
	});
};
