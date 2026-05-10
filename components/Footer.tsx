import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { VertexFooterLink } from "./VertexFooterLink";

const YEAR = new Date().getFullYear();

type FooterItem = { href: string; label: string; external?: boolean };

function FooterEntry({ item }: { item: FooterItem }) {
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener" className="hover:text-(--text)">
        {item.label}
      </a>
    );
  }
  return (
    <Link href={item.href} className="hover:text-(--text)">
      {item.label}
    </Link>
  );
}

export function Footer() {
  const { product, company, legal } = siteConfig.nav.footer;

  return (
    <footer className="mt-auto border-t border-(--border)">
      <div className="mx-auto flex w-full max-w-(--container-app) flex-col gap-6 px-6 py-10 sm:py-12">
        <p className="text-xs text-(--text-muted)">
          {siteConfig.name} — {siteConfig.tagline}
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
          <FooterColumn label="Product">
            {product.map((item) => (
              <FooterEntry key={item.href} item={item} />
            ))}
          </FooterColumn>
          <FooterColumn label="Company">
            {company.map((item) => (
              <FooterEntry key={item.href} item={item} />
            ))}
          </FooterColumn>
          <FooterColumn label="Legal">
            {legal.map((item) => (
              <FooterEntry key={item.href} item={item} />
            ))}
          </FooterColumn>
          <FooterColumn label="Contact">
            <a href={`mailto:${siteConfig.supportEmail}`} className="hover:text-(--text)">
              {siteConfig.supportEmail}
            </a>
          </FooterColumn>
        </div>
        {siteConfig.features.affiliate.enabled && (
          <p className="text-xs text-(--text-faint)">
            Affiliate disclosure: some links on this site may earn a referral fee at no cost to you.
            Disclosed per the FTC&apos;s endorsement guidelines.
          </p>
        )}
        <p className="text-xs text-(--text-faint)">
          © {YEAR} {siteConfig.name}.
        </p>
      </div>
      <VertexFooterLink />
    </footer>
  );
}

function FooterColumn({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-eyebrow text-(--text-faint)">{label}</span>
      <div className="flex flex-col gap-1.5 text-xs text-(--text-muted)">{children}</div>
    </div>
  );
}
