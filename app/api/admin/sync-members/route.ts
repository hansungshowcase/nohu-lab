import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

function getSyncSecret() {
  const s = process.env.SYNC_SECRET
  if (!s) throw new Error('SYNC_SECRET 환경변수가 설정되지 않았습니다.')
  return s
}

interface SyncMember {
  nickname: string
  tier: number
}

export async function POST(request: NextRequest) {
  try {
    const { secret, members } = await request.json()

    if (secret !== getSyncSecret()) {
      return NextResponse.json({ error: '인증 실패' }, { status: 401 })
    }

    if (!Array.isArray(members) || members.length === 0) {
      return NextResponse.json({ error: '회원 데이터 없음' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // 기존 회원 조회
    const { data: existing } = await supabase
      .from('members')
      .select('nickname, tier')

    const existMap = new Map((existing || []).map(m => [m.nickname, m.tier]))

    const newMembers: SyncMember[] = members.filter((m: SyncMember) => !existMap.has(m.nickname))
    const updatedMembers: SyncMember[] = members.filter(
      (m: SyncMember) => existMap.has(m.nickname) && existMap.get(m.nickname) !== m.tier
    )

    // 신규 등록
    if (newMembers.length > 0) {
      for (let i = 0; i < newMembers.length; i += 50) {
        const batch = newMembers.slice(i, i + 50).map(m => ({
          nickname: m.nickname,
          tier: m.tier,
          phone: '',
        }))
        await supabase.from('members').upsert(batch, { onConflict: 'nickname', ignoreDuplicates: true })
      }
    }

    // 등급 변경
    for (const m of updatedMembers) {
      await supabase
        .from('members')
        .update({ tier: m.tier })
        .eq('nickname', m.nickname)
    }

    return NextResponse.json({
      success: true,
      total: members.length,
      inserted: newMembers.length,
      updated: updatedMembers.length,
    })
  } catch (error) {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
