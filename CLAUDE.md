# CLAUDE.md - 프로젝트 규칙

## 작업 범위
- C:\Users\Administrator\nohu-lab\ 안의 코드만 수정

## Vercel 배포 규칙
- Vercel 계정: hansung1 (qhdl10100-6263)
- **nohu-lab.vercel.app = cafe-webapp 프로젝트가 서빙 중. 새 프로젝트 만들지 말고 cafe-webapp에 배포할 것**
- 배포 명령: `cd /c/Users/Administrator/nohu-lab && vercel --prod`
- 배포 전 반드시 `vercel projects ls`로 현재 프로젝트 확인 후 올바른 프로젝트에 배포
- **절대 Vercel 프로젝트를 삭제/생성하지 않기. 기존 프로젝트에 배포만 할 것**
- **절대 다른 Vercel 프로젝트(cafe-settlement, nohu-vercel, nohu-settlement, easy-link) 건들지 않기**
- 환경변수 복구 후 `.env.local`에 백업 저장해둘 것

## 과거 실수 (반복 금지)
- cafe-webapp이 nohu-lab.vercel.app을 서빙하고 있었는데, 안 쓰는 거라 판단하고 삭제 → 환경변수 전부 날아감
- 기존 프로젝트는 절대 삭제하지 말 것

## GitHub
- 레포: hansungshowcase/nohu-lab
- git config: user.name=hansungshowcase, email=hansungshowcase@users.noreply.github.com
- 자동배포 미연동, 수동 `vercel --prod` 필요

## 기술 스택
- Next.js 16 (App Router) + React 19 + Tailwind 4
- Supabase + JWT 인증
- 스타일: green 팔레트, `max-w-2xl mx-auto space-y-6` 컨테이너
