import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let _supabase: SupabaseClient | null = null

export function getSupabase() {
  if (!_supabase && supabaseUrl && supabaseAnonKey) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabase!
}

export const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseAnonKey) : (null as unknown as SupabaseClient)

// 서버 사이드에서 사용할 서비스 키 클라이언트
let _serviceSupabase: SupabaseClient | null = null

export function getServiceSupabase() {
  if (_serviceSupabase) return _serviceSupabase
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase 환경변수가 설정되지 않았습니다.')
  }
  _serviceSupabase = createClient(supabaseUrl, serviceKey)
  return _serviceSupabase
}
