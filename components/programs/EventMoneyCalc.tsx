'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ── 행사 유형 ──
const EVENT_TYPES = [
  { id: 'wedding', name: '결혼식', icon: '💒', color: 'from-pink-500 to-rose-500', lightBg: 'bg-pink-50', lightText: 'text-pink-700', border: 'border-pink-200' },
  { id: 'funeral', name: '장례식', icon: '🕯️', color: 'from-gray-600 to-gray-700', lightBg: 'bg-gray-50', lightText: 'text-gray-700', border: 'border-gray-200' },
  { id: 'first-birthday', name: '돌잔치', icon: '🎂', color: 'from-yellow-400 to-orange-400', lightBg: 'bg-yellow-50', lightText: 'text-yellow-700', border: 'border-yellow-200' },
  { id: 'birthday-elder', name: '환갑·칠순', icon: '🎉', color: 'from-red-400 to-pink-500', lightBg: 'bg-red-50', lightText: 'text-red-700', border: 'border-red-200' },
  { id: 'housewarming', name: '집들이', icon: '🏠', color: 'from-emerald-400 to-teal-500', lightBg: 'bg-emerald-50', lightText: 'text-emerald-700', border: 'border-emerald-200' },
  { id: 'opening', name: '개업', icon: '🏪', color: 'from-blue-400 to-indigo-500', lightBg: 'bg-blue-50', lightText: 'text-blue-700', border: 'border-blue-200' },
  { id: 'baby', name: '출산', icon: '👶', color: 'from-purple-400 to-pink-400', lightBg: 'bg-purple-50', lightText: 'text-purple-700', border: 'border-purple-200' },
  { id: 'promotion', name: '승진·전역', icon: '🎖️', color: 'from-amber-400 to-yellow-500', lightBg: 'bg-amber-50', lightText: 'text-amber-700', border: 'border-amber-200' },
] as const

type EventId = typeof EVENT_TYPES[number]['id']

// ── 관계 유형 ──
const RELATIONS = [
  { id: 'acquaintance', name: '안면만 있는 지인', icon: '👋' },
  { id: 'colleague', name: '직장 동료', icon: '💼' },
  { id: 'boss', name: '직장 상사·선배', icon: '👔' },
  { id: 'school-friend', name: '학교·군 동기', icon: '🎓' },
  { id: 'friend', name: '친한 친구', icon: '🤝' },
  { id: 'best-friend', name: '절친한 친구', icon: '💛' },
  { id: 'cousin', name: '사촌·가까운 친척', icon: '👨‍👩‍👦' },
  { id: 'family', name: '직계가족·형제자매', icon: '🏠' },
] as const

type RelationId = typeof RELATIONS[number]['id']

type FuneralType = 'parent' | 'grandparent'
type Attendance = 'attend' | 'absent'

// ── 분석 애니메이션 스텝 ──
const ANALYZE_STEPS = [
  { t: '행사 유형 확인 중...', i: '🔍' },
  { t: '관계 친밀도 분석 중...', i: '🤝' },
  { t: '2026년 최신 기준 조회 중...', i: '📊' },
  { t: '적정 금액 산출 중...', i: '💰' },
]

// ── 금액 데이터 ──
interface AmountRange {
  min: number
  max: number
  typical: number
}

function getWeddingAmount(relation: RelationId, attendance: Attendance): AmountRange {
  const data: Record<RelationId, { attend: AmountRange; absent: AmountRange }> = {
    'acquaintance': { attend: { min: 5, max: 5, typical: 5 }, absent: { min: 3, max: 5, typical: 3 } },
    'colleague': { attend: { min: 5, max: 10, typical: 5 }, absent: { min: 5, max: 5, typical: 5 } },
    'boss': { attend: { min: 10, max: 10, typical: 10 }, absent: { min: 5, max: 7, typical: 5 } },
    'school-friend': { attend: { min: 5, max: 10, typical: 5 }, absent: { min: 5, max: 5, typical: 5 } },
    'friend': { attend: { min: 10, max: 10, typical: 10 }, absent: { min: 5, max: 7, typical: 5 } },
    'best-friend': { attend: { min: 10, max: 20, typical: 10 }, absent: { min: 10, max: 10, typical: 10 } },
    'cousin': { attend: { min: 10, max: 20, typical: 10 }, absent: { min: 10, max: 10, typical: 10 } },
    'family': { attend: { min: 20, max: 50, typical: 30 }, absent: { min: 20, max: 30, typical: 20 } },
  }
  return data[relation]?.[attendance] || { min: 5, max: 10, typical: 5 }
}

