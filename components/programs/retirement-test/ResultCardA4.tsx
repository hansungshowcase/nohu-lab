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

// ── 문항별 마이크로 진단 (20개 항목) ──
const questionDiagnosis: Record<number, { title: string; scores: Record<number, string> }> = {
  1: {
    title: '저축/투자 비율',
    scores: {
      1: '소득 대비 저축률이 10% 미만입니다. 월 소득의 최소 15%를 자동이체로 저축하세요. 월 300만원 소득 기준 45만원이면, 연 5% 수익률로 20년 후 약 1.8억이 됩니다. 복리 효과는 시간이 가장 큰 무기입니다.',
      2: '저축 습관은 있지만 20% 이상이 권장됩니다. 매분기 2%p씩 올려보세요. 보너스·성과급의 80% 이상을 저축에 배분하면 체감 부담 없이 저축률을 크게 높일 수 있습니다.',
      3: '안정적인 저축 습관입니다. 단순 저축 비중을 줄이고 ETF·펀드 등 투자 비중을 점진적으로 늘려 실질수익률(물가상승률 3% 이상)을 확보하세요.',
      4: '매우 적극적인 저축률입니다. 이 습관을 유지하면 은퇴 시 상당한 자산을 확보할 수 있습니다. 과도한 절약으로 현재 삶의 질이 떨어지지 않는지도 점검하세요.',
    },
  },
  2: {
    title: '연금 가입 현황',
    scores: {
      1: '국민연금만으로는 노후 생활비의 25~30%만 커버됩니다. 3층 연금체계(국민+퇴직+개인) 구축이 시급합니다. 연금저축은 월 50만원(연 600만원)까지 세액공제 16.5%, 연 약 99만원 절세 효과입니다.',
      2: '가입은 했지만 운용이 방치 상태일 수 있습니다. TDF(타깃데이트펀드)나 글로벌 ETF 전환을 검토하세요. 연 수익률 2% vs 6% 차이는 30년 후 자산 규모를 3배 이상 벌립니다.',
      3: '연금 포트폴리오 기반이 잘 잡혀 있습니다. IRP 추가 가입(연 300만원 세액공제 추가)을 검토하고, 해외 분산투자 비중을 점검하세요.',
      4: '체계적인 연금 전략이 돋보입니다. 연금 수령 시기(55세vs60세vs65세)별 세율 차이를 계산하고, 연금소득세(3.3~5.5%) 최적화도 세워두세요.',
    },
  },
  3: {
    title: '비상자금 규모',
    scores: {
      1: '비상자금이 없으면 갑작스런 지출 시 대출이나 투자 해약에 의존하게 됩니다. CMA 통장에 월 생활비 1개월치부터 시작해서 6개월치까지 점진적으로 쌓으세요.',
      2: '최소한의 방어선은 있지만 큰 의료비나 실직에는 부족합니다. 매월 20~30만원씩 적립하여 6개월치 고정비를 목표로 쌓으세요.',
      3: '충분한 안전마진입니다. 6개월 초과분은 더 높은 수익률 상품(ETF, 배당주 등)으로 이동하여 자산 증식 속도를 높이세요.',
      4: '훌륭한 재정 안전망입니다. 여유 자금을 좀 더 공격적인 투자에 배분하여 자산 증식 속도를 높일 수 있습니다.',
    },
  },
  13: {
    title: '의료비/간병 보험',
    scores: {
      1: '보험이 없으면 중대 질환 시 치료비가 수천만원~억 단위로 발생합니다. 최소 실손의료보험은 반드시 가입하세요. 월 3~5만원으로 의료비 폭탄을 방어할 수 있습니다.',
      2: '실손보험은 기본입니다. 3대 질병(암·심장·뇌) 진단금 보험을 추가하면 치료 초기 목돈을 확보할 수 있습니다. 암 진단금 3천만원 기준 월 보험료 2~4만원 수준입니다.',
      3: '핵심 보장이 잘 갖춰져 있습니다. 60세 이후 보험료 부담과 갱신 조건을 미리 확인하고, 보장 중복 여부도 점검하세요.',
      4: '간병보험까지 준비한 것은 매우 선진적입니다. 65세 이상 치매 유병률 약 10%, 간병비 월 200~400만원입니다. 보장 내용과 지급 조건을 연 1회 점검하세요.',
    },
  },
  16: {
    title: '퇴직연금 운용',
    scores: {
      1: '퇴직연금은 은퇴 자금의 핵심 축입니다. 회사 HR 부서에 문의하여 DB/DC 여부, 적립금 현황을 즉시 확인하세요. 모르고 방치하면 수십년간 수익을 놓칩니다.',
      2: '가입만 되어 있고 원리금보장형(예금)에 방치된 경우가 많습니다. 실질 수익률이 물가상승률(3%)에도 못 미칠 수 있습니다. DC형이라면 TDF 전환을 강력 권장합니다.',
      3: '적극적인 운용은 좋습니다. 디폴트옵션(사전지정운용)이 도입되었으니, 본인 은퇴 시점에 맞는 TDF를 선택하세요. 수수료도 연 0.5% 이하인지 확인하세요.',
      4: 'ETF/TDF 적극 운용으로 장기 수익률을 극대화하고 있습니다. 55세 이후 연금 수령 시 퇴직소득세의 60~70%만 부과되므로 일시금보다 연금 수령이 유리합니다.',
    },
  },
  4: {
    title: '운동 습관',
    scores: {
      1: '운동 부족은 65세 이후 의료비를 평균 40% 이상 증가시킵니다. 하루 20분 걷기부터 시작하세요. 만보기 앱으로 하루 7,000보를 목표로 잡으면 부담이 적습니다.',
      2: '간헐적 운동보다 규칙성이 중요합니다. 주 3회 30분을 캘린더에 고정하세요. 부상 위험이 낮은 수영, 자전거, 걷기가 장기적으로 유리합니다.',
      3: '좋은 운동 습관입니다. 유산소+근력운동 병행 여부를 점검하세요. 50대 이후 근감소증(사코페니아) 예방을 위해 주 2회 이상 근력운동이 필수입니다.',
      4: '건강 자산이 매우 탄탄합니다. 규칙적 운동은 의료비 절감뿐 아니라 인지기능 유지에도 핵심입니다. 연령대에 맞는 운동 강도를 주기적으로 조정하세요.',
    },
  },
  5: {
    title: '건강검진 현황',
    scores: {
      1: '3년 이상 미검진 시 암·심혈관질환의 조기 발견 기회를 놓칩니다. 암은 조기 발견 시 5년 생존율 90%+이지만, 3기 이후 30% 미만으로 급락합니다. 올해 안에 반드시 검진을 받으세요.',
      2: '국가검진은 기본이지만 위·대장내시경 등 핵심 항목이 빠질 수 있습니다. 40대 이후 2년마다 위·대장내시경, 저선량 흉부CT 추가를 권장합니다. 비용 30~50만원이지만 중증질환 치료비(수천만원)와 비교하면 최고의 투자입니다.',
      3: '매년 기본검진은 좋은 습관입니다. 50대 이후엔 인지기능, 골밀도, 치매 선별검사(MMSE)를 추가하고, 가족력에 따른 맞춤 항목도 주치의와 상의하세요.',
      4: '최상의 건강관리입니다. 검진 결과를 시계열로 관리하면서 수치 변화 추이를 추적하세요. 주치의와 연 1회 종합 상담을 권합니다.',
    },
  },
  6: {
    title: '취미/여가 활동',
    scores: {
      1: '은퇴 후 평균 6~8만 시간의 자유시간이 생깁니다. 취미가 없으면 은퇴 우울증, 사회적 고립 위험이 높습니다. 관심 분야의 원데이 클래스부터 시작해보세요.',
      2: '막연한 생각을 구체적 행동으로 바꿔야 합니다. 이번 달 안에 관심 활동 3가지를 리스트업하고 1가지를 실제로 체험하세요. 비용이 적고 사회적 교류가 있는 활동이 특히 좋습니다.',
      3: '꾸준한 취미는 큰 자산입니다. "누군가와 함께 하는 활동"을 추가하면 사회적 건강까지 챙길 수 있습니다. 동호회, 자원봉사가 효과적입니다.',
      4: '다양한 취미는 은퇴 후 삶의 질을 크게 높입니다. 일부 취미를 소득원으로 연결할 수 있는지도 고민해보세요. (사진→스톡사진, 글쓰기→전자책, 요리→쿠킹클래스 등)',
    },
  },
  14: {
    title: '사회적 관계/네트워크',
    scores: {
      1: '은퇴 후 사회적 고립은 우울증, 인지기능 저하, 조기 사망 위험을 높입니다. 사회적 고립의 건강 위험은 하루 15개비 흡연과 맞먹습니다. 직장 밖 인간관계를 만들어가세요.',
      2: '가족만으로는 관계 부담이 커집니다. 동네 모임, 봉사활동, 평생교육원 등 "제3의 공간"에서의 관계를 최소 1가지 만들어보세요.',
      3: '동호회·모임 활동은 훌륭한 사회적 안전망입니다. 세대 간 교류가 가능한 활동(멘토링, 봉사)도 고려하면 더 풍요로운 관계를 구축할 수 있습니다.',
      4: '다양한 사회적 네트워크는 노후의 가장 큰 자산 중 하나입니다. 정서적 지지뿐 아니라 새로운 기회로도 이어집니다. 은퇴 후에도 적극 유지하세요.',
    },
  },
  17: {
    title: '정신건강/스트레스 관리',
    scores: {
      1: '스트레스 방치는 만성질환(고혈압, 당뇨, 심장질환)의 주요 원인입니다. 은퇴 후 정체성 상실과 결합되면 심각한 우울증으로 이어질 수 있습니다. 하루 10분 산책이나 심호흡부터 시작하세요.',
      2: '필요성을 느끼는 것이 첫걸음입니다. 스마트폰 명상 앱(하루 10분), 감사일기 쓰기, 규칙적 수면 패턴 유지 중 하나를 이번 주에 시작하세요.',
      3: '나름의 해소법이 있다는 것은 좋습니다. 여기에 사회적 활동(대화, 모임)을 추가하면 정서적 안정감이 더 높아집니다. 운동은 항우울제와 비슷한 효과가 있습니다.',
      4: '체계적인 정신건강 관리는 노후 삶의 질의 핵심입니다. 은퇴 전환기의 스트레스에 대비하여 현재의 관리 루틴을 유지하고, 필요 시 전문 상담도 활용하세요.',
    },
  },
  7: {
    title: '은퇴 후 주거 계획',
    scores: {
      1: '주거 문제는 노후 생활비의 30~40%를 차지합니다. "은퇴 후 어디에서 살 것인가?"를 진지하게 생각하고, 현재 주거 형태별 장단점과 비용을 비교해보세요.',
      2: '현재 집 유지 계획은 안정적이지만, 유지 비용(관리비, 수선비, 재산세)과 10~20년 후 편의성(엘리베이터, 병원, 대중교통)도 함께 검토해야 합니다.',
      3: '다운사이징은 자금 확보+관리 부담 감소의 이중 효과가 있습니다. 차액을 연금화하면 월 50~100만원의 추가 수입이 가능합니다.',
      4: '주거 안정은 노후의 가장 큰 기반입니다. 주택연금 활용 가능성도 검토하세요. 3억 주택 기준 65세 가입 시 월 약 75만원 종신 수령 가능합니다.',
    },
  },
  8: {
    title: '은퇴 후 생활비 계획',
    scores: {
      1: '생활비 계획이 없으면 자산이 예상보다 빠르게 소진됩니다. 통계청 기준 2인 가구 월 최소 생활비 약 198만원, 적정 생활비 약 277만원입니다. 현재 월 지출을 항목별로 기록하세요.',
      2: '대략적 감은 있지만 구체적 숫자가 없으면 정확한 준비가 어렵습니다. 항목별(주거, 식비, 의료, 여가, 경조사 등)로 10만원 단위까지 계산하세요. 의료비는 현재의 1.5~2배로 잡는 것이 안전합니다.',
      3: '구체적 계산을 했다면 "필요 총자금 = 월 생활비 × 12 × 예상 은퇴 기간(25~30년)"을 산출하고 현재 자산·예상 연금과의 갭을 확인하세요.',
      4: '상세한 계획은 핵심입니다. 인플레이션(연 3%)을 반영한 미래가치 계산까지 하면 더 정확합니다. 2~3년마다 계획을 업데이트하세요.',
    },
  },
  9: {
    title: '부채(대출) 현황',
    scores: {
      1: '은퇴 시 부채가 남으면 고정 수입이 줄어든 상태에서 이자를 감당해야 합니다. 모든 부채의 잔액·금리·만기를 정리하고, 고금리(연 5%+)부터 우선 상환하세요(에벌랜치 전략).',
      2: '상환 속도를 높이세요. 원리금균등→원금균등 변경, 중도상환 등을 활용하세요. 은퇴 5년 전까지 모든 부채 상환 완료를 목표로 삼으세요.',
      3: '적극적 부채 관리는 매우 좋습니다. 대출 금리보다 높은 수익률 투자가 가능하다면 상환과 투자의 비율을 전략적으로 조정하세요.',
      4: '부채 없는 상태는 노후의 가장 든든한 기반입니다. 불필요한 신규 대출을 주의하고, 확보된 재정 여력을 자산 증식에 집중하세요.',
    },
  },
  15: {
    title: '금융자산 다각화',
    scores: {
      1: '한국 가구 평균 부동산 비중 약 79%로 유동성이 매우 낮습니다. 매월 소액이라도 금융자산(적금, 펀드, ETF)에 투자하여 유동성 자산 비중을 높여가세요.',
      2: '금융자산 10~20%는 아직 부동산 편중이 심합니다. 목표 최소 30%. 다운사이징 차액을 금융자산으로 전환하거나 신규 저축을 금융자산에 집중하세요.',
      3: '적정 수준의 금융자산을 보유하고 있습니다. 금융자산 내에서도 예금/채권/주식/해외자산 등으로 분산이 되어 있는지 점검하세요.',
      4: '자산이 잘 분산되어 있습니다. 연 1회 배분 비율을 점검하고, 나이에 따라 안전자산(채권, 예금) 비중을 점진적으로 높여가세요.',
    },
  },
  18: {
    title: '주택연금 인지도',
    scores: {
      1: '주택연금은 55세 이상, 공시가 12억 이하 주택 소유자가 집에 살면서 월 연금을 받는 제도입니다. 3억 주택 기준 65세 월 약 75만원, 70세 월 약 92만원을 종신 수령합니다. 반드시 알아두세요.',
      2: '주택연금은 "집은 있지만 현금이 부족한" 상황의 핵심 해법입니다. 한국주택금융공사(hf.go.kr)에서 예상 수령액을 조회해보세요. 부부 모두 사망할 때까지 보장됩니다.',
      3: '대략적으로 안다면 구체적 시뮬레이션을 해보세요. 가입 시기별, 주택 가격별 수령액 차이를 비교하면 최적 전략을 세울 수 있습니다.',
      4: '주택연금 활용 계획까지 있다면 매우 체계적입니다. 정액형/증가형/감소형 등 수령 방식별 장단점을 비교하고 본인 상황에 맞는 유형을 선택하세요.',
    },
  },
  10: {
    title: '노후 준비 관심도',
    scores: {
      1: '노후 준비를 미루면 "시간의 복리" 효과를 잃습니다. 30세에 월 30만원 투자 시 60세에 약 2.5억(연 7%)이지만, 40세에 시작하면 약 1.2억. 10년 차이가 2배 이상의 자산 차이를 만듭니다.',
      2: '관심이 있다면 실천으로 옮길 때입니다. 이번 주에 딱 하나만: 국민연금공단 홈페이지에서 내 예상 수령액 확인하기(5분이면 충분합니다).',
      3: '콘텐츠 학습은 좋지만 정보 과잉으로 실행이 지연될 수 있습니다. 학습:실행 비율을 3:7로 유지하세요. 매달 1가지를 반드시 실행에 옮기세요.',
      4: '적극적인 학습과 실천은 최고의 노후 보험입니다. 가족(배우자, 부모) 단위의 노후 계획도 함께 세워보세요. 부부 합산 연금 전략이 개인보다 훨씬 효율적입니다.',
    },
  },
  11: {
    title: '금융 지식 수준',
    scores: {
      1: '예금/적금만으로는 인플레이션(연 3%)을 이기지 못합니다. 금감원 금융교육센터(fss.or.kr/edu) 무료 과정 "연금 기초", "펀드 기초" 강의부터 시작하세요.',
      2: '펀드·보험 기본을 안다면 ETF와 연금 최적화를 학습하세요. 인덱스 ETF(코스피200, S&P500)는 낮은 수수료로 시장 평균 수익률을 얻을 수 있어 장기 투자에 최적입니다.',
      3: '다양한 투자 이해가 있다면 세금 최적화(절세)에 집중하세요. 연금저축·IRP 세액공제, ISA 비과세 혜택, 장기보유 양도세 감면 등을 활용하면 세후 수익률을 크게 높일 수 있습니다.',
      4: '폭넓은 금융 지식은 큰 경쟁력입니다. 연금 수령 시 세금(3.3~5.5%), 건강보험료 피부양자 자격 유지 전략, 종합소득세 최소화 등 세후 실수령액 극대화에 집중하세요.',
    },
  },
  12: {
    title: '은퇴 후 소득원 계획',
    scores: {
      1: '연금만으로는 원하는 생활 수준 유지가 어렵습니다. 은퇴 후 월 100~200만원 추가 소득이 있으면 삶의 질이 크게 달라집니다. 자신의 경험·기술·인맥 중 수익화 가능한 것을 리스트업하세요.',
      2: '3가지 유형을 탐색하세요: ①근로소득(파트타임, 컨설팅) ②사업소득(온라인 사업, 프랜차이즈) ③자산소득(임대, 배당, 이자). 각 유형별로 자신에게 맞는 것을 찾으세요.',
      3: '구체적 아이디어가 있다면 "은퇴 전 사이드 프로젝트"로 미리 테스트하세요. 주말/저녁 시간을 활용해 소규모로 시작하면 은퇴 후 바로 안정적 수입으로 전환할 수 있습니다.',
      4: '이미 준비 중이라면 수입의 안정성과 확장 가능성을 점검하세요. 건강 악화 시 플랜B도 준비하세요. 자산소득(배당, 임대)은 노동과 무관하므로 가장 안정적입니다.',
    },
  },
  19: {
    title: '가족 은퇴 대화',
    scores: {
      1: '은퇴 계획을 가족과 공유하지 않으면 기대 불일치로 갈등이 생깁니다. 배우자의 은퇴 후 생활비 기대치, 자녀 지원 범위 등을 솔직하게 대화하세요.',
      2: '가벼운 이야기를 넘어 구체적 숫자(월 생활비, 자산 현황, 연금 수령액)를 공유하세요. 부부가 함께 재무 현황을 파악하는 것이 효율적인 노후 설계의 첫걸음입니다.',
      3: '구체적 대화와 계획 공유는 매우 바람직합니다. 부부 합산 연금 전략(수령 시기 분산, 건강보험 피부양자 유지 등)을 함께 최적화하세요.',
      4: '가족 단위 재무 계획은 최고 수준의 노후 준비입니다. 상속·증여 계획, 부모 부양, 자녀 독립 시기까지 포함한 장기 가족 재무 로드맵을 완성하세요.',
    },
  },
  20: {
    title: '소득 크레바스 대비',
    scores: {
      1: '"소득 크레바스"란 주된 직장 퇴직(평균 53세)과 국민연금 수령(65세) 사이의 5~12년 소득 공백기입니다. 한국인 74.8%가 60~62세에 직장도 연금도 없는 상태를 경험합니다. 이 공백기가 노후 빈곤의 가장 큰 원인입니다.',
      2: '걱정만으로는 해결되지 않습니다. ①55세부터 수령 가능한 개인연금 가입, ②은퇴 시점 3년치 생활비(약 7,200만원~1억) 별도 확보, ③재취업/전직 교육 프로그램 탐색을 시작하세요.',
      3: '일부 대비책이 있다면 구체적 금액과 시기를 계산하세요. 개인연금(55세~), 퇴직연금(55세~), 국민연금(65세~)의 수령 시기를 단계적으로 설계하면 공백기를 안전하게 넘길 수 있습니다.',
      4: '별도 자금 확보는 최선의 대비입니다. 이 자금의 투자 방식(너무 위험하지 않게)과 인출 계획을 정교하게 세워두세요. 조기연금(60세) vs 정상연금(65세) 수령 시뮬레이션도 해보세요.',
    },
  },
}

