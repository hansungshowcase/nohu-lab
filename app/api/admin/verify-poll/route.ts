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

    // Get pending requests (created within last 2 minutes)
    const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()
    const { data: requests, error: queryError } = await supabase
      .from('verify_requests')
      .select('id, nickname')
      .eq('status', 'pending')
      .gte('created_at', twoMinAgo)
      .order('created_at', { ascending: true })
      .limit(5)

    if (queryError) {
      return NextResponse.json({ error: '조회 실패' }, { status: 500 })
    }

    return NextResponse.json({ requests: requests || [] })
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