function getFuneralAmount(relation: RelationId, funeralType: FuneralType): AmountRange {
  const data: Record<RelationId, Record<FuneralType, AmountRange>> = {
    'acquaintance': { parent: { min: 3, max: 5, typical: 3 }, grandparent: { min: 3, max: 3, typical: 3 } },
    'colleague': { parent: { min: 5, max: 5, typical: 5 }, grandparent: { min: 3, max: 5, typical: 3 } },
    'boss': { parent: { min: 5, max: 10, typical: 5 }, grandparent: { min: 5, max: 5, typical: 5 } },
    'school-friend': { parent: { min: 5, max: 10, typical: 5 }, grandparent: { min: 3, max: 5, typical: 5 } },
    'friend': { parent: { min: 10, max: 10, typical: 10 }, grandparent: { min: 5, max: 7, typical: 5 } },
    'best-friend': { parent: { min: 10, max: 20, typical: 10 }, grandparent: { min: 5, max: 10, typical: 7 } },
    'cousin': { parent: { min: 20, max: 30, typical: 20 }, grandparent: { min: 10, max: 20, typical: 10 } },
    'family': { parent: { min: 30, max: 50, typical: 30 }, grandparent: { min: 20, max: 30, typical: 20 } },
  }
  return data[relation]?.[funeralType] || { min: 5, max: 10, typical: 5 }
}

function getOtherAmount(event: EventId, relation: RelationId): AmountRange {
  const isClose = ['friend', 'best-friend', 'cousin', 'family'].includes(relation)
  const data: Record<string, { normal: AmountRange; close: AmountRange }> = {
    'first-birthday': { normal: { min: 3, max: 5, typical: 3 }, close: { min: 5, max: 10, typical: 5 } },
    'birthday-elder': { normal: { min: 5, max: 10, typical: 5 }, close: { min: 10, max: 20, typical: 10 } },
    'housewarming': { normal: { min: 3, max: 5, typical: 3 }, close: { min: 5, max: 10, typical: 5 } },
    'opening': { normal: { min: 3, max: 5, typical: 3 }, close: { min: 5, max: 10, typical: 5 } },
    'baby': { normal: { min: 3, max: 5, typical: 3 }, close: { min: 5, max: 10, typical: 5 } },
    'promotion': { normal: { min: 3, max: 5, typical: 3 }, close: { min: 5, max: 10, typical: 5 } },
  }
  const d = data[event]
  if (!d) return { min: 3, max: 5, typical: 3 }
  return isClose ? d.close : d.normal
}

