# CLAUDE.md - 노후연구소 프로젝트 규칙

## 프로젝트 개요
- **사이트**: https://nohu-lab.vercel.app
- **용도**: 네이버 카페 회원용 웹앱 (로그인, 대시보드, 각종 프로그램 제공)
- **GitHub**: hansungshowcase/nohu-lab
- **git config**: user.name=hansungshowcase, email=hansungshowcase@users.noreply.github.com

## 기술 스택
- Next.js 16 (App Router) + React 19 + Tailwind 4
- Supabase + JWT 인증
- 스타일: green 팔레트, `max-w-2xl mx-auto space-y-6` 컨테이너

## Vercel 배포 규칙
- Vercel 계정: hansung1 (qhdl10100-6263, qhdl10100@gmail.com)
- **nohu-lab.vercel.app = nohu-lab 프로젝트가 서빙 중**
- Vercel 프로젝트 ID: prj_6cnk29cR0jHrn0ZvnZWrlbiJvtob
- **배포 전 반드시**: `git pull origin main --no-rebase`로 다른 터미널의 최신 변경사항 반영 후 배포
- **자동 배포 연동됨**: `git push origin main` 하면 Vercel이 자동 빌드+배포+alias 설정
- 배포 방법: 코드 수정 → `git add` → `git commit` → `git push origin main` → 자동 배포
- 수동 배포가 필요한 경우: `vercel --prod --yes` → `vercel alias set <배포URL> nohu-lab.vercel.app`
- 배포 전 반드시 `vercel projects ls`로 현재 프로젝트 확인 후 올바른 프로젝트에 배포
- **cafe-settlement 프로젝트 절대 접근 금지** — 코드 읽기, 수정, 배포, 설정 변경 등 어떤 작업도 금지. 사용자가 명시적으로 요청할 때만 접근 가능
- 환경변수: JWT_SECRET, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (Vercel에 설정됨)

## Vercel 프로젝트 현황 (2026-03-16 기준)
- **nohu-lab** → nohu-lab.vercel.app (메인 웹앱) ✅ 사용 중
- **cafe-settlement** → cafe-settlement.vercel.app (정산 시스템) ✅ 사용 중
- cafe-webapp → 중복 프로젝트로 삭제됨 (2026-03-16)

## 코드 수정 원칙
- **코드를 수정할 때는 항상 전보다 더 나은 상태를 만들어야 한다.** 수정 후 품질이 떨어지거나 기능이 퇴보하는 변경은 절대 금지.

## SEO/AEO/GEO 최적화 규칙 (2026 최신)

### SEO (검색엔진 최적화)
- 모든 페이지에 **title, description, og:title, og:description, og:image, twitter:card** 메타 태그 필수
- **시맨틱 HTML**: header, main, nav, section, article, footer (div 남용 금지)
- **heading 계층**: 각 페이지에 h1 하나만, h1→h2→h3 순서 준수
- 이미지에 **alt 속성** 필수, next/image 사용 권장
- **sitemap.xml, robots.txt** 유지 (새 페이지 추가 시 sitemap 업데이트)
- **canonical URL** 설정
- **Core Web Vitals**: LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms 목표
- 새 프로그램 추가 시 **고유 메타 태그 + sitemap + SEO_DESCRIPTIONS 등록** 필수

### AEO (AI 답변 엔진 최적화)
- **구조화 데이터(JSON-LD)**: WebApplication + FAQPage + Organization 스키마 유지
- 페이지 description을 **질문-답변 형태**로 작성 ("~란 무엇인가요?", "~는 어떻게 하나요?")
- 첫 번째 단락에 **핵심 답변**을 직접 제공 (AI가 인용할 수 있도록)
- **명확한 계층적 헤더** 사용 (AI 모델이 구조 파악)
- 프로그램별 **SEO_DESCRIPTIONS** 객체에 질문형+답변형 설명 등록

### GEO (생성형 AI 엔진 최적화)
- **지역 정보**: 한국어(ko_KR), 원화(KRW), 한국 시간대 명시
- **저자/조직 정보**: Organization schema로 노후연구소 + 카페 URL 연결
- **엔티티 관계**: 프로그램-카테고리-등급 관계를 구조화 데이터로 표현
- 콘텐츠가 **AI에 의해 인용/요약될 수 있도록** 명확하고 구체적으로 작성

