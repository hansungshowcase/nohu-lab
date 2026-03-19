'use client'

import { useState } from 'react'

// 한글 자모 분해/조합
const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ']
const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']

// 복합 종성 분해
const JONG_SPLIT: Record<string, [string, string]> = {
  'ㄳ':['ㄱ','ㅅ'],'ㄵ':['ㄴ','ㅈ'],'ㄶ':['ㄴ','ㅎ'],'ㄺ':['ㄹ','ㄱ'],'ㄻ':['ㄹ','ㅁ'],
  'ㄼ':['ㄹ','ㅂ'],'ㄽ':['ㄹ','ㅅ'],'ㄾ':['ㄹ','ㅌ'],'ㄿ':['ㄹ','ㅍ'],'ㅀ':['ㄹ','ㅎ'],
  'ㅄ':['ㅂ','ㅅ'],
}

// 복합 모음 분해
const JUNG_SPLIT: Record<string, [string, string]> = {
  'ㅘ':['ㅗ','ㅏ'],'ㅙ':['ㅗ','ㅐ'],'ㅚ':['ㅗ','ㅣ'],'ㅝ':['ㅜ','ㅓ'],'ㅞ':['ㅜ','ㅔ'],
  'ㅟ':['ㅜ','ㅣ'],'ㅢ':['ㅡ','ㅣ'],
}

function decomposeKorean(text: string): string[] {
  const result: string[] = []
  for (const ch of text) {
    const code = ch.charCodeAt(0)
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const offset = code - 0xAC00
      const cho = Math.floor(offset / (21 * 28))
      const jung = Math.floor((offset % (21 * 28)) / 28)
      const jong = offset % 28
      result.push(CHO[cho])
      const jungChar = JUNG[jung]
      if (JUNG_SPLIT[jungChar]) {
        result.push(...JUNG_SPLIT[jungChar])
      } else {
        result.push(jungChar)
      }
      if (jong > 0) {
        const jongChar = JONG[jong]
        if (JONG_SPLIT[jongChar]) {
          result.push(...JONG_SPLIT[jongChar])
        } else {
          result.push(jongChar)
        }
      }
    } else {
      result.push(ch)
    }
  }
  return result
}

// 한영 키맵
const JAMO_TO_EN: Record<string, string> = {
  'ㅂ':'q','ㅈ':'w','ㄷ':'e','ㄱ':'r','ㅅ':'t','ㅛ':'y','ㅕ':'u','ㅑ':'i','ㅐ':'o','ㅔ':'p',
  'ㅁ':'a','ㄴ':'s','ㅇ':'d','ㄹ':'f','ㅎ':'g','ㅗ':'h','ㅓ':'j','ㅏ':'k','ㅣ':'l',
  'ㅋ':'z','ㅌ':'x','ㅊ':'c','ㅍ':'v','ㅠ':'b','ㅜ':'n','ㅡ':'m',
  'ㅃ':'Q','ㅉ':'W','ㄸ':'E','ㄲ':'R','ㅆ':'T','ㅒ':'O','ㅖ':'P',
}
const EN_TO_JAMO: Record<string, string> = Object.fromEntries(
  Object.entries(JAMO_TO_EN).map(([k, v]) => [v, k])
)

// 자모 → 조합형 한글 합성
function composeKorean(jamos: string[]): string {
  let result = ''
  let i = 0
  while (i < jamos.length) {
    const ch = jamos[i]
    const choIdx = CHO.indexOf(ch)
    if (choIdx < 0) { result += ch; i++; continue }

    // 다음이 중성인지 확인
    if (i + 1 >= jamos.length) { result += ch; i++; continue }
    let jungChar = jamos[i + 1]
    // 복합 모음 체크
    if (i + 2 < jamos.length) {
      for (const [comp, [a, b]] of Object.entries(JUNG_SPLIT)) {
        if (jungChar === a && jamos[i + 2] === b) { jungChar = comp; i++; break }
      }
    }
    const jungIdx = JUNG.indexOf(jungChar)
    if (jungIdx < 0) { result += ch; i++; continue }

    // 종성 확인
    let jongIdx = 0
    if (i + 2 < jamos.length) {
      const nextJamo = jamos[i + 2]
      const tempJongIdx = JONG.indexOf(nextJamo)
      if (tempJongIdx > 0) {
        // 다음 다음이 중성이면 종성으로 쓰지 않음 (다음 초성으로 사용)
        if (i + 3 < jamos.length && JUNG.indexOf(jamos[i + 3]) >= 0) {
          // 복합 종성인지 확인
          if (i + 4 < jamos.length && JUNG.indexOf(jamos[i + 4]) < 0) {
            // 복합 종성 시도하지 않음, 종성 없이 마무리
          }
          // 종성 없이 합성
        } else {
          jongIdx = tempJongIdx
          i++
          // 복합 종성 체크
          if (i + 2 < jamos.length) {
            const nextNext = jamos[i + 2]
            for (const [comp, [a, b]] of Object.entries(JONG_SPLIT)) {
              if (nextJamo === a && nextNext === b) {
                const compIdx = JONG.indexOf(comp)
                if (compIdx > 0) {
                  // 다음 다음이 중성이면 복합 종성을 쓰지 않음
                  if (i + 3 < jamos.length && JUNG.indexOf(jamos[i + 3]) >= 0) break
                  jongIdx = compIdx; i++
                }
                break
              }
            }
          }
        }
      }
    }
    result += String.fromCharCode(0xAC00 + choIdx * 21 * 28 + jungIdx * 28 + jongIdx)
    i += 2
  }
  return result
}

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
      return decomposeKorean(text).map(c => JAMO_TO_EN[c] || c).join('')
    case 'enToKo': {
      const jamos = [...text].map(c => EN_TO_JAMO[c] || c)
      return composeKorean(jamos)
    }
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

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-3 py-2.5 sm:py-1.5 min-h-[44px] rounded-lg text-sm transition ${
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
          <div className="bg-orange-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap break-words overflow-hidden min-h-[80px]">
            {result}
          </div>
          <button
            onClick={handleCopy}
            className="mt-2 px-4 py-3 min-h-[44px] text-sm bg-orange-100 text-gray-700 rounded-lg hover:bg-orange-200 transition"
          >
            {copied ? '✅ 복사됨!' : '결과 복사'}
          </button>
        </div>
      )}
    </div>
  )
}
