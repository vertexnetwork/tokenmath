import { expect, test } from '@playwright/test';

test('home page loads, paste produces a token count', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/tokencount/i);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Token & Cost Calculator/);

  // The "Tokens" stat starts at 0 — establish the baseline.
  const tokensStat = page.getByText('Tokens', { exact: true }).first();
  await expect(tokensStat).toBeVisible();

  // Paste a known string and wait for the debounced count to update past zero.
  const textarea = page.getByPlaceholder(/Paste up to 1M characters/);
  await textarea.fill(
    'The quick brown fox jumps over the lazy dog. ' +
      'Tokenize this short prompt for the calculator and confirm we see a non-zero count.',
  );

  // Wait until the result-num beneath "Tokens" is non-zero.
  const tokenCount = page.locator('section#calculator [data-clarity-mask]').nth(0);
  await expect
    .poll(async () => Number((await tokenCount.first().textContent()) ?? '0'))
    .toBeGreaterThan(0);
});

test('privacy: no outgoing request body contains the pasted sentinel', async ({ page }) => {
  // §9 verification: paste a unique sentinel and confirm zero outgoing request bodies contain it.
  const sentinel = `tokencount-sentinel-${crypto.randomUUID()}`;
  const leaked: string[] = [];

  page.on('request', (req) => {
    const body = req.postData();
    if (body && body.includes(sentinel)) {
      leaked.push(`${req.method()} ${req.url()}`);
    }
  });

  await page.goto('/');
  await page.getByPlaceholder(/Paste up to 1M characters/).fill(sentinel.repeat(50));

  // Wait long enough for any debounced or batched analytics call to fire.
  await page.waitForTimeout(2_000);

  expect(leaked, `sentinel leaked in: ${leaked.join('\n')}`).toHaveLength(0);
});

test('pSEO route renders for Claude 4.5 Sonnet', async ({ page }) => {
  await page.goto('/token-calculator/anthropic-claude-4-5-sonnet');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Claude 4\.5 Sonnet/);

  // Calculator should be present and locked to this model (no model picker visible).
  await expect(page.locator('section#calculator')).toBeVisible();
  await expect(page.locator('select')).toHaveCount(0);

  // FAQ JSON-LD should be in the DOM.
  const jsonLd = page.locator('script[type="application/ld+json"]');
  await expect(jsonLd).toHaveCount(4); // Organization + SoftwareApplication + FAQPage + BreadcrumbList
});

test('mobile hamburger opens and closes', async ({ page, browserName }, testInfo) => {
  // Only run on the mobile project (iPhone 14 viewport).
  test.skip(testInfo.project.name !== 'mobile', 'mobile-only check');
  void browserName;

  await page.goto('/');
  const hamburger = page.getByRole('button', { name: 'Open menu' });
  await expect(hamburger).toBeVisible();
  await hamburger.click();

  const closeButton = page.getByRole('button', { name: 'Close menu' });
  await expect(closeButton).toBeVisible();
  await closeButton.click();
  await expect(closeButton).not.toBeVisible();
});
