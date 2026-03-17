import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { createToken, COOKIE_NAME } from '@/lib/auth'
import { mapGradeToTier } from '@/lib/types'

// Frontend polls this to check verification result
export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: '잘못된 요청' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    const { data: req, error: reqError } = await supabase
      .from('verify_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (reqError || !req) {
      return NextResponse.json({ error: '요청 없음' }, { status: 404 })
    }

    if (req.status === 'pending') {
      return NextResponse.json({ status: 'pending' })
    }

    if (req.status === 'not_found' || req.status === 'error') {
      return NextResponse.json({ status: req.status })
    }

    // status === 'completed' → 이미 처리 완료 (DB에서 회원 조회 후 로그인)
    if (req.status === 'completed') {
      const nickname = req.nickname.trim()
      const { data: existingMember } = await supabase
        .from('members')
        .select('id, nickname, tier')
        .eq('nickname', nickname)
        .limit(1)
        .single()
      if (existingMember) {
        const token = await createToken({
          memberId: existingMember.id,
          nickname: existingMember.nickname,
          tier: ([1, 2, 3, 4].includes(existingMember.tier) ? existingMember.tier : 1) as 1 | 2 | 3 | 4,
        })
        const response = NextResponse.json({ status: 'found', member: { nickname: existingMember.nickname, tier: existingMember.tier } })
        response.cookies.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' })
        return response
      }
      return NextResponse.json({ status: 'error' })
    }

    // status === 'found' → 원자적 상태 전이: found→completed (중복 처리 방지)
    const { data: updated, error: updateErr } = await supabase
      .from('verify_requests')
      .update({ status: 'completed' })
      .eq('id', id)
      .eq('status', 'found')
      .select('id')

    if (updateErr || !updated || updated.length === 0) {
      // 다른 요청이 먼저 처리함 → completed 상태로 재시도
      return NextResponse.json({ status: 'pending' })
    }

    const tier = mapGradeToTier(req.grade_name || '')
    const nickname = req.nickname.trim()

    const { data: member, error: upsertError } = await supabase
      .from('members')
      .upsert(
        { nickname, tier, phone: '', last_login: new Date().toISOString() },
        { onConflict: 'nickname' }
      )
      .select()
      .single()

    if (upsertError || !member) {
      return NextResponse.json({ status: 'error' })
    }

    const token = await createToken({
      memberId: member.id,
      nickname: member.nickname,
      tier: ([1, 2, 3, 4].includes(member.tier) ? member.tier : 1) as 1 | 2 | 3 | 4,
    })

    const response = NextResponse.json({
      status: 'found',
      member: { nickname: member.nickname, tier: member.tier },
    })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
