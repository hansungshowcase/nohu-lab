import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getServiceSupabase()
    const { count } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      totalMembers: count || 0,
    })
  } catch {
    return NextResponse.json({ totalMembers: 0 })
  }
}
