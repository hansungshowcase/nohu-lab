# CLAUDE.md - 프로젝트 규칙

## 작업 범위
- C:\Users\Administrator\nohu-lab\ 안의 코드만 수정
- **기존에 잘 동작하는 코드는 절대 수정하지 않기. 사용자가 명시적으로 요청한 부분만 변경할 것**

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

## 버그 수정 이력 (3차 전수조사 완료, 총 32건)

### 1차 수정 (11건)
1. ChatWidget Hooks 규칙 위반 - 조건부 return을 Hooks 뒤로 이동
2. /programs 인증 우회 - 실패 시 tier:4→tier:0
3. 질문 수 불일치 - registry.ts 12개→20개
4. 관리자 로그인 비결정적 - created_at 정렬 추가
5. 채팅 전체 로드 - rooms API limit(1000)
6. 디버그 API 노출 - 관리자 인증 추가
7. 전화번호 마스킹 불완전 - 8자리 이상 마스킹
8. dashboard useEffect router 의존성 제거
9. clipboard fallback 추가 (NicknameGenerator, TextConverter)
10. 채팅 메시지 중복 fetchChatRooms 제거
11. 닉네임 길이 100자 제한 + tier 범위 검증

### 2차 수정 (13건)
12. 관리자 자기 삭제 방지
13. SYNC_SECRET 환경변수 전환 (verify-poll, verify-result, sync-members)
14. 쿠키 secure 속성 일관성 (naver callback)
15. bulk API 배열 크기 1000개 제한 + 빈 문자열 필터링
16. getServiceSupabase 싱글톤 캐싱
17. ProgramCard useRouter Hooks 규칙 위반 수정
18. ImageResizer 크기 제한 (최대 10000px)
19. HashtagRecommender 이중 해시태그(##) 방지
20. 로그인 페이지 폴링 cleanup (useEffect)
21. URL 디버그 정보 노출 제거 (naver callback)
22. 신규회원 등록 실패 시 빈 ID 토큰 발급 방지
23. tier 정수 타입 검증 (members/sync)
24. PATCH phone null 참조 + tier 범위 검증

### 3차 수정 (8건)
25. 채팅 메시지 GET 권한 강화 (일반 회원 roomId 조작 방지)
26. members/sync 배열 크기 5000개 제한
27. layout.tsx viewport deprecated → Viewport export 분리
28. admin 메시지 에러/성공 색상 구분 (빨강/초록)
29. handleTierChange 낙관적 업데이트 + 롤백
30. RetirementTest 모달 오버레이 (결과 화면 가리지 않음)
31. admin fetchMembers 탭 전환 시 갱신
32. members/sync 하드코딩 secret 제거 (환경변수만 사용)
