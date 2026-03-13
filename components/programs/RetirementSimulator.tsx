'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── 등급 정의 ───
const GRADES = {
  S: { name: '금수저 노후', emoji: '👑', color: '#f59e0b', bg: 'bg-amber-50 border-amber-200', desc: '치킨도 배달시키고, 해외여행도 간다', detail: '매달 여유 있게 쓰고도 남습니다. 손주 용돈, 가끔 해외여행, 취미 활동 모두 가능. 다만 물가 상승 대비는 계속 해야 합니다.' },
  A: { name: '국밥은 사 먹는 노후', emoji: '🍲', color: '#22c55e', bg: 'bg-green-50 border-green-200', desc: '외식도 되고, 가끔 여행도 간다', detail: '기본 생활은 충분하고 가끔 외식도 됩니다. 하지만 경조사가 겹치면 빠듯해질 수 있어요. 조금만 더 모으면 완벽합니다.' },
  B: { name: '마트할인 헌터', emoji: '🏷️', color: '#3b82f6', bg: 'bg-blue-50 border-blue-200', desc: '아끼면 살 수는 있다', detail: '생활은 되지만 마감할인 반찬이 친구. 갑자기 병원비 나오면 그 달은 힘듭니다. 지금부터 저축률을 올리면 A등급 가능.' },
  C: { name: '라면 달인', emoji: '🍜', color: '#f97316', bg: 'bg-orange-50 border-orange-200', desc: '끼니 걱정이 시작된다', detail: '끼니를 거르는 날이 생길 수 있습니다. 아파도 병원비가 무서워 참게 되고, 난방비도 부담. 지금 바꾸지 않으면 힘들어집니다.' },
  D: { name: '삼각김밥도 고민', emoji: '😰', color: '#ef4444', bg: 'bg-red-50 border-red-200', desc: '무료급식소가 일상이 된다', detail: '삼시세끼 해결이 어렵습니다. 공과금 내면 남는 게 거의 없고, 자녀에게 도움 요청도 어려운 상황. 긴급하게 재설계가 필요합니다.' },
}
type Grade = keyof typeof GRADES

// ─── 질문 ───
interface Q { q: string; opts: { text: string; score: number }[] }
const QUESTIONS: Q[] = [
  { q: '매달 저축/투자 하는 금액은?', opts: [
    { text: '100만원 이상', score: 5 },
    { text: '50~100만원', score: 4 },
    { text: '30~50만원', score: 3 },
    { text: '10~30만원', score: 2 },
    { text: '거의 못 하고 있다', score: 1 },
  ]},
  { q: '현재 총 자산은? (부동산 제외)', opts: [
    { text: '3억 이상', score: 5 },
    { text: '1~3억', score: 4 },
    { text: '5천~1억', score: 3 },
    { text: '1천~5천만원', score: 2 },
    { text: '1천만원 미만', score: 1 },
  ]},
  { q: '국민연금 예상 수령액은?', opts: [
    { text: '100만원 이상', score: 5 },
    { text: '70~100만원', score: 4 },
    { text: '50~70만원', score: 3 },
    { text: '30~50만원', score: 2 },
    { text: '모르겠다 / 거의 없다', score: 1 },
  ]},
  { q: '은퇴까지 남은 기간은?', opts: [
    { text: '30년 이상', score: 5 },
    { text: '20~30년', score: 4 },
    { text: '10~20년', score: 3 },
    { text: '5~10년', score: 2 },
    { text: '5년 이내', score: 1 },
  ]},
  { q: '노후를 위해 따로 준비하고 있는 게 있나요?', opts: [
    { text: '연금저축+IRP+투자 다 하고 있다', score: 5 },
    { text: '연금저축이나 보험 하나 있다', score: 4 },
    { text: '적금 정도만', score: 3 },
    { text: '따로 없다, 국민연금만', score: 2 },
    { text: '아무것도 없다', score: 1 },
  ]},
  { q: '지금 치킨 시켜먹을 때 고민하나요?', opts: [
    { text: '전혀, 먹고 싶으면 바로 시킨다', score: 5 },
    { text: '가끔은 괜찮다', score: 4 },
    { text: '할인 쿠폰 있을 때만', score: 3 },
    { text: '한참 고민한다', score: 2 },
    { text: '포기한 지 오래다', score: 1 },
  ]},
  { q: '이번 달 경조사비 나갈 때 기분은?', opts: [
    { text: '축하해주러 가는 거니까 기꺼이', score: 5 },
    { text: '좀 아깝지만 낸다', score: 4 },
    { text: '이번 달 빠듯한데...', score: 3 },
    { text: '솔직히 부담된다', score: 2 },
    { text: '못 가는 척 한 적 있다', score: 1 },
  ]},
]

