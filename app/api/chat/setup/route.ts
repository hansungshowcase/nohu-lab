import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

// POST: 채팅 테이블 생성 (관리자 전용, 최초 1회만)
export async function POST() {
  const user = await getCurrentUser()
  if (!user || user.tier !== 4) {
    return NextResponse.json({ error: '관리자 권한 필요' }, { status: 403 })
  }

  const supabase = getServiceSupabase()

  // 테이블 존재 여부 확인
  const { error: checkError } = await supabase.from('chat_messages').select('id').limit(1)

  if (!checkError) {
    return NextResponse.json({ message: '채팅 테이블이 이미 존재합니다.' })
  }

  // 테이블이 없으면 rpc를 통해 생성 시도
  // Supabase REST API로는 DDL 불가 → 안내 메시지 반환
  return NextResponse.json({
    error: '채팅 테이블이 존재하지 않습니다. Supabase Dashboard에서 스키마를 실행하세요.',
  }, { status: 500 })
}
