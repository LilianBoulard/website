// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import tailwindcss from '@tailwindcss/vite';

import { SITE_URL } from './src/consts.ts';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  integrations: [
    expressiveCode({
      themes: ['github-dark-default', 'github-light'],
      themeCssSelector: (theme) => `[data-theme="${theme.name === 'github-dark-default' ? 'dark' : 'light'}"]`,
      defaultProps: { wrap: true },
      styleOverrides: {
        borderRadius: '0.5rem',
        codeFontFamily: "'JetBrains Mono', ui-monospace, monospace",
      },
    }),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/draft/') && !page.endsWith('.md') && !page.endsWith('.txt'),
    }),
  ],
  markdown: {
    shikiConfig: {
      themes: { dark: 'github-dark-default', light: 'github-light' },
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
