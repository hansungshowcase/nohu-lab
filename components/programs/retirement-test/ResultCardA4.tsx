'use client'

import { forwardRef } from 'react'
import { ResultType } from './results'
import { CategoryScore } from './questions'

interface ResultCardA4Props {
  total: number
  maxTotal: number
  result: ResultType
  categories: CategoryScore[]
  answers?: Record<number, number>
}

// ── 문항별 마이크로 진단 ──
const questionDiagnosis: Record<number, { title: string; scores: Record<number, string> }> = {
  1: {
    title: '저축/투자 비율',
    scores: {
      1: '소득 대비 저축률이 10% 미만으로, 복리 효과를 전혀 활용하지 못하고 있습니다. 월 소득의 최소 15%를 자동이체로 저축 통장에 이체하세요. 월 300만원 소득 기준 45만원이면 연 540만원, 연 5% 수익률로 20년 후 약 1.8억이 됩니다.',
      2: '저축을 시작했지만, 노후 대비를 위해서는 최소 20% 이상이 권장됩니다. 현재 저축 비율에서 매분기 2%p씩 올려보세요. 특히 보너스·성과급은 80% 이상을 저축에 배분하면 효과적입니다.',
      3: '안정적인 저축 습관이 형성되어 있습니다. 이 비율을 유지하면서, 단순 저축 비중을 줄이고 ETF·펀드 등 투자 비중을 점진적으로 늘려 실질수익률을 높이는 것을 검토하세요.',
      4: '매우 적극적인 저축률입니다. 이 습관을 유지하면 은퇴 시점에 상당한 자산을 확보할 수 있습니다. 다만 과도한 절약으로 현재 삶의 질이 떨어지지 않는지도 점검해보세요.',
    },
  },
  2: {
    title: '연금 가입 현황',
    scores: {
      1: '국민연금만으로는 노후 생활비의 25~30%만 커버됩니다. 3층 연금체계(국민연금+퇴직연금+개인연금)를 구축해야 합니다. 연금저축은 월 50만원(연 600만원)까지 세액공제 16.5%를 받을 수 있어, 매년 약 99만원의 절세 효과가 있습니다.',
      2: '가입은 했지만 방치하고 있다면 수익률이 예금 수준에 머물 수 있습니다. 현재 연금 상품의 운용 방식을 확인하고, TDF(타깃데이트펀드)나 글로벌 ETF로 전환을 검토하세요. 연 수익률 2% vs 6% 차이는 30년 후 자산 규모를 3배 이상 벌립니다.',
      3: '연금 포트폴리오의 기반이 잘 잡혀 있습니다. 다음 단계로 IRP 추가 가입(연 300만원 세액공제)을 검토하고, 전체 연금 자산의 해외 분산투자 비중을 점검하세요.',
      4: '체계적인 연금 전략이 돋보입니다. 연금 수령 시기(55세vs60세vs65세)에 따른 세율 차이를 계산하고, 연금소득세(3.3~5.5%) 최적화 전략도 세워두세요.',
    },
  },
  3: {
    title: '비상자금 규모',
    scores: {
      1: '비상자금이 없으면 갑작스러운 지출 시 대출이나 투자 해약에 의존하게 됩니다. 이는 이자 비용 증가와 복리 효과 단절로 이중 손해입니다. CMA 통장에 월 생활비 1개월치부터 시작해서, 6개월치까지 점진적으로 쌓으세요.',
      2: '최소한의 방어선은 있지만, 큰 의료비나 실직 상황에는 부족합니다. 별도의 비상자금 통장을 만들어 매월 20~30만원씩 적립하세요. 목표는 6개월치 고정비(주거비+보험료+공과금+식비)입니다.',
      3: '충분한 안전마진을 확보하고 있습니다. 비상자금은 CMA나 MMF 등 즉시 인출 가능한 상품에 보관하되, 6개월 초과분은 더 높은 수익률 상품으로 이동하는 것을 권합니다.',
      4: '훌륭한 재정 안전망입니다. 비상자금이 충분하므로 나머지 여유 자금은 좀 더 공격적인 투자(글로벌 ETF, 배당주 등)에 배분하여 자산 증식 속도를 높일 수 있습니다.',
    },
  },
  4: {
    title: '운동 습관',
    scores: {
      1: '운동 부족은 65세 이후 의료비를 평균 40% 이상 증가시킵니다. 고혈압, 당뇨, 관절질환 등 만성질환은 노후 재정의 최대 위협 요인입니다. 하루 20분 걷기부터 시작하세요. 스마트폰 만보기 앱으로 하루 7,000보를 목표로 잡으면 부담이 적습니다.',
      2: '간헐적 운동보다는 규칙성이 중요합니다. 주 3회 30분을 "비협상 일정"으로 캘린더에 고정하세요. 조깅, 수영, 자전거 중 부상 위험이 낮고 꾸준히 할 수 있는 종목을 선택하는 것이 핵심입니다.',
      3: '좋은 운동 습관을 갖고 있습니다. 유산소 + 근력운동을 병행하고 있는지 점검하세요. 50대 이후부터는 근감소증(사코페니아) 예방을 위해 주 2회 이상의 근력운동이 필수입니다.',
      4: '건강 자산이 매우 탄탄합니다. 규칙적 운동은 의료비 절감뿐 아니라 인지 기능 유지에도 핵심적인 역할을 합니다. 운동 기록을 남기고, 연령대에 맞는 운동 강도를 주기적으로 조정하세요.',
    },
  },
  5: {
    title: '건강검진 현황',
    scores: {
      1: '3년 이상 검진을 받지 않으면 암, 심혈관 질환 등의 조기 발견 기회를 놓칩니다. 한국인 사망원인 1위 암은 조기 발견 시 5년 생존율 90% 이상이지만, 3기 이후 발견 시 30% 미만으로 급락합니다. 올해 안에 반드시 검진을 받으세요.',
      2: '국가검진은 기본이지만, 위·대장내시경 등 핵심 항목이 빠질 수 있습니다. 40대 이후엔 2년마다 위·대장내시경, 저선량 흉부CT, 심장초음파 추가를 권장합니다. 비용은 30~50만원이지만, 중증 질환의 치료비(수천만원)와 비교하면 최고의 투자입니다.',
      3: '매년 기본검진을 받는 좋은 습관입니다. 50대 이후엔 인지기능 검사, 골밀도 검사, 치매 선별검사(MMSE)를 추가하고, 가족력에 따른 맞춤 검진 항목도 주치의와 상의하세요.',
      4: '최상의 건강관리를 하고 있습니다. 검진 결과를 시계열로 관리하면서 수치 변화 추이를 추적하세요. 주치의와 연 1회 종합 상담으로 예방적 건강관리 계획을 점검하는 것을 권합니다.',
    },
  },
  6: {
    title: '취미/여가 활동',
    scores: {
      1: '은퇴 후 평균 6~8만 시간의 자유시간이 생깁니다. 취미가 없으면 은퇴 우울증, 사회적 고립의 위험이 높습니다. 실제로 은퇴자의 33%가 "할 일이 없어서 힘들다"고 호소합니다. 관심 분야의 원데이 클래스부터 시작해보세요.',
      2: '막연한 생각을 구체적 행동으로 바꿔야 합니다. 이번 달 안에 관심 있는 활동 3가지를 리스트업하고, 그중 1가지를 실제로 체험해보세요. 비용이 적고 사회적 교류가 있는 활동(등산 모임, 독서 클럽, 봉사활동)이 특히 좋습니다.',
      3: '꾸준한 취미가 있다는 것은 큰 자산입니다. 여기에 "누군가와 함께 하는 활동"을 추가하면 사회적 건강까지 챙길 수 있습니다. 동호회 활동이나 자원봉사는 존재감과 소속감을 유지하는 데 효과적입니다.',
      4: '다양한 취미는 은퇴 후 삶의 질을 크게 높여줍니다. 일부 취미를 소득원으로 연결할 수 있는지도 고민해보세요. 예: 사진 → 스톡사진 판매, 글쓰기 → 블로그/전자책, 요리 → 쿠킹클래스 강사 등.',
    },
  },
  7: {
    title: '은퇴 후 주거 계획',
    scores: {
      1: '주거 문제는 노후 생활비의 30~40%를 차지합니다. 계획 없이 맞닥뜨리면 선택지가 크게 줄어듭니다. 먼저 "은퇴 후 어디에서 살 것인가?"를 진지하게 생각하고, 현재 주거 형태(자가/전세/월세)별 장단점과 비용을 비교해보세요.',
      2: '현재 집 유지 계획은 안정적이지만, 유지 비용(관리비, 수선비, 재산세)과 노후 편의성(엘리베이터, 병원 접근성, 대중교통)을 함께 검토해야 합니다. 10년, 20년 후에도 현재 주거가 적합한지 장기적으로 판단하세요.',
      3: '다운사이징은 자금 확보 + 관리 부담 감소의 이중 효과가 있습니다. 수도권 아파트 → 중소도시 또는 소형 평수 이동 시 억 단위의 차액을 확보할 수 있습니다. 이 차액을 연금화하면 월 50~100만원의 추가 수입이 가능합니다.',
      4: '주거 안정은 노후의 가장 큰 기반입니다. 추가로 주택연금(역모기지) 활용 가능성도 검토하세요. 3억 주택 기준 65세 가입 시 월 약 92만원을 종신 수령할 수 있습니다.',
    },
  },
  8: {
    title: '은퇴 후 생활비 계획',
    scores: {
      1: '생활비 계획이 없으면 은퇴 후 자산이 예상보다 빠르게 소진됩니다. 통계청 기준 2인 가구 월 최소 생활비 약 198만원, 적정 생활비 약 277만원입니다. 먼저 현재 월 지출을 항목별로 기록하고, 은퇴 후 변화될 항목(출퇴근비↓, 의료비↑ 등)을 반영한 예상 생활비를 산출하세요.',
      2: '대략적 감은 있지만, 구체적 숫자가 없으면 정확한 준비가 어렵습니다. 항목별(주거, 식비, 의료, 여가, 경조사, 용돈, 보험, 공과금 등)로 10만원 단위까지 계산해보세요. 특히 의료비는 나이가 들수록 급증하므로 현재의 1.5~2배로 잡는 것이 안전합니다.',
      3: '구체적인 계산을 해봤다면, 이를 바탕으로 "필요 총자금 = 월 생활비 × 12개월 × 예상 은퇴 기간(25~30년)"을 산출하고, 현재 자산 및 예상 연금과의 갭을 확인하세요.',
      4: '상세한 생활비 계획은 노후 준비의 핵심입니다. 여기에 인플레이션(연 3% 가정)을 반영한 미래 가치 계산까지 하면 더욱 정확한 준비가 가능합니다. 2~3년마다 계획을 업데이트하세요.',
    },
  },
  9: {
    title: '부채(대출) 현황',
    scores: {
      1: '은퇴 시점에 부채가 남아있으면 고정 수입이 줄어든 상태에서 이자 부담을 감당해야 합니다. 가장 먼저 할 일: 모든 부채의 잔액, 금리, 만기를 표로 정리하세요. 고금리(연 5% 이상) 부채부터 우선 상환하는 "에벌랜치 전략"을 적용하세요.',
      2: '상환 중이라면 상환 속도를 높이는 것을 고려하세요. 원리금균등 → 원금균등 변경, 여유 자금으로 중도상환 등의 방법이 있습니다. 은퇴 시점 5년 전까지 모든 부채 상환 완료를 목표로 삼으세요.',
      3: '적극적 부채 관리는 매우 좋습니다. 이자율이 높은 순서대로 집중 상환하면서, 동시에 저축·투자도 병행하세요. 대출 금리보다 높은 수익률을 기대할 수 있는 투자가 있다면, 상환과 투자의 비율을 조정하는 것도 전략입니다.',
      4: '부채 없는 상태는 노후의 가장 든든한 기반입니다. 이 상태를 유지하면서, 불필요한 신규 대출(과도한 부동산 투자 등)을 주의하세요. 확보된 재정 여력을 자산 증식에 집중 투입하세요.',
    },
  },
  10: {
    title: '노후 준비 관심도',
    scores: {
      1: '노후 준비를 미루면 "시간의 복리" 효과를 잃게 됩니다. 30세에 월 30만원을 투자하면 60세에 약 2.5억(연 7%)이 되지만, 40세에 시작하면 같은 금액으로 약 1.2억밖에 안 됩니다. 10년의 차이가 2배 이상의 자산 차이를 만듭니다.',
      2: '관심이 있다면 이제 실천으로 옮길 때입니다. "아는 것"과 "하는 것"의 차이가 노후를 결정합니다. 이번 주에 딱 하나만 실행하세요: 국민연금공단 홈페이지에서 내 예상 수령액 확인하기(5분이면 충분합니다).',
      3: '콘텐츠를 자주 찾아보는 것은 좋지만, 정보 과잉으로 오히려 실행이 지연될 수 있습니다. 학습과 실행의 비율을 3:7로 유지하세요. 매달 새로 배운 것 중 1가지를 반드시 실행에 옮기세요.',
      4: '적극적인 학습과 실천은 최고의 노후 보험입니다. 이제 개인 수준을 넘어 가족(배우자, 부모) 단위의 노후 계획도 함께 세워보세요. 부부 합산 연금 전략이 개인보다 훨씬 효율적입니다.',
    },
  },
  11: {
    title: '금융 지식 수준',
    scores: {
      1: '예금/적금만으로는 인플레이션(연 3%)을 이기지 못합니다. 실질적으로 매년 자산의 가치가 줄어드는 셈입니다. 첫 학습 추천: 금감원 금융교육센터(www.fss.or.kr/edu) 무료 과정, "연금 기초" "펀드 기초" 강의부터 시작하세요.',
      2: '펀드와 보험의 기본을 안다면, 다음 단계인 ETF와 연금 최적화를 학습하세요. 특히 인덱스 ETF(코스피200, S&P500)는 낮은 수수료로 시장 평균 수익률을 얻을 수 있어 장기 투자에 최적입니다.',
      3: '다양한 투자 이해가 있다면, 세금 최적화(절세)에 집중하세요. 연금저축·IRP의 세액공제, ISA의 비과세 혜택, 장기보유 양도세 감면 등을 활용하면 세후 수익률을 크게 높일 수 있습니다.',
      4: '폭넓은 금융 지식은 큰 경쟁력입니다. 이 지식을 바탕으로 연금 수령 시 세금(연금소득세 3.3~5.5%), 건강보험료 피부양자 자격 유지 전략, 종합소득세 최소화 등 세후 실수령액 극대화에 집중하세요.',
    },
  },
  12: {
    title: '은퇴 후 소득원 계획',
    scores: {
      1: '연금만으로는 원하는 생활 수준을 유지하기 어렵습니다. 은퇴 후에도 월 100~200만원의 추가 소득이 있으면 삶의 질이 크게 달라집니다. 먼저 자신의 경험·기술·인맥 중 수익화 가능한 것을 리스트업하세요.',
      2: '막연한 생각을 구체화해야 합니다. 은퇴 후 소득원의 3가지 유형: ①근로소득(파트타임, 컨설팅) ②사업소득(온라인 사업, 프랜차이즈) ③자산소득(임대, 배당, 이자). 각 유형별로 자신에게 맞는 것을 탐색하세요.',
      3: '구체적 아이디어가 있다면 "은퇴 전 사이드 프로젝트"로 미리 테스트해보세요. 주말이나 저녁 시간을 활용해 소규모로 시작하면 은퇴 후 바로 안정적 수입으로 전환할 수 있습니다.',
      4: '이미 준비하고 있다면 수입의 안정성과 확장 가능성을 점검하세요. 건강 악화 등으로 못하게 될 경우의 플랜B도 준비해두면 더욱 안심됩니다. 자산소득(배당, 임대)은 노동과 무관하므로 가장 안정적입니다.',
    },
  },
  13: {
    title: '노후 의료비/간병 보험',
    scores: {
      1: '보험이 전혀 없으면 중대 질환 시 치료비가 수천만원~억 단위로 발생할 수 있습니다. 국민건강보험의 본인부담금만으로도 큰 부담이 됩니다. 최소 실손의료보험은 반드시 가입하세요. 월 3~5만원으로 의료비 폭탄을 방어할 수 있습니다.',
      2: '실손보험은 기본 중의 기본입니다. 여기에 3대 질병(암, 심장, 뇌) 진단금 보험을 추가하면 치료 초기 목돈을 확보할 수 있습니다. 암 진단금 3천만원 기준, 월 보험료는 2~4만원 수준입니다.',
      3: '핵심 보장이 잘 갖춰져 있습니다. 다만 60세 이후 보험료 부담과 갱신 조건을 미리 확인하세요. 비갱신형으로 전환 가능한 상품이 있다면 검토하세요. 또한 현재 보험의 보장 중복 여부도 점검하세요.',
      4: '간병보험까지 준비한 것은 매우 선진적입니다. 한국의 65세 이상 치매 유병률은 약 10%이며, 간병비는 월 200~400만원 수준입니다. 간병보험은 이 리스크를 크게 줄여줍니다. 보장 내용과 지급 조건을 연 1회 점검하세요.',
    },
  },
  14: {
    title: '사회적 관계/네트워크',
    scores: {
      1: '직장 은퇴 후 사회적 고립은 우울증, 인지 기능 저하, 심지어 조기 사망 위험을 높입니다. 연구에 따르면 사회적 고립의 건강 위험은 하루 15개비 흡연과 맞먹습니다. 지금부터 직장 밖의 인간관계를 만들어가세요.',
      2: '가족은 중요하지만, 배우자나 자녀에게만 의존하면 관계 부담이 커집니다. 동네 모임, 종교 활동, 자원봉사 등 "제3의 공간"에서의 관계를 최소 1가지 만들어보세요. 평생교육원, 문화센터 수업도 좋은 시작점입니다.',
      3: '동호회나 모임 활동은 훌륭한 사회적 안전망입니다. 은퇴 후에도 이 활동을 유지할 수 있는지 확인하세요. 추가로 세대 간 교류가 가능한 활동(멘토링, 봉사)도 고려하면 더욱 풍요로운 관계를 구축할 수 있습니다.',
      4: '다양한 사회적 네트워크는 노후의 가장 큰 자산 중 하나입니다. 이런 관계는 정서적 지지뿐 아니라 새로운 기회(사업 파트너, 정보 교류)로도 이어집니다. 이 네트워크를 은퇴 후에도 적극 유지하세요.',
    },
  },
  15: {
    title: '금융자산 다각화',
    scores: {
      1: '한국 가구의 평균 부동산 비중은 약 79%로 매우 높습니다. 부동산만으로는 급한 현금이 필요할 때 유동성 문제가 생깁니다. 매월 소액이라도 금융자산(적금, 펀드, ETF)에 투자하여 유동성 자산 비중을 높여가세요.',
      2: '금융자산 비중이 10~20%라면, 아직 부동산 편중이 심합니다. 목표는 최소 30%입니다. 부동산 다운사이징으로 차액을 금융자산으로 전환하거나, 신규 저축을 금융자산에 집중 배분하세요.',
      3: '적정한 수준의 금융자산을 보유하고 있습니다. 금융자산 내에서도 예금/채권/주식/해외자산 등으로 분산이 되어 있는지 점검하세요. 한 자산군에 집중되면 분산 효과가 떨어집니다.',
      4: '자산이 잘 분산되어 있습니다. 이는 은퇴 후 유동성 확보와 인플레이션 방어에 큰 강점입니다. 연 1회 자산 배분 비율을 점검하고, 나이에 따라 안전자산(채권, 예금) 비중을 점진적으로 높여가세요.',
    },
  },
}

