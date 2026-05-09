import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/seo';

export const runtime = 'edge';

const SIZE = { width: 1200, height: 630 };

/**
 * /api/og — OG image generator. Per §1.5 and §2.4 this route NEVER receives prompt input;
 * accepted query params are limited to title + subtitle text used in the OG card itself.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = clamp(url.searchParams.get('title') ?? 'LLM Token & Cost Calculator', 80);
  const subtitle = clamp(
    url.searchParams.get('subtitle') ?? 'Paste. Count. Price. Privately.',
    140,
  );

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        background: '#0A0A0B',
        color: '#E7E7EA',
        padding: 80,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span
          style={{
            fontSize: 40,
            color: '#A78BFA',
            fontFamily: 'monospace',
          }}
        >
          ⟨t⟩
        </span>
        <span style={{ fontSize: 32, fontWeight: 600 }}>{SITE_NAME}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 28, color: '#9C9CA3', lineHeight: 1.3 }}>{subtitle}</div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 22,
          color: '#9C9CA3',
        }}
      >
        <span>tokencount.ai</span>
        <span style={{ color: '#34D399' }}>● Client-side. Never uploaded.</span>
      </div>
    </div>,
    SIZE,
  );
}

function clamp(s: string, max: number) {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1).trimEnd()}…`;
}
