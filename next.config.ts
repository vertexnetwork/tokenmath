import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import createMDX from '@next/mdx';

const here = dirname(fileURLToPath(import.meta.url));

// Plugins are passed by name (strings) so Turbopack can serialize the loader options.
// Importing the plugin functions directly works with Webpack but breaks Turbopack builds.
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: ['remark-frontmatter', ['remark-mdx-frontmatter', { name: 'frontmatter' }]],
  },
});

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  turbopack: {
    root: here,
  },
};

export default withMDX(nextConfig);
