'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
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

type Tab = 'members' | 'programs' | 'dashboard' | 'sync'

function AdminContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<Tab>('members')
  const [members, setMembers] = useState<MemberRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [newMember, setNewMember] = useState({ nickname: '', phone: '', tier: '1' })
  const [csvText, setCsvText] = useState('')
  const [message, setMessage] = useState('')
  const [syncLoading, setSyncLoading] = useState(false)

  useEffect(() => {
    fetchMembers()
    const sync = searchParams.get('sync')
    const count = searchParams.get('count')
    if (sync === 'success') {
      setMessage(`카페 회원 ${count}명 동기화 완료!`)
      setTimeout(() => setMessage(''), 5000)
    }
  }, [searchParams])

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

  async function handleAddMember() {
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nickname: newMember.nickname,
        phone: newMember.phone,
        tier: parseInt(newMember.tier),
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setShowAdd(false)
      setNewMember({ nickname: '', phone: '', tier: '1' })
      fetchMembers()
      setMessage('회원이 추가되었습니다.')
    } else {
      setMessage(data.error || '추가 실패')
    }
    setTimeout(() => setMessage(''), 3000)
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

  async function handleBulkUpload() {
    const res = await fetch('/api/members/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv: csvText }),
    })
    const data = await res.json()
    if (res.ok) {
      setShowBulk(false)
      setCsvText('')
      fetchMembers()
      setMessage(`${data.count}명이 등록되었습니다.`)
    } else {
      setMessage(data.error || '일괄 등록 실패')
    }
    setTimeout(() => setMessage(''), 3000)
  }

  const filtered = members.filter((m) =>
    m.nickname.toLowerCase().includes(search.toLowerCase())
  )

  const tierCounts = [1, 2, 3, 4].map(
    (t) => members.filter((m) => m.tier === t).length
  )

  const BOOKMARKLET_CODE = `javascript:void(function(){var d=document,rows=d.querySelectorAll('table.tbl_type02 tbody tr, table.type_style1 tbody tr, #memberListBody tr, .article-board tbody tr');if(!rows.length){rows=d.querySelectorAll('tr[data-memberid], tr.MClickTrackingBy498979');}if(!rows.length){alert('회원 목록을 찾을 수 없습니다. 카페 회원관리 페이지에서 실행해주세요.');return;}var members=[];rows.forEach(function(r){var cells=r.querySelectorAll('td');if(cells.length>=2){var nick=cells[1]?cells[1].textContent.trim():'';var level=cells[2]?cells[2].textContent.trim():'일반회원';if(nick)members.push({nickname:nick,levelName:level});}});if(!members.length){alert('회원 데이터를 파싱할 수 없습니다.');return;}fetch('${typeof window !== 'undefined' ? window.location.origin : 'https://nohu-lab.vercel.app'}/api/members/sync',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({members:members,syncKey:'nohu-lab-sync-2026'})}).then(function(r){return r.json()}).then(function(d){if(d.success)alert('동기화 완료! 총 '+d.total+'명 (신규: '+d.new+', 업데이트: '+d.updated+')');else alert('실패: '+d.error);}).catch(function(e){alert('오류: '+e.message);});})()`

  async function handleManualSync() {
    setSyncLoading(true)
    setMessage('')
    try {
      const textarea = document.getElementById('syncData') as HTMLTextAreaElement
      if (!textarea || !textarea.value.trim()) {
        setMessage('회원 데이터를 입력해주세요.')
        setSyncLoading(false)
        return
      }

      // 형식: 닉네임,등급명 (한 줄에 하나)
      const lines = textarea.value.trim().split('\n').filter(l => l.trim())
      const memberList = lines.map(line => {
        const parts = line.split(',').map(p => p.trim())
        return { nickname: parts[0], levelName: parts[1] || '일반회원' }
      }).filter(m => m.nickname)

      const res = await fetch('/api/members/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: memberList, syncKey: 'nohu-lab-sync-2026' }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage(`동기화 완료! 총 ${data.total}명 (신규: ${data.new}명, 업데이트: ${data.updated}명)`)
        fetchMembers()
      } else {
        setMessage(data.error || '동기화 실패')
      }
    } catch {
      setMessage('동기화 중 오류가 발생했습니다.')
    } finally {
      setSyncLoading(false)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'members', label: '회원 관리' },
    { id: 'sync', label: '카페 동기화' },
    { id: 'programs', label: '프로그램 관리' },
    { id: 'dashboard', label: '대시보드' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        ⚙️ 관리자 패널
      </h1>

      {message && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm">
          {message}
        </div>
      )}

      {/* 탭 */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
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
              className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
            >
              + 회원 추가
            </button>
            <button
              onClick={() => setShowBulk(!showBulk)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              CSV 일괄 등록
            </button>
            <button
              onClick={() => setTab('sync')}
              className="px-4 py-2 bg-[#03C75A] hover:bg-[#02b351] text-white rounded-lg text-sm inline-flex items-center gap-1"
            >
              카페 회원 동기화
            </button>
          </div>

          {/* 회원 추가 폼 */}
          {showAdd && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  placeholder="닉네임"
                  value={newMember.nickname}
                  onChange={(e) => setNewMember({ ...newMember, nickname: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  placeholder="연락처 (010-0000-0000)"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <select
                  value={newMember.tier}
                  onChange={(e) => setNewMember({ ...newMember, tier: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {[1, 2, 3, 4].map((t) => (
                    <option key={t} value={t}>{TIER_MAP[t].name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAddMember}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
              >
                추가
              </button>
            </div>
          )}

          {/* CSV 일괄 등록 */}
          {showBulk && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                형식: 닉네임,연락처,등급 (한 줄에 하나씩)
              </p>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={"홍길동,01012345678,1\n김철수,01087654321,2"}
                className="w-full h-32 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              />
              <button
                onClick={handleBulkUpload}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
              >
                일괄 등록
              </button>
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
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">닉네임</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">연락처</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">등급</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">마지막 로그인</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                        {member.nickname}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {member.phone_masked}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={member.tier}
                          onChange={(e) => handleTierChange(member.id, parseInt(e.target.value))}
                          className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        >
                          {[1, 2, 3, 4].map((t) => (
                            <option key={t} value={t}>{TIER_MAP[t].name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
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
              {filtered.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  {search ? '검색 결과가 없습니다.' : '등록된 회원이 없습니다.'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 카페 동기화 탭 */}
      {tab === 'sync' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              카페 회원 동기화
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              네이버 카페 회원 목록을 가져와서 DB에 등록합니다.
            </p>

            {/* 방법 1: 직접 입력 */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                방법 1: 직접 입력
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                카페 회원관리에서 회원 목록을 복사해서 붙여넣기하세요.<br />
                형식: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">닉네임,등급명</code> (한 줄에 하나)
              </p>
              <textarea
                id="syncData"
                placeholder={"홍길동,코어회원\n김철수,우수회원\n이영희,프리미엄회원\n박지민,헤리티지회원"}
                className="w-full h-40 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm mb-3"
              />
              <button
                onClick={handleManualSync}
                disabled={syncLoading}
                className="px-4 py-2 bg-[#03C75A] hover:bg-[#02b351] disabled:bg-gray-400 text-white rounded-lg text-sm"
              >
                {syncLoading ? '동기화 중...' : '동기화 실행'}
              </button>
            </div>

            {/* 방법 2: 북마클릿 */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                방법 2: 북마클릿 (자동)
              </h4>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2 mb-3">
                <p>1. 아래 버튼을 <strong>북마크바에 드래그</strong>하세요.</p>
                <p>2. 네이버 카페 회원관리 페이지에 접속하세요.</p>
                <p>3. 북마크바에서 해당 북마클릿을 클릭하면 자동 동기화됩니다.</p>
              </div>
              <a
                href={BOOKMARKLET_CODE}
                onClick={(e) => e.preventDefault()}
                className="inline-block px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium cursor-grab"
                title="이 버튼을 북마크바에 드래그하세요"
              >
                노후연구소 동기화
              </a>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                * 이 버튼을 클릭하지 말고 북마크바로 드래그하세요
              </p>
            </div>
          </div>

          {/* 카페 회원관리 바로가기 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <a
              href="https://cafe.naver.com/ManageJoinList.nhn?clubid=eovhskfktmak"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#03C75A] hover:underline font-medium"
            >
              네이버 카페 회원관리 페이지 열기 →
            </a>
          </div>
        </div>
      )}

      {/* 프로그램 관리 탭 */}
      {tab === 'programs' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            프로그램은 <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">app/programs/registry.ts</code>에서 관리됩니다.
            코드에서 직접 추가/수정하세요.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">프로그램</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">카테고리</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">최소 등급</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {programRegistry.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-gray-900 dark:text-white">
                        {p.icon} {p.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.category}</td>
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
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {members.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">전체 회원</div>
            </div>
            {[1, 2, 3, 4].map((t) => (
              <div key={t} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tierCounts[t - 1]}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {TIER_MAP[t].name}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
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
                    className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">{m.nickname}</span>
                      <TierBadge tier={m.tier} />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
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
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    }>
      <AdminContent />
    </Suspense>
  )
}
