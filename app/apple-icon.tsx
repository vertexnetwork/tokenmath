import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
        fontSize: 110,
        fontWeight: 700,
        fontFamily: 'monospace',
      }}
    >
      ⟨t⟩
    </div>,
    size,
  );
}
