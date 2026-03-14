'use client'

import { useState, useEffect, RefObject } from 'react'

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
  cardRef: RefObject<HTMLDivElement | null>
  a4CardRef?: RefObject<HTMLDivElement | null>
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
  cardRef,
  a4CardRef,
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
      }
    }
    initKakao()
    // SDK가 async 로드되므로 약간 기다릴 수 있음
    const timer = setTimeout(initKakao, 1000)
    return () => clearTimeout(timer)
  }, [])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      fallbackCopy(shareUrl)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function saveImage() {
    const target = a4CardRef?.current || cardRef.current
    if (!target || saving) return
    setSaving(true)
    try {
      // Temporarily move on-screen for capture
      const origStyle = target.style.cssText
      target.style.position = 'fixed'
      target.style.left = '0'
      target.style.top = '0'
      target.style.zIndex = '-1'

      // Wait for layout
      await new Promise(r => setTimeout(r, 100))

      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(target, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      })

      // Restore
      target.style.cssText = origStyle

      const link = document.createElement('a')
      link.download = `노후준비_리포트_${total}점_${grade}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('이미지 저장 실패:', err)
      alert('이미지 저장에 실패했습니다. 스크린샷을 이용해주세요.')
    } finally {
      setSaving(false)
    }
  }

  const shareText = `나의 노후 준비 점수는 ${total}점! (${grade}) 당신은 몇 점?`

  function shareKakao() {
    if (kakaoReady && window.Kakao) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '나의 노후 준비 점수 결과',
          description: shareText,
          imageUrl: 'https://nohu-lab.vercel.app/api/og',
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: '나도 테스트하기',
            link: {
              mobileWebUrl: 'https://nohu-lab.vercel.app/programs/retirement-test',
              webUrl: 'https://nohu-lab.vercel.app/programs/retirement-test',
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

    // Fallback: 카카오 SDK 로드 실패 시 링크 복사
    const fullText = `${shareText}\n${shareUrl}`
    try {
      navigator.clipboard.writeText(fullText)
    } catch {
      fallbackCopy(fullText)
    }
    alert('카카오톡 연결에 실패했습니다. 링크가 복사되었으니 카카오톡에 붙여넣기 해주세요.')
  }

  return (
    <div className="flex flex-col gap-3 max-w-md mx-auto w-full">
      {/* Copy link */}
      <button
        onClick={copyLink}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition"
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
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-green-600 text-green-700 rounded-xl font-medium hover:bg-green-50 transition disabled:opacity-50"
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
  )
}
