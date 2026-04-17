import { getCollection } from 'astro:content';
import type { APIRoute, GetStaticPaths } from 'astro';
import { SITE_URL } from '../../consts.ts';

// Plain-markdown mirror of each post — handy for LLM crawlers (GEO).

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
};

export const GET: APIRoute = ({ props }) => {
  const post = props.post as Awaited<ReturnType<typeof getCollection<'blog'>>>[number];
  const { title, description, date, updated, tags } = post.data;

  const fm = [
    `# ${title}`,
    '',
    description,
    '',
    `> Published: ${date.toISOString().slice(0, 10)}` +
      (updated ? `  ·  Updated: ${updated.toISOString().slice(0, 10)}` : '') +
      (tags.length ? `  ·  Tags: ${tags.map((t) => `#${t}`).join(' ')}` : ''),
    `> Canonical: ${new URL(`/blog/${post.id}/`, SITE_URL).toString()}`,
    '',
    '---',
    '',
    post.body ?? '',
  ].join('\n');

  return new Response(fm, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
