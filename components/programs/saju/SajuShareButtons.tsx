'use client'

import { useState, useCallback } from 'react'
import { SajuResult, STEMS, ELEMENTS, STEM_ELEMENT } from './sajuEngine'
import { DAY_MASTER_PROFILES, getViralSummary } from './sajuData'

interface Props {
  result: SajuResult
  cardRef: React.RefObject<HTMLDivElement | null>
}

export default function SajuShareButtons({ result, cardRef }: Props) {
  const [copyDone, setCopyDone] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const profile = DAY_MASTER_PROFILES[result.dayMaster]
  const viral = getViralSummary(result.dayMaster, result.isDayMasterStrong)

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
      const text = `${profile.emoji} ${viral}\n\n내 사주풀이 결과 보기:\n${getShareUrl()}`
      await navigator.clipboard.writeText(text)
      setCopyDone(true)
      setTimeout(() => setCopyDone(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = `${profile.emoji} ${viral}\n\n내 사주풀이 결과 보기:\n${getShareUrl()}`
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
      const { toPng } = await import('html-to-image')
      const node = cardRef.current

      // html-to-image 알려진 버그: 첫 호출은 폰트/스타일 로딩 전 렌더링됨
      // 해결: 2~3번 호출하여 안정적인 결과 확보
      const options = {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        skipAutoScale: true,
        filter: (el: HTMLElement) => {
          // no-print 클래스 요소 제외
          if (el.classList?.contains('no-print')) return false
          return true
        },
      }

      // 워밍업 호출 (폰트/이미지 로딩 대기)
      await toPng(node, options).catch(() => {})
      // 실제 렌더링 (2번째 호출은 안정적)
      await new Promise(r => setTimeout(r, 300))
      const dataUrl = await toPng(node, options)

      // dataUrl 유효성 확인
      if (!dataUrl || !dataUrl.startsWith('data:image/png')) {
        throw new Error('Invalid PNG data')
      }

      // data URL → Blob 변환 (더 안정적인 다운로드)
      const res = await fetch(dataUrl)
      const blob = await res.blob()

      // 모바일: Web Share API
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        try {
          const file = new File([blob], 'saju-result.png', { type: 'image/png' })
          await navigator.share({ files: [file], title: '사주풀이 결과' })
          setSaving(false)
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 2000)
          return
        } catch { /* fallback to download */ }
      }

      // Blob URL로 다운로드
      const blobUrl = URL.createObjectURL(blob)
      const fileName = `사주풀이_${STEMS[result.dayMaster]}${ELEMENTS[STEM_ELEMENT[result.dayMaster]]}_결과.png`
      try {
        const link = document.createElement('a')
        link.download = fileName
        link.href = blobUrl
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        // 짧은 딜레이 후 제거 (브라우저 호환)
        setTimeout(() => {
          document.body.removeChild(link)
          URL.revokeObjectURL(blobUrl)
        }, 3000)
      } catch {
        // fallback: 새 탭에서 이미지 열기
        window.open(dataUrl, '_blank')
      }
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (e) {
      console.error('html-to-image 실패, html2canvas fallback:', e)
      // Fallback: html2canvas
      try {
        const html2canvas = (await import('html2canvas')).default
        const canvas = await html2canvas(cardRef.current!, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false,
          scrollY: -window.scrollY,
          scrollX: 0,
          windowWidth: 720,
        } as Parameters<typeof html2canvas>[1])
        canvas.toBlob((blob) => {
          if (!blob) {
            alert('이미지 저장에 실패했습니다. 스크린샷을 이용해주세요.')
            return
          }
          const blobUrl = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.download = `사주풀이_결과.png`
          link.href = blobUrl
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          setTimeout(() => URL.revokeObjectURL(blobUrl), 5000)
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 2000)
        }, 'image/png', 1.0)
      } catch {
        alert('이미지 저장에 실패했습니다. 스크린샷을 이용해주세요.')
      }
    }
    setSaving(false)
  }

  const handleKakao = () => {
    const w = window as typeof window & { Kakao?: { isInitialized: () => boolean; init: (key: string) => void; Share: { sendDefault: (obj: Record<string, unknown>) => void } } }
    if (!w.Kakao) {
      alert('카카오톡 SDK를 불러오지 못했습니다. 링크 복사로 공유해주세요.')
      handleCopyLink()
      return
    }
    if (!w.Kakao.isInitialized()) {
      w.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_KEY || '3913fde247b12ce25084eb42a9b17ed9')
    }
    try {
      w.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `${profile.emoji} ${profile.title}`,
          description: `${viral}\n\n나도 사주풀이 해보기!`,
          imageUrl: 'https://nohu-lab.vercel.app/globe.svg',
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
    <div className="space-y-2 sm:space-y-3">
      <p className="text-center text-[13px] sm:text-sm text-gray-500 font-medium">친구에게 공유하고 함께 비교해보세요!</p>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <button
          onClick={handleCopyLink}
          className="py-3 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 active:scale-95 text-gray-700 rounded-xl text-[11px] sm:text-sm font-medium transition-all flex flex-col items-center justify-center gap-0.5 sm:gap-1"
        >
          <span className="text-base sm:text-lg">{copyDone ? '✅' : '🔗'}</span>
          <span>{copyDone ? '복사됨!' : '링크 복사'}</span>
        </button>
        <button
          onClick={handleSaveImage}
          disabled={saving}
          className="py-3 bg-orange-50 hover:bg-orange-100 active:bg-orange-200 active:scale-95 text-orange-700 rounded-xl text-[11px] sm:text-sm font-medium transition-all flex flex-col items-center justify-center gap-0.5 sm:gap-1 disabled:opacity-50"
        >
          <span className="text-base sm:text-lg">{saving ? '⏳' : saveSuccess ? '✅' : '📷'}</span>
          <span>{saving ? '저장 중...' : saveSuccess ? '완료!' : '이미지 저장'}</span>
        </button>
        <button
          onClick={handleKakao}
          className="py-3 bg-[#FEE500] hover:bg-[#F5DC00] active:bg-[#EDCF00] active:scale-95 text-[#3C1E1E] rounded-xl text-[11px] sm:text-sm font-medium transition-all flex flex-col items-center justify-center gap-0.5 sm:gap-1"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.804 5.103 4.508 6.445-.148.544-.954 3.503-.985 3.724 0 0-.02.166.088.23.108.063.235.03.235.03.31-.043 3.59-2.354 4.155-2.76A12.58 12.58 0 0012 18.382c5.523 0 10-3.463 10-7.691C22 6.463 17.523 3 12 3"/></svg>
          <span>카카오톡</span>
        </button>
      </div>
    </div>
  )
}
