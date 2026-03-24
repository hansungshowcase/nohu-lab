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
            title: '결과 보기',
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
