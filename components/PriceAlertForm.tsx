"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/site-config";
import { events } from "@/lib/analytics";
import { BellIcon, CheckIcon } from "./icons";

/**
 * Price-change alert opt-in — the one retention mechanic that matches how this audience
 * actually behaves. Promise: we email ONLY when Claude/Gemini/GPT list pricing changes (a
 * few times a year), never a newsletter. Pairs with the saved-scenario drift badges: the
 * badge shows a change happened while you were away; this is how you hear about the next one.
 *
 * Self-hides unless siteConfig.features.email.enabled — so it ships dark until Resend is
 * configured. POSTs to /api/subscribe → Resend audience. No DB, no login.
 */
type Status = "idle" | "submitting" | "ok" | "error";

interface PriceAlertFormProps {
  source: "calculator" | "compare" | "model" | "footer";
  className?: string;
}

export function PriceAlertForm({ source, className }: PriceAlertFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  if (!siteConfig.features.email.enabled) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting" || status === "ok") return;
    setStatus("submitting");
    setMessage(null);
    events.subscribe("submit", source);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      if (res.ok) {
        setStatus("ok");
        events.subscribe("success", source);
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus("error");
        setMessage(
          data.error === "invalid_email"
            ? "That email doesn’t look valid."
            : "Couldn’t add you right now — try again in a minute.",
        );
      }
    } catch {
      setStatus("error");
      setMessage("Network hiccup — try again in a minute.");
    }
  }

  if (status === "ok") {
    return (
      <div
        className={`flex items-center gap-2 rounded-xl border border-(--accent-2)/40 bg-(--accent-2)/10 px-4 py-3 text-sm text-(--text) ${className ?? ""}`}
      >
        <CheckIcon className="text-(--accent-2)" />
        You’re on the list. We’ll only email when a model’s price changes.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      aria-label={siteConfig.features.email.leadMagnetName}
      className={`rounded-xl border border-(--border) bg-(--surface) p-4 sm:p-5 ${className ?? ""}`}
    >
      <div className="flex items-center gap-2">
        <BellIcon className="text-(--accent)" />
        <h3 className="text-sm font-medium text-(--text)">
          Get told when a model’s price drops
        </h3>
      </div>
      <p className="mt-1 text-xs text-(--text-faint)">
        Email-only alerts when Claude, Gemini, or GPT list pricing changes. No newsletter, no
        marketing — typically a few emails a year.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`price-alert-${source}`}>
          Email address
        </label>
        <input
          id={`price-alert-${source}`}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "submitting"}
          className="flex-1 rounded-md border border-(--border) bg-(--bg) px-3 py-2 text-sm text-(--text) placeholder:text-(--text-faint) focus:border-(--accent) focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center rounded-md border border-(--accent)/40 bg-(--accent)/10 px-4 py-2 text-sm font-medium text-(--accent) hover:border-(--accent) disabled:opacity-60"
        >
          {status === "submitting" ? "Adding…" : "Notify me"}
        </button>
      </div>
      {message && (
        <p
          className={`mt-2 text-xs ${status === "error" ? "text-amber-300" : "text-(--text-faint)"}`}
          role={status === "error" ? "alert" : undefined}
        >
          {message}
        </p>
      )}
      <p className="mt-3 text-xs text-(--text-faint)">
        Stored in our email provider (Resend), used only for price-change alerts. Unsubscribe in
        one click.
      </p>
    </form>
  );
}
