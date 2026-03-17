'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import TierBadge from '@/components/TierBadge'
import { TIER_MAP } from '@/lib/types'
import { programRegistry } from '@/app/programs/registry'

interface MemberRow {
  id: string
  nickname: string
  phone: string
  phone_masked: string
  tier: number
  created_at: string
  last_login: string | null
}

interface NewMember {
  nickname: string
  tier: number
}

interface ChatRoom {
  roomId: string
  memberNickname: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  sender_nickname: string
  sender_role: 'member' | 'admin'
  message: string
  is_read: boolean
  created_at: string
}

type Tab = 'members' | 'programs' | 'dashboard' | 'sync' | 'chat'

function AdminContent() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('members')
  const [members, setMembers] = useState<MemberRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMember, setNewMember] = useState<NewMember>({ nickname: '', tier: 1 })
  const [bulkInput, setBulkInput] = useState('')
  const [addMode, setAddMode] = useState<'single' | 'bulk'>('single')

  // 채팅 관련 상태
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatSending, setChatSending] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatPollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  async function fetchMembers() {
    setLoading(true)
    try {
      const res = await fetch('/api/members')
      if (res.status === 403) {
        router.push('/dashboard')
        return
      }
      const data = await res.json()
      setMembers(Array.isArray(data) ? data : [])
    } catch {
      setMessage('회원 목록을 불러올 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  async function handleTierChange(id: string, tier: number) {
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })
      if (res.ok) {
        setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, tier } : m)))
      } else {
        setMessage('등급 변경에 실패했습니다.')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch {
      setMessage('네트워크 오류가 발생했습니다.')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  async function handleDelete(id: string, nickname: string) {
    if (!confirm(`${nickname} 회원을 삭제하시겠습니까?`)) return
    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== id))
        setMessage('삭제되었습니다.')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('삭제에 실패했습니다.')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch {
      setMessage('네트워크 오류가 발생했습니다.')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  async function handleAddMember() {
    if (!newMember.nickname.trim()) return
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: newMember.nickname.trim(), tier: newMember.tier }),
    })
    const data = await res.json()
    if (res.ok) {
      setMembers((prev) => [data, ...prev])
      setNewMember({ nickname: '', tier: 1 })
      setMessage(`${newMember.nickname.trim()} 회원이 등록되었습니다.`)
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage(data.error || '등록에 실패했습니다.')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  async function handleBulkAdd() {
    const nicknames = bulkInput
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean)
    if (nicknames.length === 0) return

    const res = await fetch('/api/members/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nicknames, tier: newMember.tier }),
    })
    const data = await res.json()
    if (res.ok) {
      setMessage(`${data.added}명 등록 완료${data.skipped > 0 ? ` (중복 ${data.skipped}명 건너뜀)` : ''}`)
      setBulkInput('')
      fetchMembers()
      setTimeout(() => setMessage(''), 5000)
    } else {
      setMessage(data.error || '등록에 실패했습니다.')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const filtered = members.filter((m) =>
    m.nickname.toLowerCase().includes(search.toLowerCase())
  )

  const tierCounts = useMemo(() => [1, 2, 3, 4].map(
    (t) => members.filter((m) => m.tier === t).length
  ), [members])

  // 채팅방 목록 로드
  useEffect(() => {
    if (tab === 'chat') {
      fetchChatRooms()
      const interval = setInterval(fetchChatRooms, 5000)
      return () => clearInterval(interval)
    }
  }, [tab])

  // 선택된 방의 메시지 로드
  useEffect(() => {
    if (!selectedRoom) return
    fetchChatMessages(selectedRoom)
    chatPollRef.current = setInterval(() => fetchChatMessages(selectedRoom), 3000)
    return () => {
      if (chatPollRef.current) clearInterval(chatPollRef.current)
    }
  }, [selectedRoom])

  // 메시지 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  async function fetchChatRooms() {
    setChatLoading(true)
    try {
      const res = await fetch('/api/chat/rooms')
      if (res.ok) {
        const data = await res.json()
        setChatRooms(data)
      }
    } catch {
      // 네트워크 오류 시 무시 (폴링이 재시도)
    } finally {
      setChatLoading(false)
    }
  }

  async function fetchChatMessages(roomId: string) {
    try {
      const res = await fetch(`/api/chat/messages?roomId=${roomId}`)
      if (res.ok) {
        const data = await res.json()
        setChatMessages(data)
      }
    } catch {
      // 네트워크 오류 시 무시 (폴링이 재시도)
    }
  }

  async function handleChatSend(e: React.FormEvent) {
    e.preventDefault()
    if (!chatInput.trim() || chatSending || !selectedRoom) return
    setChatSending(true)
    const savedInput = chatInput
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput.trim(), roomId: selectedRoom }),
      })
      if (res.ok) {
        const newMsg = await res.json()
        setChatMessages(prev => [...prev, newMsg])
        setChatInput('')
        fetchChatRooms()
      } else {
        setMessage('메시지 전송에 실패했습니다.')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch {
      setChatInput(savedInput)
      setMessage('네트워크 오류가 발생했습니다.')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setChatSending(false)
    }
  }

  function formatChatTime(dateStr: string) {
    const d = new Date(dateStr)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    if (isToday) {
      return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) + ' ' +
      d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  const totalUnread = chatRooms.reduce((sum, r) => sum + r.unreadCount, 0)

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'members', label: '회원 관리' },
    { id: 'chat', label: '채팅', badge: totalUnread },
    { id: 'sync', label: '카페 동기화' },
    { id: 'programs', label: '프로그램 관리' },
    { id: 'dashboard', label: '대시보드' },
  ]

  const [syncStatus, setSyncStatus] = useState<{
    totalMembers?: number
    lastVerifySuccess?: string | null
    lastVerifyAny?: string | null
    lastVerifyStatus?: string | null
  } | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/admin/sync-status', { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setSyncStatus(data) })
      .catch((err) => { if (err.name !== 'AbortError') { /* 네트워크 오류 무시 */ } })
    return () => controller.abort()
  }, [])

  // 동기화 경고 조건: 회원 1명 이하이거나, 마지막 확인 실패
  const syncWarning = syncStatus && (
    (syncStatus.totalMembers || 0) <= 1 ||
    syncStatus.lastVerifyStatus === 'error'
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        관리자 패널
      </h1>

      {message && (
        <div className="mb-4 p-3 bg-orange-50 text-orange-700 rounded-lg text-sm whitespace-pre-line">
          {message}
        </div>
      )}

      {/* 탭 */}
      <div className="flex gap-2 mb-6 border-b border-orange-100">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition relative ${
              tab === t.id
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.badge && t.badge > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* 동기화 경고 (모든 탭에서 표시) */}
      {syncWarning && (
        <div className="mb-4 bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3 cursor-pointer" onClick={() => setTab('sync')}>
          <span className="text-xl mt-0.5">&#9888;&#65039;</span>
          <div>
            <p className="font-bold text-red-800">회원 동기화가 정상 작동하지 않고 있습니다</p>
            <p className="text-sm text-red-700 mt-0.5">
              {(syncStatus?.totalMembers || 0) <= 1
                ? 'DB에 등록된 회원이 없습니다. 확장프로그램이 실행 중인지 확인하세요.'
                : '마지막 회원 확인이 실패했습니다. 확장프로그램 상태를 확인하세요.'}
            </p>
            <p className="text-xs text-red-600 mt-1 underline">카페 동기화 탭에서 확인하기</p>
          </div>
        </div>
      )}

      {/* 회원 관리 탭 */}
      {tab === 'members' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="닉네임 검색..."
              className="flex-1 min-w-0 px-4 py-2 rounded-lg border border-orange-200 bg-white text-gray-900"
            />
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium"
            >
              {showAddForm ? '닫기' : '+ 회원 등록'}
            </button>
            <a
              href="https://cafe.naver.com/ManageWholeMember.nhn?clubid=20898041"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white border border-orange-300 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-50"
            >
              카페 회원 목록 보기
            </a>
          </div>

          {/* 회원 등록 폼 */}
          {showAddForm && (
            <div className="bg-white rounded-lg border border-orange-200 p-4 space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setAddMode('single')}
                  className={`px-3 py-1.5 rounded-lg text-sm ${addMode === 'single' ? 'bg-orange-600 text-white' : 'bg-orange-50 text-gray-700'}`}
                >
                  개별 등록
                </button>
                <button
                  onClick={() => setAddMode('bulk')}
                  className={`px-3 py-1.5 rounded-lg text-sm ${addMode === 'bulk' ? 'bg-orange-600 text-white' : 'bg-orange-50 text-gray-700'}`}
                >
                  일괄 등록
                </button>
              </div>

              {addMode === 'single' ? (
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm text-gray-700 mb-1">카페 닉네임</label>
                    <input
                      type="text"
                      value={newMember.nickname}
                      onChange={(e) => setNewMember({ ...newMember, nickname: e.target.value })}
                      placeholder="카페에서 확인한 닉네임"
                      className="w-full px-3 py-2 rounded-lg border border-orange-200 bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">등급</label>
                    <select
                      value={newMember.tier}
                      onChange={(e) => setNewMember({ ...newMember, tier: parseInt(e.target.value) })}
                      className="px-3 py-2 rounded-lg border border-orange-200 bg-white text-gray-900"
                    >
                      {[1, 2, 3, 4].map((t) => (
                        <option key={t} value={t}>{TIER_MAP[t].name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleAddMember}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium"
                  >
                    등록
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      닉네임 목록 (한 줄에 하나씩)
                    </label>
                    <textarea
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      placeholder={"닉네임1\n닉네임2\n닉네임3"}
                      className="w-full h-32 px-3 py-2 rounded-lg border border-orange-200 bg-white text-gray-900 resize-y"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">등급</label>
                      <select
                        value={newMember.tier}
                        onChange={(e) => setNewMember({ ...newMember, tier: parseInt(e.target.value) })}
                        className="px-3 py-2 rounded-lg border border-orange-200 bg-white text-gray-900"
                      >
                        {[1, 2, 3, 4].map((t) => (
                          <option key={t} value={t}>{TIER_MAP[t].name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleBulkAdd}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium mt-auto"
                    >
                      일괄 등록 ({bulkInput.split('\n').filter((n) => n.trim()).length}명)
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    카페 회원 관리 페이지에서 닉네임을 복사해서 붙여넣으세요.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 회원 목록 테이블 */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-orange-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-700">닉네임</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">등급</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">마지막 로그인</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((member) => (
                    <tr key={member.id} className="hover:bg-orange-50">
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {member.nickname}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={member.tier}
                          onChange={(e) => handleTierChange(member.id, parseInt(e.target.value))}
                          className="px-2 py-1 rounded border border-orange-200 bg-white text-gray-900 text-sm"
                        >
                          {[1, 2, 3, 4].map((t) => (
                            <option key={t} value={t}>{TIER_MAP[t].name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {member.last_login
                          ? new Date(member.last_login).toLocaleString('ko-KR')
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(member.id, member.nickname)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-xs text-gray-400 mt-2 px-4">
                총 {filtered.length}명
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  {search ? '검색 결과가 없습니다.' : '등록된 회원이 없습니다. 카페 회원 동기화를 실행하세요.'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 카페 동기화 탭 */}
      {tab === 'sync' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-orange-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">실시간 회원 확인 (Chrome 확장프로그램)</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              사용자가 닉네임으로 로그인하면, Chrome 확장프로그램이 <b>실시간으로</b> 네이버 카페 회원 여부를 확인합니다.<br />
              확인된 회원은 자동으로 DB에 등록되므로, 별도의 수동 등록이 필요 없습니다.
            </p>

            <div className="bg-blue-50 rounded-lg p-4 space-y-2 border border-blue-200">
              <h3 className="font-bold text-blue-800 text-base">작동 방식</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-900">
                <li>사용자가 닉네임 입력 후 로그인 클릭</li>
                <li>DB에 있으면 즉시 로그인 (기존 회원)</li>
                <li>DB에 없으면 확장프로그램이 카페에서 실시간 검색</li>
                <li>카페 회원이면 자동 등록 + 로그인 완료</li>
                <li>카페 회원이 아니면 로그인 거부</li>
              </ol>
            </div>

            {syncStatus && (
              <div className={`rounded-lg p-4 ${syncStatus.totalMembers && syncStatus.totalMembers > 1 ? 'bg-orange-50 border border-orange-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className={`font-bold text-base ${syncStatus.totalMembers && syncStatus.totalMembers > 1 ? 'text-orange-800' : 'text-yellow-800'}`}>
                  DB 등록 회원: {syncStatus.totalMembers || 0}명
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-orange-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">확장프로그램 설치 방법</h2>

            <a
              href="/cafe-sync-extension.zip"
              download
              className="flex items-center justify-center gap-3 w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-base transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              확장프로그램 다운로드 (cafe-sync-extension.zip)
            </a>

            <div className="bg-orange-50 rounded-lg p-5 space-y-3">
              <h3 className="font-bold text-gray-900 text-base">1단계: 다운로드 &amp; 압축 해제</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-800">
                <li>위 버튼을 클릭해서 zip 파일 다운로드</li>
                <li>다운로드한 파일을 <b>바탕화면</b>에 압축 해제</li>
              </ol>
            </div>

            <div className="bg-orange-50 rounded-lg p-5 space-y-3">
              <h3 className="font-bold text-gray-900 text-base">2단계: Chrome에 설치</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-800">
                <li>Chrome 주소창에 <code className="bg-white px-1.5 py-0.5 rounded text-xs border font-bold">chrome://extensions</code> 입력 후 이동</li>
                <li>우측 상단 <b>&quot;개발자 모드&quot;</b> 스위치 켜기</li>
                <li>좌측 상단 <b>&quot;압축해제된 확장 프로그램을 로드합니다&quot;</b> 클릭</li>
                <li>바탕화면에 압축 해제한 <code className="bg-white px-1.5 py-0.5 rounded text-xs border font-bold">cafe-sync-extension</code> 폴더 선택</li>
              </ol>
            </div>

            <div className="bg-amber-50 rounded-lg p-5 space-y-3 border border-amber-200">
              <h3 className="font-bold text-gray-900 text-base">3단계: 네이버 관리자 계정 로그인 (중요!)</h3>
              <div className="bg-white rounded-lg p-4 border border-amber-300">
                <p className="text-sm text-gray-800 mb-3">
                  확장프로그램이 설치된 <b>같은 Chrome 브라우저</b>에서 아래 계정으로 네이버에 로그인해야 합니다.
                </p>
                <div className="flex items-center gap-3 bg-amber-50 rounded-lg px-4 py-3">
                  <span className="text-lg">👤</span>
                  <div>
                    <p className="text-base font-bold text-gray-900">네이버 계정: <code className="bg-white px-2 py-0.5 rounded border text-orange-700">qhdl20</code></p>
                    <p className="text-xs text-gray-500 mt-0.5">노후연구소 카페 관리자 계정</p>
                  </div>
                </div>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-800">
                <li><a href="https://nid.naver.com/nidlogin.login" target="_blank" rel="noopener noreferrer" className="text-orange-700 underline font-bold">네이버 로그인 페이지</a>에서 <code className="bg-white px-1.5 py-0.5 rounded text-xs border font-bold">qhdl20</code> 계정으로 로그인</li>
                <li><a href="https://cafe.naver.com/eovhskfktmak" target="_blank" rel="noopener noreferrer" className="text-orange-700 underline font-bold">노후연구소 카페</a>에 접속해서 관리 메뉴가 보이는지 확인</li>
                <li>카페 &gt; <b>관리</b> &gt; <b>회원 관리</b> 페이지에 접근 가능하면 OK</li>
              </ol>
              <p className="text-xs text-red-600 font-bold">* 다른 네이버 계정으로 로그인하면 회원 확인이 안 됩니다!</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-5 space-y-3">
              <h3 className="font-bold text-gray-900 text-base">4단계: 정상 작동 확인</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-800">
                <li>확장프로그램 아이콘 클릭 &gt; <b>&quot;실행 중&quot;</b> 확인</li>
                <li>노후연구소 웹사이트에서 카페 회원 닉네임으로 로그인 테스트</li>
                <li>&quot;회원 확인 중...&quot; 메시지 후 로그인 성공하면 정상!</li>
              </ol>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-5 space-y-2">
            <h3 className="font-bold text-yellow-800">주의사항</h3>
            <ul className="list-disc list-inside text-sm text-yellow-900 space-y-1.5">
              <li><b>Chrome이 켜져 있어야</b> 새로운 회원 로그인이 가능합니다</li>
              <li><b>네이버 카페 관리자 계정</b>으로 로그인 되어 있어야 합니다</li>
              <li>이미 DB에 등록된 회원은 확장프로그램 없이도 로그인됩니다</li>
              <li>확장프로그램이 꺼져 있으면, 신규 회원만 로그인 불가합니다</li>
            </ul>
          </div>

          <div className="bg-red-50 rounded-lg border border-red-200 p-5 space-y-2">
            <h3 className="font-bold text-red-800">로그인이 안 될 때 체크리스트</h3>
            <ul className="list-disc list-inside text-sm text-red-900 space-y-1.5">
              <li>Chrome이 실행 중인가? (백그라운드 실행 포함)</li>
              <li>확장프로그램이 활성화되어 있는가? (chrome://extensions 확인)</li>
              <li>네이버에 관리자 계정으로 로그인되어 있는가?</li>
              <li>카페 회원 관리 페이지가 열려 있는가? (자동으로 열림)</li>
              <li>위 항목 모두 확인 후에도 안 되면 확장프로그램을 새로고침 해보세요</li>
            </ul>
          </div>
        </div>
      )}

      {/* 채팅 탭 */}
      {tab === 'chat' && (
        <div className="flex gap-2 sm:gap-4" style={{ height: 'calc(100dvh - 250px)' }}>
          {/* 채팅방 목록 */}
          <div className={`${selectedRoom ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border border-gray-200 rounded-xl bg-white overflow-hidden shrink-0`}>
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-sm text-gray-700">대화 목록</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chatRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                  <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                  <p className="text-sm">아직 대화가 없습니다</p>
                </div>
              ) : (
                chatRooms.map((room) => (
                  <button
                    key={room.roomId}
                    onClick={() => setSelectedRoom(room.roomId)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-orange-50 transition ${
                      selectedRoom === room.roomId ? 'bg-orange-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center border border-orange-200/50 shrink-0">
                          <span className="text-orange-700 font-semibold text-xs">
                            {room.memberNickname.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">{room.memberNickname}</div>
                          <div className="text-xs text-gray-500 truncate mt-0.5">{room.lastMessage}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                        <span className="text-[10px] text-gray-400">{formatChatTime(room.lastMessageAt)}</span>
                        {room.unreadCount > 0 && (
                          <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* 채팅 메시지 영역 */}
          <div className={`${selectedRoom ? 'flex' : 'hidden md:flex'} flex-col flex-1 border border-gray-200 rounded-xl bg-white overflow-hidden`}>
            {selectedRoom ? (
              <>
                {/* 채팅 헤더 */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="md:hidden p-1 hover:bg-gray-200 rounded-lg"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center border border-orange-200/50">
                    <span className="text-orange-700 font-semibold text-xs">
                      {chatRooms.find(r => r.roomId === selectedRoom)?.memberNickname?.charAt(0) || '?'}
                    </span>
                  </div>
                  <span className="font-semibold text-sm text-gray-900">
                    {chatRooms.find(r => r.roomId === selectedRoom)?.memberNickname || '회원'}
                  </span>
                </div>

                {/* 메시지 목록 */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
                  {chatMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      대화를 시작하세요
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isAdmin = msg.sender_role === 'admin'
                      return (
                        <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-[75%]">
                            {!isAdmin && (
                              <div className="text-xs text-gray-500 mb-1 ml-1 font-medium">{msg.sender_nickname}</div>
                            )}
                            <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed ${
                              isAdmin
                                ? 'bg-orange-600 text-white rounded-br-md'
                                : 'bg-gray-100 text-gray-900 rounded-bl-md'
                            }`}>
                              {msg.message}
                            </div>
                            <div className={`flex items-center gap-1 mt-1 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                              {isAdmin && msg.is_read && (
                                <span className="text-[10px] text-orange-600">읽음</span>
                              )}
                              <span className="text-[10px] text-gray-400 px-1">{formatChatTime(msg.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* 입력 */}
                <form onSubmit={handleChatSend} className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="메시지를 입력하세요..."
                      maxLength={1000}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || chatSending}
                      className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white rounded-xl font-medium text-sm transition"
                    >
                      {chatSending ? (
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        '전송'
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-500">대화를 선택하세요</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 프로그램 관리 탭 */}
      {tab === 'programs' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            프로그램은 코드에서 직접 추가/수정합니다.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-orange-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-700">프로그램</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">카테고리</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">최소 등급</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {programRegistry.map((p) => (
                  <tr key={p.id} className="hover:bg-orange-50">
                    <td className="px-4 py-3 text-gray-900">
                      {p.icon} {p.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.category}</td>
                    <td className="px-4 py-3">
                      <TierBadge tier={p.minTier} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                        {p.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 대시보드 탭 */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg p-4 border border-orange-100">
              <div className="text-2xl font-bold text-gray-900">
                {members.length}
              </div>
              <div className="text-sm text-gray-500">전체 회원</div>
            </div>
            {[1, 2, 3, 4].map((t) => (
              <div key={t} className="bg-white rounded-lg p-4 border border-orange-100">
                <div className="text-2xl font-bold text-gray-900">
                  {tierCounts[t - 1]}
                </div>
                <div className="text-sm text-gray-500">
                  {TIER_MAP[t].name}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              최근 로그인
            </h3>
            <div className="space-y-2">
              {members
                .filter((m) => m.last_login)
                .sort((a, b) => new Date(b.last_login!).getTime() - new Date(a.last_login!).getTime())
                .slice(0, 10)
                .map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-orange-100"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{m.nickname}</span>
                      <TierBadge tier={m.tier} />
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(m.last_login!).toLocaleString('ko-KR')}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  return <AdminContent />
}
