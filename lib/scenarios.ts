/**
 * Saved scenarios — localStorage-only. We store them on the user's browser and never
 * transmit; the calculator's privacy contract (§1.5) is unchanged.
 *
 * Schema is versioned so we can evolve the shape without losing user data: each entry
 * carries a `v` field; readers ignore entries with an unknown version.
 */

import type { ModelId } from './pricing';

const STORAGE_KEY = 'tokenmath:scenarios:v1';
const MAX_SCENARIOS = 10;
const SCHEMA_VERSION = 1;

export interface SavedScenario {
  v: typeof SCHEMA_VERSION;
  id: string;
  name: string;
  modelId: ModelId;
  text: string;
  outputTokens: number;
  savedAt: number;
}

export function listScenarios(): SavedScenario[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValid).sort((a, b) => b.savedAt - a.savedAt);
  } catch {
    return [];
  }
}

export function saveScenario(input: {
  name: string;
  modelId: ModelId;
  text: string;
  outputTokens: number;
}): SavedScenario | null {
  if (typeof window === 'undefined') return null;
  if (input.text.length === 0) return null;
  const scenario: SavedScenario = {
    v: SCHEMA_VERSION,
    id: cryptoRandomId(),
    name: input.name.trim() || 'Untitled scenario',
    modelId: input.modelId,
    text: input.text,
    outputTokens: input.outputTokens,
    savedAt: Date.now(),
  };
  const next = [scenario, ...listScenarios().filter((s) => s.id !== scenario.id)].slice(
    0,
    MAX_SCENARIOS,
  );
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return null;
  }
  return scenario;
}

export function deleteScenario(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const next = listScenarios().filter((s) => s.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage disabled — silent */
  }
}

export function clearAllScenarios(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage disabled — silent */
  }
}

function isValid(x: unknown): x is SavedScenario {
  if (!x || typeof x !== 'object') return false;
  const s = x as Record<string, unknown>;
  return (
    s.v === SCHEMA_VERSION &&
    typeof s.id === 'string' &&
    typeof s.name === 'string' &&
    typeof s.modelId === 'string' &&
    typeof s.text === 'string' &&
    typeof s.outputTokens === 'number' &&
    typeof s.savedAt === 'number'
  );
}

function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
