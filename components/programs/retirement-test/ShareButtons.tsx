'use client'

import { useState, useEffect } from 'react'

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void
      isInitialized: () => boolean
      Share: {
        sendDefault: (options: Record<string, unknown>) => void
      }
    }
  }
}

interface ShareButtonsProps {
  shareUrl: string
  total: number
  grade: string
  resultCode: string
  categories: { key: string; score: number }[]
}

function fallbackCopy(text: string) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

export default function ShareButtons({
  shareUrl,
  total,
  grade,
  resultCode,
  categories,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [kakaoReady, setKakaoReady] = useState(false)

  useEffect(() => {
    function initKakao() {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init('3913fde247b12ce25084eb42a9b17ed9')
      }
      if (window.Kakao?.isInitialized()) {
        setKakaoReady(true)
        return true
      }
      return false
    }
    if (initKakao()) return
    let attempts = 0
    const interval = setInterval(() => {
      if (initKakao() || ++attempts >= 10) clearInterval(interval)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const shareText = `나의 노후 준비 점수는 ${total}점! (${grade}) 당신은 몇 점?`

  function getImageUrl() {
    const catMap: Record<string, string> = {}
    categories.forEach(c => {
      const k = c.key === 'finance' ? 'f' : c.key === 'lifestyle' ? 'l' : c.key === 'housing' ? 'h' : 'm'
      catMap[k] = String(c.score)
    })
    const params = new URLSearchParams({
      s: String(total),
      code: resultCode,
      ...catMap,
    })
    return `/api/result-image?${params.toString()}`
  }

  async function copyLink() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        fallbackCopy(shareUrl)
      }
    } catch {
      fallbackCopy(shareUrl)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function saveImage() {
    if (saving) return
    setSaving(true)
    try {
      const url = getImageUrl()
      const res = await fetch(url)
      if (!res.ok) throw new Error('이미지 생성 실패')
      const blob = await res.blob()
      const fileName = `노후준비_리포트_${total}점_${grade}.png`
      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)

      // 모바일: Web Share API (갤럭시/아이폰 공유시트 → 갤러리 저장)
      if (isMobile && navigator.share) {
        try {
          const file = new File([blob], fileName, { type: 'image/png' })
          await navigator.share({ files: [file], title: '노후 준비 진단 리포트' })
          return
        } catch (e) {
          if ((e as Error).name === 'AbortError') return
          // share 실패 → 아래 fallback
        }
      }

      // 모바일 fallback: 이미지를 data URL로 새 탭에 열기 (꾹 눌러 저장)
      if (isMobile) {
        const reader = new FileReader()
        reader.onload = () => {
          const dataUrl = reader.result as string
          const w = window.open('')
          if (w) {
            w.document.write(`<html><head><title>리포트 저장</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#000;padding:16px"><p style="color:#fff;font-size:14px;margin-bottom:12px;text-align:center">이미지를 꾹 눌러서 저장하세요</p><img src="${dataUrl}" style="max-width:100%;border-radius:8px" alt="노후 준비 리포트"/></body></html>`)
            w.document.close()
          }
        }
        reader.readAsDataURL(blob)
        return
      }

      // PC: 직접 다운로드
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
      }, 3000)
    } catch {
      alert('이미지 저장에 실패했습니다. 스크린샷을 이용해주세요.')
    } finally {
      setSaving(false)
    }
  }


  async function shareKakao() {
    if (kakaoReady && window.Kakao) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '나의 노후 준비 점수 결과',
          description: shareText,
          imageUrl: 'https://retireplan.kr/api/og',
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: '나도 테스트하기',
            link: {
              mobileWebUrl: 'https://retireplan.kr/programs/retirement-test',
              webUrl: 'https://retireplan.kr/programs/retirement-test',
            },
          },
          {
            title: '결과 보기',
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      })
      return
    }

    const fullText = `${shareText}\n${shareUrl}`
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullText)
      } else {
        fallbackCopy(fullText)
      }
    } catch {
      fallbackCopy(fullText)
    }
    alert('카카오톡 연결에 실패했습니다. 링크가 복사되었으니 카카오톡에 붙여넣기 해주세요.')
  }

  return (
    <>
      <div className="flex flex-col gap-3 max-w-md mx-auto w-full">
        {/* Copy link */}
        <button
          onClick={copyLink}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition"
        >
          {copied ? (
            <>✓ 링크가 복사되었습니다!</>
          ) : (
            <>🔗 결과 링크 복사하기</>
          )}
        </button>

        {/* Save image */}
        <button
          onClick={saveImage}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-orange-600 text-orange-700 rounded-xl font-medium hover:bg-orange-50 transition disabled:opacity-50"
        >
          {saving ? (
            <>저장 중...</>
          ) : (
            <>📷 결과 이미지 저장하기</>
          )}
        </button>

        {/* KakaoTalk share */}
        <button
          onClick={shareKakao}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium hover:opacity-90 transition"
          style={{ backgroundColor: '#FEE500', color: '#191919' }}
        >
          💬 카카오톡으로 공유하기
        </button>
      </div>

    </>
  )
}
