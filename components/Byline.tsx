import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

/**
 * The editorial byline shown on every money/pricing pSEO page (model, compare, cost). It
 * names the desk that maintains the data and links to the methodology, and surfaces the real
 * per-page "verified" date — the E-E-A-T "Who/How/Why" signals the audit playbook calls the
 * strongest lever on YMYL-adjacent topics. The author is a transparent team entity, never a
 * fabricated person.
 */
export function Byline({ verified }: { verified: string }) {
  return (
    <p className="text-xs text-(--text-muted)">
      By{" "}
      <Link href={siteConfig.author.methodologyPath} className="text-(--text) hover:underline">
        {siteConfig.author.name}
      </Link>{" "}
      · Pricing verified {verified}
    </p>
  );
}
