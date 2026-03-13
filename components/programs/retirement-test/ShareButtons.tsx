'use client'

import { useState, RefObject } from 'react'

interface ShareButtonsProps {
  shareUrl: string
  total: number
  grade: string
  cardRef: RefObject<HTMLDivElement | null>
  a4CardRef?: RefObject<HTMLDivElement | null>
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

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function saveImage() {
    const target = a4CardRef?.current || cardRef.current
    if (!target || saving) return
    setSaving(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(target, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      })
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

  async function shareKakao() {
    // Try Web Share API first (shows native share sheet with KakaoTalk on mobile)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: '나의 노후 준비 점수',
          text: shareText,
          url: shareUrl,
        })
        return
      } catch {
        // user cancelled or not supported, fall through
      }
    }
    // Fallback: copy link for manual sharing
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      alert('메시지가 복사되었습니다!\n카카오톡에 붙여넣기 해주세요.')
    } catch {
      prompt('아래 내용을 복사하여 카카오톡에 공유해주세요:', `${shareText} ${shareUrl}`)
    }
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
        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl font-medium hover:opacity-90 transition"
        style={{ backgroundColor: '#FEE500', color: '#191919' }}
      >
        💬 카카오톡으로 공유하기
      </button>
    </div>
  )
}