// ── 팁 생성 ──
function getTips(event: EventId, relation: RelationId): string[] {
  const tips: string[] = []
  tips.push('경조사비는 홀수 단위(3, 5, 7, 10만원)가 관례입니다.')

  if (event === 'wedding') {
    tips.push('상대방이 내 결혼식에 낸 금액과 동일하거나 약간 올려서 내는 것이 기본입니다.')
    tips.push('직장 동료끼리는 공동으로 모아서 내는 경우도 많습니다.')
    if (relation === 'family' || relation === 'cousin') {
      tips.push('가족·친척은 지역이나 집안 문화에 따라 차이가 크므로 부모님과 상의하세요.')
    }
  }
  if (event === 'funeral') {
    tips.push('조의금은 반드시 흰 봉투에 넣으며, "부의(賻儀)" 또는 "근조(謹弔)"라고 씁니다.')
    tips.push('장례식은 가능하면 직접 방문하는 것이 예의입니다.')
  }
  if (event === 'housewarming') {
    tips.push('집들이는 현금보다 실용적인 선물(세제, 화장지, 식물 등)을 가져가는 경우가 많습니다.')
    tips.push('음식(케이크, 과일)을 가져가면 빈손으로 가지 않아도 됩니다.')
  }
  if (event === 'opening') tips.push('개업 축하는 현금 외에 화환이나 난을 보내는 것도 좋습니다.')
  if (event === 'baby') {
    tips.push('출산 축하는 현금보다 기저귀, 물티슈 등 실용적인 선물도 환영받습니다.')
    tips.push('출산 직후보다는 산모가 안정된 후 방문하는 것이 좋습니다.')
  }
  if (event === 'first-birthday') tips.push('돌잔치 금액은 식사비 수준(보통 3~5만원)을 기준으로 생각하면 됩니다.')
  if (event === 'birthday-elder') tips.push('환갑·칠순은 자녀가 주관하므로, 자녀와의 관계도 고려하세요.')
  if (['boss', 'colleague'].includes(relation)) tips.push('직무 관련자에게는 김영란법 기준 경조사비 5만원 한도가 적용됩니다.')

  return tips.slice(0, 4)
}

