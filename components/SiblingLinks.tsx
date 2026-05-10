import Link from "next/link";
import { MODELS, type ModelId } from "@/lib/pricing";

export function SiblingLinks({ modelId }: { modelId: ModelId }) {
  const current = MODELS.find((m) => m.id === modelId);
  if (!current) return null;
  const siblings = pickSiblings(modelId, 3);
  return (
    <ul className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {siblings.map((s) => (
        <li key={s.id}>
          <Link
            href={`/token-calculator/${s.slug}`}
            className="block rounded-xl border border-(--border) bg-(--surface) p-4 hover:border-(--accent)"
          >
            <div className="text-sm font-medium">{s.label}</div>
            <div className="mt-1 text-xs text-(--text-muted)">
              ${s.inputUsdPerM} input / ${s.outputUsdPerM} output per 1M
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function pickSiblings(currentId: ModelId, count: number) {
  const others = MODELS.filter((m) => m.id !== currentId);
  // Prefer same vendor first, then fill with other vendor.
  const current = MODELS.find((m) => m.id === currentId);
  if (!current) return others.slice(0, count);
  const sameVendor = others.filter((m) => m.vendor === current.vendor);
  const otherVendor = others.filter((m) => m.vendor !== current.vendor);
  return [...sameVendor, ...otherVendor].slice(0, count);
}
