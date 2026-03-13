import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

// POST: 닉네임 일괄 등록
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.tier !== 4) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const { nicknames, tier = 1 } = await request.json()

  if (!Array.isArray(nicknames) || nicknames.length === 0) {
    return NextResponse.json({ error: '닉네임 목록이 필요합니다.' }, { status: 400 })
  }

  const supabase = getServiceSupabase()

  // 기존 회원 닉네임 조회
  const { data: existing } = await supabase
    .from('members')
    .select('nickname')
    .in('nickname', nicknames)

  const existingSet = new Set((existing || []).map((m) => m.nickname))

  const newMembers = nicknames
    .filter((n: string) => !existingSet.has(n))
    .map((nickname: string) => ({
      nickname,
      phone: '',
      tier: Math.min(Math.max(tier, 1), 4),
    }))

  if (newMembers.length === 0) {
    return NextResponse.json({
      added: 0,
      skipped: nicknames.length,
    })
  }

  const { error } = await supabase
    .from('members')
    .insert(newMembers)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    added: newMembers.length,
    skipped: nicknames.length - newMembers.length,
  })
}
