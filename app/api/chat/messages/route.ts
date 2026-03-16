import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

// GET: 메시지 조회
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const supabase = getServiceSupabase()
  const { searchParams } = new URL(request.url)

  // 관리자: roomId 파라미터로 특정 회원 대화 조회
  // 회원: 자신의 대화만 조회
  let roomId = user.memberId
  if (user.tier === 4) {
    const paramRoom = searchParams.get('roomId')
    if (paramRoom) roomId = paramRoom
  }

  // 메시지 조회 + 읽음 처리 병렬 실행
  const readRole = user.tier === 4 ? 'member' : 'admin'
  const [messagesResult, readResult] = await Promise.all([
    supabase
      .from('chat_messages')
      .select('id, room_id, sender_id, sender_nickname, sender_role, message, is_read, created_at')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true }),
    supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('room_id', roomId)
      .eq('sender_role', readRole)
      .eq('is_read', false),
  ])

  if (messagesResult.error) {
    return NextResponse.json({ error: messagesResult.error.message }, { status: 500 })
  }

  if (readResult.error) {
    return NextResponse.json({ error: '읽음 처리 실패' }, { status: 500 })
  }

  return NextResponse.json(messagesResult.data || [])
}

// POST: 메시지 전송
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const body = await request.json()
  const { message, roomId: targetRoomId } = body

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({ error: '메시지를 입력하세요' }, { status: 400 })
  }

  if (message.trim().length > 1000) {
    return NextResponse.json({ error: '메시지는 1000자 이내로 입력하세요' }, { status: 400 })
  }

  const supabase = getServiceSupabase()
  const isAdmin = user.tier === 4
  const roomId = isAdmin ? targetRoomId : user.memberId

  if (!roomId) {
    return NextResponse.json({ error: 'roomId 필요' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      room_id: roomId,
      sender_id: user.memberId,
      sender_nickname: user.nickname,
      sender_role: isAdmin ? 'admin' : 'member',
      message: message.trim(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
