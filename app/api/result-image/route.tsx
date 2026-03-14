import { ImageResponse } from 'next/og'

export const runtime = 'edge'

const resultData: Record<string, { grade: string; color: string; bgColor: string; estimatedFund: string; description: string; advices: string[] }> = {
  S: { grade: '노후 마스터', color: '#16a34a', bgColor: '#f0fdf4', estimatedFund: '이미 80%+ 확보', description: '당신은 이미 노후 준비의 달인! 체계적인 계획과 꾸준한 실천으로 든든한 미래를 만들어가고 있습니다.', advices: ['현재 포트폴리오의 리밸런싱을 정기적으로 점검하세요', '상속·증여 등 자산 이전 계획도 함께 세워보세요', '주변 사람들에게 노후 준비 노하우를 공유해주세요'] },
  A: { grade: '든든한 준비생', color: '#2563eb', bgColor: '#eff6ff', estimatedFund: '약 3~4억', description: '꾸준히 준비해온 당신! 대부분의 영역에서 잘 준비하고 있지만, 몇 가지 보완하면 더 완벽해집니다.', advices: ['부족한 카테고리를 집중적으로 보강하세요', '연금 수령 시기와 방법을 미리 계획해보세요', '건강관리와 취미활동도 잊지 마세요'] },
  B: { grade: '슬슬 눈뜬 사람', color: '#ca8a04', bgColor: '#fefce8', estimatedFund: '약 4~5억', description: '노후 준비에 눈을 뜨기 시작했네요! 지금부터 본격적으로 시작하면 충분히 따라잡을 수 있습니다.', advices: ['매월 자동이체로 저축 습관을 만들어보세요', '개인연금(IRP/연금저축) 가입을 적극 검토하세요', '구체적인 은퇴 생활비 계획을 세워보세요'] },
  C: { grade: '아직은 꿈나라', color: '#ea580c', bgColor: '#fff7ed', estimatedFund: '약 5~6억', description: '아직 노후 준비가 많이 부족해요. 하지만 걱정하지 마세요, 지금 시작해도 늦지 않습니다!', advices: ['국민연금 예상 수령액부터 확인해보세요', '소액이라도 매월 저축을 시작하세요', '노후 관련 무료 교육 프로그램에 참여해보세요'] },
  D: { grade: '노후? 그게 뭔데?', color: '#dc2626', bgColor: '#fef2f2', estimatedFund: '약 6~7억', description: '솔직히 노후 준비를 거의 안 하고 있네요. 지금이 바로 시작할 때입니다!', advices: ['먼저 현재 재정 상태를 정확히 파악하세요', '불필요한 지출을 줄이고 저축부터 시작하세요', '금융 기초 지식을 쌓는 것부터 시작하세요'] },
  F: { grade: '올해부터 시작!', color: '#9333ea', bgColor: '#faf5ff', estimatedFund: '약 7억+', description: '거의 모든 영역에서 준비가 안 되어 있어요. 하지만 이 테스트를 한 것 자체가 첫 걸음입니다!', advices: ['오늘 당장 통장을 하나 만들어 자동이체를 설정하세요', '국민연금공단에서 내 연금 예상액을 확인하세요', '가까운 은행의 무료 재무상담을 받아보세요'] },
}