// ── 메인 컴포넌트 ──
export default function EventMoneyCalc() {
  // URL 파라미터로 공유된 결과 감지
  const sharedData = useMemo(() => {
    if (typeof window === 'undefined') return null
    const p = new URLSearchParams(window.location.search)
    const e = p.get('e'), r = p.get('r'), a = p.get('a'), f = p.get('f')
    if (e && r) {
      const validEvent = EVENT_TYPES.find(ev => ev.id === e)
      const validRelation = RELATIONS.find(rel => rel.id === r)
      if (validEvent && validRelation) {
        return {
          event: e as EventId,
          relation: r as RelationId,
          attendance: (a === 'absent' ? 'absent' : 'attend') as Attendance,
          funeralType: (f === 'grandparent' ? 'grandparent' : 'parent') as FuneralType,
        }
      }
    }
    return null
  }, [])

  const [step, setStep] = useState(sharedData ? 5 : 1)
  const [event, setEvent] = useState<EventId | null>(sharedData?.event ?? null)
  const [relation, setRelation] = useState<RelationId | null>(sharedData?.relation ?? null)
  const [attendance, setAttendance] = useState<Attendance>(sharedData?.attendance ?? 'attend')
  const [funeralType, setFuneralType] = useState<FuneralType>(sharedData?.funeralType ?? 'parent')
  // 분석 애니메이션
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeStep, setAnalyzeStep] = useState(0)
  // 카카오 공유
  const [kakaoMsg, setKakaoMsg] = useState('')

  const selectedEvent = EVENT_TYPES.find(e => e.id === event)

  // 금액 계산
  const getAmount = useCallback((): AmountRange | null => {
    if (!event || !relation) return null
    if (event === 'wedding') return getWeddingAmount(relation, attendance)
    if (event === 'funeral') return getFuneralAmount(relation, funeralType)
    return getOtherAmount(event, relation)
  }, [event, relation, attendance, funeralType])

  const amount = getAmount()
  const tips = event && relation ? getTips(event, relation) : []

  // ── 분석 애니메이션 시작 ──
  function startAnalyzing() {
    setAnalyzing(true)
    setAnalyzeStep(0)
  }

  useEffect(() => {
    if (!analyzing) return
    if (analyzeStep >= ANALYZE_STEPS.length) {
      const t = setTimeout(() => {
        setAnalyzing(false)
        setStep(5) // 결과
      }, 400)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setAnalyzeStep(s => s + 1), 700)
    return () => clearTimeout(t)
  }, [analyzing, analyzeStep])

  function handleEventSelect(id: EventId) {
    setEvent(id)
    setRelation(null)
    setStep(2)
  }

  function handleRelationSelect(id: RelationId) {
    setRelation(id)
    if (event === 'wedding' || event === 'funeral') {
      setStep(3)
    } else {
      startAnalyzing()
    }
  }

  function handleDetailDone() {
    startAnalyzing()
  }

  function handleReset() {
    setStep(1)
    setEvent(null)
    setRelation(null)
    setAttendance('attend')
    setFuneralType('parent')
    setAnalyzing(false)
    setAnalyzeStep(0)
  }

  // ── 카카오톡 공유 ──
  const handleKakao = useCallback(() => {
    if (!selectedEvent || !relation || !amount) return
    const relName = RELATIONS.find(r => r.id === relation)?.name || ''
    const shareUrl = `${window.location.origin}/programs/event-money?e=${event}&r=${relation}&a=${attendance}${event === 'funeral' ? '&f=' + funeralType : ''}`
    const w = window as typeof window & { Kakao?: { isInitialized: () => boolean; init: (key: string) => void; Share: { sendDefault: (opts: Record<string, unknown>) => void } } }

    if (w.Kakao) {
      try {
        if (!w.Kakao.isInitialized()) {
          w.Kakao.init('3913fde247b12ce25084eb42a9b17ed9')
        }
        w.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: `${selectedEvent.icon} ${selectedEvent.name} 경조사비: ${amount.typical}만원`,
            description: `${relName} 기준 적정 금액 ${amount.min}~${amount.max}만원`,
            imageUrl: `https://retireplan.kr/api/og`,
            link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
          },
          buttons: [
            { title: '나도 계산하기', link: { mobileWebUrl: shareUrl, webUrl: shareUrl } },
          ],
        })
        return
      } catch {
        // fallback
      }
    }

    // SDK 실패 시 복사
    const text = `${selectedEvent.icon} ${selectedEvent.name} 경조사비: ${amount.typical}만원 (${relName} 기준)\n\n나도 계산해보기: ${shareUrl}`
    try { navigator.clipboard.writeText(text) } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setKakaoMsg('링크가 복사되었습니다!\n카카오톡에서 붙여넣기 하세요')
    setTimeout(() => setKakaoMsg(''), 4000)
  }, [selectedEvent, relation, amount])

  // ── 링크 복사 ──
  const [copyDone, setCopyDone] = useState(false)
  const handleCopyLink = useCallback(() => {
    if (!selectedEvent || !amount) return
    const relName = RELATIONS.find(r => r.id === relation)?.name || ''
    const shareUrl = `${window.location.origin}/programs/event-money?e=${event}&r=${relation}&a=${attendance}${event === 'funeral' ? '&f=' + funeralType : ''}`
    const text = `${selectedEvent.icon} ${selectedEvent.name} 경조사비: ${amount.typical}만원 (${relName} 기준)\n\n나도 계산해보기: ${shareUrl}`
    try { navigator.clipboard.writeText(text) } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopyDone(true)
    setTimeout(() => setCopyDone(false), 2000)
  }, [selectedEvent, relation, amount])

  // ── 분석 중 화면 ──
  if (analyzing) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-indigo-100 p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/20">
              <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">적정 금액 분석 중</h3>
            <p className="text-sm text-gray-400 mt-1">{selectedEvent?.icon} {selectedEvent?.name} · {RELATIONS.find(r => r.id === relation)?.name}</p>
          </div>
          <div className="space-y-2.5">
            {ANALYZE_STEPS.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-500 ${
                i < analyzeStep ? 'bg-green-50 border border-green-200' :
                i === analyzeStep ? 'bg-indigo-50 border border-indigo-200' :
                'bg-gray-50 border border-gray-100 opacity-40'
              }`}>
                <span className="text-lg w-6 text-center shrink-0">{i < analyzeStep ? '✅' : i === analyzeStep ? s.i : '⏳'}</span>
                <span className={`text-[14px] font-medium ${
                  i < analyzeStep ? 'text-green-700' : i === analyzeStep ? 'text-indigo-700' : 'text-gray-400'
                }`}>{s.t}</span>
                {i === analyzeStep && <div className="ml-auto w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />}
              </div>
            ))}
          </div>
          <div className="mt-5 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${(analyzeStep / ANALYZE_STEPS.length) * 100}%` }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* 카페 가입 유도 (상단) */}
      {step < 5 && (
        <div className="text-center">
          <a href="https://cafe.naver.com/eovhskfktmak" target="_blank" rel="noopener noreferrer"
            className="text-[13px] text-orange-600 font-medium hover:text-orange-700 transition">
            노후연구소 회원 가입 →
          </a>
        </div>
      )}

      {/* 프로그레스 */}
      {step < 5 && (
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(s => {
            const isSkipped = s === 3 && event !== 'wedding' && event !== 'funeral'
            if (isSkipped) return null
            const isActive = s === step
            const isDone = s < step
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isActive ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-200' :
                  isDone ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {isDone ? '✓' : s}
                </div>
                {s < 3 && <div className={`flex-1 h-0.5 rounded ${isDone ? 'bg-indigo-200' : 'bg-gray-100'}`} />}
              </div>
            )
          })}
        </div>
      )}

      {/* Step 1: 행사 선택 */}
      {step >= 1 && step < 5 && (
        <section className={step === 1 ? '' : 'opacity-60'}>
          <h3 className="text-sm font-bold text-gray-500 mb-3">어떤 행사인가요?</h3>
          <div className="grid grid-cols-4 gap-2">
            {EVENT_TYPES.map(ev => (
              <button
                key={ev.id}
                onClick={() => handleEventSelect(ev.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                  event === ev.id
                    ? `${ev.lightBg} ${ev.border} ${ev.lightText} scale-[1.02] shadow-sm`
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <span className="text-2xl">{ev.icon}</span>
                <span className="text-[11px] sm:text-xs font-semibold leading-tight">{ev.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Step 2: 관계 선택 */}
      {step >= 2 && step < 5 && event && (
        <section className={step === 2 ? '' : 'opacity-60'}>
          <h3 className="text-sm font-bold text-gray-500 mb-3">상대방과의 관계는?</h3>
          <div className="grid grid-cols-2 gap-2">
            {RELATIONS.map(rel => (
              <button
                key={rel.id}
                onClick={() => handleRelationSelect(rel.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                  relation === rel.id
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-lg">{rel.icon}</span>
                <span className="text-xs sm:text-sm font-medium">{rel.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Step 3: 세부 선택 (결혼/장례만) */}
      {step === 3 && event === 'wedding' && relation && (
        <section>
          <h3 className="text-sm font-bold text-gray-500 mb-3">참석하시나요?</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setAttendance('attend'); handleDetailDone() }}
              className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-gray-100 hover:border-pink-300 hover:bg-pink-50 transition-all">
              <span className="text-3xl">🙋</span>
              <span className="text-sm font-bold">직접 참석</span>
              <span className="text-[11px] text-gray-400">식장에 갑니다</span>
            </button>
            <button onClick={() => { setAttendance('absent'); handleDetailDone() }}
              className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all">
              <span className="text-3xl">✉️</span>
              <span className="text-sm font-bold">봉투만 전달</span>
              <span className="text-[11px] text-gray-400">못 가지만 마음은</span>
            </button>
          </div>
        </section>
      )}

      {step === 3 && event === 'funeral' && relation && (
        <section>
          <h3 className="text-sm font-bold text-gray-500 mb-3">어떤 상(喪)인가요?</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setFuneralType('parent'); handleDetailDone() }}
              className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-gray-100 hover:border-gray-400 hover:bg-gray-50 transition-all">
              <span className="text-3xl">🕯️</span>
              <span className="text-sm font-bold">부모상</span>
            </button>
            <button onClick={() => { setFuneralType('grandparent'); handleDetailDone() }}
              className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-gray-100 hover:border-gray-400 hover:bg-gray-50 transition-all">
              <span className="text-3xl">🕯️</span>
              <span className="text-sm font-bold">조부모상</span>
            </button>
          </div>
        </section>
      )}

      {/* Step 5: 결과 */}
      {step === 5 && amount && selectedEvent && relation && (
        <section className="space-y-4 animate-fadeIn">
          {/* 결과 카드 */}
          <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${selectedEvent.color} p-6 text-white shadow-xl`}>
            <div className="absolute top-0 right-0 text-[80px] opacity-10 -mt-2 -mr-2 leading-none">{selectedEvent.icon}</div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{selectedEvent.icon}</span>
                <span className="text-base font-bold">{selectedEvent.name}</span>
                <span className="text-white/60 text-sm">·</span>
                <span className="text-sm text-white/80">{RELATIONS.find(r => r.id === relation)?.name}</span>
              </div>
              {event === 'wedding' && (
                <p className="text-sm text-white/70 mb-3">{attendance === 'attend' ? '직접 참석' : '봉투만 전달'}</p>
              )}
              {event === 'funeral' && (
                <p className="text-sm text-white/70 mb-3">{funeralType === 'parent' ? '부모상' : '조부모상'}</p>
              )}

              <div className="mt-4 mb-2">
                <p className="text-sm text-white/70 mb-1">추천 금액</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tight">{amount.typical}</span>
                  <span className="text-xl font-bold">만원</span>
                </div>
              </div>

              {amount.min !== amount.max && (
                <div className="mt-3 bg-white/15 rounded-xl p-3">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white/70">적정 범위</span>
                    <span className="font-bold">{amount.min}만원 ~ {amount.max}만원</span>
                  </div>
                  <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="absolute h-full bg-white/60 rounded-full" style={{ left: '0%', right: '0%' }} />
                    <div className="absolute h-full w-3 bg-white rounded-full shadow-sm top-0 -translate-x-1/2"
                      style={{ left: `${((amount.typical - amount.min) / (amount.max - amount.min || 1)) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 팁 */}
          <div className="bg-amber-50/80 rounded-2xl p-5 border border-amber-100">
            <h4 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-1.5">
              <span>💡</span> 알아두면 좋은 팁
            </h4>
            <ul className="space-y-2">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                  <span className="text-amber-400 mt-1 shrink-0">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* 공유 */}
          <div className="space-y-2.5">
            <p className="text-center text-[13px] text-gray-500 font-medium">친구에게도 알려주세요!</p>
            <button onClick={handleKakao}
              className="w-full min-h-[52px] py-3.5 bg-[#FEE500] active:bg-[#F5DC00] text-[#3C1E1E] rounded-xl text-[14px] font-bold flex items-center justify-center gap-2.5 transition-all duration-150 active:scale-[0.97]">
              <svg width="20" height="20" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path fill="#3C1E1E" d="M128 36C70.6 36 24 72.8 24 118c0 29.2 19.4 54.8 48.6 69.2l-10 36.8c-.8 3 2.6 5.4 5.2 3.6l42.8-28.4c5.6.8 11.4 1.2 17.4 1.2c57.4 0 104-36.8 104-82.4S185.4 36 128 36"/></svg>
              카카오톡으로 공유하기
            </button>
            {kakaoMsg && (
              <p className="text-center text-sm text-green-600 font-medium whitespace-pre-line">{kakaoMsg}</p>
            )}
            <button onClick={handleCopyLink}
              className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.97]">
              {copyDone ? '✅ 복사됨!' : '🔗 링크 복사'}
            </button>
          </div>

          {/* 카페 가입 유도 */}
          <a href="https://cafe.naver.com/eovhskfktmak" target="_blank" rel="noopener noreferrer"
            className="block w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-center transition-all active:scale-[0.97] shadow-lg shadow-green-500/20">
            <p className="text-[15px] font-bold">노후연구소 카페 가입하기</p>
            <p className="text-[12px] text-white/80 mt-0.5">더 많은 무료 프로그램을 이용해보세요</p>
          </a>

          {/* 다시 계산 */}
          <button onClick={handleReset}
            className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all text-sm active:scale-[0.98]">
            🔄 다시 계산하기
          </button>

          <p className="text-[11px] text-gray-300 text-center leading-relaxed">
            2026년 기준 일반적인 경조사비 범위이며, 지역·문화·개인 상황에 따라 달라질 수 있습니다.
          </p>
        </section>
      )}
    </div>
  )
}
