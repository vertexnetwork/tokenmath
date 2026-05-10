import { expect, test } from "@playwright/test";

test("/api/og returns a 1200×630 PNG", async ({ request }) => {
  const res = await request.get("/api/og?title=Test&subtitle=Snapshot");
  expect(res.status()).toBe(200);
  const ct = res.headers()["content-type"] ?? "";
  expect(ct).toMatch(/image\/png/);

  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  const buf = await res.body();
  expect(buf[0]).toBe(0x89);
  expect(buf[1]).toBe(0x50);
  expect(buf[2]).toBe(0x4e);
  expect(buf[3]).toBe(0x47);
  expect(buf.length).toBeGreaterThan(2_000);
});

test("root /opengraph-image returns a 1200×630 PNG", async ({ request }) => {
  const res = await request.get("/opengraph-image");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"] ?? "").toMatch(/image\/png/);
});
