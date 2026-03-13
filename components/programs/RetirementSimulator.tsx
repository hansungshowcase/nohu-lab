'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── 유형 정의 ───
const TYPES = {
  hanwoo: { emoji: '🥩', name: '한우형', title: '은퇴해도 소고기는 먹어야지', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', meal: '한우 소고기', price: '45,000원', desc: '여유로운 노후. 치킨도 시키고 여행도 간다. 손주 용돈도 넉넉히.', tag: '#금수저노후 #플렉스은퇴' },
  gukbap: { emoji: '🍲', name: '국밥형', title: '뜨끈한 국물 한 그릇의 여유', color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', meal: '국밥 한 그릇', price: '10,000원', desc: '먹고 사는 건 된다. 가끔 외식도 하고, 조금만 더 모으면 완벽.', tag: '#국밥은사치가아니다 #괜찮은노후' },
  dosirak: { emoji: '🍱', name: '도시락형', title: '선택은 할 수 있다, 아직은', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', meal: 'CU 도시락', price: '5,500원', desc: '생활은 되지만 마감할인이 친구. 병원비 나오면 그 달은 좀 힘들다.', tag: '#마감할인헌터 #알뜰노후' },
  ramyun: { emoji: '🍜', name: '라면형', title: '파라도 넣으면 괜찮다', color: '#f97316', bg: '#fff7ed', border: '#fed7aa', meal: '라면 한 봉지', price: '1,200원', desc: '끼니를 거르는 날이 생긴다. 아파도 참게 된다. 지금 바꾸면 아직 늦지 않았다.', tag: '#라면달인 #위기의노후' },
  samgak: { emoji: '🍙', name: '삼각김밥형', title: '이것도 고민해야 한다', color: '#ef4444', bg: '#fef2f2', border: '#fecaca', meal: '삼각김밥', price: '1,500원', desc: '삼시세끼 해결이 어렵다. 무료급식소가 일상. 지금 당장 행동해야 한다.', tag: '#삼각김밥도사치 #긴급노후' },
} as const
type TypeKey = keyof typeof TYPES

// ─── 질문 ───
interface Q { q: string; sub?: string; opts: { text: string; emoji: string; score: number }[] }
const QS: Q[] = [
  {
    q: '지금 치킨 시켜먹으려면?',
    opts: [
      { text: '바로 시킨다', emoji: '🛒', score: 5 },
      { text: '쿠폰 있으면 시킨다', emoji: '🎫', score: 4 },
      { text: '이번 달 카드값 보고 결정', emoji: '💳', score: 3 },
      { text: '한참 고민하다 라면 끓인다', emoji: '🍜', score: 2 },
      { text: '치킨은 생각도 안 한다', emoji: '😔', score: 1 },
    ]
  },
  {
    q: '통장에 월급 들어오면?',
    opts: [
      { text: '자동이체로 저축/투자부터', emoji: '📊', score: 5 },
      { text: '좀 쓰고 남으면 저축', emoji: '🏦', score: 4 },
      { text: '카드값 빠지면 얼마 안 남아', emoji: '💸', score: 3 },
      { text: '다음 월급날이 기다려진다', emoji: '📅', score: 2 },
      { text: '들어오자마자 사라진다', emoji: '🕳️', score: 1 },
    ]
  },
  {
    q: '노후 준비, 솔직히?',
    opts: [
      { text: '연금+투자+보험 다 하고 있다', emoji: '🏆', score: 5 },
      { text: '연금저축 하나 정도는', emoji: '📋', score: 4 },
      { text: '국민연금 말고는 없다', emoji: '🤷', score: 3 },
      { text: '생각은 하는데 못 하고 있다', emoji: '😅', score: 2 },
      { text: '뭘 해야 하는지도 모른다', emoji: '❓', score: 1 },
    ]
  },
  {
    q: '친구 결혼식 축의금 낼 때?',
    opts: [
      { text: '기꺼이 축하하며 낸다', emoji: '💐', score: 5 },
      { text: '좀 아깝지만 당연히 낸다', emoji: '💰', score: 4 },
      { text: '이번 달 빠듯한데...', emoji: '😬', score: 3 },
      { text: '진짜 부담된다', emoji: '😥', score: 2 },
      { text: '못 가는 척 한 적 있다', emoji: '🙈', score: 1 },
    ]
  },
  {
    q: '마트에서 장볼 때 나는?',
    opts: [
      { text: '먹고 싶은 거 담는다', emoji: '🛒', score: 5 },
      { text: '대충 계산하면서 담는다', emoji: '🧮', score: 4 },
      { text: '할인 스티커 먼저 찾는다', emoji: '🏷️', score: 3 },
      { text: '필수품만 겨우 산다', emoji: '📝', score: 2 },
      { text: '마트 가는 것도 부담이다', emoji: '😞', score: 1 },
    ]
  },
  {
    q: '은퇴 후 내 모습은?',
    opts: [
      { text: '여행 다니면서 취미 즐기기', emoji: '✈️', score: 5 },
      { text: '동네 산책하고 가끔 외식', emoji: '🚶', score: 4 },
      { text: '집에서 TV 보는 게 전부일 듯', emoji: '📺', score: 3 },
      { text: '일 안 하면 못 살 것 같다', emoji: '🔧', score: 2 },
      { text: '생각하기 싫다', emoji: '🫣', score: 1 },
    ]
  },
]

function getType(total: number): TypeKey {
  const avg = total / QS.length
  if (avg >= 4.3) return 'hanwoo'
  if (avg >= 3.5) return 'gukbap'
  if (avg >= 2.7) return 'dosirak'
  if (avg >= 1.8) return 'ramyun'
  return 'samgak'
}

// ─── 참여자 수 (로컬 카운트) ───
function useCount() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const stored = localStorage.getItem('nohu-test-count')
    const base = stored ? parseInt(stored) : 2847 // 초기 시드
    setCount(base)
  }, [])
  const increment = () => {
    const next = count + 1
    setCount(next)
    localStorage.setItem('nohu-test-count', String(next))
  }
  return { count, increment }
}

