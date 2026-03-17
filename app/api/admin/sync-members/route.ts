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
    if (members.length > 5000) {
      return NextResponse.json({ error: '한 번에 최대 5000명까지 동기화 가능합니다.' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // upsert로 신규 등록 + 등급 변경 일괄 처리
    let syncCount = 0
    let errorCount = 0

    const validMembers = members.filter((m: SyncMember) => m.nickname && typeof m.nickname === 'string' && m.nickname.trim())
    for (let i = 0; i < validMembers.length; i += 500) {
      const batch = validMembers.slice(i, i + 500).map((m: SyncMember) => ({
        nickname: m.nickname.trim(),
        tier: Math.min(Math.max(Number(m.tier) || 1, 1), 4),
        phone: '',
      }))
      const { error } = await supabase
        .from('members')
        .upsert(batch, { onConflict: 'nickname' })
      if (error) errorCount += batch.length
      else syncCount += batch.length
    }

    return NextResponse.json({
      success: true,
      total: syncCount,
      errors: errorCount,
    })
  } catch (error) {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
