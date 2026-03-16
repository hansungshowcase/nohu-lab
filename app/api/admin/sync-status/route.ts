import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.tier !== 4) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  try {
    const supabase = getServiceSupabase()

    const [countResult, lastVerifyResult, lastAnyResult] = await Promise.all([
      supabase.from('members').select('*', { count: 'exact', head: true }),
      supabase.from('verify_requests').select('created_at, status').eq('status', 'found').order('created_at', { ascending: false }).limit(1),
      supabase.from('verify_requests').select('created_at, status').order('created_at', { ascending: false }).limit(1),
    ])

    return NextResponse.json({
      totalMembers: countResult.count || 0,
      lastVerifySuccess: lastVerifyResult.data?.[0]?.created_at || null,
      lastVerifyAny: lastAnyResult.data?.[0]?.created_at || null,
      lastVerifyStatus: lastAnyResult.data?.[0]?.status || null,
    })
  } catch {
    return NextResponse.json({ totalMembers: 0 })
  }
}
