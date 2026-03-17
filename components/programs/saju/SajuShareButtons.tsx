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
      g: result.gender === 'male' ? 'm' : 'f',
    })
    if (result.birthHour !== null) params.set('h', String(result.birthHour))
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

      // Blob URL로 다운로드 (영문 파일명으로 호환성 확보)
      const blobUrl = URL.createObjectURL(blob)
      const fileName = 'saju-result.png'
      try {
        const link = document.createElement('a')
        link.download = fileName
        link.href = blobUrl
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
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
        await new Promise<void>((resolve) => {
          canvas.toBlob((blob) => {
            if (!blob) {
              alert('이미지 저장에 실패했습니다. 스크린샷을 이용해주세요.')
              resolve()
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
            resolve()
          }, 'image/png', 1.0)
        })
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
    <div className="space-y-4">
      {/* 공유 헤더 */}
      <div className="text-center">
        <p className="text-sm sm:text-base font-bold text-gray-800">결과를 공유해보세요</p>
        <p className="text-xs text-gray-400 mt-0.5">친구와 사주를 비교하면 더 재밌어요</p>
      </div>

      {/* 공유 버튼 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <button
          onClick={handleCopyLink}
          className="group relative py-4 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md active:scale-[0.97] rounded-2xl text-xs sm:text-sm font-semibold transition-all flex flex-col items-center justify-center gap-1.5"
        >
          <span className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center text-lg transition-colors">
            {copyDone ? '✅' : '🔗'}
          </span>
          <span className="text-gray-600">{copyDone ? '복사됨!' : '링크 복사'}</span>
        </button>
        <button
          onClick={handleSaveImage}
          disabled={saving}
          className="group relative py-4 bg-white border border-orange-200 hover:border-orange-300 hover:shadow-md active:scale-[0.97] rounded-2xl text-xs sm:text-sm font-semibold transition-all flex flex-col items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <span className="w-10 h-10 rounded-full bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center text-lg transition-colors">
            {saving ? '⏳' : saveSuccess ? '✅' : '📷'}
          </span>
          <span className="text-orange-700">{saving ? '저장 중...' : saveSuccess ? '완료!' : '이미지 저장'}</span>
        </button>
        <button
          onClick={handleKakao}
          className="group relative py-4 bg-white border border-[#FEE500] hover:border-[#F5DC00] hover:shadow-md active:scale-[0.97] rounded-2xl text-xs sm:text-sm font-semibold transition-all flex flex-col items-center justify-center gap-1.5"
        >
          <span className="w-10 h-10 rounded-full bg-[#FEE500]/30 group-hover:bg-[#FEE500]/50 flex items-center justify-center transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3C1E1E"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.804 5.103 4.508 6.445-.148.544-.954 3.503-.985 3.724 0 0-.02.166.088.23.108.063.235.03.235.03.31-.043 3.59-2.354 4.155-2.76A12.58 12.58 0 0012 18.382c5.523 0 10-3.463 10-7.691C22 6.463 17.523 3 12 3"/></svg>
          </span>
          <span className="text-[#3C1E1E]">카카오톡</span>
        </button>
      </div>
    </div>
  )
}
