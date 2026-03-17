import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

// PATCH: 회원 정보 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.tier !== 4) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const supabase = getServiceSupabase()

    const updateData: Record<string, unknown> = {}
    if (body.tier !== undefined) updateData.tier = typeof body.tier === 'number' ? Math.min(Math.max(body.tier, 1), 4) : 1
    if (body.nickname !== undefined) {
      if (typeof body.nickname !== 'string' || body.nickname.trim().length > 50) {
        return NextResponse.json({ error: '닉네임은 50자 이내로 입력해주세요.' }, { status: 400 })
      }
      updateData.nickname = body.nickname.trim()
    }
    if (body.phone !== undefined) updateData.phone = typeof body.phone === 'string' ? body.phone.replace(/-/g, '') : ''

    const { data, error } = await supabase
      .from('members')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }
}

// DELETE: 회원 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.tier !== 4) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { id } = await params
    const supabase = getServiceSupabase()

    const { error } = await supabase.from('members').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }
}
