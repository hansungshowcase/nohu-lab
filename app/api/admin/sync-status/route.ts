import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getServiceSupabase()

    const { count } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })

    // 마지막 성공한 확인 시간
    const { data: lastVerify } = await supabase
      .from('verify_requests')
      .select('created_at, status')
      .eq('status', 'found')
      .order('created_at', { ascending: false })
      .limit(1)

    // 마지막 확인 요청 시간 (성공/실패 무관)
    const { data: lastAny } = await supabase
      .from('verify_requests')
      .select('created_at, status')
      .order('created_at', { ascending: false })
      .limit(1)

    return NextResponse.json({
      totalMembers: count || 0,
      lastVerifySuccess: lastVerify?.[0]?.created_at || null,
      lastVerifyAny: lastAny?.[0]?.created_at || null,
      lastVerifyStatus: lastAny?.[0]?.status || null,
    })
  } catch {
    return NextResponse.json({ totalMembers: 0 })
  }
}
