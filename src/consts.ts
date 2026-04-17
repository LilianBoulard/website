export const SITE_URL = 'https://lilian.boulard.fr';
export const SITE_TITLE = 'Lilian Boulard';
export const SITE_DESCRIPTION =
  'Personal site and blog of Lilian Boulard — software engineer, writing about systems, data, and the things in between.';
export const SITE_LANG = 'en';
export const SITE_LOCALE = 'en_US';

export const AUTHOR = {
  name: 'Lilian Boulard',
  url: SITE_URL,
  github: 'LilianBoulard',
  linkedin: 'lilian-boulard',
} as const;

export const SOCIAL_LINKS = [
  { label: 'GitHub', href: `https://github.com/${AUTHOR.github}` },
  { label: 'LinkedIn', href: `https://www.linkedin.com/in/${AUTHOR.linkedin}/` },
] as const;

export const GITHUB_README = {
  owner: AUTHOR.github,
  repo: AUTHOR.github,
  branch: 'HEAD',
} as const;

export const UTTERANCES = {
  repo: `${AUTHOR.github}/website`,
  issueTerm: 'pathname',
  label: 'comment',
} as const;
