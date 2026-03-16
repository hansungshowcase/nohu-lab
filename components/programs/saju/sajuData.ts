// ═══════════════════════════════════════════════
// 사주풀이 해석 데이터
// ═══════════════════════════════════════════════

import { ELEMENTS } from './sajuEngine'

// ── 일간별 성격 유형 ──
export interface DayMasterProfile {
  title: string           // 바이럴용 캐치프레이즈
  emoji: string
  element: string
  nature: string          // 자연물 비유
  personality: string[]   // 성격 키워드
  description: string     // 상세 설명
  strengths: string[]
  weaknesses: string[]
  loveStyle: string
  careerFit: string[]
  healthTip: string
  luckyColor: string
  luckyNumber: number
  luckyDirection: string
  bestMatch: number[]     // 궁합 좋은 일간 인덱스
  worstMatch: number[]    // 궁합 안 좋은 일간 인덱스
}

export const DAY_MASTER_PROFILES: DayMasterProfile[] = [
  // 0: 갑목 (甲木) - 큰 나무
  {
    title: '하늘을 찌르는 대나무',
    emoji: '🎋',
    element: '목(木)',
    nature: '큰 나무, 소나무',
    personality: ['리더십', '진취적', '정의감', '독립적'],
    description: '하늘을 향해 곧게 뻗는 큰 나무처럼, 당신은 타고난 리더입니다. 강한 추진력과 정의감으로 주변 사람들을 이끌며, 한번 정한 목표는 반드시 이루어냅니다. 새로운 도전을 두려워하지 않는 개척자 기질이 돋보입니다.',
    strengths: ['결단력이 뛰어남', '리더십이 강함', '의지가 굳건함', '성장 욕구가 강함'],
    weaknesses: ['고집이 셀 수 있음', '타인 의견 무시 경향', '융통성 부족'],
    loveStyle: '한번 사랑하면 끝까지 지키는 든든한 타입. 연인에게 자신감을 심어주는 사람이지만, 가끔 자기 방식만 고집할 수 있어요.',
    careerFit: ['CEO/경영자', '정치인', '군인/경찰', '건축가', '스타트업 창업'],
    healthTip: '간과 담에 주의하세요. 스트레스를 혼자 삼키지 말고 운동으로 풀어주세요.',
    luckyColor: '초록색',
    luckyNumber: 3,
    luckyDirection: '동쪽',
    bestMatch: [3, 9],  // 정화, 계수
    worstMatch: [6, 7], // 경금, 신금
  },
  // 1: 을목 (乙木) - 꽃과 덩굴
  {
    title: '바람에 흔들려도 꺾이지 않는 꽃',
    emoji: '🌸',
    element: '목(木)',
    nature: '꽃, 덩굴, 풀',
    personality: ['유연함', '적응력', '예술적', '섬세함'],
    description: '강한 바람에도 부러지지 않는 유연한 풀처럼, 당신은 뛰어난 적응력의 소유자입니다. 부드러움 속에 강인함이 숨어 있으며, 아름다운 것을 창조하는 예술적 감각이 탁월합니다.',
    strengths: ['적응력이 뛰어남', '대인관계 능숙', '예술적 감각', '협상 능력'],
    weaknesses: ['우유부단할 수 있음', '눈치를 너무 봄', '주관이 흔들릴 수 있음'],
    loveStyle: '상대방의 마음을 섬세하게 읽는 연애 고수. 분위기를 잘 만들지만, 때로는 자기 감정을 숨기기도 해요.',
    careerFit: ['디자이너', '예술가', '외교관', '상담사', '플로리스트'],
    healthTip: '신경계와 소화기에 주의하세요. 자연 속 산책이 최고의 힐링입니다.',
    luckyColor: '연두색',
    luckyNumber: 8,
    luckyDirection: '동쪽',
    bestMatch: [2, 6],  // 병화, 경금
    worstMatch: [7],     // 신금
  },
  // 2: 병화 (丙火) - 태양
  {
    title: '세상을 밝히는 태양의 에너지',
    emoji: '☀️',
    element: '화(火)',
    nature: '태양, 큰 불',
    personality: ['열정적', '밝음', '활발', '영향력'],
    description: '태양처럼 밝고 따뜻한 에너지를 가진 당신! 어디서든 분위기 메이커로 활약하며, 사람들에게 희망과 에너지를 전합니다. 뜨거운 열정으로 불가능을 가능으로 만드는 사람입니다.',
    strengths: ['카리스마', '표현력이 뛰어남', '낙관적', '에너지 넘침'],
    weaknesses: ['성격이 급할 수 있음', '과시욕', '감정 기복'],
    loveStyle: '불꽃처럼 뜨겁게 사랑하는 타입! 적극적으로 다가가고 로맨틱한 이벤트를 즐기지만, 식으면 빨리 식을 수도 있어요.',
    careerFit: ['연예인', '유튜버/인플루언서', '마케터', '교사', '이벤트 기획자'],
    healthTip: '심장과 혈압에 주의하세요. 과도한 흥분을 자제하고 명상을 추천합니다.',
    luckyColor: '빨간색',
    luckyNumber: 7,
    luckyDirection: '남쪽',
    bestMatch: [1, 7],  // 을목, 신금
    worstMatch: [8, 9], // 임수, 계수
  },
  // 3: 정화 (丁火) - 촛불
  {
    title: '어둠을 밝히는 따뜻한 촛불',
    emoji: '🕯️',
    element: '화(火)',
    nature: '촛불, 별빛, 달빛',
    personality: ['섬세함', '직관적', '따뜻함', '집중력'],
    description: '고요한 촛불처럼 은은하게 빛나는 당신. 깊은 통찰력과 직관으로 세상의 본질을 꿰뚫어 봅니다. 겉으로는 조용하지만 속에는 뜨거운 열정을 품고 있는 감성의 달인입니다.',
    strengths: ['직관력', '집중력이 뛰어남', '세심한 관찰력', '공감 능력'],
    weaknesses: ['예민할 수 있음', '걱정이 많음', '내면의 불안'],
    loveStyle: '깊고 의미 있는 관계를 추구하는 타입. 말보다 행동으로 사랑을 표현하며, 한번 마음을 주면 끝까지 지킵니다.',
    careerFit: ['작가', '심리상담사', '연구원', '프로그래머', '점술가/역학자'],
    healthTip: '눈과 심장에 주의하세요. 충분한 수면과 마음 정리 시간이 필요합니다.',
    luckyColor: '보라색',
    luckyNumber: 2,
    luckyDirection: '남쪽',
    bestMatch: [0, 8],  // 갑목, 임수
    worstMatch: [9],     // 계수
  },
  // 4: 무토 (戊土) - 산
  {
    title: '흔들리지 않는 거대한 산',
    emoji: '⛰️',
    element: '토(土)',
    nature: '산, 큰 바위, 대지',
    personality: ['신뢰감', '안정적', '듬직함', '포용력'],
    description: '우뚝 솟은 산처럼 듬직하고 든든한 당신. 어떤 상황에서도 흔들리지 않는 안정감이 최대 장점입니다. 주변 사람들이 어려울 때 가장 먼저 찾는 의지의 대상입니다.',
    strengths: ['책임감이 강함', '신뢰할 수 있음', '인내심', '중재 능력'],
    weaknesses: ['변화에 느림', '완고할 수 있음', '새로운 시도 꺼림'],
    loveStyle: '조건 없이 받아주는 든든한 산 같은 연인. 화려한 표현은 서툴지만, 묵묵히 곁을 지키는 진짜 사랑을 해요.',
    careerFit: ['공무원', '부동산 전문가', '금융업', '농업/목축업', '중재자/조정관'],
    healthTip: '위장과 비장에 주의하세요. 과식을 피하고 규칙적인 식사가 중요합니다.',
    luckyColor: '노란색',
    luckyNumber: 5,
    luckyDirection: '중앙',
    bestMatch: [2, 9],  // 병화, 계수
    worstMatch: [0],     // 갑목
  },
  // 5: 기토 (己土) - 정원/논밭
  {
    title: '만물을 품어 키우는 대지',
    emoji: '🌾',
    element: '토(土)',
    nature: '논밭, 정원, 흙',
    personality: ['포용력', '실용적', '양육적', '꼼꼼함'],
    description: '비옥한 대지처럼 모든 것을 품고 키워내는 당신. 실용적이면서도 따뜻한 마음을 지녔습니다. 작은 씨앗도 풍성한 열매로 만드는 놀라운 능력의 소유자예요.',
    strengths: ['실용적 사고', '꼼꼼한 관리력', '양육 능력', '인내심'],
    weaknesses: ['소심할 수 있음', '자기 희생 과다', '결정이 느림'],
    loveStyle: '상대방을 세심하게 챙기는 헌신적 연인. 요리, 선물 등 일상에서 사랑을 표현하지만, 자기 감정을 잘 말하지 않아요.',
    careerFit: ['교육자', '요리사/셰프', '간호사/의사', 'HR 담당자', '환경 전문가'],
    healthTip: '소화기와 피부에 주의하세요. 스트레스 관리가 건강의 핵심입니다.',
    luckyColor: '갈색',
    luckyNumber: 0,
    luckyDirection: '중앙',
    bestMatch: [3, 6],  // 정화, 경금
    worstMatch: [1],     // 을목
  },
  // 6: 경금 (庚金) - 쇠/바위
  {
    title: '불의를 꺾는 정의의 칼날',
    emoji: '⚔️',
    element: '금(金)',
    nature: '칼, 도끼, 쇠',
    personality: ['결단력', '의리', '강인함', '정의감'],
    description: '날카로운 칼처럼 결단력 있고 정의로운 당신! 옳다고 생각하면 어떤 반대에도 굽히지 않는 강철 멘탈의 소유자입니다. 의리와 신의를 최고의 가치로 여깁니다.',
    strengths: ['결단력', '의리가 강함', '실행력', '공정함'],
    weaknesses: ['너무 직설적', '융통성 부족', '감정 표현 서툼'],
    loveStyle: '쿨하고 시원시원한 연애 스타일. 좋아하면 바로 표현하고, 싫어하면 확실히 정리하는 타입이에요.',
    careerFit: ['군인/검사/판사', '외과의사', '엔지니어', '운동선수', 'CEO'],
    healthTip: '폐와 대장에 주의하세요. 규칙적인 호흡 운동과 유산소 운동을 추천합니다.',
    luckyColor: '흰색',
    luckyNumber: 4,
    luckyDirection: '서쪽',
    bestMatch: [1, 5],  // 을목, 기토
    worstMatch: [2],     // 병화
  },
  // 7: 신금 (辛金) - 보석
  {
    title: '빛나는 다이아몬드의 품격',
    emoji: '💎',
    element: '금(金)',
    nature: '보석, 금, 은',
    personality: ['완벽주의', '예리함', '우아함', '자존심'],
    description: '다이아몬드처럼 빛나는 당신! 높은 안목과 세련된 취향을 가졌으며, 자기만의 원칙과 기준이 확실합니다. 겉으로는 차가워 보이지만 속은 따뜻한 반전 매력의 소유자예요.',
    strengths: ['섬세한 감각', '높은 기준', '분석력', '자기관리 능력'],
    weaknesses: ['예민함', '자존심이 강함', '타협을 못 함'],
    loveStyle: '까칠하지만 한번 빠지면 진심인 타입. 감각적인 데이트를 좋아하고, 사소한 것에서 감동받는 섬세한 연인이에요.',
    careerFit: ['보석/귀금속 전문가', '디자이너', '변호사', '감정평가사', '뷰티 전문가'],
    healthTip: '호흡기와 피부에 주의하세요. 깨끗한 공기와 보습 관리가 중요합니다.',
    luckyColor: '은색',
    luckyNumber: 1,
    luckyDirection: '서쪽',
    bestMatch: [2, 8],  // 병화, 임수
    worstMatch: [0],     // 갑목
  },
  // 8: 임수 (壬水) - 바다/큰 강
  {
    title: '끝없이 넓은 바다의 지혜',
    emoji: '🌊',
    element: '수(水)',
    nature: '바다, 큰 강, 호수',
    personality: ['지혜', '포용', '자유로움', '창의성'],
    description: '넓고 깊은 바다처럼 무한한 가능성을 품은 당신! 자유롭고 창의적인 사고로 남들이 생각 못 하는 해결책을 찾아냅니다. 어디든 흘러갈 수 있는 적응력과 포용력이 탁월합니다.',
    strengths: ['창의력', '지적 호기심', '포용력', '위기 대처 능력'],
    weaknesses: ['한곳에 정착 어려움', '감정 기복', '현실감 부족할 수 있음'],
    loveStyle: '자유로운 영혼의 연인! 속박을 싫어하지만 진짜 사랑 앞에선 깊고 넓은 바다처럼 모든 걸 받아주는 타입이에요.',
    careerFit: ['탐험가/여행가', '철학자', '영화감독', '무역업', '해양/수산업'],
    healthTip: '신장과 방광에 주의하세요. 충분한 수분 섭취와 하체 운동을 추천합니다.',
    luckyColor: '파란색',
    luckyNumber: 6,
    luckyDirection: '북쪽',
    bestMatch: [3, 7],  // 정화, 신금
    worstMatch: [4],     // 무토
  },
  // 9: 계수 (癸水) - 빗물/이슬
  {
    title: '만물을 깨우는 생명의 빗물',
    emoji: '🌧️',
    element: '수(水)',
    nature: '비, 이슬, 안개',
    personality: ['지적', '직관적', '섬세', '치유력'],
    description: '생명을 틔우는 빗물처럼 잔잔하지만 강한 힘을 가진 당신. 뛰어난 직관력과 통찰력으로 미래를 내다보며, 주변 사람들의 마음을 치유하는 특별한 능력이 있습니다.',
    strengths: ['직관력', '학습 능력', '감수성', '치유 능력'],
    weaknesses: ['걱정이 많음', '우울해질 수 있음', '행동력 부족'],
    loveStyle: '감성적이고 로맨틱한 연애를 꿈꾸는 타입. 상대방의 기분을 귀신같이 알아채며, 깊은 정서적 교감을 중시해요.',
    careerFit: ['심리학자', '점술/역학', '음악가', '의료인', '종교인/명상가'],
    healthTip: '신장과 생식기에 주의하세요. 몸을 따뜻하게 유지하고 냉한 음식을 피하세요.',
    luckyColor: '검정색',
    luckyNumber: 9,
    luckyDirection: '북쪽',
    bestMatch: [0, 4],  // 갑목, 무토
    worstMatch: [2],     // 병화
  },
]

