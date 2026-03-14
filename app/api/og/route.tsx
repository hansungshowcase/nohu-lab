import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '800px',
          height: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: '60px', marginBottom: '8px' }}>🏦</div>
        <div style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px' }}>
          나의 노후 준비 점수는?
        </div>
        <div style={{ fontSize: '18px', opacity: 0.8, marginBottom: '24px' }}>
          20개 질문으로 알아보는 나의 노후 준비 상태
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 28px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '999px',
            fontSize: '16px',
            fontWeight: 700,
          }}
        >
          지금 무료로 테스트하기 →
        </div>
        <div style={{ position: 'absolute', bottom: '20px', right: '40px', fontSize: '14px', opacity: 0.5 }}>
          노후연구소
        </div>
      </div>
    ),
    {
      width: 800,
      height: 400,
    }
  )
}
