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

      // 카드를 직접 캡처 (클론 없이, 가장 안정적)
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      })

      // 파일명
      const filename = `사주풀이_${STEMS[result.dayMaster]}${ELEMENTS[STEM_ELEMENT[result.dayMaster]]}.png`

      // data URL → 다운로드
      const dataUrl = canvas.toDataURL('image/png')
      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)

      if (isMobile && navigator.share) {
        try {
          const blob = await (await fetch(dataUrl)).blob()
          const file = new File([blob], filename, { type: 'image/png' })
          await navigator.share({ files: [file], title: '사주풀이 결과' })
          return
        } catch { /* fallback */ }
      }

      // PC + 모바일 공통: <a> 태그로 다운로드
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      // 실패 시 스크린샷 안내
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