// ── 신강/신약에 따른 보충 해석 ──
export const STRENGTH_INTERPRETATIONS = {
  strong: {
    label: '신강(身強)',
    emoji: '💪',
    description: '에너지가 넘치고 자기 주관이 뚜렷한 타입',
    advice: '주변과의 조화를 이루면 더 큰 성공을 거둘 수 있습니다. 나누고 베푸는 것이 행운의 열쇠예요.',
    money: '자수성가형! 직접 벌어서 직접 쓰는 스타일. 투자보다 사업이 잘 맞아요.',
    relationship: '리드하는 연애를 선호하지만, 상대방의 의견도 존중하면 관계가 더 좋아져요.',
  },
  weak: {
    label: '신약(身弱)',
    emoji: '🤝',
    description: '협력과 조화를 중시하는 팀플레이어 타입',
    advice: '자기 확신을 키우고 결단력을 기르면 큰 성과를 낼 수 있습니다. 자기 자신을 먼저 챙기세요.',
    money: '안정적 투자가 적합! 적금, 부동산 등 안전한 자산 관리가 어울려요.',
    relationship: '상대방에게 맞추는 경향이 있지만, 자기 의견도 당당히 말하는 것이 건강한 관계의 비결이에요.',
  },
}

// ── 오행 부족 시 보완 조언 ──
export const MISSING_ELEMENT_ADVICE: Record<number, { title: string; advice: string; items: string[] }> = {
  0: { title: '목(木) 기운 부족', advice: '성장과 시작의 에너지가 부족합니다', items: ['초록색 옷이나 소품 활용', '동쪽 방향이 길방', '나무나 식물 가까이하기', '봄에 새로운 시작을 하면 좋음'] },
  1: { title: '화(火) 기운 부족', advice: '열정과 표현의 에너지가 부족합니다', items: ['빨간색 아이템 활용', '남쪽 방향이 길방', '촛불이나 조명 활용', '여름 활동을 늘리면 좋음'] },
  2: { title: '토(土) 기운 부족', advice: '안정과 중심의 에너지가 부족합니다', items: ['노란색/갈색 활용', '규칙적인 생활 습관', '흙을 만지는 활동 (도예, 정원 등)', '제철 음식 챙겨 먹기'] },
  3: { title: '금(金) 기운 부족', advice: '결단과 정리의 에너지가 부족합니다', items: ['흰색/금색 활용', '서쪽 방향이 길방', '금속 액세서리 착용', '가을에 중요한 결정을 하면 좋음'] },
  4: { title: '수(水) 기운 부족', advice: '지혜와 유연함의 에너지가 부족합니다', items: ['검정색/파란색 활용', '북쪽 방향이 길방', '물 관련 활동 (수영, 온천 등)', '겨울에 자기 계발을 하면 좋음'] },
}

