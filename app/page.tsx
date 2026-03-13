'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  async function pollVerifyStatus(verifyId: string) {
    setVerifying(true)
    let attempts = 0
    const maxAttempts = 20 // 40 seconds max

    return new Promise<void>((resolve) => {
      pollingRef.current = setInterval(async () => {
        attempts++
        try {
          const res = await fetch(`/api/auth/verify-status?id=${verifyId}`)
          const data = await res.json()

          if (data.status === 'pending') {
            if (attempts >= maxAttempts) {
              stopPolling()
              setVerifying(false)
              setError('회원 확인 시간이 초과되었습니다.\n관리자의 확장프로그램이 실행 중인지 확인해주세요.')
              setLoading(false)
              resolve()
            }
            return
          }

          stopPolling()
          setVerifying(false)

          if (data.status === 'found') {
            router.push('/dashboard')
          } else {
            setError('노후연구소 카페에 가입되지 않은 닉네임입니다.\n카페에 먼저 가입해주세요.')
            setLoading(false)
          }
          resolve()
        } catch {
          // Network error, keep polling
          if (attempts >= maxAttempts) {
            stopPolling()
            setVerifying(false)
            setError('서버에 연결할 수 없습니다.')
            setLoading(false)
            resolve()
          }
        }
      }, 2000)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    stopPolling()

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim() }),
      })
      const data = await res.json()

      if (data.success) {
        router.push('/dashboard')
        return
      }

      if (data.status === 'verifying' && data.verifyId) {
        // Start polling for verification result
        await pollVerifyStatus(data.verifyId)
        return
      }

      if (!res.ok) {
        setError(data.error || '로그인에 실패했습니다.')
        setLoading(false)
        return
      }
    } catch {
      setError('서버에 연결할 수 없습니다.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">☕</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              노후연구소
            </h1>
            <p className="text-gray-500 mt-1">
              카페 닉네임으로 로그인하세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                카페 닉네임
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="노후연구소 카페에서 사용하는 닉네임"
                className="w-full px-4 py-3 rounded-lg border border-green-200 bg-white text-gray-900 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg whitespace-pre-line">
                {error}
              </div>
            )}

            {verifying && (
              <div className="bg-amber-50 text-amber-700 text-sm p-3 rounded-lg flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                카페 회원 여부를 확인하고 있습니다...
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {verifying ? '회원 확인 중...' : '확인 중...'}
                </>
              ) : (
                '로그인'
              )}
            </button>
          </form>

          <div className="relative flex items-center my-5">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-3 text-xs text-gray-400">또는</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          <button
            type="button"
            onClick={async () => {
              setError('')
              setLoading(true)
              try {
                const res = await fetch('/api/auth/guest-login', { method: 'POST' })
                const data = await res.json()
                if (data.success) {
                  router.push('/dashboard')
                } else {
                  setError(data.error || '비회원 로그인에 실패했습니다.')
                  setLoading(false)
                }
              } catch {
                setError('서버에 연결할 수 없습니다.')
                setLoading(false)
              }
            }}
            disabled={loading}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-medium rounded-lg transition"
          >
            비회원으로 둘러보기
          </button>

          <p className="text-center text-sm text-gray-600 mt-5 leading-relaxed">
            카페 등급에 따라 사용 가능한 도구가 다릅니다.
          </p>

          <div className="text-center mt-4 space-y-2">
            <a
              href="https://cafe.naver.com/eovhskfktmak"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 border border-green-200 text-green-700 font-medium rounded-lg hover:bg-green-50 transition text-center"
            >
              카페 회원가입
            </a>
            <a
              href="/admin/login"
              className="inline-block text-xs text-gray-400 hover:text-gray-600 transition mt-2"
            >
              관리자 로그인
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
