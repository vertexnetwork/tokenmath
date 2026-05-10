import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { CHANGELOG, type ChangelogEntry } from "@/lib/changelog";

export const metadata: Metadata = buildMetadata({
  title: "Changelog",
  description: `What shipped on ${siteConfig.name}, dated. Auto-generated from the project git log.`,
  path: "/changelog",
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
          Auto-generated from the project git log. Dates and titles only — by design.
        </p>
      </header>

      {CHANGELOG.length === 0 ? (
        <p className="text-sm text-(--text-faint)">
          No entries yet. Once commits with conventional-commit prefixes land on <code>main</code>,
          they&apos;ll show up here.
        </p>
      ) : (
        <ol className="flex flex-col">
          {CHANGELOG.map((entry, i) => (
            <Row key={`${entry.date}-${i}`} entry={entry} />
          ))}
        </ol>
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
      <span className="text-base text-(--text)">{entry.title}</span>
    </li>
  );
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
