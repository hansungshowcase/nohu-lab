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
- 배포 명령: `vercel --prod --yes`
- 배포 후 반드시: `vercel alias set <배포URL> nohu-lab.vercel.app` 으로 도메인 연결 확인
- 배포 전 반드시 `vercel projects ls`로 현재 프로젝트 확인 후 올바른 프로젝트에 배포
- **절대 다른 Vercel 프로젝트(cafe-settlement) 건들지 않기**
- 자동배포 미연동, 수동 `vercel --prod` 필요
- 환경변수: JWT_SECRET, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (Vercel에 설정됨)

## Vercel 프로젝트 현황 (2026-03-16 기준)
- **nohu-lab** → nohu-lab.vercel.app (메인 웹앱) ✅ 사용 중
- **cafe-settlement** → cafe-settlement.vercel.app (정산 시스템) ✅ 사용 중
- cafe-webapp → 중복 프로젝트로 삭제됨 (2026-03-16)

## 절대 금지 사항
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

## 보고 규칙
- 사용자에게 작업 완료를 보고하기 전에, 모든 수정사항과 기능이 완벽하게 작동하는지 **최소 5번 테스트**한 후 최종 보고할 것
- 빌드 테스트, 엔진/로직 테스트, 실제 페이지 접근 테스트 등을 포함

## 과거 실수 (반복 금지)
- cafe-webapp 프로젝트를 안 쓰는 거라 판단하고 삭제 → 환경변수 전부 날아감 → 프로젝트는 사용자 요청 없이 절대 삭제하지 말 것
- ai-worker2가 cafe-webapp(잘못된 프로젝트)에 연결되어 배포가 nohu-lab.vercel.app에 반영 안 됨 → 배포 전 .vercel/project.json 확인 필수
- vercel --prod 후 nohu-lab.vercel.app alias가 자동 갱신 안 되는 경우 있음 → 배포 후 반드시 `vercel alias set` 실행
