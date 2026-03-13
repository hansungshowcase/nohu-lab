'use client'

import { useState } from 'react'

export default function TextCounter() {
  const [text, setText] = useState('')

  const chars = text.length
  const charsNoSpace = text.replace(/\s/g, '').length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const lines = text ? text.split('\n').length : 0
  const bytes = new TextEncoder().encode(text).length

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="여기에 텍스트를 입력하세요..."
        className="w-full h-48 p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y focus:ring-2 focus:ring-green-500 outline-none"
      />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: '글자수', value: chars },
          { label: '공백 제외', value: charsNoSpace },
          { label: '단어수', value: words },
          { label: '줄수', value: lines },
          { label: '바이트', value: bytes },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center"
          >
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {item.value.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {text && (
        <button
          onClick={() => setText('')}
          className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition"
        >
          초기화
        </button>
      )}
    </div>
  )
}
