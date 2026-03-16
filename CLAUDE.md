# CLAUDE.md - 프로젝트 규칙

## 작업 범위
- C:\Users\Administrator\nohu-lab\ 안의 코드만 수정

## Vercel 배포 규칙
- Vercel 계정: hansung1 (qhdl10100-6263)
- **nohu-lab.vercel.app = nohu-lab 프로젝트가 서빙 중**
- 배포 명령: `vercel --prod --yes`
- 배포 후 `vercel alias set <배포URL> nohu-lab.vercel.app` 으로 도메인 연결 확인
- 배포 전 반드시 `vercel projects ls`로 현재 프로젝트 확인 후 올바른 프로젝트에 배포
- **절대 다른 Vercel 프로젝트(cafe-settlement) 건들지 않기**

## 절대 금지 사항
- **Vercel 프로젝트를 새로 만들거나 삭제하지 않기** (사용자가 명시적으로 요청할 때만)
- **GitHub 저장소를 새로 만들거나 삭제하지 않기** (사용자가 명시적으로 요청할 때만)
- 기존 프로젝트: nohu-lab(=nohu-lab.vercel.app), cafe-settlement 이 2개만 사용
- cafe-webapp은 중복 프로젝트로 삭제됨 (2026-03-16)

## GitHub
- 레포: hansungshowcase/nohu-lab
- git config: user.name=hansungshowcase, email=hansungshowcase@users.noreply.github.com
- 자동배포 미연동, 수동 `vercel --prod` 필요

## 기술 스택
- Next.js 16 (App Router) + React 19 + Tailwind 4
- Supabase + JWT 인증
- 스타일: green 팔레트, `max-w-2xl mx-auto space-y-6` 컨테이너

## 보고 규칙
- 사용자에게 작업 완료를 보고하기 전에, 모든 수정사항과 기능이 완벽하게 작동하는지 **최소 5번 테스트**한 후 최종 보고할 것
- 빌드 테스트, 엔진/로직 테스트, 실제 페이지 접근 테스트 등을 포함
