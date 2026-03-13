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
    const W = 700, H = 920, sc = 2
    const c = document.createElement('canvas'); c.width = W * sc; c.height = H * sc
    const x = c.getContext('2d')!; x.scale(sc, sc)
    const L = 40, R2 = W - 40, CW = R2 - L
    const gc: Record<string, string> = { S: '#f59e0b', A: '#22c55e', B: '#3b82f6', C: '#f97316', D: '#ef4444' }
    const col = gc[r.gr] || '#888'
    const line = (yy: number) => { x.strokeStyle = '#e0e0e0'; x.lineWidth = 1; x.beginPath(); x.moveTo(L, yy); x.lineTo(R2, yy); x.stroke() }
    const wrap = (text: string, yy: number, mw: number, fs = 13) => {
      x.font = `400 ${fs}px system-ui`; let ln = '', ly = yy
      for (const ch of text) { const t = ln + ch; if (x.measureText(t).width > mw) { x.fillText(ln, L, ly); ly += fs + 5; ln = ch } else ln = t }
      if (ln) x.fillText(ln, L, ly); return ly
    }

    // 배경
    x.fillStyle = '#fafafa'; x.fillRect(0, 0, W, H)

    // 헤더
    x.fillStyle = '#999'; x.font = '300 11px system-ui'; x.fillText('노후연구소 | ' + P.updated + ' 실제 물가 기준', L, 30)
    x.fillStyle = '#111'; x.font = '900 24px system-ui'; x.fillText('은퇴 후, 당신의 어느 하루', L, 62)

    // 등급 뱃지
    x.fillStyle = col; x.beginPath(); x.roundRect(R2 - 50, 18, 50, 50, 10); x.fill()
    x.fillStyle = '#fff'; x.font = '900 28px system-ui'; x.textAlign = 'center'; x.fillText(r.gr, R2 - 25, 50); x.textAlign = 'left'

    // 별명 + 월 가용
    x.fillStyle = col; x.font = '700 14px system-ui'; x.fillText(`"${r.nickname}"`, L, 88)
    x.fillStyle = '#888'; x.font = '400 12px system-ui'; x.fillText(`${r.grN} | 월 ${ww(r.monthly)} | 한 끼 ${ww(r.perMeal)}`, L, 106)

    let y = 120; line(y); y += 20

    // 하루 타임라인
    type CS = { t: string; e: string; c: number; ok: boolean }
    const slots: CS[] = (() => {
      const mo = r.monthly
      if (mo >= 4e6) return [
        { t: '07:00', e: `카페 아메리카노 ${ww(P.americano)}`, c: P.americano, ok: true },
        { t: '09:00', e: '문화센터 수영 80,000원/월', c: 80000, ok: true },
        { t: '12:00', e: `시장 칼국수 ${ww(P.gukbap)}`, c: P.gukbap, ok: true },
        { t: '15:00', e: '손주 간식 5,000원', c: 5000, ok: true },
        { t: '18:00', e: '마트 삼겹살 20,000원', c: 20000, ok: true },
      ]
      if (mo >= 3e6) return [
        { t: '07:00', e: '커피믹스 200원', c: 200, ok: true },
        { t: '09:00', e: '뒷산 등산 (무료)', c: 0, ok: true },
        { t: '12:00', e: '집에서 김치찌개 3,000원', c: 3000, ok: true },
        { t: '15:00', e: '도서관 (에어컨 무료)', c: 0, ok: true },
        { t: '18:00', e: '이마트 할인 장보기 15,000원', c: 15000, ok: true },
      ]
      if (mo >= 2e6) return [
        { t: '07:00', e: '밥 + 김치 1,000원', c: 1000, ok: true },
        { t: '12:00', e: '남은 밥에 계란 후라이 1,500원', c: 1500, ok: true },
        { t: '15:00', e: '혈압약... 병원비 9,000원 무섭다', c: 9000, ok: false },
        { t: '18:00', e: '마감할인 반찬 5,000원', c: 5000, ok: true },
        { t: '21:00', e: '경조사 축의금 10만원... 이달 마이너스', c: 100000, ok: false },
      ]
      if (mo >= 15e5) return [
        { t: '07:00', e: '계란 2개, 아껴야 한다 600원', c: 600, ok: true },
        { t: '12:00', e: '경로식당 2,000원', c: 2000, ok: true },
        { t: '15:00', e: '혈압약 떨어졌다. 참는다', c: 0, ok: false },
        { t: '18:00', e: `라면 한 봉지 ${ww(P.ramen)}`, c: P.ramen, ok: true },
        { t: '21:00', e: '난방 안 튼다. 이불 속으로', c: 0, ok: false },
      ]
      return [
        { t: '07:00', e: '간장 비빔밥 (반찬 없다)', c: 500, ok: false },
        { t: '12:00', e: '무료급식소 줄 서기', c: 0, ok: false },
        { t: '15:00', e: '전기세 35,000원 고지서', c: 35000, ok: false },
        { t: '18:00', e: '폐기 직전 도시락 2,000원', c: 2000, ok: false },
        { t: '21:00', e: '아들한테 전화할까... 말까', c: 0, ok: false },
      ]
    })()

    slots.forEach(s => {
      x.fillStyle = '#aaa'; x.font = '500 11px system-ui'; x.fillText(s.t, L, y)
      x.fillStyle = s.ok ? '#333' : '#dc2626'; x.font = `${s.ok ? '400' : '600'} 13px system-ui`; x.fillText(s.e, L + 55, y)
      if (!s.ok) { x.fillStyle = '#fecaca'; x.beginPath(); x.roundRect(L + 50, y - 12, CW - 50, 18, 4); x.fill(); x.fillStyle = '#dc2626'; x.font = '600 13px system-ui'; x.fillText(s.e, L + 55, y) }
      y += 28
    })
    y += 4; line(y); y += 20

    // 한 줄 핵심
    const ck = Math.floor(r.monthly / P.chicken)
    x.fillStyle = '#111'; x.font = '800 16px system-ui'; x.fillText(`한 끼 ${ww(r.perMeal)}`, L, y)
    x.fillStyle = '#888'; x.font = '400 13px system-ui'; x.fillText(`치킨 ${ck}마리/월 | ${r.ag}대 상위 ${r.pct}%`, L + 160, y)
    y += 12; line(y); y += 18

    // 종합 진단
    x.fillStyle = col; x.font = '700 14px system-ui'; x.fillText('종합 진단', L, y); y += 18
    const gap = S.need - r.monthly
    let diag: string
    if (r.gr === 'S') diag = `여유 있는 노후. 카페 커피도 마시고, 외식도 됩니다. 물가 상승(구매력 ${Math.round(r.inflAdj / r.monthly * 100)}%)만 대비하세요.`
    else if (r.gr === 'A') diag = `먹고 사는 건 됩니다. 하지만 경조사 겹치면 빠듯. 월 ${ww(gap > 0 ? gap : 0)} 더 모으면 안심.`
    else if (r.gr === 'B') diag = `밥은 먹지만 병원비 한 번이면 그 달은 끝. 적정 생활비 대비 ${ww(gap)} 부족.`
    else if (r.gr === 'C') diag = `끼니를 거르는 날이 생깁니다. 난방비 아끼려고 이불 속에서 버팁니다. 월 ${ww(gap)} 추가 저축 시급.`
    else diag = `삼시세끼 해결이 안 됩니다. 국민연금 ${ww(r.penM)}으로는 공과금 내면 끝.`
    x.fillStyle = '#444'; y = wrap(diag, y, CW, 13) + 14

    // 처방 한 줄
    x.fillStyle = col; x.font = '600 12px system-ui'
    if (r.gr !== 'S') x.fillText(`은퇴까지 ${r.yrs}년. ${r.sr < 20 ? `저축률 ${r.sr}%→20%.` : ''} 지금이 복리 극대화 구간.`, L, y)
    else x.fillText(`은퇴까지 ${r.yrs}년. 인플레이션 대비 투자 유지하세요.`, L, y)

    // 하단 CTA
    const by = H - 60
    x.fillStyle = '#03C75A'; x.beginPath(); x.roundRect(L, by, CW, 36, 10); x.fill()
    x.fillStyle = '#fff'; x.font = '700 12px system-ui'; x.textAlign = 'center'
    x.fillText('나도 체험해보기  nohu-lab.vercel.app', W / 2, by + 22); x.textAlign = 'left'
    x.fillStyle = '#999'; x.font = '400 10px system-ui'; x.textAlign = 'center'
    x.fillText('노후연구소 카페  cafe.naver.com/eovhskfktmak', W / 2, H - 12); x.textAlign = 'left'

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
    const txt = `[은퇴 후 하루 체험]\n\n${result.gr}등급 "${result.nickname}"\n은퇴 후 한 끼: ${ww(result.perMeal)}\n치킨 ${ck}마리/월 | ${result.ag}대 상위 ${result.pct}%\n\n나도 체험해보기: ${url}\n\n노후연구소 카페\ncafe.naver.com/eovhskfktmak`
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
    const txt = `[은퇴 후 하루 체험]\n\n${result.gr}등급 "${result.nickname}"\n은퇴 후 한 끼: ${ww(result.perMeal)}\n치킨 ${ck}마리 | 국밥 ${gb}그릇/월\n\n나도 체험: ${url}\n노후연구소 카페: cafe.naver.com/eovhskfktmak`
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
        <h2 className="text-[26px] font-[900] text-gray-900 leading-tight">은퇴 후,<br/>당신의 하루를<br/>체험해 보세요</h2>
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
  const m = r.monthly
  const chicken = Math.floor(m / P.chicken)

  // 하루 타임라인 생성
  type Slot = { time: string; icon: string; text: string; cost: number; ok: boolean }
  const day: Slot[] = (() => {
    if (m >= 4e6) return [
      { time: '07:00', icon: '☕', text: `동네 카페 아메리카노`, cost: P.americano, ok: true },
      { time: '09:00', icon: '🏊', text: '문화센터 수영', cost: 80000, ok: true },
      { time: '12:00', icon: '🍲', text: `시장 칼국수`, cost: P.gukbap, ok: true },
      { time: '15:00', icon: '👶', text: '손주 간식 사주기', cost: 5000, ok: true },
      { time: '18:00', icon: '🥩', text: `마트에서 삼겹살`, cost: 20000, ok: true },
      { time: '21:00', icon: '📺', text: 'TV + 맥주 한 캔', cost: 3000, ok: true },
    ]
    if (m >= 3e6) return [
      { time: '07:00', icon: '☕', text: '커피믹스 한 잔', cost: 200, ok: true },
      { time: '09:00', icon: '⛰️', text: '뒷산 등산 (무료)', cost: 0, ok: true },
      { time: '12:00', icon: '🍚', text: '집에서 김치찌개', cost: 3000, ok: true },
      { time: '15:00', icon: '📚', text: '도서관 (에어컨 무료)', cost: 0, ok: true },
      { time: '18:00', icon: '🛒', text: `이마트 저녁할인 장보기`, cost: 15000, ok: true },
      { time: '21:00', icon: '📺', text: '넷플릭스 (아들 계정)', cost: 0, ok: true },
    ]
    if (m >= 2e6) return [
      { time: '07:00', icon: '🍚', text: '밥 + 어제 남은 김치', cost: 1000, ok: true },
      { time: '09:00', icon: '🚶', text: '아파트 단지 산책', cost: 0, ok: true },
      { time: '12:00', icon: '🍳', text: '남은 밥에 계란 후라이', cost: 1500, ok: true },
      { time: '15:00', icon: '💊', text: `혈압약 (이번 달 병원비 무섭다)`, cost: 9000, ok: false },
      { time: '18:00', icon: '🏷️', text: '마감할인 30% 반찬', cost: 5000, ok: true },
      { time: '21:00', icon: '💸', text: `경조사 축의금 10만원... 이달 마이너스`, cost: 100000, ok: false },
    ]
    if (m >= 15e5) return [
      { time: '07:00', icon: '🥚', text: '계란 2개 (아껴야 한다)', cost: 600, ok: true },
      { time: '09:00', icon: '🏠', text: '나가면 돈 든다. 집에 있는다', cost: 0, ok: true },
      { time: '12:00', icon: '🍜', text: `경로식당 2,000원`, cost: 2000, ok: true },
      { time: '15:00', icon: '💊', text: '혈압약 떨어졌다. 참는다', cost: 0, ok: false },
      { time: '18:00', icon: '🍜', text: `라면 한 봉지 ${ww(P.ramen)}`, cost: P.ramen, ok: true },
      { time: '21:00', icon: '🥶', text: '난방 안 튼다. 이불 속으로', cost: 0, ok: false },
    ]
    return [
      { time: '07:00', icon: '🍚', text: '간장 비빔밥 (반찬 없다)', cost: 500, ok: false },
      { time: '09:00', icon: '🛏️', text: '보일러 못 켠다. 이불 속', cost: 0, ok: false },
      { time: '12:00', icon: '🍱', text: '무료급식소 줄 서기', cost: 0, ok: false },
      { time: '15:00', icon: '📄', text: '전기세 35,000원 고지서', cost: 35000, ok: false },
      { time: '18:00', icon: '🍱', text: '폐기 직전 도시락 2,000원', cost: 2000, ok: false },
      { time: '21:00', icon: '📱', text: '아들한테 전화할까... 말까', cost: 0, ok: false },
    ]
  })()
  const dayTotal = day.reduce((s, d) => s + d.cost, 0)

  return (
    <div className="max-w-[440px] mx-auto px-4">
      <style>{CSS}</style>

      {/* 헤더: 등급 + 별명 + 한 줄 */}
      <div className="text-center pt-2 pb-4">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-[900] text-[18px]" style={{ backgroundColor: r.grC }}>{r.gr}</div>
          <div className="text-left">
            <p className="text-[14px] font-[800] text-gray-900">"{r.nickname}"</p>
            <p className="text-[10px] text-gray-500">{r.grN} | 월 {ww(m)}</p>
          </div>
        </div>
      </div>

      {/* 하루 타임라인 */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-[14px] font-[800] text-gray-900">은퇴 후, 당신의 어느 하루</p>
          <p className="text-[10px] text-gray-400">{P.updated} 실제 물가 기준 | 하루 예산 {ww(r.daily)}</p>
        </div>
        <div className="divide-y divide-gray-50">
          {day.map((s, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 ${!s.ok ? 'bg-red-50/50' : ''}`}>
              <div className="text-[10px] text-gray-400 w-10 shrink-0 tabular-nums font-mono">{s.time}</div>
              <div className="text-[20px] shrink-0">{s.icon}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-[600] ${s.ok ? 'text-gray-800' : 'text-red-700'}`}>{s.text}</p>
              </div>
              {s.cost > 0 && <p className={`text-[11px] shrink-0 tabular-nums font-[600] ${s.ok ? 'text-gray-500' : 'text-red-500'}`}>{s.cost >= 10000 ? ww(s.cost) : `${s.cost.toLocaleString()}원`}</p>}
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-[11px] text-gray-500">오늘 하루 지출</span>
          <span className={`text-[14px] font-[800] ${dayTotal > r.daily ? 'text-red-600' : 'text-gray-900'}`}>{ww(dayTotal)} {dayTotal > r.daily ? '(예산 초과!)' : ''}</span>
        </div>
      </div>

      {/* 한 줄 요약 */}
      <div className="mt-3 bg-white border border-gray-200 rounded-2xl p-4">
        <div className="flex items-baseline gap-2 justify-center">
          <span className="text-[11px] text-gray-500">한 끼</span>
          <span className="text-[24px] font-[900]" style={{ color: r.grC }}>{ww(r.perMeal)}</span>
          <span className="text-[11px] text-gray-400">|</span>
          <span className="text-[11px] text-gray-500">치킨</span>
          <span className="text-[18px] font-[800] text-gray-900">{chicken}마리</span>
          <span className="text-[11px] text-gray-400">/ 월</span>
        </div>
        <p className="text-[11px] text-gray-500 text-center mt-2">{r.ag}대 상위 {r.pct}% | 준비도 {r.fi}% | 은퇴 시 자산 {w(r.total)}</p>
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
          결과 공유하기
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
