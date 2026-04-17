import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import {
  SITE_TITLE, SITE_DESCRIPTION, SITE_URL, AUTHOR,
} from '../consts.ts';

// Full plain-text dump of every published post — for LLM ingestion (GEO).

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const blocks: string[] = [
    `# ${SITE_TITLE}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    `Author: ${AUTHOR.name} (https://github.com/${AUTHOR.github})`,
    `Generated: ${new Date().toISOString()}`,
    '',
    '---',
    '',
  ];

  for (const post of posts) {
    blocks.push(
      `# ${post.data.title}`,
      '',
      `Published: ${post.data.date.toISOString().slice(0, 10)}` +
        (post.data.updated ? `  ·  Updated: ${post.data.updated.toISOString().slice(0, 10)}` : '') +
        (post.data.tags.length ? `  ·  Tags: ${post.data.tags.map((t) => `#${t}`).join(' ')}` : ''),
      `URL: ${SITE_URL}/blog/${post.id}/`,
      '',
      post.data.description,
      '',
      post.body ?? '',
      '',
      '---',
      '',
    );
  }

  return new Response(blocks.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