// ── 교차 분석 인사이트 ──
function getCrossInsights(categories: CategoryScore[]): { icon: string; title: string; insight: string }[] {
  const f = categories.find(c => c.key === 'finance')!
  const l = categories.find(c => c.key === 'lifestyle')!
  const h = categories.find(c => c.key === 'housing')!
  const m = categories.find(c => c.key === 'mindset')!
  const insights: { icon: string; title: string; insight: string }[] = []

  // 재정 높고 건강 낮음 (finance max 16, lifestyle max 16)
  if (f.score >= 11 && l.score <= 7) {
    insights.push({ icon: '⚠️', title: '돈은 있지만 건강이 위험', insight: '재정 준비는 잘 되어 있지만 건강관리가 부족합니다. 65세 이후 연간 의료비는 평균 300~500만원이며, 중증질환 시 수천만원이 소요됩니다. 아무리 많은 자산도 건강 없이는 의미가 없습니다. 지금 당장 건강 투자를 시작하세요.' })
  }
  // 건강 높고 재정 낮음
  if (l.score >= 11 && f.score <= 7) {
    insights.push({ icon: '⚠️', title: '건강하지만 재정이 불안', insight: '건강관리는 잘하고 있지만, 재정 준비가 부족하면 은퇴 후 건강한 몸으로 경제적 고통을 겪게 됩니다. 건강이 허락하는 동안 적극적으로 저축과 투자를 시작하세요. 건강할 때가 돈을 벌 수 있는 최적의 시간입니다.' })
  }
  // 마인드 높고 재정 낮음
  if (m.score >= 8 && f.score <= 7) {
    insights.push({ icon: '💡', title: '아는 만큼 실천이 필요', insight: '노후에 대한 관심과 지식은 높지만, 실제 재정 행동으로 이어지지 않고 있습니다. "분석 마비(Analysis Paralysis)" 상태일 수 있습니다. 완벽한 계획보다 불완전한 실행이 낫습니다. 이번 주에 연금저축 계좌 하나를 개설하세요.' })
  }
  // 재정 높고 마인드 낮음
  if (f.score >= 11 && m.score <= 5) {
    insights.push({ icon: '💡', title: '습관은 좋지만 전략이 부족', insight: '저축 습관은 좋지만 금융 지식이 부족하면, 비효율적인 상품에 돈이 묶여있을 수 있습니다. 현재 보유 금융상품의 수수료와 수익률을 점검하세요. 수수료가 연 1% 이상인 펀드는 인덱스 ETF(수수료 0.1% 이하)로 전환을 검토하세요.' })
  }
  // 주거/자산 높고 재정 낮음
  if (h.score >= 11 && f.score <= 7) {
    insights.push({ icon: '🏠', title: '부동산에 편중된 자산', insight: '주거 자산은 확보했지만 금융 자산이 부족합니다. 한국 가계의 평균 부동산 비중은 약 79%로, 유동성이 매우 낮습니다. 부동산 자산을 유동화(주택연금, 다운사이징)하여 금융 자산 비중을 30% 이상으로 높이는 것을 검토하세요.' })
  }
  // 전체적으로 균형잡힌 경우
  const scores = categories.map(c => c.score)
  const maxGap = Math.max(...scores) - Math.min(...scores)
  if (maxGap <= 3 && f.score >= 10) {
    insights.push({ icon: '✨', title: '균형 잡힌 준비', insight: '4개 영역이 비교적 균형있게 준비되어 있습니다. 이는 매우 이상적인 상태입니다. 가장 점수가 낮은 영역을 한 단계만 올리면 전체 노후 준비의 완성도가 크게 높아집니다.' })
  } else if (maxGap >= 6) {
    insights.push({ icon: '⚡', title: '영역 간 편차가 심함', insight: `가장 강한 영역과 약한 영역의 점수 차이가 ${maxGap}점으로 큽니다. 이런 불균형은 약한 영역이 전체 노후 준비를 무너뜨리는 "가장 약한 고리" 효과를 만듭니다. 약한 영역부터 집중적으로 보강하세요.` })
  }
  // 전체 낮음
  if (f.score <= 6 && m.score <= 4) {
    insights.push({ icon: '🚨', title: '재정 인식 긴급 개선 필요', insight: '재정 준비와 금융 인식이 모두 낮은 상태는 가장 위험한 조합입니다. 우선 국민연금공단(1355)에 전화하여 예상 수령액을 확인하고, 가까운 은행에서 무료 재무상담을 받으세요. 작은 행동 하나가 큰 변화의 시작입니다.' })
  }

  return insights.slice(0, 3)
}