// ── 용신 기반 개운법 ──
export const USEFUL_GOD_TIPS: Record<number, { element: string; description: string; tips: string[] }> = {
  0: { element: '목(木)', description: '성장과 발전의 기운이 필요합니다', tips: ['초록색을 많이 활용하세요', '아침 산책이나 등산이 좋아요', '새로운 공부나 자격증에 도전하세요', '동쪽으로 여행하면 기운이 살아나요'] },
  1: { element: '화(火)', description: '열정과 활력의 기운이 필요합니다', tips: ['빨간색/주황색 아이템을 활용하세요', '사교 모임에 적극 참여하세요', '발표나 무대에 서는 경험을 쌓으세요', '남쪽 방향이 행운을 가져와요'] },
  2: { element: '토(土)', description: '안정과 신뢰의 기운이 필요합니다', tips: ['노란색/베이지 톤을 활용하세요', '규칙적인 루틴을 만드세요', '부동산이나 토지 관련 활동이 좋아요', '안정적인 사람과 함께하면 행운이 와요'] },
  3: { element: '금(金)', description: '결단과 실행의 기운이 필요합니다', tips: ['흰색/은색 아이템을 활용하세요', '체계적 계획을 세우고 실행하세요', '금속 소재의 액세서리가 행운의 부적이에요', '서쪽 방향으로 여행하면 좋아요'] },
  4: { element: '수(水)', description: '지혜와 유연함의 기운이 필요합니다', tips: ['검정/파란색을 활용하세요', '독서와 명상으로 내면을 채우세요', '수영이나 온천이 에너지를 충전해줘요', '북쪽 방향이 행운의 방향이에요'] },
}