// ── 교차 분석 인사이트 ──
export function getCrossInsights(categories: CategoryScore[]): { icon: string; title: string; insight: string }[] {
  const f = categories.find(c => c.key === 'finance')!
  const l = categories.find(c => c.key === 'lifestyle')!
  const h = categories.find(c => c.key === 'housing')!
  const m = categories.find(c => c.key === 'mindset')!
  const insights: { icon: string; title: string; insight: string }[] = []

  if (f.score >= 14 && l.score <= 8) {
    insights.push({ icon: '[!]', title: '돈은 있지만 건강이 위험', insight: '재정 준비는 잘 되어 있지만 건강관리가 부족합니다. 65세 이후 연간 의료비는 평균 550만원(건보공단 2024)이며 중증질환 시 수천만원이 소요됩니다. 아무리 많은 자산도 건강 없이는 의미가 없습니다.' })
  }
  if (l.score >= 14 && f.score <= 8) {
    insights.push({ icon: '[!]', title: '건강하지만 재정이 불안', insight: '건강관리는 잘하고 있지만 재정 준비가 부족하면 건강한 몸으로 경제적 고통을 겪게 됩니다. 건강할 때가 돈을 벌 수 있는 최적의 시간입니다. 적극적으로 저축과 투자를 시작하세요.' })
  }
  if (m.score >= 12 && f.score <= 8) {
    insights.push({ icon: '[i]', title: '아는 만큼 실천이 필요', insight: '노후에 대한 관심과 지식은 높지만 실제 재정 행동으로 이어지지 않고 있습니다. "분석 마비(Analysis Paralysis)" 상태일 수 있습니다. 완벽한 계획보다 불완전한 실행이 낫습니다.' })
  }
  if (f.score >= 14 && m.score <= 8) {
    insights.push({ icon: '[i]', title: '습관은 좋지만 전략이 부족', insight: '저축 습관은 좋지만 금융 지식이 부족하면 비효율적인 상품에 돈이 묶여있을 수 있습니다. 수수료 연 1% 이상인 펀드는 인덱스 ETF(수수료 0.1% 이하)로 전환을 검토하세요.' })
  }
  if (h.score >= 14 && f.score <= 8) {
    insights.push({ icon: '[H]', title: '부동산에 편중된 자산', insight: '주거 자산은 확보했지만 금융 자산이 부족합니다. 한국 가계 평균 부동산 비중 약 79%로 유동성이 매우 낮습니다. 부동산 유동화(주택연금, 다운사이징)로 금융자산 비중 30% 이상을 목표로 하세요.' })
  }
  const scores = categories.map(c => c.score)
  const maxGap = Math.max(...scores) - Math.min(...scores)
  if (maxGap <= 3 && f.score >= 12) {
    insights.push({ icon: '[+]', title: '균형 잡힌 준비', insight: '4개 영역이 균형있게 준비되어 있습니다. 매우 이상적인 상태입니다. 가장 점수가 낮은 영역을 한 단계만 올리면 전체 완성도가 크게 높아집니다.' })
  } else if (maxGap >= 8) {
    insights.push({ icon: '[!]', title: '영역 간 편차가 심함', insight: `가장 강한 영역과 약한 영역의 차이가 ${maxGap}점으로 큽니다. 약한 영역이 전체 노후 준비를 무너뜨리는 "가장 약한 고리" 효과를 만듭니다. 약한 영역부터 집중 보강하세요.` })
  }
  if (f.score <= 8 && m.score <= 8) {
    insights.push({ icon: '[!!]', title: '재정 인식 긴급 개선 필요', insight: '재정 준비와 금융 인식이 모두 낮은 상태는 가장 위험한 조합입니다. 국민연금공단(☎1355)에 전화하여 예상 수령액을 확인하고, 가까운 은행에서 무료 재무상담을 받으세요.' })
  }

  return insights.slice(0, 3)
}

