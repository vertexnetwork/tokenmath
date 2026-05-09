import type { MDXComponents } from 'mdx/types';

// Lets MDX inherit our existing prose styles via the parent <article>; we don't need to
// override individual element renderers right now.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  };
}
