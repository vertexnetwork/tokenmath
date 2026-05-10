import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { CHANGELOG } from '@/lib/changelog';

export const metadata: Metadata = buildMetadata({
  title: 'Changelog',
  description:
    'What shipped on tokenmath, dated. Pricing-data refreshes, new models, calculator features, and the occasional design pass — nothing else.',
  path: '/changelog',
});

export default function ChangelogPage() {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-10 sm:py-16"
    >
      <header className="flex flex-col gap-3">
        <p className="text-eyebrow text-(--accent)">Changelog</p>
        <h1 className="text-display-lg">What shipped, when.</h1>
        <p className="max-w-prose text-base text-(--text-muted) sm:text-lg">
          Pricing refreshes, new models, calculator features, and the occasional design pass.
          Nothing else.
        </p>
      </header>

      <ol className="flex flex-col gap-12">
        {CHANGELOG.map((entry) => (
          <li
            key={entry.date}
            className="grid grid-cols-1 gap-3 sm:grid-cols-[150px_1fr] sm:gap-8"
          >
            <time
              dateTime={entry.date}
              className="font-serif text-base italic text-(--text-faint) sm:pt-2"
            >
              {formatDate(entry.date)}
            </time>
            <article className="flex flex-col gap-3">
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-(--text)">
                {entry.title}
              </h2>
              {entry.summary && (
                <p className="text-(--text-muted)">{entry.summary}</p>
              )}
              <ul className="flex flex-col gap-2 border-l border-(--border) pl-4">
                {entry.changes.map((c, i) => (
                  <li key={i} className="text-sm text-(--text-muted)">
                    {c}
                  </li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ol>
    </main>
  );
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