// ── 올해 운세 (세운) 간단 해석 ──
export function getYearFortune(dayMasterElement: number, currentYear: number): { title: string; description: string; stars: number; advice: string } {
  const yearStem = ((currentYear - 4) % 10 + 10) % 10
  const yearElement = [0,0,1,1,2,2,3,3,4,4][yearStem]

  // 오행 관계에 따른 운세
  const rel = ((yearElement - dayMasterElement) % 5 + 5) % 5

  const fortunes = [
    { title: '비겁운 - 경쟁과 협력의 해', description: '나와 같은 기운이 강해지는 해입니다. 경쟁자가 나타나지만, 좋은 동료도 만날 수 있어요. 협력 프로젝트가 성과를 낼 수 있습니다.', stars: 3, advice: '경쟁에서 이기려면 실력을 키우세요. 동업은 신중하게!' },
    { title: '식상운 - 표현과 창작의 해', description: '창의력과 표현력이 폭발하는 해! 새로운 아이디어가 샘솟고, 숨겨왔던 재능이 빛을 발합니다. SNS, 블로그, 유튜브 등 콘텐츠 활동이 좋아요.', stars: 4, advice: '아이디어를 행동으로 옮기세요. 새로운 도전이 행운을 부릅니다!' },
    { title: '재성운 - 재물과 기회의 해', description: '재물운이 상승하는 한 해! 투자, 사업 확장, 이직 등 경제적 기회가 찾아옵니다. 단, 과욕은 금물. 분수에 맞는 투자가 중요합니다.', stars: 5, advice: '기회가 오면 과감하게 잡되, 리스크 관리는 철저하게!' },
    { title: '관성운 - 변화와 책임의 해', description: '직장이나 사회적 위치에 변화가 생길 수 있는 해. 승진, 이직, 새로운 역할 등 책임이 커질 수 있습니다. 건강 관리에도 신경 쓰세요.', stars: 3, advice: '맡은 일에 최선을 다하세요. 성실함이 인정받는 해입니다.' },
    { title: '인성운 - 학습과 성장의 해', description: '배움과 자기계발의 운이 강한 해! 새로운 공부, 자격증, 학위 등에 도전하면 좋은 성과를 거둘 수 있습니다. 귀인의 도움도 기대할 수 있어요.', stars: 4, advice: '공부하고 준비하세요. 지금 쌓는 실력이 내년의 기회가 됩니다!' },
  ]

  return fortunes[rel]
}

