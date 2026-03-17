import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

function getSyncSecret() {
  const s = process.env.SYNC_SECRET
  if (!s) throw new Error('SYNC_SECRET 환경변수가 설정되지 않았습니다.')
  return s
}

// Chrome extension polls this to get pending verification requests
export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json()
    if (secret !== getSyncSecret()) {
      return NextResponse.json({ error: '인증 실패' }, { status: 401 })
    }

    const supabase = getServiceSupabase()

    // 오래된 레코드 정리 (10분 이상 된 pending/completed만 삭제, found는 보존)
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    await supabase
      .from('verify_requests')
      .delete()
      .lt('created_at', tenMinAgo)
      .in('status', ['pending', 'completed', 'not_found', 'error'])

    // Get pending requests (created within last 5 minutes)
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: requests, error: queryError } = await supabase
      .from('verify_requests')
      .select('id, nickname')
      .eq('status', 'pending')
      .gte('created_at', fiveMinAgo)
      .order('created_at', { ascending: true })
      .limit(10)

    if (queryError) {
      return NextResponse.json({ error: '조회 실패' }, { status: 500 })
    }

    return NextResponse.json({ requests: requests || [] })
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