// ── 리스크 시나리오 ──
function getScenarios(total: number, categories: CategoryScore[]): { label: string; color: string; monthly: string; desc: string }[] {
  const f = categories.find(c => c.key === 'finance')!
  const base = total >= 46 ? 280 : total >= 28 ? 230 : 200

  const optimistic = Math.round(base * (1 + f.score / 24))
  const baseline = base
  const pessimistic = Math.round(base * (1 - (12 - f.score) / 30))

  return [
    { label: '낙관', color: '#16a34a', monthly: `월 ${optimistic}만원`, desc: '현재 습관 유지 + 연금 최적화 + 추가 소득원 확보' },
    { label: '기본', color: '#ca8a04', monthly: `월 ${baseline}만원`, desc: '현재 준비 수준 유지, 추가 대응 없음' },
    { label: '비관', color: '#dc2626', monthly: `월 ${pessimistic}만원`, desc: '건강 악화 또는 조기 은퇴로 인한 소득 감소' },
  ]
}

// ── 추천 자원 ──
function getResources(categories: CategoryScore[]): { name: string; url: string; desc: string }[] {
  const resources: { name: string; url: string; desc: string }[] = []
  const f = categories.find(c => c.key === 'finance')!
  const m = categories.find(c => c.key === 'mindset')!

  resources.push({ name: '국민연금공단 "내 연금 알아보기"', url: 'nps.or.kr', desc: '예상 연금 수령액, 가입이력, 추납 가능 여부 확인' })
  if (f.score <= 6) {
    resources.push({ name: '금융감독원 "파인(FINE)"', url: 'fine.fss.or.kr', desc: '내 금융상품 한눈에 조회, 숨은 보험금 찾기' })
    resources.push({ name: '서민금융진흥원', url: 'kinfa.or.kr', desc: '무료 재무상담, 채무조정, 서민금융상품 안내' })
  }
  if (m.score <= 6) {
    resources.push({ name: '금감원 금융교육센터', url: 'fss.or.kr/edu', desc: '연금, 투자, 보험 등 무료 온라인 교육 과정' })
    resources.push({ name: '한국은행 경제교육', url: 'bok.or.kr/education', desc: '경제·금융 기초 지식 무료 학습' })
  }
  resources.push({ name: '한국주택금융공사', url: 'hf.go.kr', desc: '주택연금 예상 수령액 조회, 가입 조건 확인' })

  return resources.slice(0, 4)
}

