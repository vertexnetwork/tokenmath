"use client";

import { useEffect, useState } from "react";
import { getModelById, type ModelId } from "@/lib/pricing";
import { deleteScenario, listScenarios, saveScenario, type SavedScenario } from "@/lib/scenarios";
import { BookmarkIcon, TrashIcon } from "./icons";

/**
 * Saved scenarios — localStorage-only. The privacy contract is unchanged: scenarios are
 * stored on this browser and never transmitted. The header copy ("Saved on this browser
 * only") makes that explicit so users don't fear an account-shaped commitment.
 */
interface SavedScenariosProps {
  currentText: string;
  currentModelId: ModelId;
  currentOutputTokens: number;
  onLoad: (scenario: SavedScenario) => void;
}

export function SavedScenarios({
  currentText,
  currentModelId,
  currentOutputTokens,
  onLoad,
}: SavedScenariosProps) {
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    // localStorage isn't available during SSR — read after mount, scheduled out of the
    // synchronous effect body to satisfy react-hooks/set-state-in-effect.
    const id = window.setTimeout(() => setScenarios(listScenarios()), 0);
    return () => window.clearTimeout(id);
  }, []);

  const refresh = () => setScenarios(listScenarios());

  const onSave = () => {
    if (!currentText) return;
    saveScenario({
      name: name.trim() || `Scenario ${scenarios.length + 1}`,
      modelId: currentModelId,
      text: currentText,
      outputTokens: currentOutputTokens,
    });
    setName("");
    refresh();
  };

  const onDelete = (id: string) => {
    deleteScenario(id);
    refresh();
  };

  const empty = scenarios.length === 0;
  const cantSave = currentText.length === 0;

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="rounded-xl border border-(--border) bg-(--surface)"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm">
        <span className="inline-flex items-center gap-2">
          <BookmarkIcon className="text-(--accent)" />
          <span className="font-medium">Saved scenarios</span>
          <span className="text-xs text-(--text-faint)">
            {empty ? "none yet" : `${scenarios.length} on this browser`}
          </span>
        </span>
        <span aria-hidden className="text-(--text-faint)">
          {open ? "−" : "+"}
        </span>
      </summary>

      <div className="border-t border-(--border) p-4">
        <p className="mb-4 text-xs text-(--text-faint)">
          Saved on this browser only — never uploaded. Up to 10 scenarios.
        </p>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name this scenario (optional)"
            className="flex-1 rounded-md border border-(--border) bg-(--bg) px-3 py-2 text-sm text-(--text) placeholder:text-(--text-faint) focus:border-(--accent) focus:outline-none"
            disabled={cantSave}
          />
          <button
            type="button"
            onClick={onSave}
            disabled={cantSave}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-(--accent)/40 bg-(--accent)/10 px-3 py-2 text-sm font-medium text-(--accent) hover:border-(--accent) disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-(--accent)/40"
          >
            Save current
          </button>
        </div>

        {empty ? (
          <p className="text-xs text-(--text-faint)">
            Tip: save a scenario when you have a prompt + model + response length you might revisit.
            Useful for sizing features before committing to a vendor.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {scenarios.map((s) => {
              const model = getModelById(s.modelId);
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-(--border) bg-(--bg) px-3 py-2"
                >
                  <button
                    type="button"
                    onClick={() => onLoad(s)}
                    className="flex flex-1 flex-col items-start text-left"
                  >
                    <span className="text-sm font-medium text-(--text)">{s.name}</span>
                    <span className="text-xs text-(--text-faint)">
                      {model?.label ?? s.modelId} · {s.text.length.toLocaleString("en-US")} chars ·{" "}
                      {s.outputTokens.toLocaleString("en-US")} output tokens
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(s.id)}
                    aria-label={`Delete scenario ${s.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-(--text-faint) hover:bg-(--surface) hover:text-(--text)"
                  >
                    <TrashIcon />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </details>
  );
}
