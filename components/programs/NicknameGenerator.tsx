'use client'

import { useState } from 'react'

const adjectives = [
  '행복한', '빛나는', '용감한', '지혜로운', '신비한', '달콤한', '활기찬', '우아한',
  '멋진', '귀여운', '강인한', '따뜻한', '상큼한', '영리한', '든든한', '반짝이는',
  '깜찍한', '당당한', '자유로운', '편안한', '재미있는', '꿈꾸는', '날렵한', '포근한',
]

const nouns = [
  '고양이', '토끼', '여우', '곰돌이', '펭귄', '다람쥐', '올빼미', '수달',
  '판다', '사슴', '고래', '나비', '별', '달', '구름', '바다',
  '산', '숲', '바람', '하늘', '꽃', '이슬', '무지개', '햇살',
]

function generateOne(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.random() > 0.5 ? Math.floor(Math.random() * 100) : ''
  return `${adj}${noun}${num}`
}

export default function NicknameGenerator() {
  const [nicknames, setNicknames] = useState<string[]>([])
  const [count, setCount] = useState(5)

  function generate() {
    const results = new Set<string>()
    let attempts = 0
    while (results.size < count && attempts < count * 3) {
      results.add(generateOne())
      attempts++
    }
    setNicknames([...results])
  }

  function copyToClipboard(text: string) {
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
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
        <div className="flex-1">
          <label className="block text-sm text-gray-700 mb-1">
            생성 개수
          </label>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full px-3 py-3 min-h-[44px] rounded-lg border border-orange-200 bg-white text-gray-900"
          >
            {[3, 5, 10, 20].map((n) => (
              <option key={n} value={n}>{n}개</option>
            ))}
          </select>
        </div>
        <button
          onClick={generate}
          className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition"
        >
          🎲 생성하기
        </button>
      </div>

      {nicknames.length > 0 && (
        <div className="space-y-2">
          {nicknames.map((nick, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-orange-50 rounded-lg px-4 py-3"
            >
              <span className="text-gray-900 font-medium break-all">
                {nick}
              </span>
              <button
                onClick={() => copyToClipboard(nick)}
                className="text-sm text-orange-600 hover:text-orange-700 px-3 py-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-orange-50 transition"
              >
                복사
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
