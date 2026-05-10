import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { CHANGELOG, type ChangelogEntry, type ChangelogType } from '@/lib/changelog';

export const metadata: Metadata = buildMetadata({
  title: 'Changelog',
  description:
    'What shipped on tokenmath, dated. Auto-generated from the project git log — every feat, fix, perf, and revert that lands on main appears here.',
  path: '/changelog',
});

const TYPE_LABEL: Record<ChangelogType, string> = {
  feat: 'New',
  fix: 'Fix',
  perf: 'Perf',
  revert: 'Revert',
};

const TYPE_TONE: Record<ChangelogType, string> = {
  feat: 'border-(--accent)/40 bg-(--accent)/10 text-(--accent)',
  fix: 'border-(--border) text-(--text-muted)',
  perf: 'border-(--gold)/40 bg-(--gold)/10 text-(--gold)',
  revert: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
};

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
          Auto-generated from the project git log. Every <code className="text-(--text)">feat</code>
          , <code className="text-(--text)">fix</code>, <code className="text-(--text)">perf</code>,
          and <code className="text-(--text)">revert</code> that lands on{' '}
          <code className="text-(--text)">main</code> appears here.
        </p>
      </header>

      {CHANGELOG.length === 0 ? (
        <p className="text-sm text-(--text-faint)">
          No entries yet. Once commits with conventional-commit prefixes land on{' '}
          <code>main</code>, they&apos;ll show up here.
        </p>
      ) : (
        <ol className="flex flex-col">{CHANGELOG.map((entry) => <Row key={entry.hash} entry={entry} />)}</ol>
      )}
    </main>
  );
}

function Row({ entry }: { entry: ChangelogEntry }) {
  return (
    <li className="grid grid-cols-1 gap-2 border-t border-(--border) py-5 first:border-t-0 sm:grid-cols-[140px_1fr] sm:gap-8">
      <time
        dateTime={entry.date}
        className="font-serif text-sm italic text-(--text-faint) sm:pt-0.5"
      >
        {formatDate(entry.date)}
      </time>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${TYPE_TONE[entry.type]}`}
        >
          {TYPE_LABEL[entry.type]}
        </span>
        {entry.scope && (
          <span className="font-mono text-xs text-(--text-faint)">{entry.scope}</span>
        )}
        <span className="text-base text-(--text)">{entry.title}</span>
      </div>
    </li>
  );
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
