import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase 환경변수가 설정되지 않았습니다.')
    }
    _supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabase
}

// 서버 사이드에서 사용할 서비스 키 클라이언트 (싱글톤)
let _serviceSupabase: SupabaseClient | null = null

export function getServiceSupabase(): SupabaseClient {
  if (!_serviceSupabase) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    if (!supabaseUrl || !serviceKey) {
      throw new Error('Supabase 환경변수가 설정되지 않았습니다.')
    }
    _serviceSupabase = createClient(supabaseUrl, serviceKey)
  }
  return _serviceSupabase
}
