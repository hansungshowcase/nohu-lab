'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '로그인에 실패했습니다.')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('서버에 연결할 수 없습니다.')
    } finally {
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
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                {error}
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
                  확인 중...
                </>
              ) : (
                '로그인'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-5 leading-relaxed">
            노후연구소 카페 회원만 이용 가능합니다.
            <br />
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
