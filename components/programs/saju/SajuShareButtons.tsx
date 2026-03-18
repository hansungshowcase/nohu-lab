'use client'

import { useState, useCallback } from 'react'
import { SajuResult } from './sajuEngine'
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
    const text = `${profile.emoji} ${viral}\n\n내 사주풀이 결과 보기:\n${getShareUrl()}`
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
    setCopyDone(true)
    setTimeout(() => setCopyDone(false), 2000)
  }

  const handleSaveImage = async () => {
    if (!cardRef.current || saving) return
    setSaving(true)
    try {
      const { toPng } = await import('html-to-image')
      const node = cardRef.current
      const options = {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        skipAutoScale: true,
        filter: (el: HTMLElement) => !el.classList?.contains('no-print'),
      }

      const dataUrl = await toPng(node, options)
      if (!dataUrl || !dataUrl.startsWith('data:image/png')) {
        throw new Error('Invalid PNG data')
      }

      const fetchRes = await fetch(dataUrl)
      const blob = await fetchRes.blob()

      // 모바일: Web Share API
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        try {
          const file = new File([blob], 'saju-result.png', { type: 'image/png' })
          await navigator.share({ files: [file], title: '사주풀이 결과' })
          setSaving(false)
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 2000)
          return
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') {
            setSaving(false)
            return
          }
        }
      }

      // File System Access API (Chrome/Edge)
      const w = window as typeof window & { showSaveFilePicker?: (opts: Record<string, unknown>) => Promise<FileSystemFileHandle> }
      if (w.showSaveFilePicker) {
        try {
          const handle = await w.showSaveFilePicker({
            suggestedName: 'saju-result.png',
            types: [{ description: 'PNG Image', accept: { 'image/png': ['.png'] } }],
          })
          const writable = await handle.createWritable()
          await writable.write(blob)
          await writable.close()
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 2000)
          setSaving(false)
          return
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') {
            setSaving(false)
            return
          }
        }
      }

      // Fallback: <a download>
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = 'saju-result.png'
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(blobUrl) }, 3000)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch {
      alert('이미지 저장에 실패했습니다. 스크린샷을 이용해주세요.')
    }
    setSaving(false)
  }

  const [kakaoCopied, setKakaoCopied] = useState(false)

  const handleKakao = async () => {
    const shareUrl = getShareUrl()
    const w = window as typeof window & { Kakao?: { isInitialized: () => boolean; init: (key: string) => void; Share: { sendDefault: (opts: Record<string, unknown>) => void } } }

    // 카카오 SDK로 직접 공유
    if (w.Kakao) {
      try {
        if (!w.Kakao.isInitialized()) {
          w.Kakao.init('3913fde247b12ce25084eb42a9b17ed9')
        }
        w.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: `${profile.emoji} ${profile.title}`,
            description: viral,
            imageUrl: `https://retireplan.kr/api/og`,
            link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
          },
          buttons: [
            { title: '결과 보기', link: { mobileWebUrl: shareUrl, webUrl: shareUrl } },
            { title: '나도 해보기', link: { mobileWebUrl: 'https://retireplan.kr/programs/saju-reading', webUrl: 'https://retireplan.kr/programs/saju-reading' } },
          ],
        })
        return
      } catch {
        // SDK 실패 시 아래 fallback
      }
    }

    // Fallback: 클립보드 복사
    const text = `${profile.emoji} ${viral}\n\n내 사주풀이 결과 보기:\n${shareUrl}`
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
    setKakaoCopied(true)
    setTimeout(() => setKakaoCopied(false), 3000)
  }

  return (
    <div className="space-y-4">
      {/* 공유 헤더 */}
      <div className="text-center">
        <p className="text-sm sm:text-base font-bold text-gray-800">결과를 공유해보세요</p>
        <p className="text-xs text-gray-400 mt-0.5">친구와 사주를 비교하면 더 재밌어요</p>
      </div>

      {/* 공유 버튼 */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <button
          onClick={handleCopyLink}
          className="group relative py-4 bg-gradient-to-b from-blue-50 to-blue-100/50 border border-blue-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-1.5"
        >
          <span className="w-11 h-11 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center text-xl transition-all duration-200 group-hover:scale-110">
            {copyDone ? '✅' : '🔗'}
          </span>
          <span className="text-blue-700">{copyDone ? '복사됨!' : '링크 복사'}</span>
        </button>
        <button
          onClick={handleSaveImage}
          disabled={saving}
          className="group relative py-4 bg-gradient-to-b from-purple-50 to-purple-100/50 border border-purple-200 hover:border-purple-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-1.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <span className="w-11 h-11 rounded-full bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center text-xl transition-all duration-200 group-hover:scale-110">
            {saving ? '⏳' : saveSuccess ? '✅' : '📷'}
          </span>
          <span className="text-purple-700">{saving ? '저장 중...' : saveSuccess ? '완료!' : '이미지 저장'}</span>
        </button>
        <button
          onClick={handleKakao}
          className="group relative py-4 bg-gradient-to-b from-[#FEE500]/40 to-[#FEE500]/60 border border-[#F5DC00] hover:border-[#EDCF00] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-1.5"
        >
          <span className="w-11 h-11 rounded-full bg-[#FEE500]/50 group-hover:bg-[#FEE500]/80 flex items-center justify-center transition-all duration-200 group-hover:scale-110">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3C1E1E"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.804 5.103 4.508 6.445-.148.544-.954 3.503-.985 3.724 0 0-.02.166.088.23.108.063.235.03.235.03.31-.043 3.59-2.354 4.155-2.76A12.58 12.58 0 0012 18.382c5.523 0 10-3.463 10-7.691C22 6.463 17.523 3 12 3"/></svg>
          </span>
          <span className="text-[#3C1E1E]">{kakaoCopied ? '복사 완료!' : '카카오톡 공유'}</span>
        </button>
      </div>
    </div>
  )
}
