import type { RequestHandler } from './$types';
import { getAllPosts } from '$lib/posts';

export const prerender = true;

const SITE_URL = 'https://squirrel.talosvault.net/';
const SITE_TITLE = 'SquirrelModeller Blog';
const SITE_DESCRIPTION = "All of SquirrelModeller's blogs.";

function escapeXml(str: string) {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export const GET: RequestHandler = async () => {
	const posts = getAllPosts().filter((post) => post.date);

	const items = posts
		.map((post) => {
			const link = `${SITE_URL}/blog/${post.slug}`;
			const pubDate = new Date(post.date!).toUTCString();
			const description = post.description || post.excerpt || '';

			const categories = post.tags
				.map((tag) => `<category>${escapeXml(tag)}</category>`)
				.join('\n');

			return `
<item>
  <title>${escapeXml(post.title)}</title>
  <link>${escapeXml(link)}</link>
  <guid>${escapeXml(link)}</guid>
  <pubDate>${pubDate}</pubDate>
  <description>${escapeXml(description)}</description>
  ${categories}
</item>`;
		})
		.join('\n');

	const latestPostDate = posts[0]?.date
		? new Date(posts[0].date).toUTCString()
		: new Date().toUTCString();

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(SITE_TITLE)}</title>
  <link>${escapeXml(`${SITE_URL}/blog`)}</link>
  <description>${escapeXml(SITE_DESCRIPTION)}</description>
  <language>en</language>
  <lastBuildDate>${latestPostDate}</lastBuildDate>
  ${items}
</channel>
</rss>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'text/xml; charset=utf-8'
		}
	});
};
