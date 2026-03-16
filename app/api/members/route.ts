import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

// GET: 회원 목록 (관리자 전용)
export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.tier !== 4) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 연락처 마스킹
  const masked = data.map((m) => ({
    ...m,
    phone_masked: m.phone.length === 11
      ? `${m.phone.slice(0, 3)}-****-${m.phone.slice(7)}`
      : m.phone,
  }))

  return NextResponse.json(masked)
}

// POST: 회원 추가 (관리자 전용)
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.tier !== 4) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const { nickname, phone, tier } = await request.json()

  if (!nickname || typeof nickname !== 'string' || !nickname.trim()) {
    return NextResponse.json({ error: '닉네임은 필수입니다.' }, { status: 400 })
  }
  if (nickname.trim().length > 50) {
    return NextResponse.json({ error: '닉네임은 50자 이내로 입력해주세요.' }, { status: 400 })
  }

  const supabase = getServiceSupabase()

  const { data, error } = await supabase
    .from('members')
    .insert({
      nickname: nickname.trim(),
      phone: typeof phone === 'string' ? phone.replace(/-/g, '') : '',
      tier: typeof tier === 'number' ? Math.min(Math.max(tier, 1), 4) : 1,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: '이미 존재하는 닉네임입니다.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
