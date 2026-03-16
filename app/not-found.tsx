import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">페이지를 찾을 수 없습니다</h1>
      <p className="text-gray-500 mb-6">요청하신 페이지가 존재하지 않습니다.</p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition"
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
}
