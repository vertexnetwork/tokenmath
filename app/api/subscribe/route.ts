/**
 * Email capture → Resend audience. The only serverless route besides /api/og, and it never
 * receives prompt content — just an email + a source tag for funnel attribution.
 *
 * - Edge runtime (no Node fs).
 * - Validates email shape, forwards to the Resend Audience API.
 * - Treats Resend 409 (already in audience) as success — idempotent.
 * - Returns 503 when Resend env vars are unset, so the feature is a clean no-op until
 *   configured.
 */
import { addToAudience, isValidEmail } from "@/lib/email";

export const runtime = "edge";

type Body = { email?: unknown; source?: unknown };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  if (!isValidEmail(body.email)) {
    return Response.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const result = await addToAudience(body.email);
  if (!result.ok) {
    const status = result.status === "not_configured" ? 503 : 502;
    return Response.json({ ok: false, error: result.status }, { status });
  }
  return Response.json({ ok: true, status: result.status });
}