function getGrade(total: number): Grade {
  const avg = total / QUESTIONS.length
  if (avg >= 4.3) return 'S'
  if (avg >= 3.5) return 'A'
  if (avg >= 2.7) return 'B'
  if (avg >= 1.8) return 'C'
  return 'D'
}

// ─── 컴포넌트 ───
export default function RetirementSimulator() {
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'loading' | 'result'>('intro')
  const [qi, setQi] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [grade, setGrade] = useState<Grade>('B')
  const [member, setMember] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => { if (r.ok) setMember(true) }).catch(() => {})
  }, [])

  const answer = (score: number) => {
    const next = [...answers, score]
    setAnswers(next)
    if (qi + 1 < QUESTIONS.length) {
      setQi(qi + 1)
    } else {
      setPhase('loading')
      const total = next.reduce((a, b) => a + b, 0)
      const g = getGrade(total)
      setTimeout(() => { setGrade(g); setPhase('result') }, 2200)
    }
  }

  const restart = () => { setPhase('intro'); setQi(0); setAnswers([]) }

  const shareResult = () => {
    const g = GRADES[grade]
    const txt = `[나의 노후 등급]\n\n${g.emoji} ${grade}등급 "${g.name}"\n${g.desc}\n\n나도 테스트하기:\nhttps://nohu-lab.vercel.app/programs/retirement-simulator\n\n노후연구소 카페\ncafe.naver.com/eovhskfktmak`
    if (navigator.share) navigator.share({ title: '나의 노후 등급', text: txt }).catch(() => {})
    else { navigator.clipboard.writeText(txt); alert('클립보드에 복사되었습니다') }
  }

  // ─── 인트로 ───
  if (phase === 'intro') return (
    <div className="max-w-[440px] mx-auto px-4 text-center">
      <div className="pt-8 pb-6">
        <p className="text-[60px] leading-none">🏆</p>
        <h2 className="text-[26px] font-[900] text-gray-900 leading-tight mt-4">당신의<br/>노후 등급은?</h2>
        <p className="text-[13px] text-gray-500 mt-3">7개 질문에 답하면<br/>은퇴 후 당신의 삶이 어떤 등급인지 알 수 있습니다</p>
        <div className="flex justify-center gap-2 mt-5">
          {(Object.entries(GRADES) as [Grade, typeof GRADES.S][]).map(([k, v]) => (
            <div key={k} className="text-center">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-[900] text-[16px] mx-auto" style={{ backgroundColor: v.color }}>{k}</div>
              <p className="text-[9px] text-gray-400 mt-1">{v.name}</p>
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => setPhase('quiz')} className="w-full py-4 bg-green-600 text-white font-[800] rounded-xl text-[15px] hover:bg-green-700 transition active:scale-[0.98]">
        테스트 시작하기
      </button>
      <p className="text-[10px] text-gray-400 mt-3">30초면 끝납니다 | 개인정보 수집 없음</p>
    </div>
  )

  // ─── 퀴즈 ───
  if (phase === 'quiz') {
    const q = QUESTIONS[qi]
    const progress = ((qi) / QUESTIONS.length) * 100
    return (
      <div className="max-w-[440px] mx-auto px-4">
        {/* 진행 바 */}
        <div className="pt-4 pb-2">
          <div className="flex justify-between text-[11px] text-gray-400 mb-1">
            <span>{qi + 1} / {QUESTIONS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* 질문 */}
        <div className="pt-6 pb-4">
          <p className="text-[20px] font-[800] text-gray-900 leading-snug">{q.q}</p>
        </div>

        {/* 선택지 */}
        <div className="space-y-2">
          {q.opts.map((opt, i) => (
            <button key={i} onClick={() => answer(opt.score)}
              className="w-full text-left px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[14px] font-[600] text-gray-800 hover:border-green-400 hover:bg-green-50 active:bg-green-100 transition">
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─── 로딩 ───
  if (phase === 'loading') return (
    <div className="max-w-[440px] mx-auto px-4 text-center pt-20">
      <div className="inline-block w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      <p className="text-[15px] font-[700] text-gray-900 mt-4">등급 분석 중...</p>
      <p className="text-[11px] text-gray-400 mt-1">당신의 노후를 진단하고 있습니다</p>
    </div>
  )

  // ─── 결과 ───
  const g = GRADES[grade]
  const total = answers.reduce((a, b) => a + b, 0)
  const avg = total / QUESTIONS.length
  const scores = QUESTIONS.map((q, i) => ({ q: q.q, score: answers[i], max: 5 }))

  return (
    <div className="max-w-[440px] mx-auto px-4">
      {/* 등급 카드 */}
      <div className={`rounded-2xl border-2 p-6 text-center ${g.bg} relative overflow-hidden`}>
        <div className="absolute -right-4 -top-4 text-[120px] leading-none select-none opacity-10 font-[900]">{grade}</div>
        <div className="relative z-10">
          <p className="text-[48px] leading-none">{g.emoji}</p>
          <div className="mt-3 inline-block px-4 py-1.5 rounded-full text-white font-[900] text-[20px]" style={{ backgroundColor: g.color }}>
            {grade}등급
          </div>
          <p className="text-[22px] font-[900] text-gray-900 mt-3">"{g.name}"</p>
          <p className="text-[13px] text-gray-600 mt-2">{g.desc}</p>
        </div>
      </div>

      {/* 상세 설명 */}
      <div className="mt-3 bg-white border border-gray-200 rounded-2xl p-4">
        <p className="text-[13px] text-gray-700 leading-[1.8]">{g.detail}</p>
      </div>

      {/* 점수 바 */}
      <div className="mt-3 bg-white border border-gray-200 rounded-2xl p-4">
        <p className="text-[12px] font-[700] text-gray-900 mb-3">항목별 점수</p>
        <div className="space-y-2.5">
          {scores.map((s, i) => (
            <div key={i}>
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-gray-500 truncate pr-2">{s.q}</span>
                <span className="text-gray-800 font-[700] shrink-0">{s.score}/{s.max}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${s.score / s.max * 100}%`, backgroundColor: s.score >= 4 ? '#22c55e' : s.score >= 3 ? '#eab308' : '#ef4444' }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
          <span className="text-[11px] text-gray-500">총점</span>
          <span className="text-[13px] font-[800] text-gray-900">{total} / {QUESTIONS.length * 5}</span>
        </div>
      </div>

      {/* 등급 기준 */}
      <div className="mt-3 bg-white border border-gray-200 rounded-2xl p-4">
        <p className="text-[12px] font-[700] text-gray-900 mb-2">전체 등급</p>
        <div className="space-y-1.5">
          {(Object.entries(GRADES) as [Grade, typeof GRADES.S][]).map(([k, v]) => (
            <div key={k} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${k === grade ? 'bg-gray-100' : ''}`}>
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-white font-[800] text-[12px] shrink-0" style={{ backgroundColor: v.color }}>{k}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-[12px] ${k === grade ? 'font-[700] text-gray-900' : 'text-gray-600'}`}>{v.name}</p>
              </div>
              <p className="text-[18px] shrink-0">{v.emoji}</p>
              {k === grade && <span className="text-[9px] bg-gray-900 text-white px-1.5 py-0.5 rounded font-[700] shrink-0">YOU</span>}
            </div>
          ))}
        </div>
      </div>

      {/* 카페 유도 */}
      {!member && (
        <div className="mt-3 bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-[13px] font-[700] text-gray-900">{grade === 'S' || grade === 'A' ? '등급 유지 전략이 궁금하다면' : '등급을 올리고 싶다면'}</p>
          <p className="text-[11px] text-gray-500 mt-1">맞춤 노후 설계, 투자 전략, 연금 최적화</p>
          <a href="https://cafe.naver.com/eovhskfktmak" target="_blank" rel="noopener noreferrer"
            className="inline-block mt-3 px-6 py-2.5 bg-[#03C75A] text-white font-[700] rounded-xl text-[13px] active:bg-[#02b050]">
            노후연구소 카페 가입하기
          </a>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 -mx-4 px-4 py-3 flex gap-2 z-40 mt-4">
        <button onClick={restart} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-[13px] font-bold active:bg-gray-50">다시 하기</button>
        <button onClick={shareResult} className="flex-[2] py-3 bg-[#FEE500] text-[#3C1E1E] rounded-xl text-[13px] font-[800] active:bg-[#F5DC00] flex items-center justify-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#3C1E1E"><path d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.68 6.67-.15.56-.96 3.6-.99 3.82 0 0-.02.16.08.22s.22.02.22.02c.29-.04 3.37-2.2 3.9-2.57.67.1 1.37.15 2.11.15 5.52 0 10-3.58 10-7.94S17.52 3 12 3"/></svg>
          내 등급 공유하기
        </button>
      </div>
      <div className="h-16" />
    </div>
  )
}
