const CAFE_ID = '20898041'
const CAFE_URL = 'eovhskfktmak'

export interface CafeMemberInfo {
  nickname: string
  gradeName: string
  tier: 1 | 2 | 3 | 4
}

function mapGradeToTier(gradeName: string): 1 | 2 | 3 | 4 {
  const name = gradeName.trim()
  if (name.includes('매니저') || name.includes('스탭') || name.includes('운영') || name === '헤리티지회원') return 4
  if (name === '시그니처회원' || name === '프리미엄회원') return 3
  if (name === '우수회원') return 2
  return 1
}

export async function checkCafeMember(nickname: string): Promise<CafeMemberInfo | null> {
  const cookie = process.env.NAVER_CAFE_COOKIE
  if (!cookie) {
    console.error('[naver-cafe] NAVER_CAFE_COOKIE 환경변수가 설정되지 않았습니다.')
    return null
  }

  try {
    // 네이버 카페 관리자 회원 검색 API
    const params = new URLSearchParams({
      'search.clubid': CAFE_ID,
      'search.searchBy': '1', // 1 = 닉네임 검색
      'search.query': nickname,
      'search.sortBy': '1',
      'search.clubGradeId': '0',
      'search.memberLevel': '0',
      'userDisplay': '10',
      'page': '1',
    })

    const res = await fetch(
      `https://cafe.naver.com/ManageMemberAjax.nhn?${params.toString()}`,
      {
        headers: {
          'Cookie': cookie,
          'Referer': `https://cafe.naver.com/${CAFE_URL}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'text/html, */*',
          'X-Requested-With': 'XMLHttpRequest',
        },
      }
    )

    if (!res.ok) {
      console.error(`[naver-cafe] API 응답 오류: ${res.status}`)
      return null
    }

    const html = await res.text()
    console.log(`[naver-cafe] 응답 길이: ${html.length}자`)

    // HTML 파싱: 닉네임과 등급 추출
    // 관리자 페이지의 회원 목록에서 닉네임을 찾음
    const memberMatch = findMemberInHtml(html, nickname)
    if (memberMatch) {
      return memberMatch
    }

    // 첫 번째 방법이 실패하면 JSON API 시도
    return await checkCafeMemberJsonApi(nickname, cookie)
  } catch (error) {
    console.error('[naver-cafe] 회원 확인 실패:', error)
    return null
  }
}

function findMemberInHtml(html: string, targetNickname: string): CafeMemberInfo | null {
  // 네이버 카페 관리자 회원목록의 다양한 HTML 패턴 매칭
  const patterns = [
    // 패턴 1: <a ...>닉네임</a> ... 등급명
    new RegExp(
      `<[^>]*class="[^"]*nick[^"]*"[^>]*>\\s*${escapeRegex(targetNickname)}\\s*<`,
      'i'
    ),
    // 패턴 2: 닉네임이 직접 텍스트로 포함
    new RegExp(
      `>\\s*${escapeRegex(targetNickname)}\\s*<`,
      'i'
    ),
  ]

  for (const pattern of patterns) {
    if (pattern.test(html)) {
      // 등급 추출 시도
      const gradePatterns = [
        /class="[^"]*grade[^"]*"[^>]*>\s*([^<]+)\s*</gi,
        /등급[^:：]*[：:]\s*([^\s<]+)/gi,
        /<span[^>]*>\s*(일반회원|코어회원|우수회원|프리미엄회원|시그니처회원|헤리티지회원|매니저|스탭|운영진)\s*<\/span>/gi,
      ]

      let gradeName = '일반회원'
      for (const gp of gradePatterns) {
        const gradeMatch = gp.exec(html)
        if (gradeMatch) {
          gradeName = gradeMatch[1].trim()
          break
        }
      }

      return {
        nickname: targetNickname,
        gradeName,
        tier: mapGradeToTier(gradeName),
      }
    }
  }

  return null
}

async function checkCafeMemberJsonApi(
  nickname: string,
  cookie: string
): Promise<CafeMemberInfo | null> {
  try {
    // 네이버 카페 내부 JSON API 시도
    const res = await fetch(
      `https://apis.naver.com/cafe-web/cafe2/CafeMemberSearch?cafeId=${CAFE_ID}&query=${encodeURIComponent(nickname)}&page=1&perPage=10`,
      {
        headers: {
          'Cookie': cookie,
          'Referer': `https://cafe.naver.com/${CAFE_URL}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
      }
    )

    if (!res.ok) return null

    const data = await res.json()
    console.log('[naver-cafe] JSON API 응답:', JSON.stringify(data).substring(0, 500))

    // 응답에서 회원 검색
    const members = data?.message?.result?.memberList ||
                    data?.result?.memberList ||
                    data?.members ||
                    data?.data?.members ||
                    []

    for (const member of members) {
      const memberNick = member.nickname || member.nick || member.memberNickname || ''
      if (memberNick.trim() === nickname.trim()) {
        const gradeName = member.memberLevelName || member.gradeName || member.levelName || '일반회원'
        return {
          nickname: memberNick.trim(),
          gradeName,
          tier: mapGradeToTier(gradeName),
        }
      }
    }
  } catch (error) {
    console.log('[naver-cafe] JSON API 실패 (정상일 수 있음):', error)
  }

  return null
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