const catMeta = [
  { key: 'f', label: '재정 준비도', letter: 'F', color: '#16a34a' },
  { key: 'l', label: '생활/건강', letter: 'L', color: '#2563eb' },
  { key: 'h', label: '주거/자산', letter: 'H', color: '#ea580c' },
  { key: 'm', label: '마인드/지식', letter: 'M', color: '#7c3aed' },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const total = parseInt(searchParams.get('s') || '0', 10)
  const code = (searchParams.get('code') || 'B').toUpperCase()
  const result = resultData[code] || resultData.B

  const cats = catMeta.map(cm => ({
    ...cm,
    score: parseInt(searchParams.get(cm.key) || '0', 10),
    max: 20,
  }))

  const pct = Math.round((total / 80) * 100)
  const strongest = cats.reduce((a, b) => a.score > b.score ? a : b)
  const weakest = cats.reduce((a, b) => a.score < b.score ? a : b)

  const gradeLabel = (p: number) => p >= 80 ? '우수' : p >= 60 ? '양호' : p >= 40 ? '보통' : '미흡'
  const gradeColor = (p: number) => p >= 80 ? '#16a34a' : p >= 60 ? '#2563eb' : p >= 40 ? '#ca8a04' : '#dc2626'

  return new ImageResponse(
    (
      <div style={{
        width: '800px',
        height: '1200px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif',
        backgroundColor: '#ffffff',
        color: '#111827',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#166534',
          color: '#ffffff',
          padding: '32px 48px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', letterSpacing: '3px', opacity: 0.6 }}>RETIREMENT READINESS REPORT</span>
            <span style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>노후 준비 종합 진단 리포트</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '22px', fontWeight: 800 }}>노후연구소</span>
          </div>
        </div>

        {/* Score Summary */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
          padding: '32px 48px',
          backgroundColor: '#fafafa',
          borderBottom: '1px solid #e5e7eb',
        }}>
          {/* Score Circle */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            border: `8px solid ${result.color}`,
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '48px', fontWeight: 800, color: result.color }}>{total}</span>
            <span style={{ fontSize: '14px', color: '#9ca3af' }}>/ 80점</span>
          </div>
          {/* Grade + Description */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '40px', height: '40px', borderRadius: '50%',
                backgroundColor: result.color, color: '#fff',
                fontSize: '20px', fontWeight: 800,
              }}>
                {result.grade.charAt(0)}
              </span>
              <span style={{ fontSize: '28px', fontWeight: 800, color: result.color }}>{result.grade}</span>
              <span style={{
                padding: '4px 14px', borderRadius: '999px',
                fontSize: '13px', fontWeight: 700,
                color: '#fff',
                backgroundColor: total >= 61 ? '#16a34a' : total >= 37 ? '#ca8a04' : '#dc2626',
              }}>
                {total >= 73 ? '상위 5%' : total >= 61 ? '상위 20%' : total >= 49 ? '상위 40%' : total >= 37 ? '상위 60%' : '하위 30%'}
              </span>
            </div>
            <span style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.7' }}>{result.description}</span>
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <span style={{ padding: '5px 14px', borderRadius: '8px', backgroundColor: result.bgColor, fontSize: '13px' }}>
                필요 노후자금: <span style={{ fontWeight: 800, color: result.color }}>{result.estimatedFund}</span>
              </span>
              <span style={{ padding: '5px 14px', borderRadius: '8px', backgroundColor: '#f0fdf4', fontSize: '13px' }}>
                강점: <span style={{ fontWeight: 800, color: '#16a34a' }}>{strongest.label}</span>
              </span>
              <span style={{ padding: '5px 14px', borderRadius: '8px', backgroundColor: '#fef2f2', fontSize: '13px' }}>
                보강: <span style={{ fontWeight: 800, color: '#dc2626' }}>{weakest.label}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Category Bar Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '28px 48px', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '4px', height: '22px', borderRadius: '2px', backgroundColor: '#166534' }} />
            <span style={{ fontSize: '18px', fontWeight: 700 }}>4대 영역 종합 점수</span>
          </div>
          {cats.map((cat) => {
            const p = Math.round((cat.score / cat.max) * 100)
            const gc = gradeColor(p)
            return (
              <div key={cat.key} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '110px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '24px', height: '24px', borderRadius: '50%',
                    backgroundColor: cat.color, color: '#fff',
                    fontSize: '13px', fontWeight: 800,
                  }}>{cat.letter}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#374151' }}>{cat.label}</span>
                </div>
                <div style={{ display: 'flex', flex: 1, height: '32px', backgroundColor: '#f3f4f6', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                    height: '100%', width: `${Math.max(p, 5)}%`,
                    backgroundColor: gc, borderRadius: '6px',
                    paddingRight: '10px',
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{cat.score}/{cat.max}</span>
                  </div>
                </div>
                <span style={{
                  width: '44px', fontSize: '12px', fontWeight: 700,
                  color: gc, textAlign: 'center',
                  padding: '3px 0', borderRadius: '6px',
                }}>{gradeLabel(p)}</span>
              </div>
            )
          })}
        </div>

        {/* Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '20px 48px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '4px', height: '22px', borderRadius: '2px', backgroundColor: '#166534' }} />
            <span style={{ fontSize: '18px', fontWeight: 700 }}>맞춤 실천 가이드</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {result.advices.map((advice, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                padding: '18px 20px', borderRadius: '12px',
                border: '1px solid #e5e7eb', backgroundColor: '#fafafa',
              }}>
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: result.color, color: '#fff',
                  fontSize: '16px', fontWeight: 800, flexShrink: 0,
                }}>{i + 1}</span>
                <span style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', flex: 1 }}>{advice}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score Summary Row */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '24px',
          padding: '20px 48px',
          borderTop: '1px solid #e5e7eb',
        }}>
          {cats.map(cat => {
            const p = Math.round((cat.score / cat.max) * 100)
            return (
              <div key={cat.key} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '12px 24px', borderRadius: '12px',
                backgroundColor: `${gradeColor(p)}10`, flex: 1,
              }}>
                <span style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{cat.label}</span>
                <span style={{ fontSize: '28px', fontWeight: 800, color: gradeColor(p) }}>{cat.score}</span>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>/ {cat.max}점</span>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 48px',
          backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb',
        }}>
          <span style={{ fontSize: '13px', color: '#9ca3af' }}>nohu-lab.vercel.app/programs/retirement-test</span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#166534' }}>노후연구소</span>
        </div>
      </div>
    ),
    {
      width: 800,
      height: 1200,
    }
  )
}