// ── 월 예상 생활비 내역 ──
function getMonthlyBreakdown(total: number): { item: string; amount: string; note: string }[] {
  if (total >= 37) {
    return [
      { item: '주거 관리비', amount: '30~40만원', note: '자가 기준, 관리비+재산세+수선비' },
      { item: '식비', amount: '60~80만원', note: '2인 가구 기준, 외식 포함' },
      { item: '의료비', amount: '30~50만원', note: '보험료+약값+검진비, 나이에 따라 증가' },
      { item: '교통/통신', amount: '15~20만원', note: '대중교통+통신비+인터넷' },
      { item: '여가/문화', amount: '20~40만원', note: '취미, 여행, 구독 서비스 등' },
      { item: '경조사/용돈', amount: '20~30만원', note: '자녀 지원, 경조사, 손주 용돈' },
      { item: '보험료', amount: '15~25만원', note: '실손보험+기타 보장성 보험' },
      { item: '기타/예비', amount: '10~15만원', note: '의류, 생필품, 예비비' },
    ]
  }
  return [
    { item: '주거비', amount: '30~50만원', note: '자가: 관리비+세금 / 전세: 이자비용' },
    { item: '식비', amount: '50~70만원', note: '2인 가구, 최소 기준' },
    { item: '의료비', amount: '20~40만원', note: '국민건강보험 본인부담+약값' },
    { item: '교통/통신', amount: '10~15만원', note: '경로우대+알뜰 요금제 활용' },
    { item: '여가', amount: '10~20만원', note: '무료 프로그램 적극 활용 시' },
    { item: '경조사', amount: '10~20만원', note: '최소 범위 유지' },
    { item: '보험료', amount: '10~20만원', note: '실손보험 필수, 나머지 재검토' },
    { item: '기타', amount: '10만원', note: '생필품, 예비비' },
  ]
}

