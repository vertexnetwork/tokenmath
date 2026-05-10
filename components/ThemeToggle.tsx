"use client";

import { useSyncExternalStore } from "react";
import { events } from "@/lib/analytics";
import { MoonIcon, SunIcon } from "./icons";

type Theme = "dark" | "light";

// Tiny external store so useSyncExternalStore can subscribe + we avoid setState-in-effect.
// The DOM (html.dark / html.light, set by the inline boot script in app/layout.tsx) is the
// source of truth; this store just emits when toggle() flips it.
const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function getClientSnapshot(): Theme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}
function getServerSnapshot(): Theme {
  // Matches the dark default class set on <html> in app/layout.tsx so SSR + first hydration
  // agree. The inline boot script in <head> may then flip the class to 'light' before paint;
  // useSyncExternalStore re-reads via getClientSnapshot on the client.
  return "dark";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.classList.toggle("light", next === "light");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private-browsing or storage-disabled — toggle still works for the session.
    }
    events.themeToggled(next);
    emit();
  };

  return (
    <button
      type="button"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      onClick={toggle}
      className="inline-flex h-11 w-11 items-center justify-center rounded-md text-(--text-muted) hover:bg-(--surface) hover:text-(--text)"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
