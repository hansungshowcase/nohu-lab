'use client'

import { useState, useMemo, useEffect, useRef } from 'react'

// ── 2026년 최신 국민연금 데이터 (NPS 공식 기반) ──
const A_VAL = 3_193_511 // 2026년 A값
const MIN_SI = 400_000, MAX_SI = 6_370_000, NOW = 2026

// NPS 공식: 기본연금액 = 계수 × (A + B) × (1 + 0.05n/12)
// 계수: 2026년~ 1.29 (소득대체율 43%), 이전 연도는 다른 계수 적용
// n: 20년(240개월) 초과 가입월수
function getCoeff(sy: number): number {
  // 수급 시작 연도별 계수 (소득대체율/30 × 연도별 보정)
  if (sy <= 1998) return 2.1   // 70% 시절
  if (sy <= 2007) return 1.8   // 60% 시절
  if (sy >= 2028) return 1.29  // 개혁 후 43%
  // 2008~2027: 단계적 감소
  const rates: Record<number, number> = {
    2008: 1.5, 2009: 1.485, 2010: 1.47, 2011: 1.455, 2012: 1.44,
    2013: 1.425, 2014: 1.41, 2015: 1.395, 2016: 1.38, 2017: 1.365,
    2018: 1.35, 2019: 1.335, 2020: 1.32, 2021: 1.305, 2022: 1.29,
    2023: 1.275, 2024: 1.26, 2025: 1.245, 2026: 1.29, 2027: 1.29,
  }
  return rates[sy] || 1.29
}
function normalAge(by: number) { return by <= 1952 ? 60 : by <= 1956 ? 61 : by <= 1960 ? 62 : by <= 1964 ? 63 : by <= 1968 ? 64 : 65 }

// NPS 실제 공식: 가입 연도별 다른 계수 적용 후 가중평균
// [2.4(A+0.75B)×P1/P + 1.8(A+B)×P2/P + ... + 1.29(A+B)×P21/P] × (1+0.05n/12)
function estPension(by: number, inc: number, yr: number) {
  const B = Math.max(MIN_SI, Math.min(MAX_SI, inc))
  const totalMonths = Math.min(yr * 12, 480)
  if (totalMonths <= 0) return 0
  const startAge = Math.max(18, Math.min(27, normalAge(by) - yr))
  const startYear = by + startAge

  // 각 가입 연도별 계수 × 해당 연도 가입월수 합산
  let weightedSum = 0, mc = 0
  for (let y = startYear; mc < totalMonths; y++) {
    const mInYear = Math.min(12, totalMonths - mc)
    weightedSum += getCoeff(y) * mInYear
    mc += mInYear
  }
  const avgCoeff = weightedSum / mc

  const n = Math.max(0, totalMonths - 240)
  const basePension = avgCoeff * (A_VAL + B) * (1 + 0.05 * n / 12)
  const proportional = totalMonths >= 240 ? 1 : totalMonths / 240
  return Math.round(basePension * proportional / 12)
}
// 실제 납부 기간 추정: 현재나이 - 취업추정나이(27세), 최대 40년
function estContrib(age: number) {
  const worked = Math.max(0, age - 27) // 27세부터 현재까지 일한 기간
  const remaining = Math.max(0, normalAge(NOW - age) - age) // 은퇴까지 남은 기간
  return Math.max(0, Math.min(40, worked + remaining))
}

// 반환일시금: 전체 납부액(본인+사용자 9%) + 복리이자(연 2.6%)
function estLumpSum(inc: number, yr: number) {
  const mp = Math.max(MIN_SI, Math.min(MAX_SI, inc)) * 0.09
  let t = 0; for (let i = 0; i < yr * 12; i++) t = (t + mp) * (1 + 0.026 / 12)
  return Math.round(t)
}

// 연금소득세 추정 (연간)
function estTax(monthlyPension: number): number {
  const annual = monthlyPension * 12
  // 연금소득공제
  let deduction = 0
  if (annual <= 3_500_000) deduction = annual
  else if (annual <= 7_000_000) deduction = 3_500_000 + (annual - 3_500_000) * 0.4
  else if (annual <= 14_000_000) deduction = 4_900_000 + (annual - 7_000_000) * 0.2
  else deduction = 6_300_000 + (annual - 14_000_000) * 0.1
  const taxable = Math.max(0, annual - deduction - 1_500_000) // 기본공제 150만
  // 간이세율 적용
  if (taxable <= 14_000_000) return Math.round(taxable * 0.06)
  if (taxable <= 50_000_000) return Math.round(840_000 + (taxable - 14_000_000) * 0.15)
  return Math.round(6_240_000 + (taxable - 50_000_000) * 0.24)
}

// 건보료 추정 (월)
function estHealthIns(monthlyPension: number): number {
  const annual = monthlyPension * 12
  if (annual <= 20_000_000) return 0 // 연 2000만 이하 피부양자 유지 가능
  const taxableIncome = annual * 0.5 // 연금소득 50%만 인정
  return Math.round((taxableIncome / 12) * 0.0709) // 2025 건보료율 7.09%
}

interface S { label: string; age: number; monthly: number; pct: string; cumul: number; type: 'early' | 'normal' | 'deferred'; diff: number; yearsDiff: number }
function cum(m: number, sa: number, ea: number) { return ea <= sa ? 0 : Math.floor((ea - sa) * 12) * m }

// 11가지 전체 시나리오 (1년 단위)
function allScenarios(na: number, base: number, le: number): S[] {
  const all: S[] = []
  for (let y = 5; y >= 1; y--) {
    const r = 1 - y * 0.06, m = Math.round(base * r)
    all.push({ label: `${y}년 조기 (${na-y}세)`, age: na-y, monthly: m, pct: `-${y*6}%`, cumul: cum(m, na-y, le), type: 'early', diff: m - base, yearsDiff: -y })
  }
  all.push({ label: `정상 (${na}세)`, age: na, monthly: base, pct: '기준', cumul: cum(base, na, le), type: 'normal', diff: 0, yearsDiff: 0 })
  for (let y = 1; y <= 5; y++) {
    const r = 1 + y * 0.072, m = Math.round(base * r)
    all.push({ label: `${y}년 연기 (${na+y}세)`, age: na+y, monthly: m, pct: `+${(y*7.2).toFixed(1)}%`, cumul: cum(m, na+y, le), type: 'deferred', diff: m - base, yearsDiff: y })
  }
  return all
}

