import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

// GET: 채팅방 목록 (관리자용) 또는 안읽은 메시지 수 (회원용)
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const supabase = getServiceSupabase()

  if (user.tier === 4) {
    // 관리자: 모든 채팅방 목록 (마지막 메시지 기준 정렬)
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('room_id, sender_nickname, sender_role, message, is_read, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 채팅방별로 그룹핑
    const roomMap = new Map<string, {
      roomId: string
      memberNickname: string
      lastMessage: string
      lastMessageAt: string
      unreadCount: number
    }>()

    for (const msg of (messages || [])) {
      if (!roomMap.has(msg.room_id)) {
        // 회원 닉네임 찾기
        const memberNick = msg.sender_role === 'member' ? msg.sender_nickname : ''
        roomMap.set(msg.room_id, {
          roomId: msg.room_id,
          memberNickname: memberNick,
          lastMessage: msg.message,
          lastMessageAt: msg.created_at,
          unreadCount: 0,
        })
      }
      const room = roomMap.get(msg.room_id)!
      if (!room.memberNickname && msg.sender_role === 'member') {
        room.memberNickname = msg.sender_nickname
      }
      if (msg.sender_role === 'member' && !msg.is_read) {
        room.unreadCount++
      }
    }

    // 닉네임이 없는 방은 DB에서 일괄 조회
    const rooms = Array.from(roomMap.values())
    const missingIds = rooms.filter(r => !r.memberNickname).map(r => r.roomId)
    if (missingIds.length > 0) {
      const { data: members } = await supabase
        .from('members')
        .select('id, nickname')
        .in('id', missingIds)
      const memberMap = new Map((members || []).map(m => [m.id, m.nickname]))
      for (const room of rooms) {
        if (!room.memberNickname) {
          room.memberNickname = memberMap.get(room.roomId) || '알 수 없음'
        }
      }
    }

    // 안읽은 메시지가 있는 방 우선, 그 다음 최신 메시지 순
    rooms.sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    })

    return NextResponse.json(rooms)
  } else {
    // 회원: 안읽은 메시지 수만 반환
    const { count, error } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', user.memberId)
      .eq('sender_role', 'admin')
      .eq('is_read', false)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ unreadCount: count || 0 })
  }
}
