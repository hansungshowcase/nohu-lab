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

interface SupplementShareButtonsProps {
  shareUrl: string
  profileSummary: string
  recommendCount: number
  onRestart: () => void
}

export default function SupplementShareButtons({
  shareUrl,
  profileSummary,
  recommendCount,
  onRestart,
}: SupplementShareButtonsProps) {
  const [copied, setCopied] = useState(false)
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

  async function shareKakao() {
    if (kakaoReady && window.Kakao) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '💊 나의 맞춤 영양제 처방전',
          description: `${profileSummary} — ${recommendCount}가지 영양제를 추천받았어요!`,
          imageUrl: 'https://retireplan.kr/api/og',
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: '내 처방전 보기',
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
          {
            title: '☕ 카페 가입하기',
            link: {
              mobileWebUrl: 'https://cafe.naver.com/eovhskfktmak',
              webUrl: 'https://cafe.naver.com/eovhskfktmak',
            },
          },
        ],
      })
      return
    }
    // fallback
    await copyLink()
    alert('카카오톡이 준비되지 않아 링크가 복사되었습니다.')
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

  return (
    <div className="space-y-3 max-w-md mx-auto w-full">
      <p className="text-center text-sm text-gray-500 mb-2">결과를 공유해보세요</p>

      <button
        onClick={shareKakao}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl font-medium hover:opacity-90 transition"
        style={{ backgroundColor: '#FEE500', color: '#191919' }}
      >
        💬 카카오톡으로 공유
      </button>

      <button
        onClick={copyLink}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition"
      >
        {copied ? '✓ 링크 복사됨!' : '🔗 결과 링크 복사'}
      </button>

      <button
        onClick={onRestart}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-white border-2 border-orange-300 text-orange-700 rounded-xl font-medium hover:bg-orange-50 transition"
      >
        🔄 다시 상담하기
      </button>

      <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
        ※ 본 추천은 일반적인 건강 정보 제공 목적이며,<br />
        의학적 처방을 대체하지 않습니다.<br />
        개인 건강 상태에 따라 전문가 상담을 권장합니다.
      </p>
    </div>
  )
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
