'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
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

  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  const [verifySeconds, setVerifySeconds] = useState(0)
  const [lastVerifyId, setLastVerifyId] = useState<string | null>(null)

  async function pollVerifyStatus(verifyId: string) {
    setVerifying(true)
    setVerifySeconds(0)
    setLastVerifyId(verifyId)
    let attempts = 0
    const maxAttempts = 40
    const interval = 1500

    return new Promise<void>((resolve) => {
      pollingRef.current = setInterval(async () => {
        attempts++
        setVerifySeconds(Math.round(attempts * interval / 1000))
        try {
          const res = await fetch(`/api/auth/verify-status?id=${verifyId}`)
          if (!res.ok) return
          const data = await res.json()

          if (data.status === 'pending') {
            if (attempts >= maxAttempts) {
              stopPolling()
              setVerifying(false)
              setError('회원 확인 시간이 초과되었습니다.\n확장프로그램이 실행 중인지 확인 후 다시 시도해주세요.')
              setLoading(false)
              resolve()
            }
            return
          }

          stopPolling()
          setVerifying(false)

          if (data.status === 'found') {
            router.push('/dashboard')
          } else if (data.status === 'not_found') {
            setError('노후연구소 카페에 가입되지 않은 닉네임입니다.\n카페에 먼저 가입해주세요.')
            setLoading(false)
          } else {
            setError('회원 확인 중 오류가 발생했습니다.\n다시 시도해주세요.')
            setLoading(false)
          }
          resolve()
        } catch {
          if (attempts >= maxAttempts) {
            stopPolling()
            setVerifying(false)
            setError('서버에 연결할 수 없습니다.')
            setLoading(false)
            resolve()
          }
        }
      }, interval)
    })
  }

  async function handleRetry() {
    setError('')
    setLoading(true)
    // 먼저 닉네임으로 재로그인 시도 (확장프로그램이 이미 등록했을 수 있음)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          router.push('/dashboard')
          return
        }
        if (data.status === 'verifying' && data.verifyId) {
          await pollVerifyStatus(data.verifyId)
          return
        }
      }
    } catch { /* fallback to polling */ }
    // 그래도 안 되면 기존 verifyId로 재폴링
    if (lastVerifyId) {
      await pollVerifyStatus(lastVerifyId)
    } else {
      setLoading(false)
      setError('다시 닉네임을 입력하고 로그인해주세요.')
    }
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
      if (!res.ok) {
        setError('서버 오류가 발생했습니다.')
        setLoading(false)
        return
      }
      const data = await res.json()

      if (data.success) {
        router.push('/dashboard')
        return
      }

      if (data.status === 'verifying' && data.verifyId) {
        await pollVerifyStatus(data.verifyId)
        return
      }

      setError(data.error || '로그인에 실패했습니다.')
      setLoading(false)
    } catch {
      setError('서버에 연결할 수 없습니다.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-premium px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="hidden sm:block absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-orange-100/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="hidden sm:block absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-100/30 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      <div className="w-full max-w-[420px] relative">
        <div className="animate-fade-in bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-orange-900/5 p-8 sm:p-10 border border-white/60">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/20">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
              노후연구소
            </h1>
            <p className="text-[13px] text-gray-400 mt-1.5 font-medium">
              카페 닉네임으로 로그인하세요
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                카페 닉네임
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력하세요"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-[14px] placeholder:text-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none transition-all duration-200"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-[13px] p-3.5 rounded-xl whitespace-pre-line border border-red-100">
                {error}
              </div>
            )}

            {verifying && (
              <div className="bg-amber-50 text-amber-700 text-[13px] p-3.5 rounded-xl border border-amber-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 spinner shrink-0" style={{ borderTopColor: '#d97706' }} />
                  <span>카페 회원 여부를 확인하고 있습니다... ({verifySeconds}초)</span>
                </div>
                <p className="text-[11px] text-amber-500 mt-1.5 ml-6">확장프로그램이 카페에서 검색 중입니다. 최대 60초 소요됩니다.</p>
              </div>
            )}

            {!verifying && !loading && lastVerifyId && error && (
              <button
                type="button"
                onClick={handleRetry}
                className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[13px] font-medium rounded-xl border border-amber-200 transition-all"
              >
                🔄 다시 확인하기
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-orange-300 disabled:to-amber-300 text-white font-semibold text-[14px] rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                  {verifying ? '회원 확인 중...' : '확인 중...'}
                </>
              ) : (
                '로그인'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-gray-100" />
            <span className="mx-4 text-[11px] text-gray-300 font-medium uppercase tracking-wider">or</span>
            <div className="flex-grow border-t border-gray-100" />
          </div>

          {/* Guest login */}
          <button
            type="button"
            onClick={async () => {
              setError('')
              setLoading(true)
              try {
                const res = await fetch('/api/auth/guest-login', { method: 'POST' })
                if (!res.ok) { setError('서버 오류가 발생했습니다.'); setLoading(false); return }
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
            className="w-full py-3.5 bg-white hover:bg-gray-50 disabled:bg-gray-50 text-gray-600 font-medium text-[14px] rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300"
          >
            비회원으로 둘러보기
          </button>

          {/* Footer */}
          <p className="text-center text-[12px] text-gray-400 mt-6 leading-relaxed">
            카페 등급에 따라 사용 가능한 도구가 다릅니다
          </p>

          <div className="text-center mt-4 space-y-3">
            <a
              href="https://cafe.naver.com/eovhskfktmak"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 border border-gray-200 text-gray-600 font-medium text-[13px] rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-center"
            >
              카페 회원가입
            </a>
            <a
              href="/admin/login"
              className="inline-block text-[11px] text-gray-300 hover:text-gray-500 transition-colors mt-1"
            >
              관리자 로그인
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
