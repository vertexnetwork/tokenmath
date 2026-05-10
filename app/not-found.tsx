import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export default function NotFound() {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start gap-6 px-6 py-20"
    >
      <p className="text-eyebrow text-(--accent)">404</p>
      <h1 className="text-display-lg">This page doesn&apos;t exist.</h1>
      <p className="max-w-prose text-base text-(--text-muted)">
        It may have moved or never existed. Head back to the{" "}
        <Link href="/" className="text-(--accent) underline-offset-4 hover:underline">
          {siteConfig.name} calculator
        </Link>{" "}
        or check the{" "}
        <Link href="/models" className="text-(--accent) underline-offset-4 hover:underline">
          models index
        </Link>
        .
      </p>
    </main>
  );
}
