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
    error: '테이블이 존재하지 않습니다',
    sql: `CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_nickname TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('member', 'admin')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON chat_messages(room_id, is_read) WHERE is_read = false;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on chat_messages" ON chat_messages FOR ALL USING (auth.role() = 'service_role');`,
    instruction: 'Supabase Dashboard > SQL Editor에서 위 SQL을 실행하세요.'
  }, { status: 500 })
}
