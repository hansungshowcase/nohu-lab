import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

function getSyncSecret() {
  const s = process.env.SYNC_SECRET
  if (!s) throw new Error('SYNC_SECRET 환경변수가 설정되지 않았습니다.')
  return s
}

// Chrome extension reports verification result
export async function POST(request: NextRequest) {
  try {
    const { secret, id, status, gradeName } = await request.json()
    if (secret !== getSyncSecret()) {
      return NextResponse.json({ error: '인증 실패' }, { status: 401 })
    }

    if (!id || typeof status !== 'string' || !['found', 'not_found', 'error'].includes(status)) {
      return NextResponse.json({ error: '잘못된 요청' }, { status: 400 })
    }

    if (status === 'found' && !gradeName) {
      return NextResponse.json({ error: 'found 상태에는 gradeName이 필요합니다.' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    const { error: updateError } = await supabase
      .from('verify_requests')
      .update({ status, grade_name: gradeName || null })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: '업데이트 실패' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
