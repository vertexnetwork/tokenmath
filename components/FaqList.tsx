export interface Faq {
  q: string;
  a: string;
}

// Renders an accessible FAQ disclosure list. We deliberately avoid <dl>/<dt>/<dd> —
// <details>/<summary> isn't valid inside <dl>, and pairing them confuses Lighthouse +
// screen readers. The FAQPage JSON-LD on each pSEO page already encodes the
// question/answer pairing for search engines, so no semantic loss.
export function FaqList({ faqs }: { faqs: ReadonlyArray<Faq> }) {
  return (
    <div className="my-6 divide-y divide-(--border) overflow-hidden rounded-xl border border-(--border)">
      {faqs.map((faq) => (
        <details key={faq.q} className="group">
          <summary className="flex min-h-11 cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium hover:bg-(--surface)">
            {faq.q}
            <span
              aria-hidden
              className="ml-3 text-(--text-muted) transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="border-t border-(--border) bg-(--bg)/50 px-4 py-3 text-sm text-(--text-muted)">
            {faq.a}
          </div>
        </details>
      ))}
    </div>
  );
}