// ── 바이럴용 한줄 요약 ──
export function getViralSummary(dayMaster: number, isStrong: boolean): string {
  const summaries: Record<number, string[]> = {
    0: ['CEO 기질 200%! 타고난 리더 사주', '조용히 세상을 바꾸는 큰 그릇 사주'],
    1: ['꺾이지 않는 마음의 소유자!', '부드러움이 강함을 이기는 외유내강 사주'],
    2: ['어디서든 주인공! 스타 기질 사주', '열정으로 세상을 녹이는 태양 사주'],
    3: ['천재적 직관의 소유자!', '은은하게 빛나는 숨은 실력자 사주'],
    4: ['믿음직한 인생의 든든한 버팀목!', '흔들리지 않는 프로 안정러 사주'],
    5: ['사람을 키우는 최고의 멘토 사주!', '소소하지만 확실한 행복을 아는 사주'],
    6: ['칼같은 판단력의 결정자!', '정의로운 영혼의 진짜 사나이/여전사 사주'],
    7: ['빛나는 존재감! 타고난 럭셔리 사주', '완벽을 추구하는 장인정신 사주'],
    8: ['끝없는 가능성의 모험가 사주!', '세상 어디든 내 무대! 자유영혼 사주'],
    9: ['미래를 읽는 예언자 사주!', '조용히 세상을 치유하는 힐러 사주'],
  }
  return summaries[dayMaster][isStrong ? 0 : 1]
}

