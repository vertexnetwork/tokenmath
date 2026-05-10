import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/**
 * Brand monogram — bracketed cursor [|] in mauve on warm dark. The same mark renders at
 * 64×64 in /icon.svg; this 32px PNG variant is what browsers cache as the favicon.
 */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0A0A0B',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={20} height={20} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22 18 H18 V46 H22"
          fill="none"
          stroke="#B4A0F5"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M42 18 H46 V46 H42"
          fill="none"
          stroke="#B4A0F5"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M32 22 V42" fill="none" stroke="#E7E7EA" strokeWidth={4} strokeLinecap="round" />
      </svg>
    </div>,
    size,
  );
}
