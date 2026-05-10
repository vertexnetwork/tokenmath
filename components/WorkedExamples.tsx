import { costUsd, getModelById, type ModelId } from "@/lib/pricing";

interface Scenario {
  label: string;
  inputTokens: number;
  outputTokens: number;
  description: string;
}

const DEFAULT_SCENARIOS: Scenario[] = [
  {
    label: "Short chat turn",
    inputTokens: 800,
    outputTokens: 400,
    description: "A typical Q&A turn with a small system prompt.",
  },
  {
    label: "System prompt + tool spec",
    inputTokens: 5000,
    outputTokens: 500,
    description: "A larger context window with a tool schema, single response.",
  },
  {
    label: "Long document Q&A",
    inputTokens: 50_000,
    outputTokens: 1500,
    description: "A long-form input (e.g. transcript) with a structured response.",
  },
];

interface WorkedExamplesProps {
  modelId: ModelId;
  scenarios?: Scenario[];
}

export function WorkedExamples({ modelId, scenarios = DEFAULT_SCENARIOS }: WorkedExamplesProps) {
  const m = getModelById(modelId);
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-(--border)">
      <table className="w-full text-sm">
        <thead className="bg-(--bg) text-(--text-muted)">
          <tr>
            <th className="px-4 py-2 text-left text-xs uppercase tracking-wide">Scenario</th>
            <th className="px-4 py-2 text-right text-xs uppercase tracking-wide">Input</th>
            <th className="px-4 py-2 text-right text-xs uppercase tracking-wide">Output</th>
            <th className="px-4 py-2 text-right text-xs uppercase tracking-wide">Cost</th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map((s) => {
            const cost = costUsd(m, s.inputTokens, s.outputTokens);
            return (
              <tr key={s.label} className="border-t border-(--border)">
                <td className="px-4 py-3">
                  <div className="font-medium">{s.label}</div>
                  <div className="text-xs text-(--text-muted)">{s.description}</div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {s.inputTokens.toLocaleString("en-US")}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {s.outputTokens.toLocaleString("en-US")}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-(--accent)">
                  {formatUsd(cost.totalUsd)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatUsd(n: number) {
  if (n === 0) return "$0.00";
  if (n < 0.01) return "<$0.01";
  if (n < 1) return `$${n.toFixed(3)}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}