// ── 대운 해석 ──
export function getDaeunInterpretation(tenGod: string): { title: string; description: string; emoji: string; stars: number } {
  const map: Record<string, { title: string; description: string; emoji: string; stars: number }> = {
    '비견': { title: '독립과 도전', emoji: '🏃', description: '자기 주관이 뚜렷해지고 독립적으로 성장하는 시기입니다. 동업이나 경쟁 상황이 생길 수 있으니 주체적으로 판단하세요.', stars: 3 },
    '겁재': { title: '경쟁과 변화', emoji: '⚡', description: '예상치 못한 변화와 경쟁이 찾아오는 시기. 재물 관리에 특히 신중해야 하며, 충동적인 투자는 피하세요.', stars: 2 },
    '식신': { title: '풍요와 안정', emoji: '🌸', description: '먹을 복과 창작 에너지가 넘치는 안정된 시기. 자격증 취득, 기술 연마, 콘텐츠 활동에 최적입니다.', stars: 4 },
    '상관': { title: '자유와 표현', emoji: '🎨', description: '기존의 틀을 깨고 자유롭게 표현하는 시기. 예술·창작 활동이 빛나지만, 대인관계에서 말조심이 필요합니다.', stars: 3 },
    '편재': { title: '큰 재물의 기회', emoji: '💎', description: '대박의 기회가 찾아오는 시기! 사업 확장, 투자, 부동산 등에서 큰 성과를 거둘 수 있습니다. 단, 과욕은 금물.', stars: 5 },
    '정재': { title: '꾸준한 축적', emoji: '🏦', description: '안정적인 수입과 재물이 쌓이는 시기. 저축, 부동산, 장기 투자에 유리하며 착실한 노력이 보상받습니다.', stars: 4 },
    '편관': { title: '시련 후 도약', emoji: '🔥', description: '압박과 도전이 있지만, 이를 극복하면 인생의 큰 전환점이 됩니다. 건강 관리와 스트레스 해소가 중요합니다.', stars: 2 },
    '정관': { title: '명예와 승진', emoji: '👑', description: '사회적 인정과 지위 상승의 시기. 직장인에게 승진·이직 기회가 오며, 신뢰를 쌓으면 큰 결실을 맺습니다.', stars: 4 },
    '편인': { title: '전환과 탐구', emoji: '🔍', description: '새로운 분야에 눈을 뜨는 시기. 이직, 전업, 유학 등 인생의 방향 전환이 있을 수 있습니다. 열린 마음이 필요합니다.', stars: 3 },
    '정인': { title: '성장과 귀인', emoji: '🌟', description: '귀인의 도움으로 크게 성장하는 시기. 학업, 자격증, 자기계발에 최적이며 어머니·스승과의 인연이 깊어집니다.', stars: 4 },
  }
  return map[tenGod] || { title: '전환기', description: '변화의 시기입니다.', emoji: '🔄', stars: 3 }
}

