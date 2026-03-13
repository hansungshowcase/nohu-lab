import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { createToken, COOKIE_NAME } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { nickname, phone, adminLogin } = await request.json()

    if (!nickname || !phone) {
      return NextResponse.json(
        { error: '닉네임과 연락처를 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    const supabase = getServiceSupabase()
    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .eq('nickname', nickname.trim())
      .single()

    const phoneClean = phone.replace(/-/g, '')
    let currentMember = member

    if (error || !member) {
      // 관리자 로그인은 자동 가입 불가
      if (adminLogin) {
        return NextResponse.json(
          { error: '등록되지 않은 관리자입니다.' },
          { status: 401 }
        )
      }

      // 신규 회원 자동 등록 (Tier 1)
      const { data: newMember, error: insertError } = await supabase
        .from('members')
        .insert({
          nickname: nickname.trim(),
          phone: phoneClean,
          tier: 1,
          last_login: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        return NextResponse.json(
          { error: '회원 등록에 실패했습니다. 다시 시도해주세요.' },
          { status: 500 }
        )
      }

      currentMember = newMember
    } else {
      // 기존 회원: 연락처 비교
      const phoneMatch =
        member.phone === phoneClean ||
        member.phone === '' ||
        (await bcrypt.compare(phoneClean, member.phone))

      if (!phoneMatch) {
        return NextResponse.json(
          { error: '연락처가 일치하지 않습니다.' },
          { status: 401 }
        )
      }

      // 일반 로그인에서 관리자 계정 차단
      if (!adminLogin && member.tier === 4) {
        return NextResponse.json(
          { error: '관리자는 관리자 로그인을 이용해주세요.' },
          { status: 403 }
        )
      }

      // 관리자 로그인에서 일반 회원 차단
      if (adminLogin && member.tier !== 4) {
        return NextResponse.json(
          { error: '관리자 권한이 없습니다.' },
          { status: 403 }
        )
      }

      // last_login 업데이트
      await supabase
        .from('members')
        .update({ last_login: new Date().toISOString() })
        .eq('id', member.id)
    }

    const token = await createToken({
      memberId: currentMember.id,
      nickname: currentMember.nickname,
      tier: currentMember.tier,
    })

    const response = NextResponse.json({
      success: true,
      member: {
        nickname: currentMember.nickname,
        tier: currentMember.tier,
      },
    })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
