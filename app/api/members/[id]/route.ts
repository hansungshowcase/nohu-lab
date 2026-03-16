import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

// PATCH: 회원 정보 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.tier !== 4) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const supabase = getServiceSupabase()

  const updateData: Record<string, unknown> = {}
  if (body.tier !== undefined) {
    const t = Number(body.tier)
    if (Number.isInteger(t) && t >= 1 && t <= 4) updateData.tier = t
  }
  if (body.nickname !== undefined) updateData.nickname = body.nickname
  if (body.phone !== undefined && body.phone !== null) updateData.phone = String(body.phone).replace(/-/g, '')

  const { data, error } = await supabase
    .from('members')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE: 회원 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.tier !== 4) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const { id } = await params
  if (id === user.memberId) {
    return NextResponse.json({ error: '자기 자신은 삭제할 수 없습니다.' }, { status: 400 })
  }
  const supabase = getServiceSupabase()

  const { error } = await supabase.from('members').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
