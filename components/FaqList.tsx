export interface Faq {
  q: string;
  a: string;
}

export function FaqList({ faqs }: { faqs: ReadonlyArray<Faq> }) {
  return (
    <dl className="my-6 divide-y divide-(--border) overflow-hidden rounded-xl border border-(--border)">
      {faqs.map((faq) => (
        <details key={faq.q} className="group">
          <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium hover:bg-(--surface)">
            {faq.q}
            <span
              aria-hidden
              className="ml-3 text-(--text-muted) transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <dd className="border-t border-(--border) bg-(--bg)/50 px-4 py-3 text-sm text-(--text-muted)">
            {faq.a}
          </dd>
        </details>
      ))}
    </dl>
  );
}
