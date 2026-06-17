// 심층 학습(LearnPage) 콘텐츠 데이터.
// 실제 본문 텍스트는 추후 채울 예정 — 현재는 구조와 placeholder만 완성.

export interface LearnItem {
  category: LearnCategory
  title: string
  summary: string
  /** 비로그인 사용자에게도 보이는 미리보기 항목 여부 */
  isPreview: boolean
  /** 외부 자료 링크 (있으면 새 탭으로 열기) */
  externalLink?: string
}

export type LearnCategory =
  | '하크니스 핵심 원칙'
  | '퍼실리테이션 스킬'
  | '관련 논문·연구 자료'
  | '해외 대학 연계'
  | '추천 토론 텍스트'

/** 카테고리 표시 순서 + 짧은 설명 */
export const LEARN_CATEGORIES: { name: LearnCategory; desc: string }[] = [
  { name: '하크니스 핵심 원칙', desc: '하크니스 토론을 떠받치는 기본 철학과 규칙' },
  { name: '퍼실리테이션 스킬', desc: '토론을 이끄는 교사·진행자를 위한 실전 기술' },
  { name: '관련 논문·연구 자료', desc: '토론식 학습의 효과를 다룬 연구 자료' },
  { name: '해외 대학 연계', desc: '하크니스·토론식 교육 관련 해외 기관 링크' },
  { name: '추천 토론 텍스트', desc: '토론에 적합한 읽기 자료와 발제 주제' },
]

export const LEARN_ITEMS: LearnItem[] = [
  // 하크니스 핵심 원칙
  {
    category: '하크니스 핵심 원칙',
    title: '둥근 테이블의 의미',
    summary: '(placeholder) 모두가 동등하게 마주 보는 원형 배치의 교육적 의미.',
    isPreview: true,
  },
  {
    category: '하크니스 핵심 원칙',
    title: '학생 주도 대화의 원리',
    summary: '(placeholder) 교사가 답을 주지 않는 토론이 작동하는 방식.',
    isPreview: true,
  },
  {
    category: '하크니스 핵심 원칙',
    title: '경청과 연결의 기술',
    summary: '(placeholder) 상대의 말을 인용하고 이어가는 빌딩(building) 기법.',
    isPreview: false,
  },
  {
    category: '하크니스 핵심 원칙',
    title: '침묵을 다루는 법',
    summary: '(placeholder) 토론 중 침묵의 의미와 생산적으로 활용하는 방법.',
    isPreview: false,
  },

  // 퍼실리테이션 스킬
  {
    category: '퍼실리테이션 스킬',
    title: '좋은 발문 만들기',
    summary: '(placeholder) 사고를 여는 개방형 질문 설계 원칙.',
    isPreview: true,
  },
  {
    category: '퍼실리테이션 스킬',
    title: '발언 균형 잡기',
    summary: '(placeholder) 독점과 소외를 줄이고 고른 참여를 이끄는 개입 전략.',
    isPreview: false,
  },
  {
    category: '퍼실리테이션 스킬',
    title: '토론 마무리와 피드백',
    summary: '(placeholder) 세션을 정리하고 성장 피드백으로 연결하는 법.',
    isPreview: false,
  },

  // 관련 논문·연구 자료
  {
    category: '관련 논문·연구 자료',
    title: '토론식 학습과 비판적 사고',
    summary: '(placeholder) 토론 기반 수업이 비판적 사고에 미치는 영향 연구 요약.',
    isPreview: true,
  },
  {
    category: '관련 논문·연구 자료',
    title: '또래 학습(Peer Learning) 효과',
    summary: '(placeholder) 동료 간 상호작용이 학습 성취에 미치는 효과.',
    isPreview: false,
  },

  // 해외 대학 연계 (외부 링크)
  {
    category: '해외 대학 연계',
    title: 'Phillips Exeter Academy — Harkness',
    summary: '(placeholder) 하크니스 교수법의 발상지 공식 소개.',
    isPreview: true,
    externalLink: 'https://www.exeter.edu/harkness',
  },
  {
    category: '해외 대학 연계',
    title: 'Harvard — Discussion-based Teaching',
    summary: '(placeholder) 하버드의 토론 중심 교수법 자료.',
    isPreview: false,
    externalLink: 'https://bokcenter.harvard.edu/',
  },
  {
    category: '해외 대학 연계',
    title: 'Oxford — Tutorial System',
    summary: '(placeholder) 옥스퍼드 튜토리얼식 소규모 토론 학습.',
    isPreview: false,
    externalLink: 'https://www.ox.ac.uk/',
  },

  // 추천 토론 텍스트
  {
    category: '추천 토론 텍스트',
    title: 'AI 시대의 직업 윤리',
    summary: '(placeholder) 기술과 윤리를 둘러싼 토론 발제 자료.',
    isPreview: true,
  },
  {
    category: '추천 토론 텍스트',
    title: '정의란 무엇인가 — 발췌',
    summary: '(placeholder) 공정성과 분배 정의에 대한 토론 텍스트.',
    isPreview: false,
  },
  {
    category: '추천 토론 텍스트',
    title: '기후 위기와 세대 간 책임',
    summary: '(placeholder) 환경 윤리 토론을 위한 읽기 자료.',
    isPreview: false,
  },
]
