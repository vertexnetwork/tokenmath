/**
 * Public re-export of the auto-generated changelog. The actual data lives in
 * lib/changelog.generated.ts, which is rewritten on every `pnpm prebuild` from the
 * project's git log. Import from here, never from the generated file directly — that
 * keeps callers stable if we change the source-of-truth shape later.
 */

import { CHANGELOG, type ChangelogEntry } from './changelog.generated';

export { CHANGELOG };
export type { ChangelogEntry, ChangelogType } from './changelog.generated';

export function latestChange(): ChangelogEntry | undefined {
  return CHANGELOG[0];
}
