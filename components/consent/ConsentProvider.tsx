"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { siteConfig } from "@/lib/site-config";

type ConsentState = "unknown" | "granted" | "denied";

interface ConsentValue {
  state: ConsentState;
  grant: () => void;
  deny: () => void;
}

const ConsentContext = createContext<ConsentValue | null>(null);

const STORAGE_KEY = `${siteConfig.shortName}-consent-v1`;

// External store backed by localStorage. This pattern (mirrors ThemeToggle.tsx) avoids
// react-hooks/set-state-in-effect: the source of truth lives outside React, and
// useSyncExternalStore subscribes without ever calling setState in an effect.
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
function getClientSnapshot(): ConsentState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "granted" || raw === "denied") return raw;
  } catch {
    // private browsing / storage disabled
  }
  return "unknown";
}
function getServerSnapshot(): ConsentState {
  return "unknown";
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const persist = useCallback((next: ConsentState) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage write failed — toggle still emits so consumers get the value for the session
    }
    emit();
  }, []);

  const value = useMemo<ConsentValue>(
    () => ({
      state,
      grant: () => persist("granted"),
      deny: () => persist("denied"),
    }),
    [state, persist],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    // Render-safe fallback so components consuming useConsent() don't crash if the
    // provider is accidentally omitted (e.g. in unit tests).
    return { state: "unknown", grant: () => {}, deny: () => {} };
  }
  return ctx;
}
