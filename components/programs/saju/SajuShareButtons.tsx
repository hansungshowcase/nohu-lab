'use client'

import { useState, useCallback } from 'react'
import { SajuResult, STEMS, ELEMENTS, STEM_ELEMENT } from './sajuEngine'
import { DAY_MASTER_PROFILES } from './sajuData'

interface Props {
  result: SajuResult
  cardRef: React.RefObject<HTMLDivElement | null>
}

// A4: 210mm × 297mm, at 96dpi = 794 × 1123px
const A4_WIDTH = 794
const A4_HEIGHT = 1123

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
      const html2canvas = (await import('html2canvas')).default

      // Clone card into an off-screen A4-sized container for consistent capture
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.top = '0'
      container.style.width = `${A4_WIDTH}px`
      container.style.minHeight = `${A4_HEIGHT}px`
      container.style.backgroundColor = '#f5f3ff'
      container.style.display = 'flex'
      container.style.flexDirection = 'column'
      container.style.alignItems = 'center'
      container.style.justifyContent = 'center'
      container.style.padding = '32px'
      container.style.boxSizing = 'border-box'

      const clone = cardRef.current.cloneNode(true) as HTMLElement
      clone.style.width = `${A4_WIDTH - 64}px`  // 730px with 32px padding each side
      clone.style.maxWidth = `${A4_WIDTH - 64}px`
      clone.style.transform = 'none'
      clone.style.margin = '0'

      container.appendChild(clone)
      document.body.appendChild(container)

      // Wait for layout to settle
      await new Promise(r => setTimeout(r, 150))

      const canvas = await (html2canvas as Function)(container, {
        scale: 2,  // 2x for high-res output (1588 × 2246)
        backgroundColor: '#f5f3ff',
        useCORS: true,
        logging: false,
        allowTaint: true,
        width: A4_WIDTH,
        height: Math.max(A4_HEIGHT, container.scrollHeight),
        windowWidth: A4_WIDTH,
        windowHeight: Math.max(A4_HEIGHT, container.scrollHeight),
      })

      document.body.removeChild(container)

      const dataUrl = canvas.toDataURL('image/png')

      // Mobile: Web Share API first, then fallback to new tab
      if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
        if (navigator.share) {
          try {
            const blob = await (await fetch(dataUrl)).blob()
            const file = new File([blob], 'saju-result.png', { type: 'image/png' })
            await navigator.share({ files: [file], title: '사주풀이 결과' })
            setSaving(false)
            return
          } catch { /* fallback below */ }
        }
        // Fallback: open in new tab for screenshot
        const newTab = window.open()
        if (newTab) {
          newTab.document.write(`
            <html><head><title>사주풀이 결과</title>
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <style>body{margin:0;display:flex;justify-content:center;align-items:flex-start;background:#f5f3ff;min-height:100vh;padding:16px}img{max-width:100%;height:auto;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1)}</style>
            </head><body>
            <img src="${dataUrl}" alt="사주풀이 결과" />
            </body></html>
          `)
          newTab.document.close()
        }
        setSaving(false)
        return
      }

      // Desktop: download PNG
      const link = document.createElement('a')
      link.download = `사주풀이_${STEMS[result.dayMaster]}${ELEMENTS[STEM_ELEMENT[result.dayMaster]]}.png`
      link.href = dataUrl
      link.click()
    } catch (e) {
      alert('이미지 저장에 실패했습니다. 스크린샷을 이용해주세요.')
    }
    setSaving(false)
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
          {saving ? '⏳ A4 이미지 생성 중...' : '📷 이미지 저장'}
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