// ── 3층 연금체계 분석 ──
export function getPensionAnalysis(answers: Record<number, number>): { tier: string; icon: string; status: string; color: string; detail: string }[] {
  const q2 = answers[2] || 1
  const q16 = answers[16] || 1
  return [
    {
      tier: '1층: 국민연금',
      icon: '1',
      status: '가입 중 (의무)',
      color: '#ea580c',
      detail: '평균 수령액 월 67만원(전체) / 20년+ 가입 시 월 108만원. 수령 개시: 65세(1969년생 이후). 연기연금 신청 시 연 7.2%씩 증액(최대 5년=+36%). 추납·임의가입으로 가입기간을 늘리면 수령액이 증가합니다.',
    },
    {
      tier: '2층: 퇴직연금',
      icon: '2',
      status: q16 >= 3 ? '적극 운용 중' : q16 >= 2 ? '가입됨 (방치 가능성)' : '미확인/미가입',
      color: q16 >= 3 ? '#ea580c' : q16 >= 2 ? '#ca8a04' : '#dc2626',
      detail: q16 >= 3
        ? '퇴직연금을 적극 운용 중입니다. 55세 이후 연금 수령 시 퇴직소득세의 60~70%만 과세됩니다. 수수료 연 0.5% 이하인지 점검하세요.'
        : q16 >= 2
        ? '원리금보장형(예금)에 방치 시 실질 수익률이 물가상승률(3%)에도 못 미칩니다. DC형이라면 TDF(타깃데이트펀드)로 전환을 강력 권장합니다.'
        : '퇴직연금 가입 여부·운용 방식을 즉시 확인하세요. 회사 HR 부서에 DB/DC 여부, 적립금 현황을 문의하세요.',
    },
    {
      tier: '3층: 개인연금',
      icon: '3',
      status: q2 >= 3 ? '체계적 구축' : q2 >= 2 ? '부분 가입' : '미가입',
      color: q2 >= 3 ? '#ea580c' : q2 >= 2 ? '#ca8a04' : '#dc2626',
      detail: q2 >= 3
        ? '연금저축(600만)+IRP(300만) 합산 연 900만원 세액공제를 최대한 활용하세요. 총급여 5,500만원 이하 시 세액공제율 16.5%(최대 148.5만원 환급)입니다.'
        : q2 >= 2
        ? '현재 연금 상품의 수수료와 수익률을 확인하세요. 수수료 연 1% 이상이면 저비용 인덱스 상품으로 전환 검토. IRP 추가 가입으로 세액공제 한도를 늘릴 수 있습니다.'
        : '국민연금만으로는 적정 노후생활비의 25~30%만 커버됩니다. 연금저축 계좌를 즉시 개설하세요. 월 50만원 납입 시 연 약 99만원 절세 효과가 있습니다.',
    },
  ]
}