## 절대 금지 사항
- **cafe-settlement 프로젝트에 절대 접근 금지** — 읽기, 수정, 배포, 설정 변경 모두 금지 (사용자 명시적 요청 시에만 허용)
- **Vercel 프로젝트를 새로 만들거나 삭제하지 않기** (사용자가 명시적으로 요청할 때만)
- **GitHub 저장소를 새로 만들거나 삭제하지 않기** (사용자가 명시적으로 요청할 때만)
- 사용자가 요청하지 않은 코드 수정 금지

## 새 컴퓨터에서 세팅하는 법
```bash
# 1. 저장소 클론
git clone https://github.com/hansungshowcase/nohu-lab.git
cd nohu-lab

# 2. git 설정
git config user.name "hansungshowcase"
git config user.email "hansungshowcase@users.noreply.github.com"

# 3. 의존성 설치
npm install

# 4. Vercel 연결 (로그인 후)
vercel login
vercel link  # → hansung1 팀 선택 → nohu-lab 프로젝트 선택

# 5. .vercel/project.json 확인 (아래 내용이어야 함)
# {"projectId":"prj_6cnk29cR0jHrn0ZvnZWrlbiJvtob","orgId":"team_Qg3m3uYpcdK49KERdgISNq6o","projectName":"nohu-lab"}

# 6. 환경변수 가져오기
vercel env pull .env.local

# 7. 로컬 개발
npm run dev

# 8. 배포
vercel --prod --yes
vercel alias set <배포URL> nohu-lab.vercel.app
```

## 브랜치 구조
- **main**: 배포용 메인 브랜치
- **frontend**: 디자인/버그 수정 작업 브랜치
- **backend**: 새 기능 추가/기존 기능 수정 작업 브랜치
- 병렬 작업 시 git worktree 사용:
  ```bash
  git worktree add ../ai-worker1 frontend
  git worktree add ../ai-worker2 backend
  ```
- 배포 전 main에 merge 필요:
  ```bash
  cd nohu-lab  # 원본 저장소 (main 브랜치)
  git merge frontend -m "merge frontend"
  git merge backend -m "merge backend"
  # 충돌 시 수동 해결 후 git add + git commit
  vercel --prod --yes
  ```

## 프로그램 목록 (registry.ts)
| ID | 이름 | 등급 | 상태 |
|---|---|---|---|
| retirement-test | 노후 준비 점수 테스트 | 비회원(0) | ✅ |
| saju-reading | 사주풀이 | 비회원(0) | ✅ NEW |
| text-counter | 글자수 카운터 | 코어회원(1) | ✅ |
| image-resizer | 이미지 리사이저 | 코어회원(1) | ✅ |
| nickname-generator | 랜덤 닉네임 생성기 | 코어회원(1) | ✅ |
| hashtag-recommender | 해시태그 추천기 | 우수회원(2) | ✅ |
| text-converter | 텍스트 변환기 | 우수회원(2) | ✅ |

## 새 프로그램 추가 방법
1. `components/programs/` 에 컴포넌트 파일 생성
2. `app/programs/registry.ts` 에 등록
3. `app/programs/[programId]/page.tsx` 의 `programComponents`에 lazy import 추가

## 작업 시작 전 필수 규칙
- **작업 시작 전 반드시 최신 코드 반영**: `git fetch origin && git pull origin main` 후 작업 시작
- worktree에서 작업 시: `git fetch origin && git merge origin/main` 으로 최신 main 반영 후 작업
- **배포 전 반드시 양쪽 브랜치 merge**: 한쪽만 배포하면 다른 쪽 변경사항 누락됨
- 배포 순서: 양쪽 커밋 → `cd nohu-lab && git pull origin main && git merge frontend && git merge backend` → 충돌 해결 → 빌드 확인 → `vercel --prod --yes` → `vercel alias set`

## 병렬 작업 충돌 방지 규칙
- **ai-worker1 (frontend 브랜치)**: 디자인, 레이아웃, 버그 수정 담당
- **ai-worker2 (backend 브랜치)**: 새 기능 추가, 기존 기능 수정 담당
- **각 워커는 자기 담당 파일만 수정할 것** (다른 워커의 파일을 수정하면 merge 시 충돌 발생)
- **공유 파일 수정 시 주의**: `CLAUDE.md`, `registry.ts`, `page.tsx ([programId])`, `globals.css`, `layout.tsx` 등은 양쪽에서 수정할 수 있어 충돌 위험
- 배포는 main 브랜치에서만 할 것 (worktree에서 직접 배포하지 않기)
- **다른 워커가 수정 중인 파일을 동시에 수정하지 않기**

