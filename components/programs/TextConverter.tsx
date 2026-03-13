'use client'

import { useState } from 'react'

// 한영 키맵
const KO_TO_EN: Record<string, string> = {
  'ㅂ':'q','ㅈ':'w','ㄷ':'e','ㄱ':'r','ㅅ':'t','ㅛ':'y','ㅕ':'u','ㅑ':'i','ㅐ':'o','ㅔ':'p',
  'ㅁ':'a','ㄴ':'s','ㅇ':'d','ㄹ':'f','ㅎ':'g','ㅗ':'h','ㅓ':'j','ㅏ':'k','ㅣ':'l',
  'ㅋ':'z','ㅌ':'x','ㅊ':'c','ㅍ':'v','ㅠ':'b','ㅜ':'n','ㅡ':'m',
  'ㅃ':'Q','ㅉ':'W','ㄸ':'E','ㄲ':'R','ㅆ':'T','ㅒ':'O','ㅖ':'P',
}
const EN_TO_KO: Record<string, string> = Object.fromEntries(
  Object.entries(KO_TO_EN).map(([k, v]) => [v, k])
)

type ConvertMode = 'upper' | 'lower' | 'capitalize' | 'koToEn' | 'enToKo' | 'reverse' | 'removeSpaces'

const MODES: { id: ConvertMode; label: string }[] = [
  { id: 'upper', label: '대문자 변환' },
  { id: 'lower', label: '소문자 변환' },
  { id: 'capitalize', label: '첫 글자 대문자' },
  { id: 'koToEn', label: '한→영 (자판 변환)' },
  { id: 'enToKo', label: '영→한 (자판 변환)' },
  { id: 'reverse', label: '텍스트 뒤집기' },
  { id: 'removeSpaces', label: '공백 제거' },
]

function convert(text: string, mode: ConvertMode): string {
  switch (mode) {
    case 'upper':
      return text.toUpperCase()
    case 'lower':
      return text.toLowerCase()
    case 'capitalize':
      return text.replace(/\b\w/g, (c) => c.toUpperCase())
    case 'koToEn':
      return [...text].map((c) => KO_TO_EN[c] || c).join('')
    case 'enToKo':
      return [...text].map((c) => EN_TO_KO[c] || c).join('')
    case 'reverse':
      return [...text].reverse().join('')
    case 'removeSpaces':
      return text.replace(/\s/g, '')
    default:
      return text
  }
}

export default function TextConverter() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<ConvertMode>('upper')
  const [copied, setCopied] = useState(false)

  const result = convert(input, mode)

  function handleCopy() {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
          원본 텍스트
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="변환할 텍스트를 입력하세요"
          className="w-full h-32 p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y focus:ring-2 focus:ring-green-500 outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              mode === m.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {input && (
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
            변환 결과
          </label>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-gray-900 dark:text-white whitespace-pre-wrap min-h-[80px]">
            {result}
          </div>
          <button
            onClick={handleCopy}
            className="mt-2 px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition"
          >
            {copied ? '✅ 복사됨!' : '결과 복사'}
          </button>
        </div>
      )}
    </div>
  )
}
