'use client'

import { useState } from 'react'

const HASHTAG_DB: Record<string, string[]> = {
  음식: ['#맛집', '#먹스타그램', '#맛있다', '#푸드', '#음식추천', '#카페', '#디저트', '#홈쿡', '#요리', '#먹방'],
  여행: ['#여행', '#여행스타그램', '#국내여행', '#해외여행', '#풍경', '#여행사진', '#힐링', '#관광', '#호텔', '#바다'],
  일상: ['#일상', '#데일리', '#소통', '#좋아요', '#팔로우', '#셀피', '#오늘', '#하루', '#감성', '#사진'],
  운동: ['#운동', '#헬스', '#다이어트', '#건강', '#피트니스', '#홈트', '#러닝', '#요가', '#필라테스', '#근력운동'],
  패션: ['#패션', '#오오티디', '#코디', '#스타일', '#데일리룩', '#옷스타그램', '#쇼핑', '#신상', '#트렌드', '#뷰티'],
  반려동물: ['#반려동물', '#강아지', '#고양이', '#멍스타그램', '#냥스타그램', '#펫', '#귀여워', '#산책', '#애견', '#집사'],
}

const KEYWORDS = Object.keys(HASHTAG_DB)

export default function HashtagRecommender() {
  const [text, setText] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  function recommend() {
    const lower = text.toLowerCase()
    const matched = new Set<string>()

    KEYWORDS.forEach((keyword) => {
      if (lower.includes(keyword)) {
        HASHTAG_DB[keyword].forEach((tag) => matched.add(tag))
      }
    })

    // 텍스트에서 직접 키워드를 추출하여 해시태그 생성
    const words = text.split(/\s+/).filter((w) => w.length >= 2)
    words.slice(0, 5).forEach((w) => matched.add(`#${w}`))

    if (matched.size === 0) {
      // 기본 해시태그
      ['#일상', '#소통', '#좋아요', '#데일리', '#오늘'].forEach((t) =>
        matched.add(t)
      )
    }

    setTags([...matched].slice(0, 15))
    setCopied(false)
  }

  function copyAll() {
    const text = tags.join(' ')
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <label className="block text-sm text-gray-700 mb-1">
          게시글 내용을 입력하세요
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="예: 오늘 여행에서 맛있는 음식을 먹었다"
          className="w-full h-32 p-4 rounded-lg border border-green-200 bg-white text-gray-900 resize-y focus:ring-2 focus:ring-green-500 outline-none"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="text-sm text-gray-500">
          카테고리 힌트:
        </span>
        {KEYWORDS.map((k) => (
          <span
            key={k}
            onClick={() => setText((prev) => prev + ' ' + k)}
            className="text-xs bg-green-50 text-gray-600 px-2 py-1 rounded cursor-pointer hover:bg-green-100 transition"
          >
            {k}
          </span>
        ))}
      </div>

      <button
        onClick={recommend}
        disabled={!text.trim()}
        className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition"
      >
        해시태그 추천받기
      </button>

      {tags.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={copyAll}
            className="px-4 py-2 text-sm bg-green-100 text-gray-700 rounded-lg hover:bg-green-200 transition"
          >
            {copied ? '✅ 복사됨!' : '전체 복사'}
          </button>
        </div>
      )}
    </div>
  )
}