## 전수조사 규칙
- **전수조사 전 반드시**: `git fetch origin && git merge origin/main --no-edit`로 main의 최신 코드를 반영한 후 조사할 것
- 다른 터미널이 main에 push한 변경사항이 있을 수 있으므로, merge 후의 코드를 기준으로 조사해야 함
- 전수조사 후 발견된 버그 수정 시, 수정 대상 파일이 다른 터미널에서 작업 중인지 `git status`로 확인
- **배포 후 반드시 주요 기능 실제 테스트**: curl로 API 호출하여 정상 응답 확인 (로그인, 회원 조회 등)
- **핵심 기능(로그인, 채팅, 프로그램)은 코드 정적 분석뿐 아니라 실제 API 호출 테스트까지 수행할 것** — 코드가 문법적으로 맞아도 타이밍/동시성/환경 문제로 런타임 오류 발생 가능
- 전수조사 시 다음 런타임 시나리오를 반드시 검증:
  1. 동시 요청 (같은 닉네임 2명 동시 로그인)
  2. 확장프로그램 응답 지연 (15~30초)
  3. API 연속 실패 (서버 다운, 네트워크 끊김)
  4. 환경변수 미설정/잘못된 값
  5. DB 커넥션 실패

## 보고 규칙
- 사용자에게 작업 완료를 보고하기 전에, 모든 수정사항과 기능이 완벽하게 작동하는지 **최소 5번 테스트**한 후 최종 보고할 것
- 빌드 테스트, 엔진/로직 테스트, 실제 페이지 접근 테스트 등을 포함
- **이중 검증 필수**: 보고 전 사용자가 요구한 모든 항목을 체크리스트로 만들어 하나씩 검증. 빠진 항목이 없는지 재확인 후 보고
- **실제 사용자 관점에서 테스트**: 코드 분석만으로 "된다"고 보고하지 말 것. 실제 배포된 페이지에서 curl/브라우저로 직접 확인

## 반복 실수 방지 규칙
- **기능 수정 후 반드시 배포 확인**: 코드 수정 → git push → 자동배포 완료 확인 → 배포된 사이트에서 실제 테스트 → 보고. 이 순서를 건너뛰지 말 것
- **외부 서비스 연동 시 사전 확인 필수**: 카카오 SDK, 네이버 API 등 외부 서비스 연동 시 도메인 등록/키 설정 등 필수 조건을 먼저 확인한 후 구현. "될 것 같다"로 진행하지 말 것
- **한 번에 하나의 기능만 수정**: 여러 기능을 동시에 수정하면 어느 것이 문제인지 파악 어려움. 하나 수정 → 테스트 → 확인 → 다음 수정
- **사용자가 같은 요청을 2번 이상 하면**: 이전 시도가 왜 실패했는지 근본 원인을 먼저 분석하고, 같은 방식으로 재시도하지 말 것. 다른 접근 방식을 찾거나, 불가능한 이유를 명확히 설명
- **"완료"라고 보고하기 전 체크리스트**:
  1. 빌드 성공 확인
  2. git push 완료 확인
  3. 배포 완료 확인 (Vercel 상태 Ready)
  4. 배포된 URL에서 curl로 실제 테스트
  5. 외부 서비스 연동 시 실제 동작 테스트

## 과거 실수 (반복 금지)
- cafe-webapp 프로젝트를 안 쓰는 거라 판단하고 삭제 → 환경변수 전부 날아감 → 프로젝트는 사용자 요청 없이 절대 삭제하지 말 것
- ai-worker2가 cafe-webapp(잘못된 프로젝트)에 연결되어 배포가 nohu-lab.vercel.app에 반영 안 됨 → 배포 전 .vercel/project.json 확인 필수
- vercel --prod 후 nohu-lab.vercel.app alias가 자동 갱신 안 되는 경우 있음 → 배포 후 반드시 `vercel alias set` 실행
- **전수조사가 frontend 브랜치만 검사하고 main의 다른 터미널 변경사항을 놓침** → admin-login이 timingSafeEqual로 변경되어 서버 오류 발생. 전수조사 전 반드시 main merge 후 조사할 것
- **Vercel 무료 플랜 일일 배포 한도 100회** → 3개 터미널에서 빈번한 배포 시 한도 초과 주의. 배포는 꼭 필요할 때만
