import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Root as HastRoot, Element } from 'hast';

import { GITHUB_README } from '../consts.ts';

const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_README.owner}/${GITHUB_README.repo}/${GITHUB_README.branch}`;
const BLOB_BASE = `https://github.com/${GITHUB_README.owner}/${GITHUB_README.repo}/blob/${GITHUB_README.branch}`;

export const README_RAW_URL = `${RAW_BASE}/README.md`;

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      'align', 'width', 'height', 'loading', 'decoding',
    ],
    a: [...(defaultSchema.attributes?.a ?? []), 'target', 'rel'],
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'align'],
  },
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    'picture', 'source', 'details', 'summary',
  ],
};

function isAbsolute(url: string): boolean {
  return /^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url) || url.startsWith('mailto:');
}

function rewriteRelativeUrls() {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node: Element) => {
      const tag = node.tagName;
      if (tag === 'img' || tag === 'source') {
        const src = node.properties?.src;
        if (typeof src === 'string' && !isAbsolute(src)) {
          node.properties!.src = `${RAW_BASE}/${src.replace(/^\.?\/?/, '')}`;
        }
        const srcset = node.properties?.srcSet;
        if (typeof srcset === 'string' && !isAbsolute(srcset)) {
          node.properties!.srcSet = `${RAW_BASE}/${srcset.replace(/^\.?\/?/, '')}`;
        }
      }
      if (tag === 'a') {
        const href = node.properties?.href;
        if (typeof href === 'string' && !isAbsolute(href)) {
          node.properties!.href = `${BLOB_BASE}/${href.replace(/^\.?\/?/, '')}`;
        }
      }
    });
  };
}

const FALLBACK_HTML =
  '<p><em>The GitHub profile README is temporarily unavailable. ' +
  `View it directly at <a href="https://github.com/${GITHUB_README.owner}/${GITHUB_README.repo}">github.com/${GITHUB_README.owner}</a>.</em></p>`;

export async function processReadmeMarkdown(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rewriteRelativeUrls)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
}

let cache: { html: string; fetchedAt: string } | null = null;

export async function loadProfileReadme(): Promise<{ html: string; fetchedAt: string }> {
  if (cache) return cache;

  let markdown: string;
  try {
    const res = await fetch(README_RAW_URL, {
      headers: { 'User-Agent': 'lilian.boulard.fr-build' },
    });
    if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
    markdown = await res.text();
  } catch (err) {
    console.error(`[github-readme] failed to fetch ${README_RAW_URL}:`, err);
    cache = { html: FALLBACK_HTML, fetchedAt: new Date().toISOString() };
    return cache;
  }

  const html = await processReadmeMarkdown(markdown);
  cache = { html, fetchedAt: new Date().toISOString() };
  return cache;
}
