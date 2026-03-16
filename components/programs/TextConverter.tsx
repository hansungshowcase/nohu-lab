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
    navigator.clipboard.writeText(result).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = result
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
          원본 텍스트
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="변환할 텍스트를 입력하세요"
          className="w-full h-32 p-4 rounded-lg border border-orange-200 bg-white text-gray-900 resize-y focus:ring-2 focus:ring-orange-500 outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              mode === m.id
                ? 'bg-orange-600 text-white'
                : 'bg-orange-50 text-gray-700 hover:bg-orange-100'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {input && (
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            변환 결과
          </label>
          <div className="bg-orange-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap min-h-[80px]">
            {result}
          </div>
          <button
            onClick={handleCopy}
            className="mt-2 px-4 py-2 text-sm bg-orange-100 text-gray-700 rounded-lg hover:bg-orange-200 transition"
          >
            {copied ? '✅ 복사됨!' : '결과 복사'}
          </button>
        </div>
      )}
    </div>
  )
}
