"use client";

import Link from "next/link";
import { events } from "@/lib/analytics";

/**
 * The mandatory blind footer link. Clicking it routes to /network (the canonical hub-and-spoke
 * entry point) and fires the network-wide `vertex_footer_opened` event.
 */
export function VertexFooterLink() {
  return (
    <div className="border-t border-(--border)/50 py-4 text-center">
      <Link
        href="/network"
        onClick={() => events.vertexFooterOpened()}
        className="text-xs text-(--text-faint) underline-offset-4 hover:text-(--text) hover:underline"
      >
        Part of the Vertex Network
      </Link>
    </div>
  );
}
