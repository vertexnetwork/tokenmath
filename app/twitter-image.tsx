// Twitter/X uses the same dimensions and design as our OG card. Re-export the
// opengraph-image renderer so we have one source of truth for the fallback social card.
// `runtime` must be a literal in the source file (Turbopack can't statically parse it
// across re-exports), so we re-declare it here.
export const runtime = "edge";
export { default, alt, size, contentType } from "./opengraph-image";