// 결과 표시용 핵심 3가지: 5년 조기 / 정상 / 5년 연기
function beAge(a: S, b: S): number | null {
  const e = a.age < b.age ? a : b, l = a.age < b.age ? b : a
  if (l.monthly <= e.monthly) return null
  const d = l.monthly - e.monthly
  return d <= 0 ? null : Math.round((l.age + Math.ceil((l.age - e.age) * 12 * e.monthly / d) / 12) * 10) / 10
}
const fm = (n: number) => n.toLocaleString() + '원'
const fM = (n: number) => { const v = n / 10000; return v >= 10000 ? (v / 10000).toFixed(1) + '억원' : v.toLocaleString(undefined, { maximumFractionDigits: 0 }) + '만원' }

const UK = 'pension-timing-usage', CK = 'pt_u', MF = 2
function getCookie(name: string): string { try { const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)')); return m ? m[1] : '' } catch { return '' } }
function setCookie(name: string, val: string) { try { document.cookie = `${name}=${val};path=/;max-age=${365*24*3600};SameSite=Lax` } catch {} }
function getU() {
  const ls = (() => { try { return parseInt(localStorage.getItem(UK) || '0', 10) || 0 } catch { return 0 } })()
  const ck = parseInt(getCookie(CK) || '0', 10) || 0
  return Math.max(ls, ck) // 둘 중 큰 값 (하나만 삭제해도 차단)
}
function addU() {
  const c = getU() + 1
  try { localStorage.setItem(UK, String(c)) } catch {}
  setCookie(CK, String(c))
  return c
}

const STEPS = [
  { t: '입력 정보 검증 중...', i: '🔍', ms: 800 },
  { t: 'NPS 공식 기반 연금액 심층 산출 중...', i: '💰', ms: 1500 },
  { t: '조기·정상·연기 3가지 시나리오 심층 비교 중...', i: '📊', ms: 1800 },
  { t: '해지(반환일시금) 손익 정밀 분석 중...', i: '🔥', ms: 1200 },
  { t: '세금·건보료 실수령액 시뮬레이션 중...', i: '💳', ms: 1500 },
  { t: '최적 수령 타이밍 도출 중...', i: '🎯', ms: 1000 },
]

// ══ 컴포넌트 ══
export default function PensionTiming({ userTier = 0 }: { userTier?: number }) {
  const resultRef = useRef<HTMLDivElement>(null)
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [myAge, setAge] = useState('')
  const [myIncome, setMyIncome] = useState('')
  const [le, setLE] = useState('85')
  const [done, setDone] = useState(false)
  const [anim, setAnim] = useState(false)
  const [step, setStep] = useState(0)
  const [usage, setUsage] = useState(0)
  const [blocked, setBlocked] = useState(false)
  const [copyOk, setCopy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveOk, setSaveOk] = useState(false)
  const [started, setStarted] = useState(false)
  const [kakaoMsg, setKakaoMsg] = useState('')

  const [urlLoaded, setUrlLoaded] = useState(false)

  // 계산 로직 (useEffect보다 먼저 선언해야 TDZ 방지)
  const isGuest = userTier === 0
  const age = parseInt(myAge) || 0
  const inc = (parseInt(myIncome.replace(/,/g, '')) || 0) * 10000 // 만원 단위 입력 → 원 변환
  const lifeExp = parseInt(le) || 85
  const by = age > 0 ? NOW - age : 0
  const na = by >= 1930 && by <= 2001 ? normalAge(by) : 0
  const cy = age > 0 ? estContrib(age) : 0
  const validIncome = inc >= 500_000 // 최소 50만원 이상 (만원 입력 기준 50 이상)
  const base = na && validIncome && cy ? estPension(by, inc, cy) : 0
  const lump = validIncome && cy ? estLumpSum(inc, cy) : 0
  const tax = base > 0 ? estTax(base) : 0
  const healthIns = base > 0 ? estHealthIns(base) : 0

  useEffect(() => {
    const u = getU()
    setUsage(u)
    if (userTier === 0 && u >= MF) setBlocked(true)

    // URL 파라미터 읽기 (결과 공유용)
    const p = new URLSearchParams(window.location.search)
    const pAge = p.get('age'), pIncome = p.get('income'), pLe = p.get('le')
    if (pAge && pIncome) {
      setAge(pAge)
      setMyIncome(pIncome)
      if (pLe) setLE(pLe)
      setStarted(true)
      setUrlLoaded(true)
    }
  }, [userTier])

  // URL 파라미터: base 계산 후 결과 표시
  useEffect(() => {
    if (urlLoaded && base > 0 && !done && started) { setDone(true); setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100) }
  }, [urlLoaded, base, done, started])

  useEffect(() => () => { if (ivRef.current) clearTimeout(ivRef.current as unknown as ReturnType<typeof setTimeout>) }, [])

  // 11가지 전체에서 진짜 최적 찾기
  const allSc = useMemo(() => (!na || base <= 0) ? [] : allScenarios(na, base, lifeExp), [na, base, lifeExp])
  const best = useMemo(() => allSc.length ? allSc.reduce((a, b) => b.cumul > a.cumul ? b : a, allSc[0]) : null, [allSc])
  // 표시용: best + 정상 + 5년 조기 (best가 정상이면 5년 조기 + 정상 + 5년 연기)
  const sc = useMemo(() => {
    if (!allSc.length || !best) return []
    const normal = allSc.find(s => s.yearsDiff === 0)!
    const early5 = allSc.find(s => s.yearsDiff === -5)!
    const defer5 = allSc.find(s => s.yearsDiff === 5)!
    if (best.yearsDiff === 0) return [early5, normal, defer5]
    if (best.yearsDiff === -5) return [best, normal, defer5]
    if (best.yearsDiff === 5) return [early5, normal, best]
    // best가 1~4년 조기/연기인 경우: best + 정상 + 반대편 5년
    if (best.yearsDiff < 0) return [best, normal, defer5]
    return [early5, normal, best]
  }, [allSc, best])
  const brk = useMemo(() => {
    if (!allSc.length) return null
    const e5 = allSc.find(s => s.yearsDiff === -5)
    const d5 = allSc.find(s => s.yearsDiff === 5)
    return e5 && d5 ? beAge(e5, d5) : null
  }, [allSc])

  // 소득 대비 % (안전 계산)
  const incomeRatio = useMemo(() => {
    if (!inc || inc < 10000 || !base) return 0
    return Math.round(base / inc * 100)
  }, [inc, base])

  function handleIncomeChange(v: string) {
    const n = v.replace(/[^0-9]/g, '')
    setMyIncome(n ? parseInt(n).toLocaleString() : '')
    setDone(false)
  }

  function getShareUrl() {
    const base_url = 'https://retireplan.kr/programs/pension-timing'
    if (!myAge || !myIncome) return base_url
    return `${base_url}?age=${myAge}&income=${myIncome.replace(/,/g, '')}&le=${le}`
  }

  function handleCalc() {
    if (age < 25 || age > 75 || !validIncome || !base) return
    if (isGuest && usage >= MF) { setBlocked(true); return }
    if (isGuest) setUsage(addU())
    setAnim(true); setStep(0)
    if (ivRef.current) clearInterval(ivRef.current)
    let s = 0
    const advance = () => {
      s++
      if (s >= STEPS.length) {
        ivRef.current = null; setAnim(false); setDone(true)
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
      } else {
        setStep(s)
        ivRef.current = setTimeout(advance, STEPS[s].ms) as unknown as ReturnType<typeof setInterval>
      }
    }
    ivRef.current = setTimeout(advance, STEPS[0].ms) as unknown as ReturnType<typeof setInterval>
  }

  // 이미지 저장 — 전체 결과 캡처용 숨김 div
  const handleImg = async () => {
    if (!best || !sc[1] || saving) return
    setSaving(true)
    try {
      const lumpRatio = lump > 0 ? (sc[1].cumul / lump).toFixed(1) : '0'
      const recAge = lump > 0 && base > 0 ? Math.round((na + Math.ceil(lump / base) / 12) * 10) / 10 : 0
      const realMonthly = Math.round(base - tax / 12 - healthIns)

      const isMob = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
      const wrap = document.createElement('div')
      const capW = isMob ? Math.min(360, window.innerWidth - 32) : 420
      wrap.style.cssText = `position:absolute;left:-9999px;top:0;width:${capW}px;padding:24px;background:#fff;font-family:-apple-system,BlinkMacSystemFont,sans-serif;`
      wrap.innerHTML = `
        <div style="padding:4px;">
          <!-- 헤더 -->
          <div style="background:#FFF7ED;border:2px solid #FED7AA;border-radius:16px;padding:24px;text-align:center;margin-bottom:16px;">
            <div style="font-size:12px;font-weight:700;color:#92400E;margin-bottom:8px;">분석 결과 | 연금 수령 황금 타이밍</div>
            <div style="font-size:26px;font-weight:800;color:#EA580C;margin-bottom:4px;">${best.age}세에 시작하면 가장 이득</div>
            <div style="font-size:12px;color:#6B7280;margin-bottom:16px;">${by}년생 (${age}세) / 기대수명 ${lifeExp}세 기준</div>
            ${sc.map(s => {
              const ib = s === best
              return `<div style="background:${ib ? '#FFF7ED' : '#F9FAFB'};border:${ib ? '2px solid #FB923C' : '1px solid #E5E7EB'};border-radius:12px;padding:12px 14px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
                <div><span style="font-size:13px;font-weight:700;color:${ib ? '#EA580C' : '#374151'};">${ib ? '[BEST] ' : ''}${s.label}</span><span style="font-size:10px;color:#9CA3AF;margin-left:4px;">${s.pct}</span><div style="font-size:11px;color:#6B7280;margin-top:2px;">월 ${fm(s.monthly)}</div></div>
                <div style="font-size:15px;font-weight:800;color:${ib ? '#EA580C' : '#374151'};">${fM(s.cumul)}</div>
              </div>`
            }).join('')}
            ${brk ? `<div style="font-size:12px;color:#374151;margin-top:10px;padding:10px;background:#FEF3C7;border-radius:10px;">손익분기: ${brk}세</div>` : ''}
          </div>

          <!-- 해지 vs 연금 -->
          ${lump > 0 ? `<div style="background:#fff;border:1px solid #FED7AA;border-radius:16px;padding:20px;margin-bottom:16px;">
            <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:12px;">해지 vs 연금수령</div>
            <div style="display:flex;gap:8px;margin-bottom:10px;">
              <div style="flex:1;background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:12px;text-align:center;">
                <div style="font-size:11px;color:#DC2626;">해지 시</div>
                <div style="font-size:18px;font-weight:800;color:#DC2626;margin:4px 0;">${fM(lump)}</div>
              </div>
              <div style="flex:1;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:12px;text-align:center;">
                <div style="font-size:11px;color:#16A34A;">연금 총액</div>
                <div style="font-size:18px;font-weight:800;color:#16A34A;margin:4px 0;">${fM(sc[1].cumul)}</div>
              </div>
            </div>
            <div style="background:#16A34A;border-radius:12px;padding:12px;text-align:center;color:#fff;">
              <div style="font-size:18px;font-weight:800;">연금이 ${lumpRatio}배 유리</div>
              <div style="font-size:11px;margin-top:2px;">${recAge}세에 해지금 회수</div>
            </div>
          </div>` : ''}

          <!-- 소득대비 -->
          <div style="background:#fff;border:1px solid #FED7AA;border-radius:16px;padding:20px;margin-bottom:16px;">
            <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:8px;">현재 소득 대비 연금</div>
            <div style="font-size:24px;font-weight:800;color:#EA580C;text-align:center;padding:8px 0;">${incomeRatio}%</div>
            <div style="height:8px;background:#FFF7ED;border-radius:99px;overflow:hidden;"><div style="height:100%;background:#EA580C;border-radius:99px;width:${Math.min(100, incomeRatio)}%;"></div></div>
          </div>

          <!-- 세금/실수령 -->
          <div style="background:#fff;border:1px solid #FED7AA;border-radius:16px;padding:20px;margin-bottom:16px;">
            <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:12px;">세금/건보료 시뮬레이션</div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:12px;"><span style="color:#6B7280;">월 연금 (세전)</span><span style="font-weight:700;">${fm(base)}</span></div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:12px;"><span style="color:#6B7280;">연금소득세 (연)</span><span style="color:#DC2626;">${tax > 0 ? '-' + fm(tax) : '비과세'}</span></div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:12px;"><span style="color:#6B7280;">건보료 (월)</span><span style="color:#DC2626;">${healthIns > 0 ? '-' + fm(healthIns) : '0원'}</span></div>
            <div style="display:flex;justify-content:space-between;padding:10px;margin-top:8px;background:#FFF7ED;border-radius:8px;font-size:13px;"><span style="font-weight:700;">월 실수령액</span><span style="font-weight:800;color:#EA580C;">${fm(realMonthly)}</span></div>
          </div>

          <!-- 내 연금 요약 -->
          <div style="background:#fff;border:1px solid #FED7AA;border-radius:16px;padding:20px;">
            <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:12px;">내 연금 요약</div>
            ${[
              ['출생연도', `${by}년 (${age}세)`],
              ['정상 수령', `${na}세 (${by + na}년)`],
              ['월소득(세전)', fM(inc)],
              ['납부기간', `약 ${cy}년`],
              ['예상 월연금', fm(base)],
            ].map(([l, v]) => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #F3F4F6;font-size:12px;"><span style="color:#6B7280;">${l}</span><span style="font-weight:600;">${v}</span></div>`).join('')}
          </div>

          <div style="text-align:center;margin-top:20px;padding-top:16px;border-top:1px solid #E5E7EB;">
            <div style="font-size:16px;font-weight:800;color:#EA580C;letter-spacing:-0.5px;">노후연구소</div>
            <div style="font-size:10px;color:#9CA3AF;margin-top:4px;">retireplan.kr | 2026 연금개혁 반영 | NPS 공식 기반</div>
          </div>
        </div>`
      document.body.appendChild(wrap)

      const html2canvas = (await import('html2canvas')).default
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const canvas = await html2canvas(wrap, {
        scale: isMob ? 1.5 : 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        width: wrap.scrollWidth,
        height: wrap.scrollHeight,
      } as any)
      document.body.removeChild(wrap)

      // canvas → blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png', 0.95)
      })

      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)

      // 모바일 저장
      if (isMobile) {
        const isKakao = /KAKAOTALK/i.test(navigator.userAgent)

        // 1순위: Web Share API (갤럭시/아이폰 공유시트)
        if (navigator.share) {
          try {
            const file = new File([blob], `연금분석_${age}세.png`, { type: 'image/png' })
            await navigator.share({ files: [file], title: '연금수령 황금타이밍' })
            setSaving(false)
            setSaveOk(true); setTimeout(() => setSaveOk(false), 2000)
            return
          } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') { setSaving(false); return }
          }
        }

        // 2순위: <a download>
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = `연금분석_${age}세.png`
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(blobUrl) }, 3000)

        if (isKakao) {
          setTimeout(() => { alert('이미지가 다운로드되지 않으면,\n오른쪽 상단 ⋯ 메뉴에서\n"다른 브라우저로 열기"를 눌러주세요.') }, 500)
        }

        setSaving(false)
        setSaveOk(true); setTimeout(() => setSaveOk(false), 2000)
        return
      }

      // PC: File System Access API (Chrome/Edge)
      const ww = window as typeof window & { showSaveFilePicker?: (opts: Record<string, unknown>) => Promise<FileSystemFileHandle> }
      if (ww.showSaveFilePicker) {
        try {
          const handle = await ww.showSaveFilePicker({ suggestedName: `연금분석_${age}세.png`, types: [{ description: 'PNG Image', accept: { 'image/png': ['.png'] } }] })
          const writable = await handle.createWritable()
          await writable.write(blob)
          await writable.close()
          setSaveOk(true); setTimeout(() => setSaveOk(false), 2000)
          setSaving(false)
          return
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') { setSaving(false); return }
        }
      }

      // PC Fallback: <a download>
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `연금분석_${age}세.png`
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(blobUrl) }, 1000)
      setSaveOk(true); setTimeout(() => setSaveOk(false), 2000)
    } catch {
      alert('이미지 저장에 실패했습니다. 스크린샷을 이용해주세요.')
    }
    setSaving(false)
  }

  const handleCopy = async () => {
    const u = getShareUrl()
    try { await navigator.clipboard.writeText(u) } catch { const a = document.createElement('textarea'); a.value = u; a.style.position = 'fixed'; a.style.left = '-9999px'; document.body.appendChild(a); a.select(); document.execCommand('copy'); document.body.removeChild(a) }
    setCopy(true); setTimeout(() => setCopy(false), 2000)
  }
  const handleKakao = async () => {
    const shareUrl = getShareUrl()
    const w = window as typeof window & { Kakao?: { isInitialized: () => boolean; init: (key: string) => void; Share: { sendDefault: (opts: Record<string, unknown>) => void } } }

    // 카카오 SDK로 직접 공유 (사주풀이와 동일)
    if (w.Kakao) {
      try {
        if (!w.Kakao.isInitialized()) {
          w.Kakao.init('3913fde247b12ce25084eb42a9b17ed9')
        }
        w.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: '연금수령 황금타이밍',
            description: best ? `${age}세 분석: ${best.age}세에 시작하면 가장 이득!` : '나에게 최적인 연금 개시 시점은?',
            imageUrl: 'https://retireplan.kr/api/og',
            link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
          },
          buttons: [
            { title: '결과 보기', link: { mobileWebUrl: shareUrl, webUrl: shareUrl } },
            { title: '나도 해보기', link: { mobileWebUrl: 'https://retireplan.kr/programs/pension-timing', webUrl: 'https://retireplan.kr/programs/pension-timing' } },
          ],
        })
        return
      } catch {
        // SDK 실패 시 아래 fallback
      }
    }

    // Fallback: 클립보드 복사
    const text = `연금수령 황금타이밍\n${best ? `${age}세 분석: ${best.age}세에 시작하면 가장 이득!` : ''}\n\n결과 보기:\n${shareUrl}`
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setKakaoMsg('링크가 복사되었습니다!\n카카오톡에서 붙여넣기 하세요'); setTimeout(() => setKakaoMsg(''), 4000)
  }

  // ── 차단 ──
  if (blocked) return (
    <div className="max-w-md mx-auto px-4"><div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-6 sm:p-8 text-center">
      <div className="text-5xl mb-4">🔒</div><h3 className="text-lg font-bold text-gray-900 mb-2">무료 체험이 끝났습니다</h3>
      <p className="text-sm text-gray-600 mb-6">비회원 2회 무료 · 회원가입하면 무제한!</p>
      <a href="https://cafe.naver.com/eovhskfktmak" target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all">회원가입하고 무제한 이용하세요</a>
    </div></div>
  )

  // ── 분석 중 ──
  if (anim) return (
    <div className="max-w-md mx-auto px-4"><div className="bg-white rounded-2xl border border-orange-100 p-6 sm:p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl mb-4 shadow-lg shadow-orange-500/20"><div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin" /></div>
        <h3 className="text-lg font-bold text-gray-900">{age}세 맞춤 분석 중</h3>
      </div>
      <div className="space-y-2.5">
        {STEPS.map((s, i) => (<div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-500 ${i < step ? 'bg-green-50 border border-green-200' : i === step ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 border border-gray-100 opacity-40'}`}>
          <span className="text-lg w-6 text-center shrink-0">{i < step ? '✅' : i === step ? s.i : '⏳'}</span>
          <span className={`text-[14px] font-medium ${i < step ? 'text-green-700' : i === step ? 'text-orange-700' : 'text-gray-400'}`}>{s.t}</span>
          {i === step && <div className="ml-auto w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />}
        </div>))}
      </div>
      <div className="mt-5 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-700 ease-out" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
    </div></div>
  )

  // ── 프로그램 설명 ──
  if (!started) return (
    <div className="max-w-md mx-auto px-4 space-y-5">
      {isGuest && (<div className="bg-amber-50 rounded-xl border border-amber-100 px-4 py-2.5 flex items-center justify-between">
        <span className="text-[13px] text-amber-700">무료 체험 <strong>{Math.max(0, MF - usage)}회</strong> 남음</span>
        <a href="https://cafe.naver.com/eovhskfktmak" target="_blank" rel="noopener noreferrer" className="text-[12px] text-orange-500 font-semibold hover:text-orange-600 transition">회원가입 →</a>
      </div>)}
      <div className="bg-white rounded-2xl border border-orange-100 p-5 sm:p-7">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl mb-4 shadow-lg shadow-orange-500/20 text-3xl">⏰</div>
          <h2 className="text-[17px] sm:text-xl font-bold text-gray-900">연금수령 황금타이밍</h2>
          <p className="text-[14px] text-gray-500 mt-2">국민연금, 언제 받아야 가장 이득일까?</p>
        </div>
        <div className="space-y-3 mb-6">
          {[
            { i: '📊', t: '조기·정상·연기 3가지 시나리오 비교', d: '총 수령액 기준, 나에게 가장 유리한 시점을 찾아드립니다' },
            { i: '🔥', t: '해지 vs 연금수령 정밀 손익 분석', d: '반환일시금과 연금 총액을 비교해 몇 배 차이나는지 계산합니다' },
            { i: '💳', t: '세금·건보료까지 실수령액 시뮬레이션', d: '연금소득세, 건강보험료를 반영한 실제 수령액을 알려드립니다' },
            { i: '👨‍👩‍👧', t: '유족연금·물가연동 등 숨은 혜택 분석', d: '사망 시 배우자 수령액, 매년 물가상승 반영까지 안내합니다' },
          ].map(item => (
            <div key={item.t} className="flex gap-3 items-start">
              <span className="text-lg shrink-0 mt-0.5">{item.i}</span>
              <div><p className="text-[13px] font-semibold text-gray-800">{item.t}</p><p className="text-[12px] text-gray-500">{item.d}</p></div>
            </div>
          ))}
        </div>
        <div className="bg-orange-50 rounded-xl p-3 mb-5 text-center">
          <p className="text-[11px] text-orange-600">2026년 연금개혁 반영 · 소득대체율 43% · A값 319만원 · 최신 NPS 데이터 기준</p>
        </div>
        <button onClick={() => setStarted(true)} className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-[15px] rounded-xl transition-all shadow-md shadow-orange-500/20 active:scale-[0.98]">시작하기</button>
      </div>
    </div>
  )

  // ── 입력 + 결과 ──
  return (
    <div className="max-w-md mx-auto px-4 space-y-5 pb-[env(safe-area-inset-bottom)]">
      {isGuest && (<div className="bg-amber-50 rounded-xl border border-amber-100 px-4 py-3 flex items-center justify-between">
        <span className="text-[13px] text-amber-700">무료 체험 <strong>{Math.max(0, MF - usage)}회</strong> 남음</span>
        <a href="https://cafe.naver.com/eovhskfktmak" target="_blank" rel="noopener noreferrer" className="text-[13px] text-orange-500 font-semibold hover:text-orange-600 transition py-1">회원가입 →</a>
      </div>)}

      <div className="bg-white rounded-2xl border border-orange-100 p-5 sm:p-6 space-y-5">
        <div className="text-center">
          <h2 className="text-[18px] sm:text-lg font-bold text-gray-900">2가지만 입력하세요</h2>
          <p className="text-[13px] text-gray-400 mt-1">나이 + 월소득이면 충분합니다</p>
        </div>

        {/* 나이 */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-500 mb-1.5">현재 나이</label>
          <div className="relative">
            <input type="number" value={myAge} onChange={(e) => { setAge(e.target.value); setDone(false) }} placeholder="예: 55" min={25} max={75}
              className="w-full px-4 py-3.5 pr-10 rounded-xl border-2 border-gray-200 text-lg font-bold placeholder:text-gray-300 placeholder:font-normal placeholder:text-base focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none transition-all" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base text-gray-400 font-medium">세</span>
          </div>
          {age > 0 && na > 0 && (
            <p className="text-[12px] text-orange-500 mt-1.5 font-medium">{by}년생 · 정상 수령 {na}세 ({by + na}년) · 앞으로 {Math.max(0, na - age)}년</p>
          )}
        </div>

        {/* 월소득 */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-500 mb-1.5">월소득 (세전)</label>
          <div className="relative">
            <input type="text" inputMode="numeric" value={myIncome} onChange={(e) => handleIncomeChange(e.target.value)} placeholder="예: 350"
              className="w-full px-4 py-3.5 pr-16 rounded-xl border-2 border-gray-200 text-lg font-bold placeholder:text-gray-300 placeholder:font-normal placeholder:text-base focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none transition-all" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base text-gray-400 font-medium">만원</span>
          </div>
          <p className="text-[12px] text-gray-400 mt-1.5">세전 월급 기준 (예: 월 350만원이면 350 입력)</p>
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-gray-500 mb-2.5 text-center">기대수명</label>
          <div className="flex gap-2 justify-center flex-wrap">
            {[75, 80, 85, 90, 95].map(a => (
              <button key={a} onClick={() => { setLE(String(a)); setDone(false) }}
                className={`min-w-[48px] min-h-[44px] px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-95 ${le === String(a) ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{a}세</button>
            ))}
          </div>
          <p className="text-[12px] text-gray-400 mt-2 text-center">통계청 2023 남 80.6세 / 여 86.6세</p>
        </div>
        {base > 0 && (
          <div className="bg-orange-50 rounded-xl px-4 py-3 flex items-center justify-between border border-orange-100">
            <span className="text-[13px] text-gray-600 font-medium">예상 월 연금액</span>
            <span className="text-lg font-bold text-orange-600">{fm(base)}</span>
          </div>
        )}

        {age > 0 && (age < 25 || age > 75) && (
          <p className="text-[12px] text-red-500 text-center">25세~75세 사이를 입력해주세요</p>
        )}
        {inc > 0 && !validIncome && (
          <p className="text-[12px] text-red-500 text-center">50 이상 입력해주세요 (만원 단위, 예: 350)</p>
        )}
        <button onClick={handleCalc} disabled={age < 25 || age > 75 || !validIncome || !base}
          className="w-full min-h-[52px] py-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-gray-200 disabled:to-gray-300 disabled:text-gray-400 text-white font-bold text-[15px] rounded-xl transition-all shadow-md shadow-orange-500/20 disabled:shadow-none active:scale-[0.98]">내 연금 분석하기</button>
      </div>

      {/* ══ 결과 ══ */}
      {done && sc.length === 3 && best && (
        <div ref={resultRef} className="space-y-5 animate-slide-up">

          {/* 핵심 결론 */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl border border-amber-200 p-5 sm:p-6 shadow-sm">
            <div className="text-center mb-5">
              <p className="text-[13px] font-bold text-amber-700 mb-2">🏆 분석 결과</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                <span className="text-orange-600">{best.age}세</span>에 받기 시작하면<br />가장 이득입니다
              </h3>
              <p className="text-[13px] text-gray-500 mt-2">{by}년생 · 기대수명 {lifeExp}세 기준</p>
            </div>

            <div className="space-y-2.5 mb-4">
              {sc.map(s => {
                const ib = s === best, maxC = Math.max(...sc.map(x => x.cumul)), bw = maxC > 0 ? (s.cumul / maxC) * 100 : 0
                return (
                  <div key={s.label} className={`rounded-xl p-4 ${ib ? 'bg-white border-2 border-orange-300 shadow-sm' : 'bg-white/60 border border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        {ib && <span className="text-sm">🏆</span>}
                        <span className={`text-[13px] sm:text-[14px] font-bold break-keep ${ib ? 'text-orange-700' : 'text-gray-700'}`}>{s.label}</span>
                        <span className={`text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-full font-semibold shrink-0 ${s.type === 'early' ? 'bg-blue-100 text-blue-700' : s.type === 'deferred' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{s.pct}</span>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between mb-2">
                      <p className="text-[12px] text-gray-500">{s.age}세부터 · 월 <strong className="text-gray-700">{fm(s.monthly)}</strong></p>
                      <p className={`text-[16px] font-bold ${ib ? 'text-orange-600' : 'text-gray-600'}`}>{fM(s.cumul)}</p>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${ib ? 'bg-gradient-to-r from-orange-400 to-amber-500' : s.type === 'early' ? 'bg-blue-300' : 'bg-purple-300'}`} style={{ width: `${bw}%` }} />
                    </div>
                    {s.diff !== 0 && <p className="text-[11px] text-gray-400 mt-1.5">정상 대비 월 {s.diff > 0 ? '+' : ''}{fm(s.diff)}</p>}
                  </div>
                )
              })}
            </div>

            {/* 분석 요약 */}
            <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-amber-100 space-y-2">
              <p className="text-[12px] font-bold text-amber-700">💡 핵심 분석</p>
              <p className="text-[13px] text-gray-800 leading-relaxed">
                {best.type === 'early' && <>기대수명 {lifeExp}세 기준, <strong className="text-orange-600">{Math.abs(best.yearsDiff)}년 앞당겨서 {na - Math.abs(best.yearsDiff)}세부터</strong> 받는 것이 총 수령액 기준 가장 유리합니다.</>}
                {best.type === 'normal' && <><strong className="text-orange-600">정상 시기({na}세)에 수령</strong>하는 것이 가장 균형 잡힌 선택입니다.</>}
                {best.type === 'deferred' && <><strong className="text-orange-600">{best.yearsDiff}년 늦춰서 {best.pct} 증액</strong>된 월 {fm(best.monthly)}을 받는 것이 가장 유리합니다.</>}
              </p>
              {brk && <p className="text-[12px] text-gray-600"><strong className="text-orange-600">{brk}세</strong>가 손익분기점입니다. 이보다 오래 살면 연기수령이, 일찍 사망하면 조기수령이 이득입니다.</p>}
              <p className="text-[12px] text-gray-600">최적 vs 최악 선택 차이: <strong className="text-orange-600">{fM(Math.abs(best.cumul - Math.min(...sc.map(x => x.cumul))))}</strong></p>
            </div>
          </div>

          {/* 1단계: 현재 상태 체감 */}
          <div className="bg-white rounded-2xl border border-orange-100 p-5 sm:p-6">
            <h3 className="text-[16px] font-bold text-gray-900 mb-3">당신의 연금 현재 상태</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-4">
              현재 월소득 <strong>{fM(inc)}</strong> 기준,<br />
              연금 수령 시 <strong className="text-orange-600">월 {fm(base)}</strong>을 받게 됩니다.
            </p>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[13px] text-gray-600">현재 소득 대비</span>
                <span className="text-[16px] font-bold text-orange-600">{incomeRatio}%</span>
              </div>
              <div className="h-3 bg-orange-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, incomeRatio)}%` }} />
              </div>
              <p className="text-[12px] text-gray-500 mt-2">
                {incomeRatio > 0 && incomeRatio < 40 && '생활비 보전이 부족할 수 있습니다. 퇴직연금·개인연금 보완을 고려하세요.'}
                {incomeRatio >= 40 && incomeRatio < 60 && '적정 수준입니다. 추납이나 연기수령으로 더 높일 수 있습니다.'}
                {incomeRatio >= 60 && '양호한 수준입니다. 연금만으로도 기본 생활이 가능합니다.'}
              </p>
            </div>
          </div>

          {/* 한줄 결론 */}
          {brk && best && (
            <div className="bg-orange-50 rounded-2xl border border-orange-200 p-5 text-center">
              <p className="text-[15px] font-bold text-gray-900">
                한국인 평균수명은 <strong className="text-orange-600">83세</strong>
              </p>
              <p className="text-[14px] text-gray-700 mt-2 leading-relaxed">
                83세까지만 살아도<br />
                <strong className="text-orange-600">{best.age}세</strong>에 받기 시작하는 게 <strong className="text-orange-600">{fM(best.cumul)}</strong>으로 가장 이득
              </p>
            </div>
          )}

          {/* 해지 vs 연금 */}
          {lump > 0 && sc[1] && (() => {
            const ratio = (sc[1].cumul / lump).toFixed(1)
            const diff = sc[1].cumul - lump
            const recoverAge = Math.round((na + Math.ceil(lump / base) / 12) * 10) / 10
            return (
              <div className="bg-white rounded-2xl border border-orange-100 p-5 sm:p-6">
                <h3 className="text-[16px] font-bold text-gray-900 mb-4">해지 vs 연금, 뭐가 이득?</h3>

                {/* 비교 카드 */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-2xl p-4 sm:p-5 text-center bg-red-50 border border-red-200">
                    <p className="text-[13px] text-red-600 font-semibold mb-2">해지하면</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-600">{fM(lump)}</p>
                    <p className="text-[12px] text-red-400 mt-2">납부액 + 이자</p>
                  </div>
                  <div className="rounded-2xl p-4 sm:p-5 text-center bg-green-50 border border-green-200">
                    <p className="text-[13px] text-green-600 font-semibold mb-2">연금으로 받으면</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">{fM(sc[1].cumul)}</p>
                    <p className="text-[12px] text-green-500 mt-2">{lifeExp}세까지 누적</p>
                  </div>
                </div>

                {/* 결론 */}
                <div className="bg-green-600 rounded-2xl p-4 sm:p-5 text-center text-white">
                  <p className="text-[18px] sm:text-[20px] font-bold">연금이 {ratio}배 유리</p>
                  <p className="text-[14px] font-medium mt-1 text-green-100">차이: {fM(diff)}</p>
                </div>

                <p className="text-[13px] text-gray-600 mt-4 text-center leading-relaxed">
                  {na}세부터 받으면 <strong className="text-orange-600">{recoverAge}세</strong>에 해지금을 회수하고,<br />이후로는 <strong>받을수록 이득</strong>입니다.
                </p>
                <p className="text-[11px] text-gray-400 mt-2 text-center">* 반환일시금은 본인+사용자 납부액 + 이자(연 2.6% 복리) 추정치</p>
              </div>
            )
          })()}

          {/* 세금·건보료·실수령액 */}
          <div className="bg-white rounded-2xl border border-orange-100 p-5">
            <h3 className="text-[15px] font-bold text-gray-900 mb-1">💳 세금·건보료 시뮬레이션</h3>
            <p className="text-[12px] text-gray-500 mb-4">정상수령(월 {fm(base)}) 기준 추정</p>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-[13px] text-gray-600">월 연금액 (세전)</span>
                <span className="text-[14px] font-bold text-gray-900">{fm(base)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-[13px] text-gray-600">연금소득세 (연간)</span>
                <span className="text-[14px] font-semibold text-red-500">{tax > 0 ? `-${fm(tax)}` : '비과세'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <div>
                  <span className="text-[13px] text-gray-600">건강보험료 (월)</span>
                  {healthIns === 0 && <span className="text-[11px] text-green-600 ml-1.5">피부양자 유지</span>}
                </div>
                <span className="text-[14px] font-semibold text-red-500">{healthIns > 0 ? `-${fm(healthIns)}` : '0원'}</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-orange-50 rounded-lg px-3 -mx-1">
                <span className="text-[13px] font-bold text-gray-800">월 실수령액 (추정)</span>
                <span className="text-[16px] font-bold text-orange-600">{fm(Math.round(base - tax / 12 - healthIns))}</span>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-[11px] text-gray-400">• 연금소득 연 350만원까지 전액 공제, 초과분 세율 적용</p>
              <p className="text-[11px] text-gray-400">• 건보료: 연금소득 연 2,000만원 초과 시 50%에 부과 (7.09%)</p>
              <p className="text-[11px] text-gray-400">• 연 2,000만원 초과 시 자녀 직장보험 피부양자 탈락 가능</p>
            </div>
          </div>

          {/* 4단계: 추납 시뮬레이션 */}
          {cy < 40 && (() => {
            const extraYears = Math.min(5, 40 - cy)
            const newBase = estPension(by, inc, cy + extraYears)
            const increase = newBase - base
            const monthlyCost = Math.max(MIN_SI, Math.min(MAX_SI, inc)) * 0.09
            const totalCost = monthlyCost * extraYears * 12
            const payback = increase > 0 ? Math.ceil(totalCost / increase) : 0
            return increase > 0 ? (
              <div className="bg-white rounded-2xl border border-orange-100 p-5 sm:p-6">
                <h3 className="text-[16px] font-bold text-gray-900 mb-1">추납하면 얼마나 더 받을까?</h3>
                <p className="text-[12px] text-gray-500 mb-4">미납 기간 보험료를 추후 납부하면 수령액이 올라갑니다</p>
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-gray-600">추납 기간</span>
                    <span className="text-[14px] font-bold text-indigo-700">{extraYears}년</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-gray-600">추납 비용</span>
                    <span className="text-[14px] font-bold text-gray-800">{fM(totalCost)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-gray-600">월 수령액 증가</span>
                    <span className="text-[14px] font-bold text-green-600">+{fm(increase)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-indigo-200">
                    <span className="text-[13px] font-bold text-gray-800">투자금 회수</span>
                    <span className="text-[14px] font-bold text-orange-600">{payback}개월 ({Math.round(payback / 12 * 10) / 10}년)</span>
                  </div>
                </div>
                <p className="text-[12px] text-gray-500 mt-3 leading-relaxed">추납 후 <strong>{payback}개월</strong>이면 투자금을 회수하고, 이후로는 매달 <strong>{fm(increase)}</strong>씩 더 받습니다.</p>
              </div>
            ) : null
          })()}

          {/* 5단계: 실행 가이드 */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-5 sm:p-6">
            <h3 className="text-[16px] font-bold text-gray-900 mb-1">그래서 지금 뭘 해야 하나요?</h3>
            <p className="text-[12px] text-gray-500 mb-4">최적 타이밍 <strong className="text-orange-600">{best?.age}세</strong> 기준, 지금 실행할 수 있는 것들</p>
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-4 border border-orange-100">
                <div className="flex gap-3 items-start">
                  <div className="w-7 h-7 shrink-0 bg-orange-500 text-white rounded-full flex items-center justify-center text-[13px] font-bold">1</div>
                  <div>
                    <p className="text-[14px] font-semibold text-gray-800">내 정확한 가입이력 확인하기</p>
                    <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">지금 분석은 추정치입니다. 실제 가입기간·납부액을 확인해야 정확합니다.</p>
                    <a href="https://www.nps.or.kr" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 px-3 py-1.5 bg-orange-100 text-orange-700 text-[12px] font-semibold rounded-lg hover:bg-orange-200 transition">국민연금공단 바로가기</a>
                  </div>
                </div>
              </div>
              {cy < 40 && (
                <div className="bg-white rounded-xl p-4 border border-orange-100">
                  <div className="flex gap-3 items-start">
                    <div className="w-7 h-7 shrink-0 bg-orange-500 text-white rounded-full flex items-center justify-center text-[13px] font-bold">2</div>
                    <div>
                      <p className="text-[14px] font-semibold text-gray-800">추납 가능 여부 조회하기</p>
                      <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">실업·휴직·경력단절 기간이 있으면 추납으로 수령액을 올릴 수 있습니다. 공단(1355)에 전화하면 바로 확인됩니다.</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-white rounded-xl p-4 border border-orange-100">
                <div className="flex gap-3 items-start">
                  <div className="w-7 h-7 shrink-0 bg-orange-500 text-white rounded-full flex items-center justify-center text-[13px] font-bold">{cy < 40 ? '3' : '2'}</div>
                  <div>
                    <p className="text-[14px] font-semibold text-gray-800">부족분 대비 계획 세우기</p>
                    <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">
                      연금 월 {fm(base)}은 현재 소득의 <strong>{incomeRatio}%</strong>입니다.
                      {incomeRatio < 50 ? ' 퇴직연금(IRP)·개인연금으로 나머지를 채워야 합니다.' : ' 다른 연금과 합산하면 안정적인 노후가 가능합니다.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 내 연금 요약 */}
          <div className="bg-white rounded-2xl border border-orange-100 p-5">
            <h3 className="text-[14px] font-bold text-gray-900 mb-3">내 연금 요약</h3>
            <div className="space-y-1.5">
              {[
                { l: '출생연도', v: `${by}년 (만 ${age}세)` },
                { l: '정상 수령 나이', v: `${na}세 (${by + na}년)` },
                { l: '평균 월소득', v: `${fM(inc)} (세전)` },
                { l: '예상 총 납부기간', v: (() => { const past = Math.max(0, age - 27), future = Math.max(0, na - age); return `약 ${cy}년 (과거 ${Math.min(past, cy)}년 + 미래 ${Math.min(future, cy - Math.min(past, cy))}년)` })() },
                { l: '적용 계수', v: `${getCoeff(by + na)} (${by + na >= 2026 ? '43%' : `${Math.round(getCoeff(by + na) / 3 * 100)}%`})` },
                { l: '예상 월 연금', v: fm(base), bold: true },
              ].map(r => (
                <div key={r.l} className="flex items-start justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-[12px] text-gray-500 shrink-0 break-keep">{r.l}</span>
                  <span className={`text-[12px] sm:text-[13px] text-right break-keep ${r.bold ? 'font-bold text-orange-600' : 'font-semibold text-gray-800'}`}>{r.v}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-3">* 납부기간은 자동 추정. 정확한 금액은 <a href="https://www.nps.or.kr" target="_blank" rel="noopener noreferrer" className="text-orange-500 underline">국민연금공단</a>에서 확인하세요.</p>
          </div>

          {/* 공유 */}
          <div className="space-y-3">
            <p className="text-center text-[13px] text-gray-500 font-medium">친구에게도 알려주세요!</p>
            <button onClick={handleKakao}
              className="w-full min-h-[52px] py-3.5 bg-[#FEE500] active:bg-[#F5DC00] text-[#3C1E1E] rounded-xl text-[14px] font-bold flex items-center justify-center gap-2.5 transition-all duration-150 active:scale-[0.97]">
              <svg width="20" height="20" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path fill="#3C1E1E" d="M128 36C70.6 36 24 72.8 24 118c0 29.2 19.4 54.8 48.6 69.2l-10 36.8c-.8 3 2.6 5.4 5.2 3.6l42.8-28.4c5.6.8 11.4 1.2 17.4 1.2c57.4 0 104-36.8 104-82.4S185.4 36 128 36"/></svg>
              카카오톡으로 공유하기
            </button>
            {kakaoMsg && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <p className="text-[13px] text-green-700 font-medium whitespace-pre-line">{kakaoMsg}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={handleCopy}
                className="min-h-[48px] py-3 bg-gray-100 active:bg-gray-200 text-gray-700 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 transition-all duration-150 active:scale-95">
                <span className="text-lg">{copyOk ? '✅' : '🔗'}</span>
                <span>{copyOk ? '복사됨!' : '결과 링크 복사'}</span>
              </button>
              <button onClick={handleImg} disabled={saving}
                className="min-h-[48px] py-3 bg-indigo-50 active:bg-indigo-100 text-indigo-700 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-150 active:scale-95">
                <span className={`text-lg ${saving ? 'animate-spin' : ''}`}>{saving ? '⏳' : saveOk ? '✅' : '📷'}</span>
                <span>{saving ? '저장 중...' : saveOk ? '저장 완료!' : '이미지 저장'}</span>
              </button>
            </div>
          </div>

          <div className="text-center pb-6">
            <button onClick={() => { setAge(''); setMyIncome(''); setDone(false) }} className="px-6 py-3 text-[13px] bg-orange-100 text-gray-700 rounded-xl hover:bg-orange-200 hover:shadow-md transition-all duration-200 active:scale-90 hover:-translate-y-0.5 font-medium">다시 분석하기</button>
          </div>
        </div>
      )}
    </div>
  )
}
