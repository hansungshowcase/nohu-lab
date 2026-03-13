import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

const SYNC_SECRET = 'nohu-cafe-sync-2026'

// Chrome extension polls this to get pending verification requests
export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json()
    if (secret !== SYNC_SECRET) {
      return NextResponse.json({ error: '인증 실패' }, { status: 401 })
    }

    const supabase = getServiceSupabase()

    // Get pending requests (created within last 2 minutes)
    const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()
    const { data: requests } = await supabase
      .from('verify_requests')
      .select('id, nickname')
      .eq('status', 'pending')
      .gte('created_at', twoMinAgo)
      .order('created_at', { ascending: true })
      .limit(5)

    return NextResponse.json({ requests: requests || [] })
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
