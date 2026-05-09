import { getModelById, type ModelId } from '@/lib/pricing';

export function ModelPricingTable({ modelId }: { modelId: ModelId }) {
  const m = getModelById(modelId);
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-(--border)">
      <table className="w-full text-sm">
        <thead className="bg-(--bg) text-(--text-muted)">
          <tr>
            <th className="px-4 py-2 text-left text-xs uppercase tracking-wide">Tier</th>
            <th className="px-4 py-2 text-right text-xs uppercase tracking-wide">Input $/M</th>
            <th className="px-4 py-2 text-right text-xs uppercase tracking-wide">Output $/M</th>
          </tr>
        </thead>
        <tbody>
          {(
            m.tiers ?? [
              { upTo: null, inputUsdPerM: m.inputUsdPerM, outputUsdPerM: m.outputUsdPerM },
            ]
          ).map((tier, idx) => (
            <tr key={idx} className="border-t border-(--border)">
              <td className="px-4 py-2">
                {tier.upTo === null
                  ? 'All input'
                  : `≤ ${tier.upTo.toLocaleString('en-US')} input tokens`}
              </td>
              <td className="px-4 py-2 text-right tabular-nums">${tier.inputUsdPerM}</td>
              <td className="px-4 py-2 text-right tabular-nums">${tier.outputUsdPerM}</td>
            </tr>
          ))}
          <tr className="border-t border-(--border) text-(--text-muted)">
            <td className="px-4 py-2">Context window</td>
            <td className="px-4 py-2 text-right tabular-nums" colSpan={2}>
              {m.contextWindow.toLocaleString('en-US')} tokens
            </td>
          </tr>
        </tbody>
      </table>
      <p className="border-t border-(--border) bg-(--bg) px-4 py-2 text-xs text-(--text-muted)">
        Verified against{' '}
        <a href={m.source} target="_blank" rel="noopener" className="underline">
          {new URL(m.source).host}
        </a>{' '}
        on {m.dataAsOf}.
      </p>
    </div>
  );
}
