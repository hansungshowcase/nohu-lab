'use client'

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-6xl mb-4">😵</div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h1>
      <p className="text-gray-500 mb-6 text-center">잠시 후 다시 시도해주세요.</p>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition"
      >
        다시 시도
      </button>
    </div>
  )
}
