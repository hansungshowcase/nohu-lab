'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

interface Input { age: number; monthlyNet: number; monthlySave: number; currentAssets: number; retireAge: number }

// 2026년 3월 실시간 물가 (API에서 가져오되 기본값 내장)
interface MarketPrices {
  chicken: number; gukbap: number; cvs: number; americano: number; soju: number
  bus: number; ramen: number; samgak: number; market: number; lunchAvg: number
  minWage: number; egg30: number; rice10kg: number
  updated: string
}
const DEFAULT_PRICES: MarketPrices = {
  chicken: 23000, gukbap: 10000, cvs: 5500, americano: 5500, soju: 5500,
  bus: 1500, ramen: 1200, samgak: 1500, market: 50000, lunchAvg: 8500,
  minWage: 10320, egg30: 8500, rice10kg: 35000,
  updated: '2026-03-13',
}

const S = {
  need: 3_500_000, min: 2_400_000, avg: 2_200_000, pen: 670_000,
  asset: { 20: 12e6, 30: 359_580_000, 40: 627_140_000, 50: 662_050_000, 60: 5e8 } as Record<number, number>,
  med: { 50: 280, 55: 340, 60: 410, 65: 515, 70: 620, 75: 750, 80: 890 } as Record<number, number>,
}
const RET = 0.05, INF = 0.03, LE = 85

function estGross(n: number) { let g = n; for (let i = 0; i < 10; i++) g = n + dd(g).t; return Math.round(g) }
function dd(g: number) {
  const np = Math.round(Math.min(g, 59e5) * .045), hi = Math.round(g * .03545), ltc = Math.round(hi * .1281), ei = Math.round(g * .009)
  const tb = Math.max(g - np - hi - ltc - ei - 15e5, 0), it = Math.round(itx(tb * 12) / 12), lt = Math.round(it * .1)
  return { np, hi, ltc, ei, it, lt, t: np + hi + ltc + ei + it + lt }
}
function itx(a: number) { if (a <= 14e6) return a * .06; if (a <= 5e7) return 84e4 + (a - 14e6) * .15; if (a <= 88e6) return 624e4 + (a - 5e7) * .24; if (a <= 15e7) return 1536e4 + (a - 88e6) * .35; return 3706e4 + (a - 15e7) * .38 }
function pen(g: number, y: number) { return Math.round(Math.max((2_861_091 + Math.min(g, 59e5)) * Math.min(Math.max(y, 10), 40) * .008, 33e4)) }
function pctl(age: number, m: number) {
  const a = ({ 20: 16e5, 30: 22e5, 40: 28e5, 50: 26e5, 60: 2e6 } as Record<number, number>)[Math.floor(age / 10) * 10] || 22e5
  const z = (m - a) / (a * .4), t = 1 / (1 + .2316419 * Math.abs(z)), d = .3989422802 * Math.exp(-z * z / 2)
  const p = d * t * (.3193815 + t * (-.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return Math.round(Math.min(Math.max((z > 0 ? 1 - p : p) * 100, 1), 99))
}

interface R {
  gross: number; dedT: number; dedD: ReturnType<typeof dd>; yrs: number; retYrs: number
  retAll: number; assetG: number; saveG: number; total: number; penM: number; fromAsset: number; monthly: number
  daily: number; perMeal: number
  inflAdj: number; real10: number; real20: number; pct: number; ag: number; fi: number; sr: number
  gr: string; grN: string; grC: string; nickname: string
  budget: { c: string; a: number; p: number }[]
  proj: { y: number; age: number; v: number }[]
  sc: { add: number; m: number; gr: string; diff: number }[]
  med: { age: string; ann: number; pct: number }[]; medT: number
}

function calc(inp: Input): R {
  const net = inp.monthlyNet * 1e4, sav = inp.monthlySave * 1e4, ast = inp.currentAssets * 1e4
  const gross = estGross(net), d = dd(gross), yrs = inp.retireAge - inp.age, retYrs = LE - inp.retireAge
  const retAll = gross * yrs, mr = RET / 12, mo = yrs * 12
  const assetG = Math.round(ast * Math.pow(1 + RET, yrs))
  const saveG = sav > 0 ? Math.round(sav * ((Math.pow(1 + mr, mo) - 1) / mr)) : 0
  const total = assetG + saveG + retAll, penM = pen(gross, yrs)
  const fromAsset = Math.round(total / (retYrs * 12)), monthly = fromAsset + penM
  const daily = Math.round(monthly / 30), perMeal = Math.round(daily / 3)
  const inflAdj = Math.round(monthly / Math.pow(1 + INF, yrs))
  const p = pctl(inp.age, monthly), ag = Math.floor(inp.age / 10) * 10
  const fi = Math.round(monthly / S.need * 100), sr = net > 0 ? Math.round(sav / net * 100) : 0
  const { l: gr, n: grN, c: grC } = grI(monthly)
  const nickname = getNick(monthly, gr)
  const budget = getBud(monthly, gr)
  const now = new Date().getFullYear()
  const proj: R['proj'] = [{ y: now, age: inp.age, v: ast }]
  for (let y = 5; y <= yrs; y += 5) proj.push({ y: now + y, age: inp.age + y, v: Math.round(ast * Math.pow(1 + RET, y) + sav * ((Math.pow(1 + mr, y * 12) - 1) / mr)) })
  if (yrs % 5 !== 0) proj.push({ y: now + yrs, age: inp.retireAge, v: total })
  const sc = [10, 30, 50, 100].map(add => { const es = sav + add * 1e4, sg = es > 0 ? Math.round(es * ((Math.pow(1 + mr, mo) - 1) / mr)) : 0, m = Math.round((assetG + sg + retAll) / (retYrs * 12)) + penM; return { add, m, gr: grI(m).l, diff: m - monthly } })
  const med: R['med'] = []; let medT = 0
  for (const [a, c] of Object.entries(S.med)) { if (Number(a) >= inp.retireAge - 5) { const ann = c * 1e4; med.push({ age: a + '세', ann, pct: Math.round(ann / 12 / monthly * 100) }); medT += ann * 5 } }
  return { gross, dedT: d.t, dedD: d, yrs, retYrs, retAll, assetG, saveG, total, penM, fromAsset, monthly, daily, perMeal, inflAdj, real10: Math.round(monthly * Math.pow(1 - INF, 10)), real20: Math.round(monthly * Math.pow(1 - INF, 20)), pct: p, ag, fi, sr, gr, grN, grC, nickname, budget, proj, sc, med, medT }
}
function grI(m: number) {
  if (m >= 4e6) return { l: 'S', n: '치킨도 시켜먹는 노후', c: '#f59e0b' }
  if (m >= 3e6) return { l: 'A', n: '국밥은 사 먹는 노후', c: '#22c55e' }
  if (m >= 2e6) return { l: 'B', n: '집에서 해 먹는 노후', c: '#3b82f6' }
  if (m >= 15e5) return { l: 'C', n: '라면으로 버티는 노후', c: '#f97316' }
  return { l: 'D', n: '끼니 걱정 노후', c: '#ef4444' }
}
function getNick(m: number, gr: string): string {
  if (gr === 'S') {
    if (m >= 5e6) return '은퇴계의 금수저'
    return '치킨은 배달시키는 사람'
  }
  if (gr === 'A') return '국밥집 단골 어르신'
  if (gr === 'B') return '마트 마감할인 헌터'
  if (gr === 'C') return '라면 물 조절의 달인'
  return '삼각김밥도 고민하는 사람'
}
function getBud(m: number, g: string): R['budget'] {
  const r: Record<string, [string, number][]> = {
    S:[['식비',.22],['주거',.08],['교통/통신',.07],['의료',.08],['여가/여행',.20],['경조사',.08],['공과금',.07],['예비비',.15],['기타',.05]],
    A:[['식비',.25],['주거',.10],['교통/통신',.08],['의료',.12],['여가',.12],['경조사',.08],['공과금',.10],['예비비',.10],['기타',.05]],
    B:[['식비',.30],['주거',.12],['교통/통신',.10],['의료',.13],['여가',.05],['경조사',.07],['공과금',.13],['예비비',.05],['기타',.05]],
    C:[['식비',.35],['주거',.15],['교통/통신',.10],['의료',.12],['공과금',.15],['경조사',.05],['예비비',.03],['기타',.05]],
    D:[['식비',.40],['주거',.18],['교통/통신',.10],['의료',.10],['공과금',.17],['기타',.05]],
  }
  return (r[g] || r.D).map(([c, v]) => ({ c, a: Math.round(m * v), p: Math.round(v * 100) }))
}
function w(n: number) { if (Math.abs(n) >= 1e8) return (n / 1e8).toFixed(1) + '억'; if (Math.abs(n) >= 1e4) return Math.round(n / 1e4).toLocaleString() + '만'; return n.toLocaleString() }
function ww(n: number) { return w(n) + '원' }

const STEPS = ['실시간 물가 데이터 수집','세전 급여 역산','4대보험 산출','소득세 계산','국민연금 추정','퇴직금 산출','복리 시뮬레이션','물가 반영','의료비 추계','동년배 비교','현금흐름 구성','리포트 생성']

function useCU(t: number, d = 1500, on = false) {
  const [v, s] = useState(0)
  useEffect(() => { if (!on) return; let f: number, t0: number; const tick = (ts: number) => { if (!t0) t0 = ts; const p = Math.min((ts - t0) / d, 1); s(Math.round(t * (1 - Math.pow(1 - p, 3)))); if (p < 1) f = requestAnimationFrame(tick) }; f = requestAnimationFrame(tick); return () => cancelAnimationFrame(f) }, [t, d, on]); return v
}
function useVis(ref: React.RefObject<HTMLElement | null>) {
  const [v, s] = useState(false)
  useEffect(() => { if (!ref.current) return; const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { s(true); o.disconnect() } }, { threshold: .12 }); o.observe(ref.current); return () => o.disconnect() }, [ref]); return v
}

