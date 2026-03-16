'use client'

import { useState, useRef } from 'react'

export default function ImageResizer() {
  const [image, setImage] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 })
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [keepRatio, setKeepRatio] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        setOriginalSize({ width: img.width, height: img.height })
        setWidth(img.width)
        setHeight(img.height)
        setImage(ev.target?.result as string)
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  function handleWidthChange(w: number) {
    setWidth(w)
    if (keepRatio && originalSize.width) {
      setHeight(Math.round((w / originalSize.width) * originalSize.height))
    }
  }

  function handleHeightChange(h: number) {
    setHeight(h)
    if (keepRatio && originalSize.height) {
      setWidth(Math.round((h / originalSize.height) * originalSize.width))
    }
  }

  function handleDownload() {
    if (!image || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    canvas.width = width
    canvas.height = height

    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height)
      const link = document.createElement('a')
      link.download = `resized_${width}x${height}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.src = image
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      {!image ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-orange-200 rounded-lg p-12 text-center cursor-pointer hover:border-orange-500 transition"
        >
          <div className="text-4xl mb-3">🖼️</div>
          <p className="text-gray-600">
            클릭하여 이미지를 선택하세요
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      ) : (
        <>
          <div className="bg-orange-50 rounded-lg p-4">
            <img
              src={image}
              alt="Preview"
              className="max-h-64 mx-auto rounded"
            />
            <p className="text-center text-sm text-gray-500 mt-2">
              원본: {originalSize.width} × {originalSize.height}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm text-gray-700 mb-1">
                너비 (px)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-orange-200 bg-white text-gray-900"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-700 mb-1">
                높이 (px)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-orange-200 bg-white text-gray-900"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={keepRatio}
              onChange={(e) => setKeepRatio(e.target.checked)}
              className="rounded"
            />
            비율 유지
          </label>

          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition"
            >
              다운로드
            </button>
            <button
              onClick={() => {
                setImage(null)
                setWidth(0)
                setHeight(0)
              }}
              className="px-6 py-2 bg-orange-100 text-gray-700 rounded-lg hover:bg-orange-200 transition"
            >
              다른 이미지
            </button>
          </div>
        </>
      )}
    </div>
  )
}
