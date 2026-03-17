'use client'

import { useEffect, useState, useRef } from 'react'

interface ChatMessage {
  id: string
  sender_role: 'member' | 'admin'
  sender_nickname: string
  message: string
  is_read: boolean
  created_at: string
}

interface User {
  memberId: string
  nickname: string
  tier: 0 | 1 | 2 | 3 | 4
}

export default function ChatWidget({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [unread, setUnread] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 게스트(tier 0)이거나 관리자(tier 4)는 위젯 안 보임
  const shouldHide = !user || user.tier === 0 || user.tier === 4

  useEffect(() => {
    if (shouldHide) {
      setMessages([])
      setUnread(0)
      setLoaded(false)
      setOpen(false)
      return
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 10000)
    return () => clearInterval(interval)
  }, [shouldHide])

  useEffect(() => {
    if (shouldHide) return
    if (open) {
      fetchMessages()
      pollRef.current = setInterval(fetchMessages, 3000)
    } else {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    }
    return () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null } }
  }, [open, shouldHide])

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  if (shouldHide) return null

  async function fetchUnread() {
    try {
      const res = await fetch('/api/chat/rooms')
      if (res.ok) {
        const data = await res.json()
        if (typeof data.unreadCount === 'number') setUnread(data.unreadCount)
      }
    } catch {
      // 네트워크 오류 시 폴링이 재시도
    }
  }

  async function fetchMessages() {
    try {
      const res = await fetch('/api/chat/messages')
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
        setUnread(0)
        setLoaded(true)
      }
    } catch {
      // 네트워크 오류 시 폴링이 재시도
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    const savedInput = input
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim() }),
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages(prev => [...prev, msg])
        setInput('')
      }
    } catch {
      setInput(savedInput)
    } finally { setSending(false) }
  }

  function formatTime(d: string) {
    const date = new Date(d)
    const now = new Date()
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) + ' ' +
      date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* 채팅창 */}
      {open && (
        <div className="fixed bottom-20 right-3 sm:right-6 w-[min(340px,calc(100vw-1.5rem))] h-[480px] max-h-[calc(100dvh-8rem)] bg-white rounded-2xl shadow-2xl shadow-black/15 border border-gray-200 flex flex-col z-50 animate-[slideUp_0.2s_ease-out]">
          {/* 헤더 */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">N</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-gray-900">노후연구소</div>
              <div className="text-[11px] text-orange-600">문의 및 상담</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 min-h-0">
            {!loaded ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin h-6 w-6 border-3 border-orange-500 border-t-transparent rounded-full" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-2">
                <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                <p className="text-xs">관리자에게 메시지를 보내보세요!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender_role === 'member'
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[80%]">
                      {!isMine && (
                        <div className="text-[10px] text-gray-500 mb-0.5 ml-1">관리자</div>
                      )}
                      <div className={`px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${
                        isMine
                          ? 'bg-orange-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                      }`}>
                        {msg.message}
                      </div>
                      <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : ''}`}>
                        {isMine && msg.is_read && (
                          <span className="text-[9px] text-orange-600">읽음</span>
                        )}
                        <span className="text-[9px] text-gray-400 px-0.5">{formatTime(msg.created_at)}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={endRef} />
          </div>

          {/* 입력 */}
          <form onSubmit={handleSend} className="shrink-0 px-3 py-2.5 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="메시지 입력..."
                maxLength={1000}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="p-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white rounded-xl transition shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-4 sm:right-6 w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-full shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 flex items-center justify-center transition-all duration-200 z-50"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1 animate-bounce">
            {unread}
          </span>
        )}
      </button>
    </>
  )
}
