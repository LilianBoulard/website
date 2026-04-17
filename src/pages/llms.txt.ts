import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import {
  SITE_TITLE, SITE_DESCRIPTION, SITE_URL, AUTHOR,
} from '../consts.ts';

// llms.txt — short, machine-friendly site index for LLM crawlers.
// Format follows the spirit of https://llmstxt.org

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const lines = [
    `# ${SITE_TITLE}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    `Author: ${AUTHOR.name} — https://github.com/${AUTHOR.github}`,
    '',
    '## About',
    '',
    `- [Home](${SITE_URL}/) — profile / about`,
    `- [Full plain-text mirror of all posts](${SITE_URL}/llms-full.txt)`,
    `- [RSS](${SITE_URL}/rss.xml)`,
    `- [Sitemap](${SITE_URL}/sitemap-index.xml)`,
    '',
    '## Blog posts',
    '',
    ...posts.map((p) => {
      const url = `${SITE_URL}/blog/${p.id}/`;
      const md = `${SITE_URL}/blog/${p.id}.md`;
      const date = p.data.date.toISOString().slice(0, 10);
      return `- [${p.data.title}](${url}) (${date}) — ${p.data.description} [markdown](${md})`;
    }),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
