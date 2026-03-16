'use client'

import { useState, useCallback } from 'react'
import { SajuResult, STEMS, ELEMENTS, STEM_ELEMENT } from './sajuEngine'
import { DAY_MASTER_PROFILES } from './sajuData'

interface Props {
  result: SajuResult
  cardRef: React.RefObject<HTMLDivElement | null>
}

export default function SajuShareButtons({ result, cardRef }: Props) {
  const [copyDone, setCopyDone] = useState(false)
  const [saving, setSaving] = useState(false)

  const profile = DAY_MASTER_PROFILES[result.dayMaster]
  const getShareUrl = useCallback(() => {
    const params = new URLSearchParams({
      y: String(result.birthYear),
      m: String(result.birthMonth),
      d: String(result.birthDay),
      h: result.birthHour !== null ? String(result.birthHour) : '',
      g: result.gender === 'male' ? 'm' : 'f',
    })
    return `${window.location.origin}/programs/saju-reading?${params.toString()}`
  }, [result])

  const handleCopyLink = async () => {
    try {
      const text = `${profile.emoji} 내 사주풀이 결과 보기:\n${getShareUrl()}`
      await navigator.clipboard.writeText(text)
      setCopyDone(true)
      setTimeout(() => setCopyDone(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = getShareUrl()
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopyDone(true)
      setTimeout(() => setCopyDone(false), 2000)
    }
  }

  const handleSaveImage = async () => {
    if (!cardRef.current || saving) return
    setSaving(true)

    try {
      // html2canvas 동적 import
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const html2canvas = (await import('html2canvas') as any).default

      // A4 사이즈 (150dpi 기준): 1240 x 1754 px
      const A4_WIDTH = 1240
      const A4_HEIGHT = 1754
      const PADDING = 60 // A4 내부 여백

      // 캡처 전: 애니메이션 opacity:0 → 1로 강제 변경 (html2canvas가 투명하게 캡처하는 문제 방지)
      const card = cardRef.current
      const animated = card.querySelectorAll('[style*="opacity"]') as NodeListOf<HTMLElement>
      const origStyles: string[] = []
      animated.forEach((el, i) => {
        origStyles[i] = el.style.cssText
        el.style.opacity = '1'
        el.style.transform = 'none'
        el.style.animation = 'none'
      })

      // 카드 캡처 - scale 2로 선명하게
      const capturedCanvas: HTMLCanvasElement = await html2canvas(card, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        windowWidth: card.scrollWidth,
        windowHeight: card.scrollHeight,
      })

      // 캡처 후: 원래 스타일 복원
      animated.forEach((el, i) => {
        if (origStyles[i]) el.style.cssText = origStyles[i]
      })

      // A4 비율 캔버스 생성
      const a4Canvas = document.createElement('canvas')
      a4Canvas.width = A4_WIDTH
      a4Canvas.height = A4_HEIGHT
      const ctx = a4Canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context 생성 실패')

      // 흰색 배경
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT)

      // 캡처된 카드를 A4 안에 맞춰서 그리기 (비율 유지)
      const availW = A4_WIDTH - PADDING * 2
      const availH = A4_HEIGHT - PADDING * 2
      const srcW = capturedCanvas.width
      const srcH = capturedCanvas.height
      const scaleRatio = Math.min(availW / srcW, availH / srcH, 1)
      const drawW = srcW * scaleRatio
      const drawH = srcH * scaleRatio

      // 수평 중앙, 수직 약간 위쪽에 배치
      const drawX = (A4_WIDTH - drawW) / 2
      const drawY = PADDING + (availH - drawH) * 0.3

      ctx.drawImage(capturedCanvas, drawX, drawY, drawW, drawH)

      // 하단 워터마크
      ctx.fillStyle = '#aaaaaa'
      ctx.font = '18px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('nohu-lab.vercel.app', A4_WIDTH / 2, A4_HEIGHT - 30)

      // 파일명
      const filename = `사주풀이_${STEMS[result.dayMaster]}${ELEMENTS[STEM_ELEMENT[result.dayMaster]]}.png`

      // Blob 변환 후 다운로드 (dataURL보다 메모리 효율적)
      const blob = await new Promise<Blob>((resolve, reject) => {
        a4Canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Blob 변환 실패'))),
          'image/png',
        )
      })

      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)

      // 모바일: navigator.share 시도
      if (isMobile && navigator.share) {
        try {
          const file = new File([blob], filename, { type: 'image/png' })
          await navigator.share({ files: [file], title: '사주풀이 결과' })
          return
        } catch {
          // share 실패 시 아래 다운로드로 fallback
        }
      }

      // PC + 모바일 공통: Blob URL로 다운로드
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = filename
      link.href = url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch {
      alert('이미지 저장에 실패했습니다.\n길게 눌러서 스크린샷을 이용해주세요.')
    } finally {
      setSaving(false)
    }
  }

  const handleKakao = () => {
    const w = window as typeof window & { Kakao?: { isInitialized: () => boolean; init: (key: string) => void; Share: { sendDefault: (obj: Record<string, unknown>) => void } } }
    if (!w.Kakao) {
      handleCopyLink()
      return
    }
    if (!w.Kakao.isInitialized()) {
      w.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_KEY || '')
    }
    try {
      w.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `${profile.emoji} 나의 사주풀이 결과`,
          description: '나도 사주풀이 해보기!',
          imageUrl: 'https://nohu-lab.vercel.app/og-saju.png',
          link: { mobileWebUrl: getShareUrl(), webUrl: getShareUrl() },
        },
        buttons: [
          { title: '나도 사주풀이 하기', link: { mobileWebUrl: getShareUrl(), webUrl: getShareUrl() } },
        ],
      })
    } catch {
      handleCopyLink()
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-gray-500">친구에게 공유하고 함께 비교해보세요!</p>
      <div className="flex gap-2">
        <button
          onClick={handleCopyLink}
          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
        >
          {copyDone ? '✅ 복사됨!' : '🔗 링크 복사'}
        </button>
        <button
          onClick={handleSaveImage}
          disabled={saving}
          className="flex-1 py-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? '⏳ 저장 중...' : '📷 이미지 저장'}
        </button>
        <button
          onClick={handleKakao}
          className="flex-1 py-3 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
        >
          💬 카카오톡
        </button>
      </div>
    </div>
  )
}
