/**
 * URL ↔ Calculator state codec.
 *
 * Used by the "Share scenario" button to encode the current model + prompt + expected
 * response length into a query-string-only URL. When the recipient opens the URL, the
 * Calculator reads these params on mount and pre-fills its state.
 *
 * Privacy note: the prompt text IS included in the URL when present. The user clicks
 * Share explicitly, so it's an opt-in disclosure. The Share button surfaces a tooltip
 * making this clear. For prompts longer than MAX_TEXT_BYTES_FOR_URL we drop the text
 * and only encode model + output, keeping URLs under common 2 KB browser limits.
 */

import type { ModelId } from "@/lib/pricing";

const PARAM_MODEL = "m";
const PARAM_TEXT = "t";
const PARAM_OUTPUT = "o";

// Cap before we drop the prompt entirely. ~1500 chars of text encodes to ~2000 chars of
// base64 → URL stays well under the 2 KB practical limit even with model + output params.
export const MAX_TEXT_BYTES_FOR_URL = 1500;

export interface ShareState {
  model?: ModelId;
  text?: string;
  outputTokens?: number;
}

export function encodeShareURL(state: ShareState, origin?: string): string {
  const base =
    origin ?? (typeof window !== "undefined" ? window.location.origin : "https://tokenmath.dev");
  const url = new URL(base);
  if (state.model) url.searchParams.set(PARAM_MODEL, state.model);
  if (state.outputTokens != null && state.outputTokens > 0) {
    url.searchParams.set(PARAM_OUTPUT, String(state.outputTokens));
  }
  if (canIncludeText(state.text)) {
    url.searchParams.set(PARAM_TEXT, base64UrlEncode(state.text!));
  }
  return url.toString();
}

export function decodeShareState(searchParams: URLSearchParams): ShareState {
  const result: ShareState = {};
  const model = searchParams.get(PARAM_MODEL);
  if (model) result.model = model as ModelId;
  const textRaw = searchParams.get(PARAM_TEXT);
  if (textRaw) {
    try {
      result.text = base64UrlDecode(textRaw);
    } catch {
      // malformed param — silently ignore so a bad URL doesn't crash the calculator
    }
  }
  const outputRaw = searchParams.get(PARAM_OUTPUT);
  if (outputRaw) {
    const n = Number(outputRaw);
    if (Number.isFinite(n) && n > 0) result.outputTokens = Math.floor(n);
  }
  return result;
}

export function hasShareState(state: ShareState): boolean {
  return state.model !== undefined || state.text !== undefined || state.outputTokens !== undefined;
}

export function canIncludeText(text: string | undefined): text is string {
  return typeof text === "string" && text.length > 0 && text.length <= MAX_TEXT_BYTES_FOR_URL;
}

// Small base64-url helpers. atob/btoa are ASCII-only; wrap with TextEncoder/TextDecoder
// so prompts containing emoji or non-Latin characters round-trip safely.
function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  const padded = str
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(str.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
