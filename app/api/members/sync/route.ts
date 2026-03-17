import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

// 카페 등급 → DB tier (1~4)
function mapCafeLevelToTier(levelName: string): 1 | 2 | 3 | 4 {
  const name = levelName.trim()
  if (name.includes('매니저') || name.includes('스탭') || name.includes('운영') || name === '헤리티지회원') return 4
  if (name === '시그니처회원' || name === '프리미엄회원') return 3
  if (name === '우수회원') return 2
  return 1
}

// POST: 카페 회원 목록 동기화 (북마클릿/관리자에서 호출)
export async function POST(request: NextRequest) {
  try {
    const { members, syncKey } = await request.json()

    // 동기화 키 확인
    if (syncKey !== process.env.SYNC_KEY) {
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
    let newCount = 0
    let updateCount = 0

    for (const m of members) {
      const nickname = (m.nickname || '').trim()
      if (!nickname) continue

      const rawTier = Number(m.tier)
      const tier = (rawTier && Number.isInteger(rawTier)) ? Math.min(Math.max(rawTier, 1), 4) : mapCafeLevelToTier(m.levelName || '일반회원')

      const { data: existing } = await supabase
        .from('members')
        .select('id, tier')
        .eq('nickname', nickname)
        .single()

      if (existing) {
        if (existing.tier !== tier) {
          const { error: updateErr } = await supabase
            .from('members')
            .update({ tier })
            .eq('id', existing.id)
          if (!updateErr) updateCount++
        }
      } else {
        const { error: insertErr } = await supabase
          .from('members')
          .insert({ nickname, phone: '', tier })
        if (!insertErr) newCount++
      }
      syncCount++
    }

    return NextResponse.json({
      success: true,
      total: syncCount,
      new: newCount,
      updated: updateCount,
    })
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