// ─── 컴포넌트 ───
export default function RetirementSimulator() {
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'loading' | 'result'>('intro')
  const [qi, setQi] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [typeKey, setTypeKey] = useState<TypeKey>('dosirak')
  const { count, increment } = useCount()

  const answer = (score: number) => {
    const next = [...answers, score]
    setAnswers(next)
    if (qi + 1 < QS.length) {
      setQi(qi + 1)
    } else {
      setPhase('loading')
      const total = next.reduce((a, b) => a + b, 0)
      const t = getType(total)
      increment()
      setTimeout(() => { setTypeKey(t); setPhase('result') }, 2000)
    }
  }

  const restart = () => { setPhase('intro'); setQi(0); setAnswers([]) }

  // 카드 생성
  const makeCard = useCallback((): HTMLCanvasElement | null => {
    const t = TYPES[typeKey]
    const W = 540, H = 540, sc = 2
    const c = document.createElement('canvas'); c.width = W * sc; c.height = H * sc
    const x = c.getContext('2d')!; x.scale(sc, sc)

    // 배경
    x.fillStyle = t.bg; x.fillRect(0, 0, W, H)
    x.fillStyle = t.color; x.fillRect(0, 0, W, 5)

    // 이모지
    x.font = '100px system-ui'; x.textAlign = 'center'; x.fillText(t.emoji, W / 2, 130)

    // 유형명
    x.fillStyle = t.color; x.font = '900 28px system-ui'; x.fillText(t.name, W / 2, 180)

    // 타이틀
    x.fillStyle = '#111'; x.font = '800 22px system-ui'; x.fillText(`"${t.title}"`, W / 2, 220)

    // 음식 + 가격
    x.fillStyle = '#666'; x.font = '400 14px system-ui'; x.fillText(`은퇴 후 나의 점심: ${t.meal} (${t.price})`, W / 2, 255)

    // 설명 (줄바꿈)
    x.fillStyle = '#555'; x.font = '400 13px system-ui'
    const words = t.desc.split(''); let line = '', ly = 290
    for (const ch of words) {
      const test = line + ch
      if (x.measureText(test).width > W - 80) { x.fillText(line, W / 2, ly); ly += 20; line = ch } else line = test
    }
    if (line) x.fillText(line, W / 2, ly)

    // 태그
    x.fillStyle = t.color; x.font = '500 12px system-ui'; x.fillText(t.tag, W / 2, ly + 30)

    // 전체 유형 라인
    const types: TypeKey[] = ['hanwoo', 'gukbap', 'dosirak', 'ramyun', 'samgak']
    const startX = (W - 80 * 5) / 2
    types.forEach((tk, i) => {
      const tx = startX + i * 80 + 40
      const ty = H - 120
      const tt = TYPES[tk]
      if (tk === typeKey) {
        x.fillStyle = tt.color; x.beginPath(); x.arc(tx, ty, 16, 0, Math.PI * 2); x.fill()
        x.fillStyle = '#fff'; x.font = '700 16px system-ui'; x.fillText(tt.emoji, tx, ty + 6)
      } else {
        x.fillStyle = '#e5e5e5'; x.beginPath(); x.arc(tx, ty, 13, 0, Math.PI * 2); x.fill()
        x.fillStyle = '#999'; x.font = '400 14px system-ui'; x.fillText(tt.emoji, tx, ty + 5)
      }
    })

    // CTA
    x.fillStyle = '#03C75A'; x.beginPath(); x.roundRect(40, H - 68, W - 80, 36, 10); x.fill()
    x.fillStyle = '#fff'; x.font = '700 12px system-ui'; x.fillText('나도 해보기  nohu-lab.vercel.app', W / 2, H - 45)

    x.fillStyle = '#bbb'; x.font = '400 9px system-ui'; x.fillText('노후연구소 카페  cafe.naver.com/eovhskfktmak', W / 2, H - 14)
    x.textAlign = 'left'
    return c
  }, [typeKey])

  const shareResult = useCallback(async () => {
    const t = TYPES[typeKey]
    const txt = `[나의 노후 유형]\n\n${t.emoji} ${t.name}\n"${t.title}"\n\n은퇴 후 나의 점심: ${t.meal}\n${t.desc}\n\n${t.tag}\n\n나도 해보기:\nhttps://nohu-lab.vercel.app/programs/retirement-simulator\n\n노후연구소 카페\ncafe.naver.com/eovhskfktmak`

    const c = makeCard()
    if (c) {
      c.toBlob(async (blob) => {
        if (!blob) { fb(txt); return }
        const file = new File([blob], `노후유형_${t.name}.png`, { type: 'image/png' })
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          try { await navigator.share({ title: '나의 노후 유형', text: txt, files: [file] }) } catch { fb(txt) }
        } else { fb(txt) }
      }, 'image/png')
    } else { fb(txt) }
  }, [typeKey, makeCard])

  function fb(txt: string) {
    if (navigator.share) navigator.share({ title: '나의 노후 유형', text: txt }).catch(() => {})
    else { navigator.clipboard.writeText(txt); alert('클립보드에 복사되었습니다') }
  }

  // ─── 인트로 ───
  if (phase === 'intro') return (
    <div className="max-w-[400px] mx-auto px-4 text-center">
      <div className="pt-8 pb-6">
        <div className="flex justify-center gap-1 text-[36px]">
          <span>🥩</span><span>🍲</span><span>🍱</span><span>🍜</span><span>🍙</span>
        </div>
        <h2 className="text-[26px] font-[900] text-gray-900 leading-tight mt-4">은퇴 후<br/>나의 점심 유형은?</h2>
        <p className="text-[13px] text-gray-500 mt-3">6개 질문으로 알아보는<br/>당신의 은퇴 후 밥상</p>

        {count > 0 && (
          <p className="text-[11px] text-green-600 font-[600] mt-4">{count.toLocaleString()}명이 참여했습니다</p>
        )}
      </div>

      {/* 유형 미리보기 */}
      <div className="grid grid-cols-5 gap-1.5 mb-6">
        {(Object.entries(TYPES) as [TypeKey, typeof TYPES.hanwoo][]).map(([, v]) => (
          <div key={v.name} className="text-center">
            <p className="text-[28px]">{v.emoji}</p>
            <p className="text-[9px] text-gray-500 font-[600] mt-0.5">{v.name}</p>
          </div>
        ))}
      </div>

      <button onClick={() => setPhase('quiz')} className="w-full py-4 bg-gray-900 text-white font-[800] rounded-xl text-[15px] active:scale-[0.98] transition">
        테스트 시작
      </button>
      <p className="text-[10px] text-gray-400 mt-3">1분이면 끝 | 개인정보 수집 없음</p>
    </div>
  )

  // ─── 퀴즈 ───
  if (phase === 'quiz') {
    const q = QS[qi]
    return (
      <div className="max-w-[400px] mx-auto px-4">
        {/* 프로그레스 */}
        <div className="pt-4 pb-1">
          <div className="flex gap-1">
            {QS.map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i < qi ? 'bg-green-500' : i === qi ? 'bg-green-400' : 'bg-gray-200'}`} />
            ))}
          </div>
          <p className="text-[10px] text-gray-400 text-right mt-1">{qi + 1}/{QS.length}</p>
        </div>

        {/* 질문 */}
        <div className="pt-4 pb-5">
          <p className="text-[22px] font-[900] text-gray-900 leading-snug">{q.q}</p>
        </div>

        {/* 선택지 */}
        <div className="space-y-2">
          {q.opts.map((opt, i) => (
            <button key={i} onClick={() => answer(opt.score)}
              className="w-full text-left flex items-center gap-3 px-4 py-3.5 bg-white border border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50/50 active:bg-green-50 transition">
              <span className="text-[22px] shrink-0">{opt.emoji}</span>
              <span className="text-[14px] font-[600] text-gray-800">{opt.text}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─── 로딩 ───
  if (phase === 'loading') return (
    <div className="max-w-[400px] mx-auto px-4 text-center pt-20">
      <div className="flex justify-center gap-2 text-[40px] animate-bounce">
        <span>🥩</span><span>🍲</span><span>🍱</span><span>🍜</span><span>🍙</span>
      </div>
      <p className="text-[16px] font-[800] text-gray-900 mt-5">메뉴 정하는 중...</p>
      <p className="text-[12px] text-gray-400 mt-1">당신의 은퇴 후 밥상을 차리고 있습니다</p>
    </div>
  )

  // ─── 결과 ───
  const t = TYPES[typeKey]
  const types: TypeKey[] = ['hanwoo', 'gukbap', 'dosirak', 'ramyun', 'samgak']

  return (
    <div className="max-w-[400px] mx-auto px-4">
      {/* 결과 카드 */}
      <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: t.border, backgroundColor: t.bg }}>
        <div className="h-1.5" style={{ backgroundColor: t.color }} />
        <div className="p-6 text-center">
          <p className="text-[80px] leading-none">{t.emoji}</p>
          <p className="text-[13px] font-[600] mt-2" style={{ color: t.color }}>{t.name}</p>
          <p className="text-[24px] font-[900] text-gray-900 mt-1">"{t.title}"</p>
          <p className="text-[12px] text-gray-500 mt-2">은퇴 후 나의 점심: <strong className="text-gray-800">{t.meal}</strong> ({t.price})</p>

          <div className="mt-4 bg-white/70 rounded-xl px-4 py-3">
            <p className="text-[13px] text-gray-700 leading-relaxed">{t.desc}</p>
          </div>

          <p className="text-[11px] mt-3" style={{ color: t.color }}>{t.tag}</p>
        </div>

        {/* 유형 라인 */}
        <div className="bg-white/50 px-4 py-3 flex justify-between items-center">
          {types.map(tk => {
            const tt = TYPES[tk]
            const isMe = tk === typeKey
            return (
              <div key={tk} className="text-center flex-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center mx-auto ${isMe ? 'ring-2 ring-offset-1' : ''}`}
                  style={isMe ? { backgroundColor: tt.color, '--tw-ring-color': tt.color } as React.CSSProperties : { backgroundColor: '#f3f4f6' }}>
                  <span className="text-[16px]">{tt.emoji}</span>
                </div>
                <p className={`text-[9px] mt-0.5 ${isMe ? 'font-[700]' : 'text-gray-400'}`} style={isMe ? { color: tt.color } : {}}>{tt.name}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* 카페 */}
      <div className="mt-3 bg-white border border-gray-200 rounded-xl p-3 text-center">
        <p className="text-[12px] font-[700] text-gray-800">
          {typeKey === 'hanwoo' || typeKey === 'gukbap' ? '노후 유지 전략이 궁금하다면' : '점심을 업그레이드하고 싶다면'}
        </p>
        <a href="https://cafe.naver.com/eovhskfktmak" target="_blank" rel="noopener noreferrer"
          className="inline-block mt-2 px-5 py-2 bg-[#03C75A] text-white font-[700] rounded-lg text-[12px]">
          노후연구소 카페 가입
        </a>
      </div>

      {/* 하단 */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 -mx-4 px-4 py-3 flex gap-2 z-40 mt-4">
        <button onClick={restart} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-[13px] font-bold active:bg-gray-50">다시 하기</button>
        <button onClick={shareResult} className="flex-[2] py-3 bg-[#FEE500] text-[#3C1E1E] rounded-xl text-[13px] font-[800] active:bg-[#F5DC00] flex items-center justify-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#3C1E1E"><path d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.68 6.67-.15.56-.96 3.6-.99 3.82 0 0-.02.16.08.22s.22.02.22.02c.29-.04 3.37-2.2 3.9-2.57.67.1 1.37.15 2.11.15 5.52 0 10-3.58 10-7.94S17.52 3 12 3"/></svg>
          내 유형 공유하기
        </button>
      </div>
      <div className="h-16" />
    </div>
  )
}
