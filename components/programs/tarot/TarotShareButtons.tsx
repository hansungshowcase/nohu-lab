'use client'

import { useState, useCallback } from 'react'
import { TarotResult, encodeResultToUrl } from './tarotEngine'

interface Props {
  result: TarotResult
  cardRef: React.RefObject<HTMLDivElement | null>
}

export default function TarotShareButtons({ result, cardRef }: Props) {
  const [copyDone, setCopyDone] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [kakaoCopied, setKakaoCopied] = useState(false)

  const getShareUrl = useCallback(() => {
    const params = encodeResultToUrl(result)
    return `${window.location.origin}/programs/tarot-reading?${params}`
  }, [result])

  const getShareText = useCallback(() => {
    const cardNames = result.cards.map((sc) => `${sc.card.emoji} ${sc.card.name}${sc.isReversed ? '(역)' : ''}`).join(' ')
    return `${cardNames}\n\n내 타로 리딩 결과 보기:\n${getShareUrl()}`
  }, [result, getShareUrl])

  const handleCopyLink = async () => {
    const text = getShareText()
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
      const node = cardRef.current
      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
      const scale = isMobile ? 1.5 : 2

      let blob: Blob

      try {
        const { domToBlob } = await import('modern-screenshot')
        blob = await domToBlob(node, {
          scale,
          backgroundColor: '#ffffff',
          quality: 0.95,
          type: 'image/png',
          filter: (el: Node) => !(el instanceof HTMLElement && el.classList?.contains('no-print')),
        })
      } catch {
        const html2canvas = (await import('html2canvas')).default
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const canvas = await html2canvas(node, { scale, backgroundColor: '#ffffff', useCORS: true, logging: false } as any)
        blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png', 0.95)
        })
      }

      if (isMobile) {
        const isKakao = /KAKAOTALK/i.test(navigator.userAgent)

        if (!isKakao && navigator.share && navigator.canShare) {
          try {
            const file = new File([blob], 'tarot-result.png', { type: 'image/png' })
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], title: '타로 리딩 결과' })
              setSaving(false)
              setSaveSuccess(true)
              setTimeout(() => setSaveSuccess(false), 2000)
              return
            }
          } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
              setSaving(false)
              return
            }
          }
        }

        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = 'tarot-result.png'
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(blobUrl) }, 1000)

        if (isKakao) {
          setTimeout(() => {
            alert('이미지가 다운로드되지 않으면,\n오른쪽 상단 ⋯ 메뉴에서\n"다른 브라우저로 열기"를 눌러주세요.')
          }, 500)
        }

        setSaving(false)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
        return
      }

      const w = window as typeof window & { showSaveFilePicker?: (opts: Record<string, unknown>) => Promise<FileSystemFileHandle> }
      if (w.showSaveFilePicker) {
        try {
          const handle = await w.showSaveFilePicker({
            suggestedName: 'tarot-result.png',
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

      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = 'tarot-result.png'
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(blobUrl) }, 1000)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch {
      alert('이미지 저장에 실패했습니다. 스크린샷을 이용해주세요.')
    }
    setSaving(false)
  }

  const handleKakao = async () => {
    const shareUrl = getShareUrl()
    const cardNames = result.cards.map((sc) => `${sc.card.emoji} ${sc.card.name}`).join(' ')
    const w = window as typeof window & { Kakao?: { isInitialized: () => boolean; init: (key: string) => void; Share: { sendDefault: (opts: Record<string, unknown>) => void } } }

    if (w.Kakao) {
      try {
        if (!w.Kakao.isInitialized()) {
          w.Kakao.init('3913fde247b12ce25084eb42a9b17ed9')
        }
        w.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: `${result.spread.icon} 타로 카드 리딩 결과`,
            description: cardNames,
            imageUrl: `https://retireplan.kr/api/og`,
            link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
          },
          buttons: [
            { title: '결과 보기', link: { mobileWebUrl: shareUrl, webUrl: shareUrl } },
            { title: '나도 타로 보기', link: { mobileWebUrl: `${window.location.origin}/programs/tarot-reading`, webUrl: `${window.location.origin}/programs/tarot-reading` } },
          ],
        })
        return
      } catch {
        // SDK 실패 시 아래 fallback
      }
    }

    const text = getShareText()
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
      <div className="text-center">
        <p className="text-base sm:text-lg font-bold text-gray-800">결과를 공유해보세요</p>
        <p className="text-sm text-gray-400 mt-0.5">친구와 타로 결과를 비교하면 더 재밌어요</p>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <button
          onClick={handleCopyLink}
          className="group relative py-4 bg-gradient-to-b from-blue-50 to-blue-100/50 border border-blue-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] rounded-2xl text-sm sm:text-base font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <span className="w-11 h-11 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center text-xl transition-all duration-200 group-hover:scale-110">
            {copyDone ? '✅' : '🔗'}
          </span>
          <span className="text-blue-700 text-xs sm:text-sm">{copyDone ? '복사됨!' : '링크 복사'}</span>
        </button>
        <button
          onClick={handleSaveImage}
          disabled={saving}
          className="group relative py-4 bg-gradient-to-b from-purple-50 to-purple-100/50 border border-purple-200 hover:border-purple-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] rounded-2xl text-sm sm:text-base font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-1.5 disabled:opacity-50 disabled:hover:translate-y-0 focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          <span className="w-11 h-11 rounded-full bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center text-xl transition-all duration-200 group-hover:scale-110">
            {saving ? '⏳' : saveSuccess ? '✅' : '📷'}
          </span>
          <span className="text-purple-700 text-xs sm:text-sm">{saving ? '저장 중...' : saveSuccess ? '완료!' : '이미지 저장'}</span>
        </button>
        <button
          onClick={handleKakao}
          className="group relative py-4 bg-gradient-to-b from-[#FEE500]/40 to-[#FEE500]/60 border border-[#F5DC00] hover:border-[#EDCF00] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] rounded-2xl text-sm sm:text-base font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <span className="w-11 h-11 rounded-full bg-[#FEE500]/50 group-hover:bg-[#FEE500]/80 flex items-center justify-center transition-all duration-200 group-hover:scale-110">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3C1E1E"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.804 5.103 4.508 6.445-.148.544-.954 3.503-.985 3.724 0 0-.02.166.088.23.108.063.235.03.235.03.31-.043 3.59-2.354 4.155-2.76A12.58 12.58 0 0012 18.382c5.523 0 10-3.463 10-7.691C22 6.463 17.523 3 12 3"/></svg>
          </span>
          <span className="text-[#3C1E1E] text-xs sm:text-sm">{kakaoCopied ? '복사 완료!' : '카카오톡'}</span>
        </button>
      </div>
    </div>
  )
}
