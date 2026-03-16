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

  /** sm: breakpoint 클래스를 강제 활성화 (클론 전용) */
  const activateSmBreakpoint = (clone: HTMLElement) => {
    try {
      const allEls = [clone, ...Array.from(clone.querySelectorAll('*'))] as HTMLElement[]
      for (const node of allEls) {
        const classes = Array.from(node.classList)
        for (const cls of classes) {
          if (cls === 'hidden' && classes.some(c => c === 'sm:block' || c === 'sm:flex' || c === 'sm:grid' || c === 'sm:inline')) {
            node.style.display = ''
            node.classList.remove('hidden')
          }
        }
      }
    } catch {
      // continue
    }
  }

  /** Blob URL로 다운로드 (모바일 호환성 향상) */
  const downloadBlob = (canvas: HTMLCanvasElement, filename: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error('Blob 생성 실패')); return }
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = filename
        link.href = url
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        // 약간의 딜레이 후 정리
        setTimeout(() => {
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          resolve()
        }, 200)
      }, 'image/png')
    })
  }

  const handleSaveImage = async () => {
    if (!cardRef.current || saving) return
    setSaving(true)

    const CONTENT_WIDTH = A4_WIDTH - 64  // 730px (좌우 패딩 32px씩)
    const CONTENT_MAX_HEIGHT = A4_HEIGHT - 64  // 1059px (상하 패딩 32px씩)
    let container: HTMLElement | null = null

    try {
      // html2canvas 동적 import (에러 시 구체적 메시지)
      let html2canvas: (el: HTMLElement, opts?: Record<string, unknown>) => Promise<HTMLCanvasElement>
      try {
        const mod = await import('html2canvas')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        html2canvas = (mod as any).default || mod
      } catch (importErr) {
        throw new Error(`html2canvas 로드 실패: ${importErr instanceof Error ? importErr.message : String(importErr)}`)
      }

      // 1) 카드 클론 생성
      const clone = cardRef.current.cloneNode(true) as HTMLElement
      clone.style.width = `${CONTENT_WIDTH}px`
      clone.style.maxWidth = `${CONTENT_WIDTH}px`
      clone.style.minWidth = `${CONTENT_WIDTH}px`
      clone.style.margin = '0'
      clone.style.padding = clone.style.padding || '0'
      clone.style.transform = 'none'
      clone.style.boxSizing = 'border-box'
      clone.style.overflow = 'visible'

      // sm: breakpoint 강제 활성화
      activateSmBreakpoint(clone)

      // 2) 측정용 offscreen wrapper
      const measureWrapper = document.createElement('div')
      measureWrapper.style.position = 'absolute'
      measureWrapper.style.left = '-9999px'
      measureWrapper.style.top = '0'
      measureWrapper.style.width = `${CONTENT_WIDTH}px`
      measureWrapper.style.overflow = 'visible'
      measureWrapper.style.backgroundColor = '#ffffff'
      measureWrapper.appendChild(clone)
      document.body.appendChild(measureWrapper)

      // 레이아웃 안정화 대기
      await new Promise(r => setTimeout(r, 400))

      // 3) 실제 콘텐츠 높이 측정
      const realHeight = clone.scrollHeight

      // 4) A4 최종 컨테이너 생성
      container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.top = '0'
      container.style.width = `${A4_WIDTH}px`
      container.style.height = `${A4_HEIGHT}px`
      container.style.overflow = 'hidden'
      container.style.backgroundColor = '#ffffff'
      container.style.boxSizing = 'border-box'
      container.style.padding = '32px'

      // measureWrapper에서 clone 분리 후 container에 이동
      measureWrapper.removeChild(clone)
      document.body.removeChild(measureWrapper)

      // 5) 콘텐츠가 A4를 초과하면 scale 축소
      if (realHeight > CONTENT_MAX_HEIGHT) {
        const scale = CONTENT_MAX_HEIGHT / realHeight
        clone.style.transformOrigin = 'top left'
        clone.style.transform = `scale(${scale})`
        // scale 후에도 원래 width 유지 (scale이 시각적으로만 줄이므로)
      }

      container.appendChild(clone)
      document.body.appendChild(container)

      // scale 적용 후 레이아웃 안정화
      await new Promise(r => setTimeout(r, 200))

      // 6) html2canvas 캡처
      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
      const captureScale = isMobile ? 1.5 : 2

      const canvas = await html2canvas(container, {
        scale: captureScale,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        allowTaint: true,
        width: A4_WIDTH,
        height: A4_HEIGHT,
        windowWidth: A4_WIDTH,
        windowHeight: A4_HEIGHT,
      })

      // 컨테이너 정리
      document.body.removeChild(container)
      container = null

      // 7) 파일명
      const filename = `사주풀이_${STEMS[result.dayMaster]}${ELEMENTS[STEM_ELEMENT[result.dayMaster]]}.png`

      // 8) 모바일 처리
      if (isMobile) {
        let shared = false

        // Web Share API 시도
        if (navigator.share && navigator.canShare) {
          try {
            const blob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob((b) => b ? resolve(b) : reject(new Error('blob fail')), 'image/png')
            })
            const file = new File([blob], filename, { type: 'image/png' })
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], title: '사주풀이 결과' })
              shared = true
            }
          } catch {
            // Share 취소 또는 실패 — fallback으로
          }
        }

        if (!shared) {
          // Blob URL 방식 다운로드 (data URL보다 모바일 호환성 좋음)
          try {
            await downloadBlob(canvas, filename)
          } catch {
            // 최후 수단: 새 탭에서 이미지 열기
            const dataUrl = canvas.toDataURL('image/png')
            const newTab = window.open()
            if (newTab) {
              newTab.document.write(`<html><head><title>사주풀이 결과</title>
                <meta name="viewport" content="width=device-width,initial-scale=1">
                <style>body{margin:0;display:flex;justify-content:center;background:#fff;min-height:100vh;padding:16px}img{max-width:100%;height:auto}</style>
                </head><body><img src="${dataUrl}" alt="사주풀이 결과" /></body></html>`)
              newTab.document.close()
            }
          }
        }

        setSaving(false)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        return
      }

      // 9) 데스크톱: Blob URL 다운로드
      await downloadBlob(canvas, filename)

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      alert(`이미지 저장 실패: ${msg}\n스크린샷을 이용해주세요.`)
    } finally {
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
