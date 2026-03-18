import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { mapGradeToTier } from '@/lib/types'

// POST: 카페 회원 목록 동기화 (북마클릿/관리자에서 호출)
export async function POST(request: NextRequest) {
  try {
    const { members, syncKey } = await request.json()

    // 동기화 키 확인
    const secret = process.env.SYNC_SECRET
    if (!secret || syncKey !== secret) {
      return NextResponse.json({ error: '인증 실패' }, { status: 403 })
    }

    if (!Array.isArray(members) || members.length === 0) {
      return NextResponse.json({ error: '회원 데이터가 없습니다.' }, { status: 400 })
    }
    if (members.length > 5000) {
      return NextResponse.json({ error: '한 번에 최대 5000명까지 동기화 가능합니다.' }, { status: 400 })
    }

    const supabase = getServiceSupabase()
    let syncCount = 0
    let errorCount = 0

    const seenNicks = new Set<string>()
    const batch = members
      .filter((m: { nickname?: string }) => (m.nickname || '').trim())
      .map((m: { nickname: string; tier?: number; levelName?: string }) => ({
        nickname: m.nickname.trim(),
        tier: (Number(m.tier) >= 1 && Number(m.tier) <= 4) ? Math.round(Number(m.tier)) : mapGradeToTier(m.levelName || '일반회원'),
      }))
      .filter(m => {
        if (seenNicks.has(m.nickname)) return false
        seenNicks.add(m.nickname)
        return true
      })

    for (let i = 0; i < batch.length; i += 500) {
      const chunk = batch.slice(i, i + 500)
      const { error } = await supabase
        .from('members')
        .upsert(chunk, { onConflict: 'nickname' })
      if (error) errorCount += chunk.length
      else syncCount += chunk.length
    }

    return NextResponse.json({
      success: true,
      total: syncCount,
      errors: errorCount,
    })
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