// ── 3대 리스크 평가 ──
export function getRiskAssessment(categories: CategoryScore[], answers: Record<number, number>): { name: string; level: string; color: string; icon: string; detail: string }[] {
  const f = categories.find(c => c.key === 'finance')!

  const longevityRisk = f.score <= 8 ? '높음' : f.score <= 14 ? '중간' : '낮음'
  const inflationScore = (answers[15] || 1) + (answers[11] || 1)
  const inflationRisk = inflationScore <= 3 ? '높음' : inflationScore <= 5 ? '중간' : '낮음'
  const healthScore = (answers[4] || 1) + (answers[5] || 1) + (answers[13] || 1)
  const healthRisk = healthScore <= 5 ? '높음' : healthScore <= 8 ? '중간' : '낮음'

  return [
    {
      name: '장수리스크',
      level: longevityRisk,
      color: longevityRisk === '높음' ? '#dc2626' : longevityRisk === '중간' ? '#ca8a04' : '#ea580c',
      icon: 'T',
      detail: longevityRisk === '높음'
        ? '현재 준비 수준으로는 은퇴 후 25~30년을 버티기 어렵습니다. 한국인 평균수명 83.4세이지만 90세까지 대비 필요.'
        : longevityRisk === '중간'
        ? '기본 준비는 되어 있지만 90세 이상까지 자금 유지 시뮬레이션이 필요합니다.'
        : '장수리스크 대비가 잘 되어 있습니다. 정기적 포트폴리오 점검으로 유지하세요.',
    },
    {
      name: '인플레이션 리스크',
      level: inflationRisk,
      color: inflationRisk === '높음' ? '#dc2626' : inflationRisk === '중간' ? '#ca8a04' : '#ea580c',
      icon: 'I',
      detail: inflationRisk === '높음'
        ? '자산이 예금·부동산에 편중되어 물가상승에 취약합니다. 연 3% 인플레이션 시 20년 후 구매력이 45%로 줄어듭니다.'
        : inflationRisk === '중간'
        ? '일부 방어가 되어 있지만 의료비 인플레이션(연 6%)에 대한 추가 대비가 필요합니다.'
        : '다양한 자산 분산으로 인플레이션 방어가 잘 되어 있습니다.',
    },
    {
      name: '건강리스크',
      level: healthRisk,
      color: healthRisk === '높음' ? '#dc2626' : healthRisk === '중간' ? '#ca8a04' : '#ea580c',
      icon: 'H',
      detail: healthRisk === '높음'
        ? '운동·검진·보험 모두 부족합니다. 65세 이후 연평균 의료비 550만원, 중증질환 시 수천만원 소요됩니다.'
        : healthRisk === '중간'
        ? '기본 건강관리는 하고 있지만 보험 보장이나 운동 습관을 강화하면 리스크를 크게 줄일 수 있습니다.'
        : '건강관리와 보험 대비가 잘 되어 의료비 리스크가 낮습니다.',
    },
  ]
}

// ── 소득 크레바스 진단 ──
export function getCrevasseAnalysis(answers: Record<number, number>): { level: string; color: string; detail: string; strategy: string[] } {
  const q20 = answers[20] || 1
  const q12 = answers[12] || 1
  const combined = q20 + q12

  if (combined >= 6) {
    return {
      level: '대비 양호',
      color: '#ea580c',
      detail: '소득 크레바스에 대한 인식과 대비가 잘 되어 있습니다. 별도 자금이나 추가 소득원이 준비되어 공백기를 안전하게 넘길 수 있습니다.',
      strategy: ['브릿지 자금의 투자 방식 점검 (과도한 위험 회피)', '파트타임/컨설팅 등 근로소득 계획 구체화', '조기연금(60세) vs 정상연금(65세) 수령액 비교 시뮬레이션'],
    }
  } else if (combined >= 4) {
    return {
      level: '부분 대비',
      color: '#ca8a04',
      detail: '소득 크레바스를 인지하고 있지만 대비가 충분하지 않습니다. 주된 직장 퇴직(평균 53세) 후 국민연금 수령(65세)까지 최대 12년의 공백이 생길 수 있습니다.',
      strategy: ['은퇴 시점 3년치 생활비(약 7,200만~1억)를 별도 계좌에 확보', '55세부터 개인연금/퇴직연금 일부 수령 시작 계획', '재취업/파트타임/프리랜서 등 브릿지 근로 계획 수립'],
    }
  }
  return {
    level: '대비 미흡',
    color: '#dc2626',
    detail: '한국인의 74.8%가 60~62세에 직장도 연금도 없는 상태를 경험합니다. 이 "소득 크레바스"가 노후 빈곤의 가장 큰 원인입니다.',
    strategy: ['지금 당장 "은퇴 후 5년 생존 자금"을 별도로 마련 시작', '55세부터 수령 가능한 개인연금(연금저축/IRP) 가입', '50대 재취업/전직 교육 프로그램 탐색 (고용센터 무료)', '기초연금(65세+, 월 최대 30.7만원) 수급 조건 확인'],
  }
}

