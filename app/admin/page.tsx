'use client'

import { useEffect, useState } from 'react'
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

type Tab = 'members' | 'programs' | 'dashboard' | 'sync'

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
    const res = await fetch(`/api/members/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier }),
    })
    if (res.ok) {
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, tier } : m)))
    }
  }

  async function handleDelete(id: string, nickname: string) {
    if (!confirm(`${nickname} 회원을 삭제하시겠습니까?`)) return
    const res = await fetch(`/api/members/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== id))
      setMessage('삭제되었습니다.')
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

  const tierCounts = [1, 2, 3, 4].map(
    (t) => members.filter((m) => m.tier === t).length
  )

  const tabs: { id: Tab; label: string }[] = [
    { id: 'members', label: '회원 관리' },
    { id: 'sync', label: '카페 동기화' },
    { id: 'programs', label: '프로그램 관리' },
    { id: 'dashboard', label: '대시보드' },
  ]

  const [syncStatus, setSyncStatus] = useState<{
    success?: boolean
    totalMembers?: number
    inserted?: number
    updated?: number
    lastSync?: string
  } | null>(null)

  useEffect(() => {
    if (tab === 'sync') {
      fetch('/api/admin/sync-status')
        .then(r => r.json())
        .then(data => setSyncStatus(data))
        .catch(() => {})
    }
  }, [tab])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        관리자 패널
      </h1>

      {message && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm whitespace-pre-line">
          {message}
        </div>
      )}

      {/* 탭 */}
      <div className="flex gap-2 mb-6 border-b border-green-100">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              tab === t.id
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 회원 관리 탭 */}
      {tab === 'members' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="닉네임 검색..."
              className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-green-200 bg-white text-gray-900"
            />
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
            >
              {showAddForm ? '닫기' : '+ 회원 등록'}
            </button>
            <a
              href="https://cafe.naver.com/ManageWholeMember.nhn?clubid=20898041"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg text-sm font-medium hover:bg-green-50"
            >
              카페 회원 목록 보기
            </a>
          </div>

          {/* 회원 등록 폼 */}
          {showAddForm && (
            <div className="bg-white rounded-lg border border-green-200 p-4 space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setAddMode('single')}
                  className={`px-3 py-1.5 rounded-lg text-sm ${addMode === 'single' ? 'bg-green-600 text-white' : 'bg-green-50 text-gray-700'}`}
                >
                  개별 등록
                </button>
                <button
                  onClick={() => setAddMode('bulk')}
                  className={`px-3 py-1.5 rounded-lg text-sm ${addMode === 'bulk' ? 'bg-green-600 text-white' : 'bg-green-50 text-gray-700'}`}
                >
                  일괄 등록
                </button>
              </div>

              {addMode === 'single' ? (
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm text-gray-700 mb-1">카페 닉네임</label>
                    <input
                      type="text"
                      value={newMember.nickname}
                      onChange={(e) => setNewMember({ ...newMember, nickname: e.target.value })}
                      placeholder="카페에서 확인한 닉네임"
                      className="w-full px-3 py-2 rounded-lg border border-green-200 bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">등급</label>
                    <select
                      value={newMember.tier}
                      onChange={(e) => setNewMember({ ...newMember, tier: parseInt(e.target.value) })}
                      className="px-3 py-2 rounded-lg border border-green-200 bg-white text-gray-900"
                    >
                      {[1, 2, 3, 4].map((t) => (
                        <option key={t} value={t}>{TIER_MAP[t].name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleAddMember}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
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
                      className="w-full h-32 px-3 py-2 rounded-lg border border-green-200 bg-white text-gray-900 resize-y"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">등급</label>
                      <select
                        value={newMember.tier}
                        onChange={(e) => setNewMember({ ...newMember, tier: parseInt(e.target.value) })}
                        className="px-3 py-2 rounded-lg border border-green-200 bg-white text-gray-900"
                      >
                        {[1, 2, 3, 4].map((t) => (
                          <option key={t} value={t}>{TIER_MAP[t].name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleBulkAdd}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium mt-auto"
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
              <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-green-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-700">닉네임</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">등급</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">마지막 로그인</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((member) => (
                    <tr key={member.id} className="hover:bg-green-50">
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {member.nickname}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={member.tier}
                          onChange={(e) => handleTierChange(member.id, parseInt(e.target.value))}
                          className="px-2 py-1 rounded border border-green-200 bg-white text-gray-900 text-sm"
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
          {/* 동기화 상태 경고 */}
          {members.length <= 1 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">&#9888;&#65039;</span>
                <h3 className="text-lg font-bold text-red-800">회원 동기화가 필요합니다!</h3>
              </div>
              <p className="text-sm text-red-700">
                현재 DB에 등록된 회원이 {members.length}명뿐입니다.
                Chrome 확장프로그램이 설치되어 있지 않거나, 실행 중이 아닐 수 있습니다.
              </p>
              <p className="text-sm text-red-700 font-bold">
                확장프로그램이 실행되지 않으면 새로운 회원이 로그인할 수 없습니다.
              </p>
            </div>
          )}

          <div className="bg-white rounded-lg border border-green-200 p-6 space-y-4">
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
              <div className={`rounded-lg p-4 ${syncStatus.totalMembers && syncStatus.totalMembers > 1 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className={`font-bold text-base ${syncStatus.totalMembers && syncStatus.totalMembers > 1 ? 'text-green-800' : 'text-yellow-800'}`}>
                  DB 등록 회원: {syncStatus.totalMembers || 0}명
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-green-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">확장프로그램 설치 방법</h2>

            <a
              href="/cafe-sync-extension.zip"
              download
              className="flex items-center justify-center gap-3 w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-base transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              확장프로그램 다운로드 (cafe-sync-extension.zip)
            </a>

            <div className="bg-green-50 rounded-lg p-5 space-y-3">
              <h3 className="font-bold text-gray-900 text-base">1단계: 다운로드 &amp; 압축 해제</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-800">
                <li>위 버튼을 클릭해서 zip 파일 다운로드</li>
                <li>다운로드한 파일을 <b>바탕화면</b>에 압축 해제</li>
              </ol>
            </div>

            <div className="bg-green-50 rounded-lg p-5 space-y-3">
              <h3 className="font-bold text-gray-900 text-base">2단계: Chrome에 설치</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-800">
                <li>Chrome 주소창에 <code className="bg-white px-1.5 py-0.5 rounded text-xs border font-bold">chrome://extensions</code> 입력 후 이동</li>
                <li>우측 상단 <b>&quot;개발자 모드&quot;</b> 스위치 켜기</li>
                <li>좌측 상단 <b>&quot;압축해제된 확장 프로그램을 로드합니다&quot;</b> 클릭</li>
                <li>바탕화면에 압축 해제한 <code className="bg-white px-1.5 py-0.5 rounded text-xs border font-bold">cafe-sync-extension</code> 폴더 선택</li>
              </ol>
            </div>

            <div className="bg-green-50 rounded-lg p-5 space-y-3">
              <h3 className="font-bold text-gray-900 text-base">3단계: 네이버 로그인 확인</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-800">
                <li>같은 Chrome에서 <a href="https://cafe.naver.com/eovhskfktmak" target="_blank" rel="noopener noreferrer" className="text-green-700 underline font-bold">노후연구소 카페</a>에 접속</li>
                <li><b>카페 관리자(운영진) 계정</b>으로 로그인되어 있는지 확인</li>
                <li>카페 &gt; 관리 &gt; 회원 관리 페이지에 접근 가능해야 합니다</li>
              </ol>
            </div>

            <div className="bg-green-50 rounded-lg p-5 space-y-3">
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

      {/* 프로그램 관리 탭 */}
      {tab === 'programs' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            프로그램은 코드에서 직접 추가/수정합니다.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-700">프로그램</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">카테고리</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">최소 등급</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {programRegistry.map((p) => (
                  <tr key={p.id} className="hover:bg-green-50">
                    <td className="px-4 py-3 text-gray-900">
                      {p.icon} {p.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.category}</td>
                    <td className="px-4 py-3">
                      <TierBadge tier={p.minTier} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <div className="text-2xl font-bold text-gray-900">
                {members.length}
              </div>
              <div className="text-sm text-gray-500">전체 회원</div>
            </div>
            {[1, 2, 3, 4].map((t) => (
              <div key={t} className="bg-white rounded-lg p-4 border border-green-100">
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
                    className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-green-100"
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
