import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

// Brand monogram per §7.6 — bracketed t in accent purple on dark.
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0A0A0B',
        color: '#A78BFA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        fontWeight: 700,
        fontFamily: 'monospace',
        borderRadius: 6,
      }}
    >
      ⟨t⟩
    </div>,
    size,
  );
}
