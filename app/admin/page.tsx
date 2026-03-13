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

type Tab = 'members' | 'programs' | 'dashboard'

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
    { id: 'programs', label: '프로그램 관리' },
    { id: 'dashboard', label: '대시보드' },
  ]

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
