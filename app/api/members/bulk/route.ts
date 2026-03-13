import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

// POST: CSV 일괄 등록
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.tier !== 4) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const { csv } = await request.json()

  if (!csv) {
    return NextResponse.json({ error: 'CSV 데이터가 필요합니다.' }, { status: 400 })
  }

  const lines = csv
    .split('\n')
    .map((l: string) => l.trim())
    .filter((l: string) => l && !l.startsWith('#'))

  const members = []
  const errors: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p: string) => p.trim())
    if (parts.length < 2) {
      errors.push(`${i + 1}번째 줄: 형식 오류 (닉네임,연락처[,등급])`)
      continue
    }

    const [nickname, phone, tierStr] = parts
    const tier = tierStr ? parseInt(tierStr) : 1

    if (tier < 1 || tier > 4) {
      errors.push(`${i + 1}번째 줄: 등급은 1~4 사이여야 합니다`)
      continue
    }

    members.push({
      nickname,
      phone: phone.replace(/-/g, ''),
      tier,
    })
  }

  if (members.length === 0) {
    return NextResponse.json(
      { error: '유효한 데이터가 없습니다.', details: errors },
      { status: 400 }
    )
  }

  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('members')
    .upsert(members, { onConflict: 'nickname' })
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    count: data.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}