// ── 맞춤 종합 조언 (찐 조언) ──
export function getDeepAdvice(total: number, categories: CategoryScore[], answers: Record<number, number>): { title: string; advice: string }[] {
  const f = categories.find(c => c.key === 'finance')!
  const l = categories.find(c => c.key === 'lifestyle')!
  const h = categories.find(c => c.key === 'housing')!
  const m = categories.find(c => c.key === 'mindset')!
  const advices: { title: string; advice: string }[] = []

  // 재정 심층 조언
  if (f.score <= 8) {
    advices.push({
      title: '[F] 재정: 긴급 행동 필요',
      advice: `재정 준비 점수 ${f.score}/20으로, 은퇴 후 최소 생활비(2인 가구 월 198만원, 통계청 2024) 확보가 어려운 상태입니다. 가장 시급한 조치: ①연금저축 계좌 개설(연 600만원 한도, 세액공제 16.5% = 연 99만원 절세), ②국민연금 예상 수령액 확인(nps.or.kr / ☎1355), ③월 소득의 최소 15%를 자동이체로 투자 계좌에 이체. 월 30만원을 연 6% 수익률로 20년 투자하면 약 1.4억이 됩니다. 10년 늦으면 절반밖에 안 됩니다.`,
    })
  } else if (f.score <= 14) {
    advices.push({
      title: '[F] 재정: 체계화 단계',
      advice: `재정 점수 ${f.score}/20으로 기본기는 갖추고 있습니다. 다음 단계: ①3층 연금(국민+퇴직+개인)의 예상 수령액을 합산하여 소득대체율(목표 70%) 확인, ②연금저축+IRP 합산 연 900만원 세액공제 한도 최대 활용, ③퇴직연금이 원리금보장형에 방치되어 있다면 TDF로 전환(장기 수익률 연 2~3%p 차이). 수수료도 연 0.5% 이하인지 반드시 확인하세요.`,
    })
  } else {
    advices.push({
      title: '[F] 재정: 최적화 단계',
      advice: `재정 점수 ${f.score}/20으로 우수합니다. 최적화 포인트: ①연금 수령 시기 전략(55세vs60세vs65세별 연금소득세 3.3~5.5% 차이 계산), ②건강보험 피부양자 자격 유지를 위한 금융소득 2,000만원 관리, ③연금소득 1,500만원 초과 시 종합소득세 vs 분리과세(16.5%) 유리한 쪽 선택. 세후 실수령액을 극대화하는 것이 이 단계의 핵심입니다.`,
    })
  }

  // 건강/생활 심층 조언
  if (l.score <= 8) {
    advices.push({
      title: '[L] 건강: 건강이 최고의 노후 자산',
      advice: `건강 영역 ${l.score}/20으로 시급한 개선이 필요합니다. 65세 이후 연간 의료비 평균 550만원(건보공단 2024), 건강관리 부족 시 2~3배 증가합니다. ①이번 달 안에 건강검진 예약(40대+: 위·대장내시경 필수), ②하루 30분 걷기 시작(만보기 7,000보 목표), ③직장 외 사회적 관계 1개 만들기(동네 모임, 봉사, 평생교육원). 은퇴 후 6~8만 시간의 자유시간을 건강하게 보내려면 지금부터 투자해야 합니다.`,
    })
  } else if (l.score <= 14) {
    advices.push({
      title: '[L] 건강: 습관 고도화',
      advice: `건강 영역 ${l.score}/20으로 기본은 갖추고 있습니다. 고도화: ①유산소+근력운동 병행 점검(50대+ 근감소증 예방 위해 주 2회 근력운동 필수), ②정신건강 관리 루틴 확보(명상·감사일기·취미), ③사회적 관계를 세대 간 교류로 확장(멘토링, 봉사 → 은퇴 후 사회적 역할 유지). 건강검진 결과는 연도별로 기록하여 수치 변화를 모니터링하세요.`,
    })
  } else {
    advices.push({
      title: '[L] 건강: 유지와 확장',
      advice: `건강 영역 ${l.score}/20으로 우수합니다. 유지 전략: ①균형·유연성 운동 추가(낙상 예방, 요가/스트레칭), ②인지기능 유지를 위한 두뇌 활동(새 언어, 악기, 퍼즐), ③건강 취미를 소득원으로 연결(운동→시니어 건강지도사, 요리→쿠킹클래스). 현재의 건강 습관이 은퇴 후 의료비를 연 200만원 이상 절감시킬 수 있습니다.`,
    })
  }

  // 자산/주거 심층 조언
  if (h.score <= 8) {
    advices.push({
      title: '[H] 자산: 기반 구축 시급',
      advice: `자산 영역 ${h.score}/20으로 구조적 개선이 필요합니다. ①현재 자산·부채 목록 작성(부동산 시가, 금융자산, 대출 잔액·금리·만기 모두 정리), ②고금리 부채(연 5%+)부터 우선 상환(에벌랜치 전략), ③은퇴 후 월 생활비 항목별 계산(주거·식비·의료·교통·여가·보험). 한국 가구 평균 부동산 비중 79%로 유동성이 극히 낮습니다. 금융자산 비중 최소 30%까지 높이세요.`,
    })
  } else if (h.score <= 14) {
    advices.push({
      title: '[H] 자산: 구조 최적화',
      advice: `자산 영역 ${h.score}/20으로 기본 구조가 있습니다. ①주택연금 시뮬레이션(hf.go.kr, 3억 주택 65세 월 약 75만원 종신 수령), ②다운사이징 차액 연금화(월 50~100만원 추가 수입 가능), ③은퇴 5년 전까지 모든 부채 상환 완료 목표. 현재 주거가 10~20년 후에도 적합한지(엘리베이터, 병원 접근성, 대중교통)도 점검하세요.`,
    })
  } else {
    advices.push({
      title: '[H] 자산: 수비 강화',
      advice: `자산 영역 ${h.score}/20으로 우수합니다. ①자산 배분 연 1회 리밸런싱(나이에 따라 안전자산 비중 증가), ②상속·증여 세금 최적화(10년 단위 증여 한도 활용), ③자산 인출 순서 최적화: 과세 계좌 → 이연과세(연금) → 비과세 계좌 순으로 인출하면 세금을 최소화할 수 있습니다.`,
    })
  }

  // 마인드 심층 조언
  if (m.score <= 8) {
    advices.push({
      title: '[M] 마인드: 인식 전환이 첫걸음',
      advice: `마인드 영역 ${m.score}/20으로 인식과 행동 전환이 필요합니다. ①이번 주: 국민연금 예상 수령액 확인(nps.or.kr, 5분), ②이번 달: 배우자/가족과 은퇴 후 생활에 대해 30분 대화, ③금감원 금융교육센터(fss.or.kr/edu) 무료 온라인 강의 1개 수강. "소득 크레바스"(은퇴~연금수령 5~12년 공백기)를 인지하고 대비하세요. 주된 직장 퇴직 평균 53세, 국민연금 수령 65세입니다.`,
    })
  } else if (m.score <= 14) {
    advices.push({
      title: '[M] 마인드: 지식을 실행으로',
      advice: `마인드 영역 ${m.score}/20으로 관심과 기본 지식이 있습니다. ①학습:실행 비율 3:7 유지(매달 1가지 반드시 실행), ②부부 합산 연금 전략 수립(개인보다 부부 단위가 효율적), ③은퇴 후 소득원 사이드 프로젝트 시작(주말/저녁, 소규모 테스트). 소득 크레바스 대비로 은퇴 시점 2~3년치 생활비를 별도 계좌에 확보하세요.`,
    })
  } else {
    advices.push({
      title: '[M] 마인드: 전문가 수준으로',
      advice: `마인드 영역 ${m.score}/20으로 우수합니다. ①가족 단위 노후 계획 확장(부모 부양, 자녀 독립, 상속 계획 포함), ②세금·연금·보험 통합 최적화(전문 세무사/FP 상담 권장), ③은퇴 후 사회적 기여(멘토링, 재능기부, 사회적 기업). 노후 준비의 최종 단계는 "돈"이 아니라 "삶의 의미와 목적"을 설계하는 것입니다.`,
    })
  }

  return advices
}

// ── 필요 노후자금 산출 ──
export function getRetirementFundCalc(total: number, answers: Record<number, number>): { monthly: number; years: number; totalNeeded: number; pensionEstimate: number; gap: number } {
  const q8 = answers[8] || 1
  const monthly = q8 >= 3 ? 280 : q8 >= 2 ? 240 : 200
  const years = 25
  const totalNeeded = monthly * 12 * years
  const q2 = answers[2] || 1
  const pensionBase = 67
  const personalPension = q2 >= 3 ? 60 : q2 >= 2 ? 30 : 0
  const pensionEstimate = (pensionBase + personalPension) * 12 * years
  const gap = totalNeeded - pensionEstimate
  return { monthly, years, totalNeeded, pensionEstimate, gap: Math.max(0, gap) }
}

