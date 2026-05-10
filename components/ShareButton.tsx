"use client";

import { useState } from "react";
import { events } from "@/lib/analytics";
import { encodeShareURL, MAX_TEXT_BYTES_FOR_URL } from "@/lib/share";
import type { ModelId } from "@/lib/pricing";

interface ShareButtonProps {
  model: ModelId;
  text: string;
  outputTokens: number;
  className?: string;
}

type ButtonState = "idle" | "copied" | "error";

export function ShareButton({ model, text, outputTokens, className }: ShareButtonProps) {
  const [state, setState] = useState<ButtonState>("idle");

  const hasText = text.length > 0;
  const includesText = hasText && text.length <= MAX_TEXT_BYTES_FOR_URL;
  const tooltip = includesText
    ? "Copies a URL with the model, response length, AND your prompt encoded. Anyone with the link can open the same scenario."
    : hasText
      ? "Prompt is too long to encode in a URL — sharing model + response length only."
      : "Copies a URL with the model + response length pre-selected. Add a prompt to share the full scenario.";

  const handleClick = async () => {
    const url = encodeShareURL({
      model,
      text: includesText ? text : undefined,
      outputTokens,
    });
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      events.shareScenario(model, includesText);
    } catch {
      setState("error");
    }
    window.setTimeout(() => setState("idle"), 2200);
  };

  const label =
    state === "copied" ? "Link copied" : state === "error" ? "Couldn't copy" : "Share scenario";

  return (
    <button
      type="button"
      onClick={handleClick}
      title={tooltip}
      aria-live="polite"
      className={[
        "inline-flex min-h-11 items-center gap-2 rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm text-(--text-muted) hover:border-(--accent) hover:text-(--text)",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <ShareIcon />
      {label}
    </button>
  );
}

function ShareIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx={18} cy={5} r={3} />
      <circle cx={6} cy={12} r={3} />
      <circle cx={18} cy={19} r={3} />
      <line x1={8.59} y1={13.51} x2={15.42} y2={17.49} />
      <line x1={15.41} y1={6.51} x2={8.59} y2={10.49} />
    </svg>
  );
}
