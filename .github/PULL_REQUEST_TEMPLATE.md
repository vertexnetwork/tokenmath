<!-- Keep PRs atomic. One PR per checklist line in PLAN.md §8. -->

## Summary

<!-- 1–3 sentences: what changed and why. Link the PLAN.md section it implements (e.g. "implements §4.1 tokenizer module"). -->

## Test plan

<!-- Concrete checks the reviewer can replicate. -->

- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean
- [ ] `pnpm test` clean
- [ ] `pnpm build` clean
- [ ] Vercel preview build passes
- [ ]

## Screenshots

<!-- Required for any user-visible change. Drop dark-mode + mobile (375×667) shots. -->

## Privacy check

<!-- Required for anything that touches input handling, analytics, or network requests. -->

- [ ] No prompt content leaves the browser (verified via DevTools Network tab with a unique sentinel string)
- [ ] No new external script domains added without a corresponding CSP entry
- [ ] N/A — change does not affect input, analytics, or network surface