// ── 궁합 간단 설명 ──
export function getCompatibilityHint(dayMaster: number): string {
  const hints: string[] = [
    '정화(丁), 계수(癸) 일간과 찰떡궁합! 서로 성장시키는 환상의 조합이에요.',
    '병화(丙), 경금(庚) 일간과 최고의 시너지! 부드러움과 강함의 완벽한 밸런스.',
    '을목(乙), 신금(辛) 일간과 운명적 만남! 서로를 빛나게 해주는 관계에요.',
    '갑목(甲), 임수(壬) 일간과 깊은 교감! 영혼까지 통하는 인연이에요.',
    '병화(丙), 계수(癸) 일간과 안정적 궁합! 서로에게 필요한 존재가 돼요.',
    '정화(丁), 경금(庚) 일간과 성장하는 관계! 함께 발전하는 최고의 파트너.',
    '을목(乙), 기토(己) 일간과 의리의 궁합! 변하지 않는 단단한 인연이에요.',
    '병화(丙), 임수(壬) 일간과 반전 매력 궁합! 다르기에 끌리는 특별한 인연.',
    '정화(丁), 신금(辛) 일간과 감성 궁합! 서로의 빈자리를 채워주는 관계에요.',
    '갑목(甲), 무토(戊) 일간과 생명의 궁합! 함께 있으면 에너지가 충전돼요.',
  ]
  return hints[dayMaster]
}
