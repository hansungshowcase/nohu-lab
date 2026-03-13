-- ==========================================
-- 카페 회원 전용 웹앱 - Supabase 스키마
-- ==========================================

-- 1. members 테이블
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  tier INTEGER DEFAULT 1 CHECK (tier >= 1 AND tier <= 4),
  created_at TIMESTAMPTZ DEFAULT now(),
  last_login TIMESTAMPTZ
);

-- 2. programs 테이블
CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  min_tier INTEGER DEFAULT 1 CHECK (min_tier >= 1 AND min_tier <= 4),
  icon TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true
);

-- 3. access_logs 테이블
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  program_id TEXT REFERENCES programs(id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_members_nickname ON members(nickname);
CREATE INDEX IF NOT EXISTS idx_access_logs_member ON access_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_accessed ON access_logs(accessed_at);

-- RLS 활성화
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- RLS 정책: service_role은 모든 접근 가능
CREATE POLICY "Service role full access on members" ON members
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on programs" ON programs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on access_logs" ON access_logs
  FOR ALL USING (auth.role() = 'service_role');

-- 인증된 사용자는 programs 읽기 가능
CREATE POLICY "Authenticated read programs" ON programs
  FOR SELECT USING (auth.role() = 'authenticated');

-- 4. verify_requests 테이블 (로그인 시 실시간 회원 확인)
CREATE TABLE IF NOT EXISTS verify_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'found', 'not_found', 'error')),
  grade_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verify_requests_status ON verify_requests(status);
CREATE INDEX IF NOT EXISTS idx_verify_requests_created ON verify_requests(created_at);

ALTER TABLE verify_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on verify_requests" ON verify_requests
  FOR ALL USING (auth.role() = 'service_role');

-- ==========================================
-- 초기 데이터
-- ==========================================

-- 관리자 계정 (연락처: 01000000000)
INSERT INTO members (nickname, phone, tier) VALUES
  ('관리자', '01000000000', 4)
ON CONFLICT (nickname) DO NOTHING;

-- 프로그램 등록
INSERT INTO programs (id, name, description, min_tier, icon, category, is_active) VALUES
  ('text-counter', '글자수 카운터', '텍스트의 글자수, 단어수, 바이트를 계산합니다', 1, '📝', '유틸리티', true),
  ('image-resizer', '이미지 리사이저', '이미지 크기를 간편하게 변경합니다', 1, '🖼️', '유틸리티', true),
  ('nickname-generator', '랜덤 닉네임 생성기', '재미있는 랜덤 닉네임을 생성합니다', 1, '🎲', '유틸리티', true),
  ('hashtag-recommender', '해시태그 추천기', '게시글 내용에 맞는 해시태그를 추천합니다', 2, '#️⃣', '콘텐츠', true),
  ('text-converter', '텍스트 변환기', '한영타 변환, 대소문자 변환 등 텍스트를 변환합니다', 2, '🔄', '유틸리티', true)
ON CONFLICT (id) DO NOTHING;
