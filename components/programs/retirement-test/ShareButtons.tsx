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
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    function initKakao() {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_KEY || '')
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
      await navigator.clipboard.writeText(shareUrl)
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
      const file = new File([blob], `노후준비_리포트_${total}점_${grade}.png`, { type: 'image/png' })

      // 1순위: Web Share API (모바일 공유 시트)
      if (navigator.share) {
        try {
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: '노후 준비 진단 리포트' })
            return
          }
        } catch (e) {
          if ((e as Error).name === 'AbortError') return
        }
      }

      // 2순위: 이미지를 화면에 표시 (모바일 - 꾹 눌러 저장)
      const blobUrl = URL.createObjectURL(blob)
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      if (isMobile) {
        setImagePreview(blobUrl)
        return
      }

      // 3순위: 직접 다운로드 (데스크탑)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch (err) {
      alert('이미지 저장에 실패했습니다. 스크린샷을 이용해주세요.')
    } finally {
      setSaving(false)
    }
  }

  function closePreview() {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
  }

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

    const fullText = `${shareText}\n${shareUrl}`
    try {
      navigator.clipboard.writeText(fullText)
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

      {/* 이미지 미리보기 오버레이 (모바일) */}
      {imagePreview && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'flex-start',
            padding: '16px', overflowY: 'auto',
          }}
          onClick={closePreview}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              textAlign: 'center',
              width: '100%',
              maxWidth: '400px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#111', margin: '0 0 4px' }}>
              아래 이미지를 꾹 눌러서 저장하세요
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
              이미지를 길게 누르면 &quot;사진에 저장&quot; 옵션이 나타납니다
            </p>
          </div>
          <img
            src={imagePreview}
            alt="노후 준비 진단 리포트"
            style={{
              width: '100%',
              maxWidth: '400px',
              borderRadius: '8px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={closePreview}
            style={{
              marginTop: '16px',
              padding: '12px 32px',
              backgroundColor: '#fff',
              color: '#111',
              borderRadius: '12px',
              border: 'none',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            닫기
          </button>
        </div>
      )}
    </>
  )
}