// ── 컴포넌트 ──

const ResultCardA4 = forwardRef<HTMLDivElement, ResultCardA4Props>(
  function ResultCardA4({ total, maxTotal, result, categories, answers }, ref) {
    const percentage = Math.round((total / maxTotal) * 100)
    const circumference = 2 * Math.PI * 54
    const crossInsights = getCrossInsights(categories)
    const scenarios = getScenarios(total, categories)
    const resources = getResources(categories)
    const monthlyBreakdown = getMonthlyBreakdown(total)
    const weakest = [...categories].sort((a, b) => a.score - b.score)[0]
    const strongest = [...categories].sort((a, b) => b.score - a.score)[0]

    // Radar chart
    const radarSize = 150
    const radarCenter = radarSize / 2
    const radarRadius = 55
    const radarAngles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI]
    const radarPoints = categories.map((cat, i) => {
      const r = (cat.score / cat.max) * radarRadius
      return { x: radarCenter + r * Math.cos(radarAngles[i]), y: radarCenter + r * Math.sin(radarAngles[i]) }
    })
    const gridLevels = [0.25, 0.5, 0.75, 1]

    const s = (base: Record<string, string | number>): React.CSSProperties => base as React.CSSProperties

    // section heading helper
    const SectionHead = ({ title, sub }: { title: string; sub?: string }) => (
      <div style={s({ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' })}>
        <div style={s({ width: '4px', height: '16px', borderRadius: '2px', backgroundColor: '#166534' })} />
        <h3 style={s({ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0' })}>{title}</h3>
        {sub && <span style={s({ fontSize: '9px', color: '#9ca3af' })}>({sub})</span>}
      </div>
    )

    return (
      <div
        ref={ref}
        style={s({
          position: 'absolute', left: '-9999px', top: '0', width: '794px',
          backgroundColor: '#ffffff',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", Roboto, sans-serif',
          color: '#111827', lineHeight: '1.5',
        })}
      >
        {/* ===== HEADER ===== */}
        <div style={s({ background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)', color: '#ffffff', padding: '28px 48px 24px' })}>
          <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' })}>
            <div>
              <div style={s({ fontSize: '10px', letterSpacing: '3px', opacity: 0.6, marginBottom: '6px' })}>RETIREMENT READINESS REPORT</div>
              <div style={s({ fontSize: '22px', fontWeight: 800 })}>노후 준비 종합 진단 리포트</div>
              <div style={s({ fontSize: '11px', opacity: 0.5, marginTop: '4px' })}>4개 영역 · 12개 항목 심층 분석 · AI 기반 맞춤 진단</div>
            </div>
            <div style={s({ textAlign: 'right' })}>
              <div style={s({ fontSize: '18px', fontWeight: 800 })}>노후연구소</div>
              <div style={s({ fontSize: '9px', opacity: 0.5, marginTop: '4px' })}>
                {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} 발행
              </div>
            </div>
          </div>
        </div>

        {/* ===== EXECUTIVE SUMMARY ===== */}
        <div style={s({ padding: '24px 48px 18px', backgroundColor: '#fafafa', borderBottom: '1px solid #e5e7eb' })}>
          <div style={s({ display: 'flex', gap: '24px', alignItems: 'center' })}>
            <div style={s({ position: 'relative', width: '120px', height: '120px', flexShrink: 0 })}>
              <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="7" />
                <circle cx="60" cy="60" r="54" fill="none" stroke={result.color} strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - (percentage / 100) * circumference} />
              </svg>
              <div style={s({ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' })}>
                <span style={s({ fontSize: '30px', fontWeight: 800 })}>{total}</span>
                <span style={s({ fontSize: '10px', color: '#9ca3af' })}>/ {maxTotal}점</span>
              </div>
            </div>
            <div style={s({ flex: 1 })}>
              <div style={s({ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' })}>
                <span style={s({ fontSize: '24px' })}>{result.icon}</span>
                <span style={s({ fontSize: '18px', fontWeight: 800, color: result.color })}>{result.grade}</span>
                <span style={s({ padding: '2px 8px', borderRadius: '999px', fontSize: '9px', fontWeight: 700, color: '#fff', backgroundColor: total >= 46 ? '#16a34a' : total >= 28 ? '#ca8a04' : '#dc2626' })}>
                  {total >= 55 ? '상위 5%' : total >= 46 ? '상위 20%' : total >= 37 ? '상위 40%' : total >= 28 ? '상위 60%' : '하위 20%'}
                </span>
              </div>
              <p style={s({ fontSize: '11.5px', color: '#4b5563', lineHeight: '1.6', margin: '0' })}>{result.description}</p>
              <div style={s({ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' })}>
                <div style={s({ padding: '4px 12px', borderRadius: '6px', backgroundColor: result.bgColor, fontSize: '10px' })}>
                  필요 노후자금 <strong style={{ color: result.color }}>{result.estimatedFund}</strong>
                </div>
                <div style={s({ padding: '4px 12px', borderRadius: '6px', backgroundColor: '#f3f4f6', fontSize: '10px' })}>
                  강점 <strong style={{ color: '#16a34a' }}>{strongest.label}</strong>
                </div>
                <div style={s({ padding: '4px 12px', borderRadius: '6px', backgroundColor: '#fef2f2', fontSize: '10px' })}>
                  보강 <strong style={{ color: '#dc2626' }}>{weakest.label}</strong>
                </div>
              </div>
            </div>
            {/* Radar */}
            <div style={s({ flexShrink: 0 })}>
              <svg width={radarSize} height={radarSize} viewBox={`0 0 ${radarSize} ${radarSize}`}>
                {gridLevels.map((level) => (
                  <polygon key={level} points={radarAngles.map(a => `${radarCenter + radarRadius * level * Math.cos(a)},${radarCenter + radarRadius * level * Math.sin(a)}`).join(' ')} fill="none" stroke="#e5e7eb" strokeWidth="0.7" />
                ))}
                {radarAngles.map((a, i) => (
                  <line key={i} x1={radarCenter} y1={radarCenter} x2={radarCenter + radarRadius * Math.cos(a)} y2={radarCenter + radarRadius * Math.sin(a)} stroke="#d1d5db" strokeWidth="0.5" />
                ))}
                <polygon points={radarPoints.map(p => `${p.x},${p.y}`).join(' ')} fill={result.color} fillOpacity="0.15" stroke={result.color} strokeWidth="2" />
                {radarPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill={result.color} />)}
                {([
                  { x: radarCenter, y: 8, label: '재정', anchor: 'middle' as const },
                  { x: radarSize - 2, y: radarCenter + 4, label: '생활', anchor: 'start' as const },
                  { x: radarCenter, y: radarSize - 2, label: '주거', anchor: 'middle' as const },
                  { x: 2, y: radarCenter + 4, label: '마인드', anchor: 'end' as const },
                ]).map((l, i) => <text key={i} x={l.x} y={l.y} textAnchor={l.anchor} fontSize="8" fill="#6b7280" fontWeight="600">{l.label}</text>)}
              </svg>
            </div>
          </div>
        </div>

        {/* ===== 교차 분석 인사이트 ===== */}
        {crossInsights.length > 0 && (
          <div style={s({ padding: '18px 48px 12px' })}>
            <SectionHead title="교차 분석 인사이트" sub="영역 간 상관관계 기반" />
            {crossInsights.map((ci, i) => (
              <div key={i} style={s({ marginBottom: '8px', padding: '10px 14px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' })}>
                <div style={s({ fontSize: '11.5px', fontWeight: 700, color: '#92400e', marginBottom: '4px' })}>{ci.icon} {ci.title}</div>
                <div style={s({ fontSize: '10.5px', color: '#78350f', lineHeight: '1.65' })}>{ci.insight}</div>
              </div>
            ))}
          </div>
        )}

        {/* ===== 문항별 마이크로 진단 ===== */}
        {answers && Object.keys(answers).length > 0 && (
          <div style={s({ padding: '8px 48px 12px' })}>
            <SectionHead title="12개 항목 개별 진단" sub="응답 기반 맞춤 분석" />
            {categories.map((cat) => {
              const catQuestionIds = cat.key === 'finance' ? [1,2,3,13] : cat.key === 'lifestyle' ? [4,5,6,14] : cat.key === 'housing' ? [7,8,9,15] : [10,11,12]
              const catIcons: Record<string, string> = { finance: '💰', lifestyle: '🏃', housing: '🏠', mindset: '🧠' }
              return (
                <div key={cat.key} style={s({ marginBottom: '10px' })}>
                  <div style={s({ fontSize: '11px', fontWeight: 700, color: '#374151', marginBottom: '6px' })}>{catIcons[cat.key]} {cat.label} ({cat.score}/{cat.max})</div>
                  {catQuestionIds.map((qid) => {
                    const qDiag = questionDiagnosis[qid]
                    const score = answers[qid]
                    if (!qDiag || score === undefined) return null
                    const scoreColor = score >= 3 ? '#16a34a' : score >= 2 ? '#ca8a04' : '#dc2626'
                    const scoreBg = score >= 3 ? '#f0fdf4' : score >= 2 ? '#fefce8' : '#fef2f2'
                    return (
                      <div key={qid} style={s({ marginBottom: '6px', padding: '8px 12px', border: '1px solid #f3f4f6', borderRadius: '8px', borderLeft: `3px solid ${scoreColor}` })}>
                        <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' })}>
                          <span style={s({ fontSize: '10.5px', fontWeight: 700, color: '#111827' })}>Q{qid}. {qDiag.title}</span>
                          <span style={s({ fontSize: '9px', fontWeight: 700, color: scoreColor, padding: '1px 8px', borderRadius: '999px', backgroundColor: scoreBg })}>{score}/4점</span>
                        </div>
                        <p style={s({ fontSize: '9.5px', color: '#4b5563', lineHeight: '1.6', margin: '0' })}>{qDiag.scores[score]}</p>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}

        {/* ===== 은퇴 후 월 생활비 시뮬레이션 ===== */}
        <div style={s({ padding: '8px 48px 12px' })}>
          <SectionHead title="은퇴 후 예상 월 생활비 내역" sub="2인가구, 통계청 기준" />
          <div style={s({ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' })}>
            <div style={s({ display: 'grid', gridTemplateColumns: '2fr 1.5fr 3fr', padding: '6px 12px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' })}>
              <span style={s({ fontSize: '9px', fontWeight: 700, color: '#6b7280' })}>항목</span>
              <span style={s({ fontSize: '9px', fontWeight: 700, color: '#6b7280', textAlign: 'right' })}>예상 금액</span>
              <span style={s({ fontSize: '9px', fontWeight: 700, color: '#6b7280', textAlign: 'right' })}>비고</span>
            </div>
            {monthlyBreakdown.map((row, i) => (
              <div key={i} style={s({ display: 'grid', gridTemplateColumns: '2fr 1.5fr 3fr', padding: '5px 12px', borderBottom: i < monthlyBreakdown.length - 1 ? '1px solid #f3f4f6' : 'none' })}>
                <span style={s({ fontSize: '9.5px', color: '#111827', fontWeight: 600 })}>{row.item}</span>
                <span style={s({ fontSize: '9.5px', color: result.color, fontWeight: 700, textAlign: 'right' })}>{row.amount}</span>
                <span style={s({ fontSize: '8.5px', color: '#9ca3af', textAlign: 'right' })}>{row.note}</span>
              </div>
            ))}
            <div style={s({ display: 'grid', gridTemplateColumns: '2fr 1.5fr 3fr', padding: '6px 12px', backgroundColor: '#f0fdf4', borderTop: '1px solid #e5e7eb' })}>
              <span style={s({ fontSize: '10px', fontWeight: 800, color: '#111827' })}>합계</span>
              <span style={s({ fontSize: '10px', fontWeight: 800, color: '#16a34a', textAlign: 'right' })}>{total >= 46 ? '200~300만원' : '150~250만원'}</span>
              <span style={s({ fontSize: '8.5px', color: '#6b7280', textAlign: 'right' })}>개인 생활 패턴에 따라 ±30% 변동</span>
            </div>
          </div>
        </div>

        {/* ===== 시나리오 분석 ===== */}
        <div style={s({ padding: '8px 48px 12px' })}>
          <SectionHead title="은퇴 후 소득 시나리오 분석" sub="낙관 / 기본 / 비관" />
          <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' })}>
            {scenarios.map((sc, i) => (
              <div key={i} style={s({ border: `1px solid ${sc.color}33`, borderRadius: '10px', padding: '12px', textAlign: 'center', borderTop: `3px solid ${sc.color}` })}>
                <div style={s({ fontSize: '10px', fontWeight: 700, color: sc.color, marginBottom: '4px' })}>{sc.label} 시나리오</div>
                <div style={s({ fontSize: '18px', fontWeight: 800, color: sc.color, marginBottom: '4px' })}>{sc.monthly}</div>
                <div style={s({ fontSize: '8.5px', color: '#6b7280', lineHeight: '1.5' })}>{sc.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== 핵심 실행 체크리스트 ===== */}
        <div style={s({ padding: '8px 48px 12px' })}>
          <SectionHead title="지금 당장 실행할 핵심 체크리스트" />
          <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' })}>
            {[
              { when: '이번 주', tasks: total >= 46
                ? ['연금 예상 수령액 재확인 (nps.or.kr)', '보유 금융상품 수수료/수익률 점검', '자산·부채 현황표 업데이트']
                : total >= 28
                ? ['국민연금 예상 수령액 확인 (nps.or.kr)', '월 지출 1주일간 상세 기록', '자동이체 저축 설정 (최소 소득 10%)']
                : ['국민연금공단 1355 전화 (수령액 확인)', '통장 쪼개기 (생활비/저축/비상금)', '불필요한 구독·자동결제 3개 해지']
              },
              { when: '이번 달', tasks: total >= 46
                ? [`${weakest.label} 영역 보강 구체 계획 수립`, '세액공제 한도 잔여분 확인·납입', '포트폴리오 리밸런싱 실행']
                : total >= 28
                ? ['개인연금(연금저축/IRP) 가입 신청', '건강검진 예약', `${weakest.label} 영역 개선 목표 1개 설정`]
                : ['연금저축 계좌 개설 (월 10만원 시작)', '건강검진 예약 (올해 안에)', '관심 취미/운동 1가지 체험']
              },
            ].map((block, i) => (
              <div key={i} style={s({ backgroundColor: '#f9fafb', borderRadius: '10px', padding: '12px 14px', border: '1px solid #f3f4f6' })}>
                <div style={s({ fontSize: '11px', fontWeight: 700, color: '#16a34a', marginBottom: '8px' })}>{block.when}</div>
                {block.tasks.map((task, ti) => (
                  <div key={ti} style={s({ display: 'flex', gap: '6px', fontSize: '9.5px', color: '#374151', lineHeight: '1.6', marginBottom: '3px' })}>
                    <span style={s({ color: '#16a34a', flexShrink: 0 })}>□</span>
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ===== 추천 자원 ===== */}
        <div style={s({ padding: '8px 48px 12px' })}>
          <SectionHead title="활용 가능한 무료 자원" />
          <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' })}>
            {resources.map((res, i) => (
              <div key={i} style={s({ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px' })}>
                <div style={s({ fontSize: '10.5px', fontWeight: 700, color: '#111827' })}>{res.name}</div>
                <div style={s({ fontSize: '9px', color: '#16a34a', fontWeight: 600, marginTop: '2px' })}>{res.url}</div>
                <div style={s({ fontSize: '8.5px', color: '#6b7280', marginTop: '2px' })}>{res.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== 종합 조언 ===== */}
        <div style={s({ padding: '8px 48px 16px' })}>
          <SectionHead title="전문가 종합 조언" />
          <div style={s({ backgroundColor: result.bgColor, borderRadius: '10px', padding: '14px 16px', borderLeft: `4px solid ${result.color}` })}>
            {result.advices.map((advice, i) => (
              <div key={i} style={s({ display: 'flex', gap: '8px', fontSize: '11px', color: '#374151', lineHeight: '1.6', marginBottom: i < result.advices.length - 1 ? '5px' : '0' })}>
                <span style={s({ color: result.color, flexShrink: 0, fontWeight: 700 })}>✓</span>
                <span>{advice}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div style={s({ padding: '14px 48px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' })}>
          <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' })}>
            <div>
              <div style={s({ fontSize: '11px', fontWeight: 700, color: '#374151' })}>노후연구소</div>
              <div style={s({ fontSize: '8px', color: '#9ca3af', marginTop: '2px' })}>nohu-lab.com · cafe.naver.com/eovhskfktmak</div>
            </div>
            <div style={s({ textAlign: 'right', maxWidth: '380px' })}>
              <div style={s({ fontSize: '7.5px', color: '#9ca3af', lineHeight: '1.5' })}>
                본 리포트는 자가진단 결과를 기반으로 한 참고 자료이며, 전문적인 재무상담을 대체하지 않습니다.
                개인의 재정 상황에 따라 전문 재무설계사 상담을 권장합니다. 제시된 금액은 통계적 추정치이며 실제와 차이가 있을 수 있습니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

export default ResultCardA4
