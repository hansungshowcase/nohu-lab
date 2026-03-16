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
  const [saveSuccess, setSaveSuccess] = useState(false)

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

  /** Expand sm: breakpoint by injecting an iframe-like viewport context.
   *  Instead of trying to add Tailwind class names (which won't have matching CSS rules),
   *  we set the container width to 794px so that CSS media queries naturally activate. */
  const activateSmBreakpoint = (clone: HTMLElement) => {
    try {
      const allEls = [clone, ...Array.from(clone.querySelectorAll('*'))] as HTMLElement[]
      for (const node of allEls) {
        // Remove any explicit 'hidden' that should only apply on mobile via sm:block pattern
        const classes = Array.from(node.classList)
        for (const cls of classes) {
          if (cls === 'hidden' && classes.some(c => c === 'sm:block' || c === 'sm:flex' || c === 'sm:grid' || c === 'sm:inline')) {
            node.style.display = ''
            node.classList.remove('hidden')
          }
        }
      }
    } catch {
      // If anything goes wrong with class manipulation, continue without it
    }
  }

  const handleSaveImage = async () => {
    if (!cardRef.current || saving) return
    setSaving(true)

    let container: HTMLElement | null = null

    try {
      const html2canvas = (await import('html2canvas')).default

      // Clone card into an off-screen A4-sized container for consistent capture
      container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.top = '0'
      container.style.width = `${A4_WIDTH}px`
      container.style.minHeight = `${A4_HEIGHT}px`
      container.style.backgroundColor = '#ffffff'
      container.style.display = 'flex'
      container.style.flexDirection = 'column'
      container.style.alignItems = 'center'
      container.style.justifyContent = 'center'
      container.style.padding = '32px'
      container.style.boxSizing = 'border-box'

      const clone = cardRef.current.cloneNode(true) as HTMLElement
      clone.style.width = `${A4_WIDTH - 64}px`
      clone.style.maxWidth = `${A4_WIDTH - 64}px`
      clone.style.transform = 'none'
      clone.style.margin = '0'

      // Apply sm: breakpoint overrides
      activateSmBreakpoint(clone)

      container.appendChild(clone)
      document.body.appendChild(container)

      // Wait for layout to settle
      await new Promise(r => setTimeout(r, 300))

      // If content overflows A4 height, use CSS transform scale to fit
      const contentHeight = container.scrollHeight
      if (contentHeight > A4_HEIGHT) {
        const scaleFactor = A4_HEIGHT / contentHeight
        clone.style.transformOrigin = 'top center'
        clone.style.transform = `scale(${scaleFactor})`
        // Wait for re-layout after scale
        await new Promise(r => setTimeout(r, 100))
      }

      const captureHeight = Math.max(A4_HEIGHT, Math.min(container.scrollHeight, A4_HEIGHT))
      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
      const captureScale = isMobile ? 1.5 : 2

      const canvas = await html2canvas(container, {
        scale: captureScale,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        allowTaint: true,
        width: A4_WIDTH,
        height: captureHeight,
        windowWidth: A4_WIDTH,
        windowHeight: captureHeight,
      })

      // Clean up container before processing result
      document.body.removeChild(container)
      container = null

      const dataUrl = canvas.toDataURL('image/png')

      // Mobile: try Web Share API, then fallback
      if (isMobile) {
        let shared = false
        if (navigator.share && navigator.canShare) {
          try {
            const res = await fetch(dataUrl)
            const blob = await res.blob()
            const file = new File([blob], 'saju-result.png', { type: 'image/png' })
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], title: '사주풀이 결과' })
              shared = true
            }
          } catch {
            // Share was cancelled or failed — fall through to fallback
          }
        }

        if (!shared) {
          // Fallback: download via anchor tag (works on most mobile browsers)
          try {
            const link = document.createElement('a')
            link.download = 'saju-result.png'
            link.href = dataUrl
            link.style.display = 'none'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          } catch {
            // Last resort: open image in new tab
            const newTab = window.open()
            if (newTab) {
              newTab.document.write(`
                <html><head><title>사주풀이 결과</title>
                <meta name="viewport" content="width=device-width,initial-scale=1">
                <style>body{margin:0;display:flex;justify-content:center;align-items:flex-start;background:#fff;min-height:100vh;padding:16px}img{max-width:100%;height:auto;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1)}</style>
                </head><body>
                <img src="${dataUrl}" alt="사주풀이 결과" />
                </body></html>
              `)
              newTab.document.close()
            }
          }
        }

        setSaving(false)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        return
      }

      // Desktop: download PNG
      const link = document.createElement('a')
      link.download = `사주풀이_${STEMS[result.dayMaster]}${ELEMENTS[STEM_ELEMENT[result.dayMaster]]}.png`
      link.href = dataUrl
      link.click()

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      alert('이미지 저장에 실패했습니다. 스크린샷을 이용해주세요.')
    } finally {
      // Ensure container is always cleaned up
      if (container && container.parentNode) {
        container.parentNode.removeChild(container)
      }
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
          {saving ? '⏳ A4 이미지 생성 중...' : saveSuccess ? '✅ 저장 완료!' : '📷 이미지 저장'}
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