const CSS = `
@keyframes up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes ring{from{stroke-dashoffset:283}to{stroke-dashoffset:var(--dash)}}
@keyframes grow{from{width:0}}
@keyframes pulse-red{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)}50%{box-shadow:0 0 0 8px rgba(239,68,68,0)}}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
@keyframes pop{0%{transform:scale(0.5);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
.au{animation:up .6s cubic-bezier(.22,1,.36,1) forwards}
.sh{background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);background-size:200% 100%;animation:shimmer 2s infinite}
.ring-anim{animation:ring 1.5s cubic-bezier(.22,1,.36,1) forwards}
.bar-anim{animation:grow .8s cubic-bezier(.22,1,.36,1) forwards}
.pop-in{animation:pop .5s cubic-bezier(.22,1,.36,1) forwards}
.shake{animation:shake .4s ease-in-out}
.pulse-warn{animation:pulse-red 1.5s infinite}
`

export default function RetirementSimulator() {
  const [phase, setPhase] = useState<'input'|'load'|'result'>('input')
  const [inp, setInp] = useState<Input>({ age: 35, monthlyNet: 300, monthlySave: 50, currentAssets: 3000, retireAge: 65 })
  const [result, setResult] = useState<R | null>(null)
  const [ls, setLs] = useState(0)
  const [lp, setLp] = useState(0)
  const [member, setMember] = useState(false)
  const [gate, setGate] = useState(false)
  const [shared, setShared] = useState(false)
  const [prices, setPrices] = useState<MarketPrices>(DEFAULT_PRICES)
  const [showShareMenu, setShowShareMenu] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') setShared(new URLSearchParams(window.location.search).has('shared'))
    fetch('/api/auth/me').then(r => { if (r.ok) setMember(true) }).catch(() => {})
    // 실시간 물가 데이터 로드
    fetch('/api/programs/market-data').then(r => r.json()).then(data => {
      if (data?.prices) {
        setPrices({
          chicken: data.prices.chicken?.price ?? DEFAULT_PRICES.chicken,
          gukbap: data.prices.gukbap?.price ?? DEFAULT_PRICES.gukbap,
          cvs: data.prices.cvs_dosirak?.price ?? DEFAULT_PRICES.cvs,
          americano: data.prices.americano?.price ?? DEFAULT_PRICES.americano,
          soju: data.prices.soju?.price ?? DEFAULT_PRICES.soju,
          bus: data.prices.bus?.price ?? DEFAULT_PRICES.bus,
          ramen: data.prices.ramen?.price ?? DEFAULT_PRICES.ramen,
          samgak: data.prices.samgak?.price ?? DEFAULT_PRICES.samgak,
          market: data.prices.market_weekly?.price ?? DEFAULT_PRICES.market,
          lunchAvg: data.prices.lunch_avg?.price ?? DEFAULT_PRICES.lunchAvg,
          minWage: data.wages?.min_hourly_2026 ?? DEFAULT_PRICES.minWage,
          egg30: data.prices.egg_30?.price ?? DEFAULT_PRICES.egg30,
          rice10kg: data.prices.rice_10kg?.price ?? DEFAULT_PRICES.rice10kg,
          updated: data.updated ?? DEFAULT_PRICES.updated,
        })
      }
    }).catch(() => {})
    // 카카오 SDK 로드 (앱키가 있을 때만)
    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY
    if (kakaoKey && typeof window !== 'undefined' && !document.getElementById('kakao-sdk')) {
      const s = document.createElement('script')
      s.id = 'kakao-sdk'
      s.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js'
      s.crossOrigin = 'anonymous'
      s.onload = () => {
        const K = (window as any).Kakao
        if (K && !K.isInitialized()) K.init(kakaoKey)
      }
      document.head.appendChild(s)
    }
  }, [])

  function go(e: React.FormEvent) {
    e.preventDefault(); setPhase('load'); setLs(0); setLp(0)
    const dur = 5000, sd = dur / STEPS.length; let s = 0
    const pi = setInterval(() => setLp(p => Math.min(p + .85, 100)), dur / 115)
    const si = setInterval(() => { s++; if (s < STEPS.length) setLs(s); else { clearInterval(si); clearInterval(pi); setLp(100); setResult(calc(inp)); setTimeout(() => setPhase('result'), 400) } }, sd)
  }

  const makeCard = useCallback((): HTMLCanvasElement | null => {
    if (!result) return null
    const P = prices, r = result
    const W = 700, H = 990, sc = 2
    const c = document.createElement('canvas'); c.width = W * sc; c.height = H * sc
    const x = c.getContext('2d')!; x.scale(sc, sc)
    const L = 40, R2 = W - 40, CW = R2 - L
    const gc: Record<string, string> = { S: '#f59e0b', A: '#22c55e', B: '#3b82f6', C: '#f97316', D: '#ef4444' }
    const col = gc[r.gr] || '#888'

    const line = (yy: number) => { x.strokeStyle = '#e0e0e0'; x.lineWidth = 1; x.beginPath(); x.moveTo(L, yy); x.lineTo(R2, yy); x.stroke() }
    const row = (label: string, val: string, yy: number, hl?: boolean) => {
      x.fillStyle = '#777'; x.font = '400 13px system-ui'; x.textAlign = 'left'; x.fillText(label, L, yy)
      x.fillStyle = hl ? col : '#222'; x.font = `${hl ? '700' : '500'} 14px system-ui`; x.textAlign = 'right'; x.fillText(val, R2, yy); x.textAlign = 'left'
    }
    const wrap = (text: string, yy: number, mw: number, fs = 13) => {
      x.font = `400 ${fs}px system-ui`; let ln = '', ly = yy
      for (const ch of text) { const t = ln + ch; if (x.measureText(t).width > mw) { x.fillText(ln, L, ly); ly += fs + 5; ln = ch } else ln = t }
      if (ln) x.fillText(ln, L, ly); return ly
    }

    // 배경
    x.fillStyle = '#fafafa'; x.fillRect(0, 0, W, H)
    x.fillStyle = 'rgba(0,0,0,.012)'; x.font = '900 420px system-ui'; x.fillText(r.gr, 250, 500)

    // 헤더
    x.fillStyle = '#999'; x.font = '300 11px system-ui'; x.fillText('노후연구소 | ' + P.updated + ' 물가 기준', L, 34)
    x.fillStyle = '#111'; x.font = '900 26px system-ui'; x.fillText('은퇴 종합 진단서', L, 70)

    // 등급 뱃지
    x.fillStyle = col; x.beginPath(); x.roundRect(R2 - 56, 22, 56, 56, 12); x.fill()
    x.fillStyle = '#fff'; x.font = '900 32px system-ui'; x.textAlign = 'center'; x.fillText(r.gr, R2 - 28, 56)
    x.font = '500 9px system-ui'; x.fillText('등급', R2 - 28, 70); x.textAlign = 'left'

    // 별명
    x.fillStyle = col; x.font = '700 15px system-ui'; x.fillText(`"${r.nickname}"`, L, 100)
    x.fillStyle = '#888'; x.font = '400 12px system-ui'; x.fillText(r.grN, L, 118)

    let y = 134; line(y); y += 24

    // 핵심 수치 (월/한끼/하루 한 줄)
    x.fillStyle = '#888'; x.font = '400 11px system-ui'; x.fillText('은퇴 후 월 가용액', L, y)
    x.fillStyle = '#111'; x.font = '900 40px system-ui'; x.fillText(ww(r.monthly), L, y + 38); y += 50
    x.fillStyle = '#666'; x.font = '400 11px system-ui'; x.fillText('한 끼', L, y)
    x.fillStyle = col; x.font = '800 20px system-ui'; x.fillText(ww(r.perMeal), L + 42, y)
    x.fillStyle = '#666'; x.font = '400 11px system-ui'; x.fillText('하루', L + 220, y)
    x.fillStyle = '#333'; x.font = '700 16px system-ui'; x.fillText(ww(r.daily), L + 258, y)
    if (r.perMeal < P.lunchAvg) { x.fillStyle = '#ef4444'; x.font = '500 11px system-ui'; x.fillText(`점심 ${ww(P.lunchAvg)}의 ${Math.round(r.perMeal / P.lunchAvg * 100)}%`, L + 420, y) }
    y += 16; line(y); y += 20

    // 치킨/국밥/도시락 한 줄
    const ck = Math.floor(r.monthly / P.chicken), gb = Math.floor(r.monthly / P.gukbap), cv = Math.floor(r.monthly / P.cvs)
    x.fillStyle = '#555'; x.font = '600 12px system-ui'
    x.fillText(`치킨 ${ck}마리`, L, y); x.fillText(`국밥 ${gb}그릇`, L + 140, y); x.fillText(`도시락 ${cv}개`, L + 290, y)
    x.fillStyle = '#aaa'; x.font = '400 10px system-ui'
    x.fillText(`(${ww(P.chicken)})`, L + 80, y); x.fillText(`(${ww(P.gukbap)})`, L + 220, y); x.fillText(`(${ww(P.cvs)})`, L + 368, y)
    y += 16; line(y); y += 20

    // 나의 위치 (3행)
    x.fillStyle = '#555'; x.font = '600 12px system-ui'; x.fillText('나의 위치', L, y); y += 20
    row(`${r.ag}대 동년배 순위`, `상위 ${r.pct}%`, y, r.pct <= 30); y += 22
    row('노후 준비도', `${r.fi}%`, y, r.fi >= 70); y += 22
    row('은퇴 시 총자산 / 국민연금', `${w(r.total)} / 월 ${ww(r.penM)}`, y); y += 8
    line(y); y += 20

    // 할 수 있는 것 / 없는 것 (각 4개)
    const m = r.monthly, canL: string[] = [], cantL: string[] = []
    if (m >= 300000) canL.push('사 먹기'); else cantL.push('외식')
    if (m >= P.chicken * 2) canL.push('치킨 배달'); else cantL.push('치킨')
    if (m >= 200000) canL.push('손주 용돈'); else cantL.push('손주 용돈')
    if (m >= 300000) canL.push('병원'); else cantL.push('병원')
    if (m >= 500000) canL.push('여행'); else cantL.push('여행')
    if (m < 3000000) cantL.push('해외여행'); else canL.push('해외여행')
    x.fillStyle = '#555'; x.font = '600 12px system-ui'; x.fillText('할 수 있는 것', L, y); x.fillText('할 수 없는 것', L + CW / 2, y); y += 18
    for (let i = 0; i < Math.max(canL.length, cantL.length, 4); i++) {
      if (canL[i]) { x.fillStyle = '#22c55e'; x.font = '700 11px system-ui'; x.fillText('V', L, y); x.fillStyle = '#555'; x.font = '400 11px system-ui'; x.fillText(canL[i], L + 16, y) }
      if (cantL[i]) { x.fillStyle = '#ef4444'; x.font = '700 11px system-ui'; x.fillText('X', L + CW / 2, y); x.fillStyle = '#555'; x.font = '400 11px system-ui'; x.fillText(cantL[i], L + CW / 2 + 16, y) }
      y += 18
    }
    y += 4; line(y); y += 20

    // 종합 진단 (풍부하게)
    x.fillStyle = col; x.font = '700 14px system-ui'; x.fillText('종합 진단', L, y); y += 20
    const gap = S.need - r.monthly
    let d1: string, d2: string
    if (r.gr === 'S') { d1 = '여유 있는 노후입니다. 시장에서 제철 과일 사고, 가끔 외식도 됩니다.'; d2 = `다만 ${r.yrs}년 후 물가 반영 시 구매력 ${Math.round(r.inflAdj / r.monthly * 100)}%. 인플레이션 대비 필수.` }
    else if (r.gr === 'A') { d1 = `먹고 사는 건 됩니다. 치킨은 시켜먹을 수 있지만, 경조사 겹치면 빠듯합니다.`; d2 = `월 ${ww(gap > 0 ? gap : 0)} 더 모으면 걱정 없는 수준. 저축률 ${r.sr}%${r.sr < 20 ? ' (권장 20%)' : ''}.` }
    else if (r.gr === 'B') { d1 = `밥은 먹지만 병원비 한 번이면 그 달은 끝. 마감할인 반찬이 일상입니다.`; d2 = `적정 생활비 ${ww(S.need)} 대비 ${ww(gap)} 부족. 지금이 바꿀 수 있는 마지막 기회.` }
    else if (r.gr === 'C') { d1 = '끼니를 거르는 날이 생깁니다. 아파도 병원비가 무서워 참게 됩니다.'; d2 = `난방비 아끼려고 이불 속에서 버티게 됩니다. 월 ${ww(gap)} 추가 저축이 시급합니다.` }
    else { d1 = '삼시세끼 해결이 안 됩니다. 무료급식소, 폐기 직전 도시락이 일상.'; d2 = `국민연금 ${ww(r.penM)}으로는 공과금 내면 남는 게 없습니다. 긴급 개편 필요.` }
    x.fillStyle = '#444'; y = wrap(d1, y, CW, 13) + 8
    x.fillStyle = '#666'; y = wrap(d2, y, CW, 12) + 16

    // 처방
    x.fillStyle = col; x.font = '700 13px system-ui'; x.fillText('잘 살려면', L, y); y += 18
    const rx: string[] = []
    if (r.sr < 20) rx.push(`저축률 ${r.sr}% → 20%로 올리기`)
    if (gap > 0) rx.push(`월 ${ww(gap)} 추가 저축/투자`)
    rx.push(`은퇴까지 ${r.yrs}년, 복리 효과 극대화 구간`)
    x.fillStyle = '#555'; x.font = '400 12px system-ui'
    rx.forEach((a, i) => { x.fillText(`${i + 1}. ${a}`, L + 8, y); y += 18 })

    // 하단 CTA
    y = H - 70
    x.fillStyle = '#03C75A'; x.beginPath(); x.roundRect(L, y, CW, 40, 10); x.fill()
    x.fillStyle = '#fff'; x.font = '700 13px system-ui'; x.textAlign = 'center'
    x.fillText('나도 분석해보기   nohu-lab.vercel.app', W / 2, y + 25); x.textAlign = 'left'
    x.fillStyle = '#999'; x.font = '400 10px system-ui'; x.textAlign = 'center'
    x.fillText('노후연구소 카페  cafe.naver.com/eovhskfktmak', W / 2, H - 16); x.textAlign = 'left'

    return c
  }, [result, prices])

  const dlCard = useCallback(() => {
    const c = makeCard()
    if (!c) return
    const a = document.createElement('a'); a.download = `은퇴진단서_${result?.gr}.png`; a.href = c.toDataURL('image/png'); a.click()
  }, [makeCard, result])

  function shareKakao() {
    if (!result) return
    const url = 'https://nohu-lab.vercel.app/programs/retirement-simulator?shared=true'
    const ck = Math.floor(result.monthly / prices.chicken)
    const txt = `[은퇴 종합 진단서]\n\n${result.gr}등급 "${result.nickname}"\n은퇴 후 한 끼: ${ww(result.perMeal)}\n치킨 ${ck}마리 | ${result.ag}대 상위 ${result.pct}%\n\n나도 해보기: ${url}\n\n노후연구소 카페\ncafe.naver.com/eovhskfktmak`
    // 진단서 이미지 생성 후 카카오톡으로 공유
    const c = makeCard()
    if (c) {
      c.toBlob(async (blob) => {
        if (!blob) { fallbackShare(txt); return }
        const file = new File([blob], `은퇴진단서_${result.gr}.png`, { type: 'image/png' })
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({ title: `은퇴 진단 ${result.gr}등급`, text: txt, files: [file] })
          } catch { fallbackShare(txt) }
        } else {
          fallbackShare(txt)
        }
      }, 'image/png')
    } else { fallbackShare(txt) }
    setShowShareMenu(false)
  }

  function fallbackShare(txt: string) {
    navigator.clipboard.writeText(txt)
    alert('텍스트가 복사되었습니다. 카카오톡에 붙여넣기 해주세요.')
  }

  function shareGeneral() {
    if (!result) return
    const url = 'https://nohu-lab.vercel.app/programs/retirement-simulator?shared=true'
    const ck = Math.floor(result.monthly / prices.chicken), gb = Math.floor(result.monthly / prices.gukbap)
    const txt = `[나의 은퇴 종합 진단서]\n\n${result.gr}등급 "${result.nickname}"\n\n은퇴 후 한 달: ${ww(result.monthly)}\n한 끼: ${ww(result.perMeal)}\n치킨 ${ck}마리 | 국밥 ${gb}그릇\n\n${result.ag}대 상위 ${result.pct}%\n\n나도 해보기: ${url}\n노후연구소 카페: cafe.naver.com/eovhskfktmak`
    const c = makeCard()
    if (c) {
      c.toBlob(async (blob) => {
        if (!blob) { textShare(txt, url); return }
        const file = new File([blob], `은퇴진단서_${result.gr}.png`, { type: 'image/png' })
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          try { await navigator.share({ title: `은퇴 진단 ${result.gr}등급`, text: txt, files: [file] }) } catch { textShare(txt, url) }
        } else { textShare(txt, url) }
      }, 'image/png')
    } else { textShare(txt, url) }
    setShowShareMenu(false)
  }

  function textShare(txt: string, url: string) {
    if (navigator.share) navigator.share({ title: '은퇴 진단서', text: txt, url }).catch(() => {})
    else { navigator.clipboard.writeText(txt); alert('클립보드에 복사되었습니다') }
  }

  function copyLink() {
    if (!result) return
    const url = 'https://nohu-lab.vercel.app/programs/retirement-simulator?shared=true'
    navigator.clipboard.writeText(url)
    alert('링크가 복사되었습니다')
    setShowShareMenu(false)
  }

  // ─── 입력 ───
  if (phase === 'input') return (
    <div className="max-w-[440px] mx-auto px-4">
      <style>{CSS}</style>
      {shared && <div className="text-center text-xs text-gray-500 mb-6 bg-gray-50 rounded-lg py-2">친구가 공유한 분석입니다 <a href="https://cafe.naver.com/eovhskfktmak" target="_blank" className="underline text-green-600 font-bold">카페 가입</a></div>}
      <div className="text-center pt-4 pb-8 space-y-3">
        <div className="inline-block bg-gray-100 rounded-full px-3 py-1 text-[10px] text-gray-500">{prices.updated} 실시간 물가 반영</div>
        <h2 className="text-[26px] font-[900] text-gray-900 leading-tight">은퇴 후,<br/>당신의 한 끼는<br/>얼마짜리인가요</h2>
        <p className="text-[13px] text-gray-500">지금 직장인 점심 평균 <strong className="text-gray-900">{ww(prices.lunchAvg)}</strong></p>
        <p className="text-[11px] text-gray-400">5개 입력 -- 12개 항목 정밀 분석</p>
      </div>
      <form onSubmit={go} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FI l="현재 나이" v={inp.age} u="세" set={v => setInp({...inp, age: v})} min={20} max={70} />
          <FI l="은퇴 나이" v={inp.retireAge} u="세" set={v => setInp({...inp, retireAge: v})} min={inp.age+1} max={80} />
        </div>
        <FI l="월 실수령액" v={inp.monthlyNet} u="만원" set={v => setInp({...inp, monthlyNet: v})} step={10} min={100}
          sub={`세전 약 ${w(estGross(inp.monthlyNet * 1e4) * 12)}원 | 2026 최저임금 ${ww(prices.minWage)}/시간`} />
        <FI l="월 저축+투자" v={inp.monthlySave} u="만원" set={v => setInp({...inp, monthlySave: v})} step={10} min={0}
          sub={`저축률 ${inp.monthlyNet > 0 ? Math.round(inp.monthlySave / inp.monthlyNet * 100) : 0}% | 권장 20% 이상`} />
        <div>
          <FI l="총 자산 (부동산 제외)" v={inp.currentAssets} u="만원" set={v => setInp({...inp, currentAssets: v})} step={500} min={0} />
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {[1000,3000,5000,10000,30000,50000].map(v => (
              <button key={v} type="button" onClick={() => setInp({...inp, currentAssets: v})}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] transition font-medium ${inp.currentAssets === v ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 active:bg-gray-200'}`}>{w(v * 1e4)}</button>
            ))}
          </div>
        </div>
        <button type="submit" className="w-full py-4 bg-gray-900 text-white font-[800] rounded-xl text-[15px] hover:bg-black transition mt-3 active:scale-[0.98]">내 노후 분석하기</button>
        <p className="text-[10px] text-center text-gray-400">개인정보 수집 없음 | 출처: 통계청, KB금융, 국민연금공단</p>
      </form>
    </div>
  )

  // ─── 로딩 ───
  if (phase === 'load') return (
    <div className="max-w-[440px] mx-auto py-10 px-4">
      <style>{CSS}</style>
      <div className="text-center mb-8">
        <p className="text-[17px] font-[800] text-gray-900 mt-1">분석 중입니다</p>
        <p className="text-[11px] text-gray-400 mt-1">{prices.updated} 실시간 물가 기준</p>
      </div>
      <div className="mb-6">
        <div className="flex justify-between text-[11px] mb-1.5">
          <span className="text-gray-500">{STEPS[ls]}</span>
          <span className="text-gray-900 font-bold tabular-nums">{Math.round(lp)}%</span>
        </div>
        <div className="h-[4px] bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gray-900 rounded-full transition-all duration-300 relative" style={{width:`${lp}%`}}><div className="absolute inset-0 sh rounded-full"/></div>
        </div>
      </div>
      <div className="space-y-0">
        {STEPS.map((s, i) => (
          <div key={i} className={`py-2 text-[11px] transition-all ${i < ls ? 'text-gray-400' : i === ls ? 'text-gray-900 font-medium' : 'text-gray-200'}`}>
            <span className="inline-block w-5 text-right mr-2 font-mono text-[10px]">{i < ls ? 'v' : i === ls ? '>' : ''}</span>{s}
          </div>
        ))}
      </div>
    </div>
  )

  if (!result) return null
  const r = result
  const P = prices
  const chicken = Math.floor(r.monthly / P.chicken)
  const gukbap = Math.floor(r.monthly / P.gukbap)
  const cvs = Math.floor(r.monthly / P.cvs)
  const soju = Math.floor(r.monthly / P.soju)
  const bus = Math.floor(r.monthly / P.bus)
  const market = Math.floor(r.monthly / P.market)

  return (
    <div className="max-w-[440px] mx-auto px-4">
      <style>{CSS}</style>

      {/* 전체 결과 1블록 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 text-[140px] font-[900] leading-none select-none" style={{ color: r.grC, opacity: 0.05 }}>{r.gr}</div>
        <div className="relative z-10">
          {/* 등급 + 별명 */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[9px] text-gray-400">노후연구소 분석</p>
              <p className="text-[15px] font-[800] mt-1" style={{ color: r.grC }}>"{r.nickname}"</p>
              <p className="text-[11px] text-gray-500">{r.grN}</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center" style={{ backgroundColor: r.grC }}>
              <span className="text-[22px] font-[900] leading-none text-white">{r.gr}</span>
              <span className="text-[7px] text-white/70">등급</span>
            </div>
          </div>

          {/* 핵심 수치 */}
          <div className="border-t border-gray-100 pt-3 mt-1">
            <p className="text-[10px] text-gray-400">은퇴 후 매달</p>
            <p className="text-[36px] font-[900] tracking-tight leading-none text-gray-900">{ww(r.monthly)}</p>
            <div className="flex gap-4 mt-1.5 items-baseline">
              <span className="text-[11px] text-gray-500">한 끼 <strong className="text-[15px] font-[800]" style={{ color: r.grC }}>{ww(r.perMeal)}</strong></span>
              <span className="text-[11px] text-gray-500">하루 <strong className="text-[14px] font-[700] text-gray-800">{ww(r.daily)}</strong></span>
              {r.perMeal < P.lunchAvg && <span className="text-[10px] text-red-500">점심 {ww(P.lunchAvg)}의 {Math.round(r.perMeal / P.lunchAvg * 100)}%</span>}
            </div>
          </div>

          {/* 치킨/국밥 — 한 줄 */}
          <div className="flex gap-1.5 mt-3">
            <FunCard top={`${chicken}`} unit="마리" label="치킨" sub={ww(P.chicken)} color={chicken >= 30 ? 'green' : chicken >= 15 ? 'yellow' : 'red'} />
            <FunCard top={`${gukbap}`} unit="그릇" label="국밥" sub={ww(P.gukbap)} color={gukbap >= 50 ? 'green' : gukbap >= 25 ? 'yellow' : 'red'} />
            <FunCard top={`${cvs}`} unit="개" label="도시락" sub={ww(P.cvs)} color={cvs >= 100 ? 'green' : cvs >= 50 ? 'yellow' : 'red'} />
          </div>

          {/* 진단 */}
          <div className="border-t border-gray-100 mt-3 pt-3">
            <p className="text-[12px] font-[700] text-gray-900 mb-1">종합 진단</p>
            <p className="text-[12px] text-gray-700 leading-[1.7]">
              {r.gr === 'S' && `여유 있는 노후. 물가 상승만 대비하면 안정적.`}
              {r.gr === 'A' && `먹고 사는 건 되지만, 월 ${ww(S.need - r.monthly > 0 ? S.need - r.monthly : 0)} 더 모으면 마음 편해집니다.`}
              {r.gr === 'B' && `밥은 먹지만 병원비 한 번이면 그 달 끝. 치킨 ${chicken}마리가 전부.`}
              {r.gr === 'C' && '끼니를 거르는 날이 생깁니다. 아파도 참게 됩니다.'}
              {r.gr === 'D' && '삼시세끼 해결이 안 됩니다. 무료급식소가 일상.'}
            </p>
          </div>

          {/* 동년배 + 준비도 */}
          <div className="flex gap-2 mt-3 text-center">
            <div className="flex-1 bg-gray-50 rounded-lg py-1.5">
              <p className="text-[9px] text-gray-400">동년배</p>
              <p className="text-[12px] font-[800] text-gray-900">상위 {r.pct}%</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-lg py-1.5">
              <p className="text-[9px] text-gray-400">준비도</p>
              <p className="text-[12px] font-[800]" style={{ color: r.fi >= 70 ? '#22c55e' : '#ef4444' }}>{r.fi}%</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-lg py-1.5">
              <p className="text-[9px] text-gray-400">은퇴 시 자산</p>
              <p className="text-[12px] font-[800] text-gray-900">{w(r.total)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ GATED ═══ */}
      {member ? (
        <>
          <Sec><BenchBars r={r} /></Sec>
          <Sec><IncomeBlock r={r} /></Sec>
          <Sec><AssetBlock r={r} /></Sec>
          <Sec><PensionBlock r={r} /></Sec>
          <Sec><BudgetBlock r={r} /></Sec>
          <Sec><RiskBlock r={r} /></Sec>
          <Sec><ScenarioBlock r={r} /></Sec>
          <Sec><PeerBlock r={r} inp={inp} /></Sec>
        </>
      ) : (
        <Sec><LockedZone onJoin={() => setGate(true)} /></Sec>
      )}

      {/* 하단 공유 버튼 */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 -mx-4 px-4 py-3 flex gap-2 z-40">
        <button onClick={() => { setPhase('input'); setResult(null) }} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-[13px] font-bold active:bg-gray-50">다시 분석</button>
        <button onClick={() => setShowShareMenu(true)} className="flex-[2] py-3 bg-[#FEE500] text-[#3C1E1E] rounded-xl text-[13px] font-[800] active:bg-[#F5DC00] flex items-center justify-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#3C1E1E"><path d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.68 6.67-.15.56-.96 3.6-.99 3.82 0 0-.02.16.08.22s.22.02.22.02c.29-.04 3.37-2.2 3.9-2.57.67.1 1.37.15 2.11.15 5.52 0 10-3.58 10-7.94S17.52 3 12 3"/></svg>
          진단서 공유하기
        </button>
      </div>
      <div className="h-16" /> {/* sticky 버튼 여유 */}

      {/* 공유 메뉴 */}
      {showShareMenu && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={() => setShowShareMenu(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-[440px] p-5 pb-8 au" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <p className="text-[16px] font-[800] text-gray-900 mb-4 text-center">분석 결과 공유하기</p>
            <div className="space-y-2">
              <button onClick={shareKakao} className="w-full py-3.5 bg-[#FEE500] text-[#3C1E1E] rounded-xl text-[14px] font-[700] flex items-center justify-center gap-2 active:bg-[#F5DC00]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#3C1E1E"><path d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.68 6.67-.15.56-.96 3.6-.99 3.82 0 0-.02.16.08.22s.22.02.22.02c.29-.04 3.37-2.2 3.9-2.57.67.1 1.37.15 2.11.15 5.52 0 10-3.58 10-7.94S17.52 3 12 3"/></svg>
                카카오톡으로 보내기
              </button>
              <button onClick={shareGeneral} className="w-full py-3.5 bg-gray-900 text-white rounded-xl text-[14px] font-[700] active:bg-gray-800">다른 앱으로 공유</button>
              <button onClick={() => { member ? dlCard() : setGate(true); setShowShareMenu(false) }} className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-xl text-[14px] font-[700] active:bg-gray-200">리포트 이미지 저장</button>
              <button onClick={copyLink} className="w-full py-3.5 bg-gray-50 text-gray-500 rounded-xl text-[13px] font-[600] active:bg-gray-100">링크 복사</button>
            </div>
            <button onClick={() => setShowShareMenu(false)} className="w-full mt-3 text-[13px] text-gray-400 py-2">닫기</button>
          </div>
        </div>
      )}

      {gate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setGate(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-[340px] w-full space-y-4 text-center au" onClick={e => e.stopPropagation()}>
            <p className="text-[18px] font-[900] text-gray-900">전체 분석 리포트는<br/>카페 회원 전용입니다</p>
            <div className="text-left bg-gray-50 rounded-lg p-3 space-y-1 text-[12px] text-gray-600">
              <p>- 4대보험/세금 상세 내역</p>
              <p>- 5년 단위 자산 성장 추계표</p>
              <p>- 국민연금 상세 분석</p>
              <p>- 월간 지출 배분표</p>
              <p>- 물가/의료비 리스크</p>
              <p>- 추가 저축 시나리오 비교</p>
              <p>- 동년배 비교 분석</p>
              <p>- 리포트 이미지 저장/공유</p>
            </div>
            <a href="https://cafe.naver.com/eovhskfktmak" target="_blank" rel="noopener noreferrer"
              className="block w-full py-3.5 bg-[#03C75A] text-white font-[800] rounded-xl text-[15px] active:bg-[#02b050]">무료 가입하고 전체 리포트 보기</a>
            <p className="text-[11px] text-gray-400">가입 후 닉네임으로 로그인</p>
            <button onClick={() => setGate(false)} className="text-[12px] text-gray-400">닫기</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 스크롤 등장 ───
function Sec({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null); const v = useVis(ref)
  return <div ref={ref} className={`transition-all duration-700 ease-out ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} mb-4`}>{children}</div>
}

// ═══ FREE 섹션들 ═══

function FunCard({ top, unit, label, sub, color }: { top: string; unit: string; label: string; sub: string; color: 'green' | 'yellow' | 'red' }) {
  const bg = color === 'green' ? 'bg-green-50 border-green-100' : color === 'yellow' ? 'bg-yellow-50 border-yellow-100' : 'bg-red-50 border-red-100'
  const tc = color === 'green' ? 'text-green-700' : color === 'yellow' ? 'text-yellow-700' : 'text-red-700'
  return (
    <div className={`${bg} border rounded-xl p-3 text-center`}>
      <p className={`text-[24px] font-[900] leading-none ${tc}`}>{top}<span className="text-[11px] font-[600]">{unit}</span></p>
      <p className="text-[11px] font-[600] text-gray-800 mt-1">{label}</p>
      <p className="text-[9px] text-gray-400">{sub}</p>
    </div>
  )
}

function BenchBars({ r }: { r: R }) {
  const items = [
    { label: '부부 적정 생활비', amount: S.need },
    { label: '부부 최소 생활비', amount: S.min },
    { label: '실제 조달 평균', amount: S.avg },
    { label: '국민연금 평균', amount: S.pen },
  ]
  const mx = Math.max(...items.map(i => i.amount), r.monthly) * 1.1
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <p className="text-[13px] font-[700] text-gray-900 mb-4">기준치 대비</p>
      <div className="space-y-3">
        {items.map((item, i) => {
          const mine = r.monthly / mx * 100, theirs = item.amount / mx * 100, ok = r.monthly >= item.amount
          return (
            <div key={i}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-gray-500">{item.label}</span>
                <span className="text-gray-800 tabular-nums font-medium">{ww(item.amount)}</span>
              </div>
              <div className="relative h-5 bg-gray-50 rounded overflow-hidden">
                <div className="absolute h-full bg-gray-200 rounded bar-anim" style={{ width: `${theirs}%`, animationDelay: `${i * 150}ms` }} />
                <div className={`absolute h-full rounded bar-anim ${ok ? 'bg-green-500' : 'bg-red-400'}`} style={{ width: `${mine}%`, animationDelay: `${i * 150 + 100}ms` }} />
                <span className="absolute left-2 top-0.5 text-[10px] text-white font-bold drop-shadow">{ww(r.monthly)}</span>
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-[9px] text-gray-400 mt-3">출처: KB금융 2025, 통계청, 국민연금공단, 가계금융복지조사 2024</p>
    </div>
  )
}

// ═══ LOCKED ═══
function LockedZone({ onJoin }: { onJoin: () => void }) {
  return (
    <div className="relative">
      <div className="space-y-3 filter blur-[6px] pointer-events-none select-none" aria-hidden="true">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 h-32" />
        <div className="bg-gray-100 rounded-2xl p-5 h-40" />
        <div className="bg-white border border-gray-100 rounded-2xl p-5 h-36" />
        <div className="bg-white border border-gray-100 rounded-2xl p-5 h-28" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 max-w-[320px] w-full text-center shadow-xl border border-gray-100">
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          </div>
          <p className="text-[16px] font-[900] text-gray-900">7개 상세 분석이<br/>잠겨 있습니다</p>
          <p className="text-[12px] text-gray-500 mt-2 leading-relaxed">세금 내역, 자산 추계표, 연금,<br/>의료비, 저축 시나리오 등</p>
          <button onClick={onJoin} className="w-full py-3.5 bg-[#03C75A] text-white font-[700] rounded-xl text-[14px] mt-4 active:bg-[#02b050]">무료 가입하고 전체 보기</button>
          <p className="text-[10px] text-gray-400 mt-2">노후연구소 카페 가입 후 로그인</p>
        </div>
      </div>
    </div>
  )
}

// ═══ GATED 섹션들 ═══
function IncomeBlock({ r }: { r: R }) {
  return <Card title="소득 구조"><D l="추정 세전 월급" v={ww(r.gross)} /><D l="추정 연봉" v={ww(r.gross * 12)} /><Sep /><D l="국민연금 4.5%" v={ww(r.dedD.np)} sm /><D l="건강보험 3.545%" v={ww(r.dedD.hi)} sm /><D l="장기요양 12.81%" v={ww(r.dedD.ltc)} sm /><D l="고용보험 0.9%" v={ww(r.dedD.ei)} sm /><D l="소득세" v={ww(r.dedD.it)} sm /><D l="지방소득세" v={ww(r.dedD.lt)} sm /><Sep /><D l="공제 합계" v={ww(r.dedT)} b /><D l="저축률" v={r.sr + '%'} sub={r.sr < 20 ? '권장 20% 미만' : ''} /></Card>
}
function AssetBlock({ r }: { r: R }) {
  return <Card title="자산 성장 추계"><D l={`자산 복리 (연 5%, ${r.yrs}년)`} v={ww(r.assetG)} /><D l="적립 + 복리 수익" v={ww(r.saveG)} /><D l={`퇴직금 (${r.yrs}년)`} v={ww(r.retAll)} /><Sep /><D l="은퇴 시 총자산" v={ww(r.total)} b />
    {r.proj.length > 2 && <table className="w-full text-[11px] mt-3"><thead><tr className="text-gray-400 border-b border-gray-50"><th className="text-left py-1 font-normal">연도</th><th className="text-left py-1 font-normal">나이</th><th className="text-right py-1 font-normal">자산</th></tr></thead><tbody>{r.proj.map((p, i) => <tr key={i} className={`border-t border-gray-50 ${i === r.proj.length-1 ? 'font-bold' : ''}`}><td className="py-1.5 text-gray-500 tabular-nums">{p.y}</td><td className="py-1.5 text-gray-500 tabular-nums">{p.age}세</td><td className="py-1.5 text-gray-900 text-right tabular-nums">{ww(p.v)}</td></tr>)}</tbody></table>}
  </Card>
}
function PensionBlock({ r }: { r: R }) {
  return <Card title="연금 + 은퇴 후 수입"><D l="국민연금 월 수령" v={ww(r.penM)} b /><D l="수령 시작" v="65세" sm /><D l="총 수령 (85세)" v={ww(r.penM * (LE - 65) * 12)} sm /><D l="전체 평균" v="월 67만원" sub="국민연금공단 2025" sm /><Sep /><D l="자산 인출/월" v={ww(r.fromAsset)} /><D l="국민연금/월" v={ww(r.penM)} /><Sep /><D l="월 가용 합계" v={ww(r.monthly)} b /></Card>
}
function BudgetBlock({ r }: { r: R }) {
  return <Card title="월간 지출 배분">{r.budget.map((b, i) => <div key={i} className="mb-2 last:mb-0"><div className="flex justify-between text-[11px] mb-0.5"><span className="text-gray-500">{b.c}</span><span className="text-gray-800 tabular-nums">{ww(b.a)} ({b.p}%)</span></div><div className="h-[4px] bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gray-800 rounded-full bar-anim" style={{width:`${b.p}%`,animationDelay:`${i*80}ms`}} /></div></div>)}</Card>
}
function RiskBlock({ r }: { r: R }) {
  return <Card title="물가 / 의료비 리스크">
    <D l="현재 가치" v={ww(r.monthly)} /><D l={`물가 반영 (${r.yrs}년 후)`} v={ww(r.inflAdj)} sub={`구매력 ${Math.round(r.inflAdj / r.monthly * 100)}%`} /><D l="은퇴 10년 후" v={ww(r.real10)} /><D l="은퇴 20년 후" v={ww(r.real20)} />
    {r.med.length > 0 && <><Sep /><p className="text-[10px] text-gray-400">연령대별 의료비</p>{r.med.map((m, i) => <div key={i} className="flex justify-between text-[11px]"><span className="text-gray-500">{m.age}</span><span className="text-gray-500 tabular-nums">연 {ww(m.ann)}</span><span className={`tabular-nums ${m.pct > 15 ? 'text-red-500' : 'text-gray-500'}`}>가용의 {m.pct}%</span></div>)}<D l="의료비 총 추정" v={ww(r.medT)} b /></>}
  </Card>
}
function ScenarioBlock({ r }: { r: R }) {
  return <Card title="추가 저축 시나리오"><table className="w-full text-[11px]"><thead><tr className="text-gray-400 border-b border-gray-100"><th className="text-left py-1.5 font-normal">추가/월</th><th className="text-right py-1.5 font-normal">월 가용</th><th className="text-right py-1.5 font-normal">증가</th><th className="text-center py-1.5 font-normal">등급</th></tr></thead><tbody>
    <tr className="border-b border-gray-50 font-medium"><td className="py-1.5 text-gray-400">현재</td><td className="py-1.5 text-right tabular-nums">{ww(r.monthly)}</td><td className="py-1.5 text-right text-gray-300">-</td><td className="py-1.5 text-center"><Bdg l={r.gr} /></td></tr>
    {r.sc.map((s, i) => <tr key={i} className={`border-b border-gray-50 ${s.gr !== r.gr ? 'bg-green-50/40' : ''}`}><td className="py-1.5 text-gray-500">+{s.add}만</td><td className="py-1.5 text-right tabular-nums font-medium">{ww(s.m)}</td><td className="py-1.5 text-right tabular-nums text-green-600">+{ww(s.diff)}</td><td className="py-1.5 text-center"><Bdg l={s.gr} glow={s.gr !== r.gr} /></td></tr>)}
  </tbody></table></Card>
}
function PeerBlock({ r, inp }: { r: R; inp: Input }) {
  const myA = inp.currentAssets * 1e4, avgA = S.asset[r.ag] || 5e8
  return <Card title={`${r.ag}대 동년배 비교`}>
    <div className="h-6 bg-gradient-to-r from-red-200 via-yellow-100 to-green-200 rounded-lg relative overflow-visible my-3">
      <div className="absolute top-0 h-full flex flex-col items-center" style={{ left: `${100 - r.pct}%`, transform: 'translateX(-50%)' }}><div className="w-px h-full bg-gray-900" /><span className="mt-1 text-[9px] font-bold bg-gray-900 text-white px-2 py-0.5 rounded whitespace-nowrap">상위 {r.pct}%</span></div>
    </div>
    <div className="flex justify-between text-[9px] text-gray-400 mb-3"><span>상위</span><span>하위</span></div>
    <div className="grid grid-cols-2 gap-2">
      <MC l={`${r.ag}대 평균 자산`} v={ww(avgA)} /><MC l="나의 자산" v={ww(myA)} c={myA >= avgA ? 'g' : 'r'} />
      <MC l="적정 생활비" v={ww(S.need)} s="KB금융 2025" /><MC l="나의 월 가용" v={ww(r.monthly)} c={r.monthly >= S.need ? 'g' : 'r'} />
    </div>
  </Card>
}

// ─── 공통 ───
function FI({ l, v, u, set, step = 1, min = 0, max, sub }: { l: string; v: number; u: string; set: (v: number) => void; step?: number; min?: number; max?: number; sub?: string }) {
  return <div><label className="block text-[11px] font-[600] text-gray-500 mb-1">{l}</label><div className="relative"><input type="number" value={v} onChange={e => set(+e.target.value)} step={step} min={min} max={max} className="w-full px-3 py-3.5 rounded-xl border border-gray-200 text-gray-900 text-[18px] font-[700] focus:ring-2 focus:ring-gray-900 outline-none pr-12 bg-white" /><span className="absolute right-3 top-4 text-[11px] text-gray-400">{u}</span></div>{sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}</div>
}
function Card({ title, children }: { title: string; children: React.ReactNode }) { return <div className="bg-white border border-gray-100 rounded-2xl p-5"><p className="text-[14px] font-[700] text-gray-900 mb-3">{title}</p><div className="space-y-1.5">{children}</div></div> }
function D({ l, v, b, sm, sub }: { l: string; v: string; b?: boolean; sm?: boolean; sub?: string }) { return <div className="flex justify-between gap-3"><div className="min-w-0"><p className={`${sm ? 'text-[11px] text-gray-400' : b ? 'text-[12px] font-[700] text-gray-900' : 'text-[11px] text-gray-600'}`}>{l}</p>{sub && <p className="text-[9px] text-gray-400">{sub}</p>}</div><p className={`shrink-0 tabular-nums ${b ? 'text-[13px] font-[800] text-gray-900' : sm ? 'text-[11px] text-gray-500' : 'text-[11px] text-gray-800 font-[500]'}`}>{v}</p></div> }
function Sep() { return <div className="border-t border-gray-100 my-1" /> }
function Bdg({ l, glow }: { l: string; glow?: boolean }) { const c: Record<string, string> = { S: 'bg-amber-500', A: 'bg-green-500', B: 'bg-blue-500', C: 'bg-orange-500', D: 'bg-red-500' }; return <span className={`inline-block w-5 h-5 ${c[l]} text-white rounded text-[9px] font-[800] leading-5 text-center ${glow ? 'ring-1 ring-green-300' : ''}`}>{l}</span> }
function MC({ l, v, s, c }: { l: string; v: string; s?: string; c?: 'g' | 'r' }) { return <div className={`rounded-xl p-3 ${c === 'g' ? 'bg-green-50 border border-green-100' : c === 'r' ? 'bg-red-50 border border-red-100' : 'bg-gray-50 border border-gray-100'}`}><p className="text-[9px] text-gray-500">{l}</p><p className={`text-[13px] font-[800] mt-0.5 ${c === 'g' ? 'text-green-700' : c === 'r' ? 'text-red-700' : 'text-gray-900'}`}>{v}</p>{s && <p className="text-[8px] text-gray-400">{s}</p>}</div> }
