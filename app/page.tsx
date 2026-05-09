export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-(--container-app) flex-1 flex-col px-6 py-12 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        LLM Token & Cost Calculator
      </h1>
      <p className="mt-3 max-w-2xl text-base text-(--text-muted) sm:text-lg">
        Paste a prompt. See the exact token count and API cost across Claude and Gemini. Runs
        entirely in your browser.
      </p>
    </main>
  );
}