// ── 월 생활비 내역 ──
function getMonthlyBreakdown(total: number): { item: string; amount: string; note: string }[] {
  if (total >= 49) {
    return [
      { item: '주거 관리비', amount: '30~40만원', note: '자가 기준, 관리비+재산세+수선비' },
      { item: '식비', amount: '60~80만원', note: '2인 가구, 외식 포함' },
      { item: '의료비', amount: '30~50만원', note: '보험료+약값+검진비 (나이↑ 증가)' },
      { item: '교통/통신', amount: '15~20만원', note: '대중교통+통신비+인터넷' },
      { item: '여가/문화', amount: '20~40만원', note: '취미, 여행, 구독 서비스' },
      { item: '경조사/용돈', amount: '20~30만원', note: '자녀 지원, 경조사, 손주 용돈' },
      { item: '보험료', amount: '15~25만원', note: '실손+보장성 보험' },
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

// ── 시나리오 분석 ──
export function getScenarios(total: number, categories: CategoryScore[]): { label: string; color: string; monthly: string; desc: string }[] {
  const f = categories.find(c => c.key === 'finance')!
  const base = total >= 61 ? 300 : total >= 37 ? 240 : 200
  const optimistic = Math.round(base * (1 + f.score / 30))
  const baseline = base
  const pessimistic = Math.round(base * (1 - (16 - Math.min(f.score, 16)) / 30))
  return [
    { label: '낙관', color: '#ea580c', monthly: `월 ${optimistic}만원`, desc: '현재 습관 유지 + 연금 최적화 + 추가 소득원 확보 + 건강 유지' },
    { label: '기본', color: '#ca8a04', monthly: `월 ${baseline}만원`, desc: '현재 준비 수준 유지, 추가 대응 없음' },
    { label: '비관', color: '#dc2626', monthly: `월 ${pessimistic}만원`, desc: '조기 은퇴, 건강 악화, 또는 예상 외 대형 지출 발생 시' },
  ]
}

// ── 추천 자원 ──
export function getResources(categories: CategoryScore[]): { name: string; url: string; desc: string }[] {
  const resources: { name: string; url: string; desc: string }[] = []
  const f = categories.find(c => c.key === 'finance')!
  const m = categories.find(c => c.key === 'mindset')!
  resources.push({ name: '국민연금공단 "내 연금 알아보기"', url: 'nps.or.kr (☎1355)', desc: '예상 연금 수령액, 가입이력, 추납 가능 여부 확인' })
  if (f.score <= 10) {
    resources.push({ name: '금융감독원 "파인(FINE)"', url: 'fine.fss.or.kr', desc: '내 금융상품 한눈에 조회, 숨은 보험금 찾기' })
    resources.push({ name: '서민금융진흥원', url: 'kinfa.or.kr', desc: '무료 재무상담, 채무조정, 서민금융상품 안내' })
  }
  if (m.score <= 10) {
    resources.push({ name: '금감원 금융교육센터', url: 'fss.or.kr/edu', desc: '연금, 투자, 보험 등 무료 온라인 교육 과정' })
  }
  resources.push({ name: '한국주택금융공사', url: 'hf.go.kr', desc: '주택연금 예상 수령액 조회, 가입 조건 확인' })
  resources.push({ name: '국민연금공단 노후준비서비스', url: 'csa.nps.or.kr', desc: '4대 영역 무료 종합 진단 + 전문가 상담' })
  return resources.slice(0, 5)
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
    const ans = answers || {}
    const pensionTiers = getPensionAnalysis(ans)
    const risks = getRiskAssessment(categories, ans)
    const crevasse = getCrevasseAnalysis(ans)
    const deepAdvice = getDeepAdvice(total, categories, ans)
    const fundCalc = getRetirementFundCalc(total, ans)

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

    // html2canvas-safe icon: colored dot with letter (no emoji)
    const Icon = ({ label, color, size = 16 }: { label: string; color: string; size?: number }) => (
      <span style={s({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: `${size}px`, height: `${size}px`, borderRadius: '50%', backgroundColor: color, color: '#fff', fontSize: `${Math.round(size * 0.55)}px`, fontWeight: 800, lineHeight: '1', flexShrink: 0 })}>{label}</span>
    )

    const catIconMap: Record<string, { label: string; color: string }> = {
      finance: { label: 'F', color: '#ea580c' },
      lifestyle: { label: 'L', color: '#2563eb' },
      housing: { label: 'H', color: '#ea580c' },
      mindset: { label: 'M', color: '#7c3aed' },
    }

    const SectionHead = ({ title, sub }: { title: string; sub?: string }) => (
      <div style={s({ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' })}>
        <div style={s({ width: '4px', height: '18px', borderRadius: '2px', backgroundColor: '#9a3412' })} />
        <h3 style={s({ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0' })}>{title}</h3>
        {sub && <span style={s({ fontSize: '9px', color: '#9ca3af' })}>{sub}</span>}
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
        <div style={s({ backgroundColor: '#9a3412', color: '#ffffff', padding: '28px 48px 24px' })}>
          <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' })}>
            <div>
              <div style={s({ fontSize: '10px', letterSpacing: '3px', opacity: 0.6, marginBottom: '6px' })}>RETIREMENT READINESS REPORT</div>
              <div style={s({ fontSize: '22px', fontWeight: 800 })}>노후 준비 종합 진단 리포트</div>
              <div style={s({ fontSize: '11px', opacity: 0.5, marginTop: '4px' })}>4개 영역 · 20개 항목 심층 분석 · 3층 연금체계 진단</div>
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
                <Icon label={result.grade.charAt(0)} color={result.color} size={32} />
                <span style={s({ fontSize: '18px', fontWeight: 800, color: result.color })}>{result.grade}</span>
                <span style={s({ padding: '2px 8px', borderRadius: '999px', fontSize: '9px', fontWeight: 700, color: '#fff', backgroundColor: total >= 61 ? '#ea580c' : total >= 37 ? '#ca8a04' : '#dc2626' })}>
                  {total >= 73 ? '상위 5%' : total >= 61 ? '상위 20%' : total >= 49 ? '상위 40%' : total >= 37 ? '상위 60%' : '하위 30%'}
                </span>
              </div>
              <p style={s({ fontSize: '11.5px', color: '#4b5563', lineHeight: '1.6', margin: '0' })}>{result.description}</p>
              <div style={s({ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' })}>
                <div style={s({ padding: '4px 12px', borderRadius: '6px', backgroundColor: result.bgColor, fontSize: '10px' })}>
                  필요 노후자금 <strong style={{ color: result.color }}>{result.estimatedFund}</strong>
                </div>
                <div style={s({ padding: '4px 12px', borderRadius: '6px', backgroundColor: '#fff7ed', fontSize: '10px' })}>
                  강점 <strong style={{ color: '#ea580c' }}>{strongest.label}</strong>
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

        {/* ===== 4대 영역 점수 비교 차트 ===== */}
        <div style={s({ padding: '18px 48px 12px' })}>
          <SectionHead title="4대 영역 종합 점수" sub="국민연금공단 노후준비서비스 기준" />
          {/* 수평 바 차트 */}
          <div style={s({ display: 'flex', flexDirection: 'column', gap: '10px' })}>
            {categories.map((cat) => {
              const pct = Math.round((cat.score / cat.max) * 100)
              const ci = catIconMap[cat.key]
              const grade = pct >= 80 ? '우수' : pct >= 60 ? '양호' : pct >= 40 ? '보통' : '미흡'
              const gradeColor = pct >= 80 ? '#ea580c' : pct >= 60 ? '#2563eb' : pct >= 40 ? '#ca8a04' : '#dc2626'
              return (
                <div key={cat.key} style={s({ display: 'flex', alignItems: 'center', gap: '10px' })}>
                  <div style={s({ width: '80px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' })}>
                    {ci && <Icon label={ci.label} color={ci.color} size={16} />}
                    <span style={s({ fontSize: '11px', fontWeight: 700, color: '#374151' })}>{cat.label}</span>
                  </div>
                  <div style={s({ flex: 1, position: 'relative' })}>
                    <div style={s({ height: '22px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden', position: 'relative' })}>
                      <div style={s({ height: '100%', width: `${pct}%`, backgroundColor: gradeColor, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '6px' })}>
                        {pct >= 25 && <span style={s({ fontSize: '10px', fontWeight: 800, color: '#fff' })}>{cat.score}/{cat.max}</span>}
                      </div>
                      {pct < 25 && <span style={s({ position: 'absolute', left: `${pct + 2}%`, top: '3px', fontSize: '10px', fontWeight: 800, color: gradeColor })}>{cat.score}/{cat.max}</span>}
                    </div>
                    {/* 기준선들 */}
                    {[25, 50, 75].map(line => (
                      <div key={line} style={s({ position: 'absolute', left: `${line}%`, top: '0', height: '22px', width: '1px', backgroundColor: '#d1d5db' })} />
                    ))}
                  </div>
                  <span style={s({ width: '32px', fontSize: '9px', fontWeight: 700, color: gradeColor, textAlign: 'center', padding: '2px 0', borderRadius: '4px', backgroundColor: `${gradeColor}15` })}>{grade}</span>
                </div>
              )
            })}
            {/* 범례 */}
            <div style={s({ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '4px' })}>
              {[{ label: '미흡 (~39%)', color: '#dc2626' }, { label: '보통 (40~59%)', color: '#ca8a04' }, { label: '양호 (60~79%)', color: '#2563eb' }, { label: '우수 (80%~)', color: '#ea580c' }].map(l => (
                <div key={l.label} style={s({ display: 'flex', alignItems: 'center', gap: '3px' })}>
                  <div style={s({ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: l.color })} />
                  <span style={s({ fontSize: '7.5px', color: '#9ca3af' })}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== 3층 연금체계 분석 ===== */}
        {Object.keys(ans).length > 0 && (
          <div style={s({ padding: '8px 48px 12px' })}>
            <SectionHead title="3층 연금체계 진단" sub="국민연금 + 퇴직연금 + 개인연금" />
            {pensionTiers.map((tier, i) => (
              <div key={i} style={s({ marginBottom: '8px', padding: '10px 14px', border: '1px solid #f3f4f6', borderRadius: '8px', borderLeft: `3px solid ${tier.color}` })}>
                <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' })}>
                  <span style={s({ fontSize: '11px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '4px' })}><Icon label={tier.icon} color={tier.color} size={16} /> {tier.tier}</span>
                  <span style={s({ fontSize: '9px', fontWeight: 700, color: tier.color, padding: '1px 8px', borderRadius: '999px', backgroundColor: `${tier.color}15` })}>{tier.status}</span>
                </div>
                <p style={s({ fontSize: '9.5px', color: '#4b5563', lineHeight: '1.65', margin: '0' })}>{tier.detail}</p>
              </div>
            ))}
          </div>
        )}

        {/* ===== 3대 리스크 평가 ===== */}
        {Object.keys(ans).length > 0 && (
          <div style={s({ padding: '8px 48px 12px' })}>
            <SectionHead title="3대 노후 리스크 평가" sub="장수·인플레이션·건강" />
            <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' })}>
              {risks.map((risk, i) => (
                <div key={i} style={s({ padding: '12px', border: `1px solid ${risk.color}33`, borderRadius: '10px', borderTop: `3px solid ${risk.color}` })}>
                  <div style={s({ textAlign: 'center', marginBottom: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center' })}>
                    <Icon label={risk.icon} color={risk.color} size={24} />
                    <div style={s({ fontSize: '11px', fontWeight: 700, color: '#111827', marginTop: '4px' })}>{risk.name}</div>
                    <div style={s({ fontSize: '12px', fontWeight: 800, color: risk.color, marginTop: '2px' })}>{risk.level}</div>
                  </div>
                  <p style={s({ fontSize: '8.5px', color: '#6b7280', lineHeight: '1.55', margin: '0' })}>{risk.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== 소득 크레바스 진단 ===== */}
        {Object.keys(ans).length > 0 && (
          <div style={s({ padding: '8px 48px 12px' })}>
            <SectionHead title="소득 크레바스 진단" sub="은퇴(53세) ~ 연금수령(65세) 공백기" />
            <div style={s({ padding: '14px 16px', border: `1px solid ${crevasse.color}33`, borderRadius: '10px', borderLeft: `4px solid ${crevasse.color}` })}>
              <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' })}>
                <span style={s({ fontSize: '12px', fontWeight: 700, color: '#111827' })}>대비 수준</span>
                <span style={s({ fontSize: '11px', fontWeight: 800, color: crevasse.color })}>{crevasse.level}</span>
              </div>
              <p style={s({ fontSize: '10px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 8px' })}>{crevasse.detail}</p>
              {/* Timeline */}
              <div style={s({ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '8px', padding: '6px 0' })}>
                <div style={s({ textAlign: 'center', fontSize: '8px', color: '#6b7280' })}>
                  <div style={s({ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#ea580c', margin: '0 auto 2px' })} />
                  근로소득
                </div>
                <div style={s({ flex: 1, height: '3px', backgroundColor: '#ea580c', margin: '0 2px' })} />
                <div style={s({ textAlign: 'center', fontSize: '8px', color: '#6b7280', fontWeight: 700 })}>
                  <div style={s({ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#dc2626', margin: '0 auto 2px' })} />
                  퇴직 53세
                </div>
                <div style={s({ flex: 2, height: '3px', backgroundColor: '#fca5a5', margin: '0 2px', borderTop: '2px dashed #dc2626' })} />
                <div style={s({ textAlign: 'center', fontSize: '8px', color: '#6b7280', fontWeight: 700 })}>
                  <div style={s({ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#2563eb', margin: '0 auto 2px' })} />
                  연금 65세
                </div>
                <div style={s({ flex: 1, height: '3px', backgroundColor: '#2563eb', margin: '0 2px' })} />
                <div style={s({ textAlign: 'center', fontSize: '8px', color: '#6b7280' })}>
                  <div style={s({ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#9ca3af', margin: '0 auto 2px' })} />
                  종신
                </div>
              </div>
              <div style={s({ fontSize: '9px', fontWeight: 700, color: '#374151', marginBottom: '4px' })}>대비 전략:</div>
              {crevasse.strategy.map((st, i) => (
                <div key={i} style={s({ display: 'flex', gap: '6px', fontSize: '9px', color: '#4b5563', lineHeight: '1.6', marginBottom: '2px' })}>
                  <span style={s({ color: crevasse.color, flexShrink: 0 })}>→</span>
                  <span>{st}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== 교차 분석 인사이트 ===== */}
        {crossInsights.length > 0 && (
          <div style={s({ padding: '8px 48px 12px' })}>
            <SectionHead title="교차 분석 인사이트" sub="영역 간 상관관계 기반" />
            {crossInsights.map((ci, i) => (
              <div key={i} style={s({ marginBottom: '8px', padding: '10px 14px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' })}>
                <div style={s({ fontSize: '11px', fontWeight: 700, color: '#92400e', marginBottom: '4px' })}>{ci.icon} {ci.title}</div>
                <div style={s({ fontSize: '9.5px', color: '#78350f', lineHeight: '1.65' })}>{ci.insight}</div>
              </div>
            ))}
          </div>
        )}

        {/* ===== 필요 노후자금 산출 ===== */}
        {Object.keys(ans).length > 0 && (
          <div style={s({ padding: '8px 48px 12px' })}>
            <SectionHead title="필요 노후자금 산출" sub="간이 계산 · 2인 가구 기준" />
            <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' })}>
              <div style={s({ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '10px', textAlign: 'center', border: '1px solid #f3f4f6' })}>
                <div style={s({ fontSize: '9px', color: '#6b7280', marginBottom: '4px' })}>월 예상 생활비</div>
                <div style={s({ fontSize: '20px', fontWeight: 800, color: '#111827' })}>{fundCalc.monthly}만원</div>
                <div style={s({ fontSize: '8px', color: '#9ca3af' })}>× 12개월 × {fundCalc.years}년</div>
              </div>
              <div style={s({ padding: '12px', backgroundColor: '#fef2f2', borderRadius: '10px', textAlign: 'center', border: '1px solid #fecaca' })}>
                <div style={s({ fontSize: '9px', color: '#6b7280', marginBottom: '4px' })}>총 필요 자금</div>
                <div style={s({ fontSize: '20px', fontWeight: 800, color: '#dc2626' })}>{(fundCalc.totalNeeded / 10000).toFixed(1)}억</div>
                <div style={s({ fontSize: '8px', color: '#9ca3af' })}>인플레이션 미반영</div>
              </div>
              <div style={s({ padding: '12px', backgroundColor: '#eff6ff', borderRadius: '10px', textAlign: 'center', border: '1px solid #bfdbfe' })}>
                <div style={s({ fontSize: '9px', color: '#6b7280', marginBottom: '4px' })}>연금으로 커버 가능</div>
                <div style={s({ fontSize: '20px', fontWeight: 800, color: '#2563eb' })}>{(fundCalc.pensionEstimate / 10000).toFixed(1)}억</div>
                <div style={s({ fontSize: '8px', color: '#9ca3af' })}>국민+개인연금 추정</div>
              </div>
            </div>
            {/* 갭 분석 바 차트 */}
            <div style={s({ marginTop: '12px', padding: '12px 14px', backgroundColor: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' })}>
              <div style={s({ fontSize: '10px', fontWeight: 700, color: '#374151', marginBottom: '8px' })}>자금 갭 분석</div>
              {/* 전체 바 */}
              <div style={s({ position: 'relative', height: '28px', backgroundColor: '#fee2e2', borderRadius: '6px', overflow: 'hidden', marginBottom: '6px' })}>
                {/* 연금 커버 부분 */}
                <div style={s({ height: '100%', width: `${Math.min(100, Math.round(fundCalc.pensionEstimate / fundCalc.totalNeeded * 100))}%`, backgroundColor: '#2563eb', borderRadius: '6px 0 0 6px', display: 'flex', alignItems: 'center', paddingLeft: '8px' })}>
                  <span style={s({ fontSize: '9px', fontWeight: 700, color: '#fff' })}>연금 {(fundCalc.pensionEstimate / 10000).toFixed(1)}억</span>
                </div>
                {/* 갭 부분 텍스트 */}
                {fundCalc.gap > 0 && (
                  <span style={s({ position: 'absolute', right: '8px', top: '7px', fontSize: '9px', fontWeight: 700, color: '#dc2626' })}>부족분 {(fundCalc.gap / 10000).toFixed(1)}억</span>
                )}
              </div>
              <div style={s({ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#9ca3af' })}>
                <span>0</span>
                <span>총 필요: {(fundCalc.totalNeeded / 10000).toFixed(1)}억원</span>
              </div>
              {/* 범례 */}
              <div style={s({ display: 'flex', gap: '16px', marginTop: '6px' })}>
                <div style={s({ display: 'flex', alignItems: 'center', gap: '4px' })}>
                  <div style={s({ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#2563eb' })} />
                  <span style={s({ fontSize: '8px', color: '#6b7280' })}>연금 커버 ({Math.round(fundCalc.pensionEstimate / fundCalc.totalNeeded * 100)}%)</span>
                </div>
                {fundCalc.gap > 0 && (
                  <div style={s({ display: 'flex', alignItems: 'center', gap: '4px' })}>
                    <div style={s({ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#fee2e2', border: '1px solid #fecaca' })} />
                    <span style={s({ fontSize: '8px', color: '#6b7280' })}>추가 확보 필요 ({Math.round(fundCalc.gap / fundCalc.totalNeeded * 100)}%)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== 20개 항목 점수 히트맵 ===== */}
        {answers && Object.keys(answers).length > 0 && (
          <div style={s({ padding: '8px 48px 12px' })}>
            <SectionHead title="20개 항목 점수 한눈에 보기" sub="색상이 진할수록 높은 점수" />
            <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' })}>
              {categories.map((cat) => {
                const catQuestionIds = cat.key === 'finance' ? [1,2,3,13,16] : cat.key === 'lifestyle' ? [4,5,6,14,17] : cat.key === 'housing' ? [7,8,9,15,18] : [10,11,12,19,20]
                const ci = catIconMap[cat.key]
                return (
                  <div key={cat.key} style={s({ padding: '8px 10px', border: '1px solid #f3f4f6', borderRadius: '8px' })}>
                    <div style={s({ fontSize: '10px', fontWeight: 700, color: '#374151', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' })}>
                      {ci && <Icon label={ci.label} color={ci.color} size={12} />} {cat.label}
                    </div>
                    <div style={s({ display: 'flex', gap: '3px' })}>
                      {catQuestionIds.map((qid) => {
                        const score = answers[qid] || 0
                        const qDiag = questionDiagnosis[qid]
                        const bgColor = score >= 4 ? '#9a3412' : score >= 3 ? '#ea580c' : score >= 2 ? '#fbbf24' : '#ef4444'
                        const textColor = score >= 3 ? '#fff' : score >= 2 ? '#78350f' : '#fff'
                        return (
                          <div key={qid} style={s({ flex: 1, textAlign: 'center' })}>
                            <div style={s({ height: '24px', backgroundColor: bgColor, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
                              <span style={s({ fontSize: '11px', fontWeight: 800, color: textColor })}>{score}</span>
                            </div>
                            <div style={s({ fontSize: '6.5px', color: '#9ca3af', marginTop: '2px', lineHeight: '1.2' })}>{qDiag?.title.slice(0, 4) || ''}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            {/* 히트맵 범례 */}
            <div style={s({ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '8px' })}>
              {[{ label: '1점 (미흡)', color: '#ef4444' }, { label: '2점 (보통)', color: '#fbbf24' }, { label: '3점 (양호)', color: '#ea580c' }, { label: '4점 (우수)', color: '#9a3412' }].map(l => (
                <div key={l.label} style={s({ display: 'flex', alignItems: 'center', gap: '3px' })}>
                  <div style={s({ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: l.color })} />
                  <span style={s({ fontSize: '7.5px', color: '#9ca3af' })}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== 20개 항목 개별 진단 ===== */}
        {answers && Object.keys(answers).length > 0 && (
          <div style={s({ padding: '8px 48px 12px' })}>
            <SectionHead title="20개 항목 개별 진단" sub="응답 기반 맞춤 분석" />
            {categories.map((cat) => {
              const catQuestionIds = cat.key === 'finance' ? [1,2,3,13,16] : cat.key === 'lifestyle' ? [4,5,6,14,17] : cat.key === 'housing' ? [7,8,9,15,18] : [10,11,12,19,20]
              const ci = catIconMap[cat.key]
              return (
                <div key={cat.key} style={s({ marginBottom: '10px' })}>
                  <div style={s({ fontSize: '11px', fontWeight: 700, color: '#374151', marginBottom: '6px', padding: '4px 8px', backgroundColor: '#f9fafb', borderRadius: '6px' })}>{ci && <Icon label={ci.label} color={ci.color} size={14} />} {cat.label} ({cat.score}/{cat.max})</div>
                  {catQuestionIds.map((qid) => {
                    const qDiag = questionDiagnosis[qid]
                    const score = answers[qid]
                    if (!qDiag || score === undefined) return null
                    const scoreColor = score >= 3 ? '#ea580c' : score >= 2 ? '#ca8a04' : '#dc2626'
                    const scoreBg = score >= 3 ? '#fff7ed' : score >= 2 ? '#fefce8' : '#fef2f2'
                    return (
                      <div key={qid} style={s({ marginBottom: '6px', padding: '8px 12px', border: '1px solid #f3f4f6', borderRadius: '8px', borderLeft: `3px solid ${scoreColor}` })}>
                        <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' })}>
                          <span style={s({ fontSize: '10px', fontWeight: 700, color: '#111827' })}>{qDiag.title}</span>
                          <span style={s({ fontSize: '9px', fontWeight: 700, color: scoreColor, padding: '1px 8px', borderRadius: '999px', backgroundColor: scoreBg })}>{score}/4점</span>
                        </div>
                        <p style={s({ fontSize: '9px', color: '#4b5563', lineHeight: '1.6', margin: '0' })}>{qDiag.scores[score]}</p>
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
            <div style={s({ display: 'grid', gridTemplateColumns: '2fr 1.5fr 3fr', padding: '6px 12px', backgroundColor: '#fff7ed', borderTop: '1px solid #e5e7eb' })}>
              <span style={s({ fontSize: '10px', fontWeight: 800, color: '#111827' })}>합계</span>
              <span style={s({ fontSize: '10px', fontWeight: 800, color: '#ea580c', textAlign: 'right' })}>{total >= 61 ? '200~300만원' : '150~250만원'}</span>
              <span style={s({ fontSize: '8.5px', color: '#6b7280', textAlign: 'right' })}>개인 패턴에 따라 ±30% 변동</span>
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
                <div style={s({ fontSize: '8px', color: '#6b7280', lineHeight: '1.5' })}>{sc.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== 맞춤 종합 조언 (찐 조언) ===== */}
        {Object.keys(ans).length > 0 && (
          <div style={s({ padding: '8px 48px 12px' })}>
            <SectionHead title="4대 영역 맞춤 심층 조언" sub="점수 기반 개인화 전략" />
            {deepAdvice.map((da, i) => (
              <div key={i} style={s({ marginBottom: '8px', padding: '12px 14px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px' })}>
                <div style={s({ fontSize: '11.5px', fontWeight: 700, color: '#111827', marginBottom: '6px' })}>{da.title}</div>
                <p style={s({ fontSize: '9.5px', color: '#374151', lineHeight: '1.7', margin: '0' })}>{da.advice}</p>
              </div>
            ))}
          </div>
        )}

        {/* ===== 핵심 실행 체크리스트 ===== */}
        <div style={s({ padding: '8px 48px 12px' })}>
          <SectionHead title="실행 로드맵" sub="이번 주 / 이번 달 / 3개월" />
          <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' })}>
            {[
              { when: '이번 주', color: '#dc2626', tasks: total >= 61
                ? ['연금 예상 수령액 재확인 (nps.or.kr)', '보유 금융상품 수수료 점검', '자산·부채 현황표 업데이트']
                : total >= 37
                ? ['국민연금 예상 수령액 확인 (nps.or.kr)', '월 지출 1주일간 상세 기록', '자동이체 저축 설정 (최소 15%)']
                : ['국민연금공단 ☎1355 전화', '통장 쪼개기 (생활비/저축/비상금)', '불필요한 구독 3개 해지']
              },
              { when: '이번 달', color: '#ca8a04', tasks: total >= 61
                ? [`${weakest.label} 영역 보강 계획 수립`, '세액공제 잔여분 확인·납입', '포트폴리오 리밸런싱']
                : total >= 37
                ? ['개인연금(연금저축/IRP) 가입', '건강검진 예약', `${weakest.label} 영역 개선 목표 설정`]
                : ['연금저축 계좌 개설 (월 10만원)', '건강검진 예약', '관심 취미/운동 1가지 체험']
              },
              { when: '3개월 내', color: '#ea580c', tasks: total >= 61
                ? ['부부 합산 연금 전략 수립', '세무사/FP 상담 예약', '상속·증여 계획 검토']
                : total >= 37
                ? ['퇴직연금 운용 방식 전환 검토', '보험 보장 적정성 점검', '소득 크레바스 대비 계획 수립']
                : ['금감원 금융교육 1과정 수료', '가까운 은행 무료 재무상담', '가족과 은퇴 계획 대화']
              },
            ].map((block, i) => (
              <div key={i} style={s({ backgroundColor: '#f9fafb', borderRadius: '10px', padding: '12px 14px', border: '1px solid #f3f4f6', borderTop: `3px solid ${block.color}` })}>
                <div style={s({ fontSize: '11px', fontWeight: 700, color: block.color, marginBottom: '8px' })}>{block.when}</div>
                {block.tasks.map((task, ti) => (
                  <div key={ti} style={s({ display: 'flex', gap: '6px', fontSize: '9px', color: '#374151', lineHeight: '1.6', marginBottom: '3px' })}>
                    <span style={s({ color: block.color, flexShrink: 0 })}>□</span>
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
                <div style={s({ fontSize: '10px', fontWeight: 700, color: '#111827' })}>{res.name}</div>
                <div style={s({ fontSize: '9px', color: '#ea580c', fontWeight: 600, marginTop: '2px' })}>{res.url}</div>
                <div style={s({ fontSize: '8px', color: '#6b7280', marginTop: '2px' })}>{res.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div style={s({ padding: '14px 48px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' })}>
          <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' })}>
            <div>
              <div style={s({ fontSize: '11px', fontWeight: 700, color: '#374151' })}>노후연구소</div>
              <div style={s({ fontSize: '8px', color: '#9ca3af', marginTop: '2px' })}>retireplan.kr · cafe.naver.com/eovhskfktmak</div>
            </div>
            <div style={s({ textAlign: 'right', maxWidth: '380px' })}>
              <div style={s({ fontSize: '7.5px', color: '#9ca3af', lineHeight: '1.5' })}>
                본 리포트는 자가진단 결과를 기반으로 한 참고 자료이며, 전문적인 재무상담을 대체하지 않습니다.
                개인의 재정 상황에 따라 전문 재무설계사(CFP) 상담을 권장합니다. 제시된 금액은 통계적 추정치이며 실제와 차이가 있을 수 있습니다.
                데이터 출처: 통계청(2024), 국민연금공단, 건강보험공단, 한국주택금융공사
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

export default ResultCardA4
