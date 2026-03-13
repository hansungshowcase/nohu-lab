'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const ERROR_MESSAGES: Record<string, string> = {
  naver_denied: '네이버 로그인이 취소되었습니다.',
  token_failed: '인증에 실패했습니다. 다시 시도해주세요.',
  profile_failed: '프로필 정보를 가져올 수 없습니다.',
  not_cafe_member: '노후연구소 카페에 가입되지 않은 회원입니다.\n카페 가입 후 다시 시도해주세요.',
  server_error: '서버 오류가 발생했습니다. 다시 시도해주세요.',
}

function LoginContent() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('error')
  const errorMessage = errorCode ? ERROR_MESSAGES[errorCode] || '로그인에 실패했습니다.' : null

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
              카페 회원 인증 후 다양한 도구를 이용하세요
            </p>
          </div>

          {errorMessage && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-5 whitespace-pre-line">
              {errorMessage}
            </div>
          )}

          <a
            href="/api/auth/naver"
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition flex items-center justify-center gap-2 text-lg"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13.5 10.56L6.26 0H0V20H6.5V9.44L13.74 20H20V0H13.5V10.56Z" fill="white"/>
            </svg>
            네이버로 로그인
          </a>

          <p className="text-center text-xs text-gray-400 mt-4">
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
