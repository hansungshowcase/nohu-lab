import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

const SYNC_SECRET = process.env.SYNC_SECRET || 'nohu-cafe-sync-2026'

// Chrome extension reports verification result
export async function POST(request: NextRequest) {
  try {
    const { secret, id, status, gradeName } = await request.json()
    if (secret !== SYNC_SECRET) {
      return NextResponse.json({ error: '인증 실패' }, { status: 401 })
    }

    if (!id || !['found', 'not_found', 'error'].includes(status)) {
      return NextResponse.json({ error: '잘못된 요청' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    await supabase
      .from('verify_requests')
      .update({ status, grade_name: gradeName || null })
      .eq('id', id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
