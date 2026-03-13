import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { createToken, COOKIE_NAME } from '@/lib/auth'
import { checkCafeMember } from '@/lib/naver-cafe'

function makeLoginResponse(memberId: string, nickname: string, tier: 1 | 2 | 3 | 4) {
  const tokenPromise = createToken({ memberId, nickname, tier })
  return tokenPromise
}

export async function POST(request: NextRequest) {
  try {
    const { nickname } = await request.json()

    if (!nickname) {
      return NextResponse.json(
        { error: '닉네임을 입력해주세요.' },
        { status: 400 }
      )
    }

    const trimmed = nickname.trim()
    const supabase = getServiceSupabase()

    // 1. DB에서 닉네임 검색
    const { data: member } = await supabase
      .from('members')
      .select('*')
      .eq('nickname', trimmed)
      .single()

    if (member) {
      // DB에 있는 회원 → 바로 로그인
      await supabase
        .from('members')
        .update({ last_login: new Date().toISOString() })
        .eq('id', member.id)

      const token = await makeLoginResponse(member.id, member.nickname, member.tier as 1 | 2 | 3 | 4)

      const response = NextResponse.json({
        success: true,
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
    }

    // 2. DB에 없으면 → 네이버 카페에서 실시간 회원 확인
    const cafeMember = await checkCafeMember(trimmed)

    if (cafeMember) {
      // 카페 회원 확인됨 → DB에 자동 등록 후 로그인
      const { data: newMember } = await supabase
        .from('members')
        .insert({
          nickname: cafeMember.nickname,
          tier: cafeMember.tier,
          last_login: new Date().toISOString(),
        })
        .select()
        .single()

      const memberId = newMember?.id || ''
      const token = await makeLoginResponse(memberId, cafeMember.nickname, cafeMember.tier)

      const response = NextResponse.json({
        success: true,
        member: { nickname: cafeMember.nickname, tier: cafeMember.tier },
      })

      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })

      return response
    }

    // 3. 카페에도 없으면 → 미가입 회원
    return NextResponse.json(
      { error: '노후연구소 카페에 가입되지 않은 닉네임입니다.\n카페 가입 후 다시 시도해주세요.' },
      { status: 401 }
    )
  } catch (error) {
    console.error('[login] 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
