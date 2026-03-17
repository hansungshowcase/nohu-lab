import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

// POST: 닉네임 일괄 등록
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.tier !== 4) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { nicknames, tier = 1 } = await request.json()

    if (!Array.isArray(nicknames) || nicknames.length === 0) {
      return NextResponse.json({ error: '닉네임 목록이 필요합니다.' }, { status: 400 })
    }
    if (nicknames.length > 500) {
      return NextResponse.json({ error: '한 번에 최대 500명까지 등록 가능합니다.' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // 기존 회원 닉네임 조회
    const { data: existing, error: existingError } = await supabase
      .from('members')
      .select('nickname')
      .in('nickname', nicknames)

    if (existingError) {
      return NextResponse.json({ error: '기존 회원 조회 실패' }, { status: 500 })
    }

    const existingSet = new Set((existing || []).map((m) => m.nickname))

    const newMembers = nicknames
      .map((n: string) => (typeof n === 'string' ? n.trim() : ''))
      .filter((n: string) => n && !existingSet.has(n))
      .map((nickname: string) => ({
        nickname: nickname.slice(0, 50),
        phone: '',
        tier: Math.min(Math.max(Number(tier) || 1, 1), 4),
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
      return NextResponse.json({ error: '회원 등록에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({
      added: newMembers.length,
      skipped: nicknames.length - newMembers.length,
    })
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }
}
