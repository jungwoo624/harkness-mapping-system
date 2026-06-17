// 세션 아카이브용 더미 데이터.
// 실제로는 Firestore "sessions" 컬렉션에서 published: true 문서를 불러올 예정.
// (관리자 발행 기능은 다음 STEP에서 구현)

export interface ArchiveSession {
  id: string
  title: string
  /** ISO 날짜 문자열 */
  date: string
  participantCount: number
  /** 목록 카드용 한 줄 요약 */
  summary: string
  /** 썸네일 URL (없으면 placeholder 표시) */
  thumbnail?: string
  published: boolean
  /** 상세: 참여 학생 이름 */
  studentNames: string[]
  /** 상세: 발언 흐름 (from→to, studentNames 인덱스) */
  speechPairs: [number, number][]
  /** 상세: 사진 갤러리 URL 목록 (없으면 placeholder) */
  photos: string[]
  /** 상세: AI 분석 요약 */
  analysisSummary: string
}

export const MOCK_ARCHIVE: ArchiveSession[] = [
  {
    id: 'ses-001',
    title: 'AI 시대의 직업 윤리',
    date: '2026-05-12T10:00:00.000Z',
    participantCount: 5,
    summary: '기술 발전과 일자리, 그리고 인간의 역할에 대한 토론.',
    published: true,
    studentNames: ['지민', '서연', '도윤', '하준', '수아'],
    speechPairs: [
      [0, 1],
      [1, 2],
      [0, 2],
      [2, 3],
      [0, 1],
    ],
    photos: [],
    analysisSummary:
      '(placeholder) 지민 학생이 논의를 주도했고, 하준 학생의 참여가 상대적으로 적었습니다.',
  },
  {
    id: 'ses-002',
    title: '정의란 무엇인가',
    date: '2026-05-20T10:00:00.000Z',
    participantCount: 4,
    summary: '공정성과 분배 정의를 둘러싼 다양한 관점의 충돌.',
    published: true,
    studentNames: ['민준', '서윤', '예준', '지우'],
    speechPairs: [
      [0, 1],
      [1, 0],
      [2, 3],
      [3, 2],
      [0, 2],
    ],
    photos: [],
    analysisSummary:
      '(placeholder) 발언이 두 그룹으로 나뉘어 균형 잡힌 토론이 이루어졌습니다.',
  },
  {
    id: 'ses-003',
    title: '기후 위기와 세대 간 책임',
    date: '2026-06-03T10:00:00.000Z',
    participantCount: 6,
    summary: '환경 문제 해결의 책임은 누구에게 있는가에 대한 토론.',
    published: true,
    studentNames: ['하윤', '시우', '주원', '서아', '도현', '지호'],
    speechPairs: [
      [0, 1],
      [2, 3],
      [4, 5],
      [1, 2],
      [3, 4],
      [0, 4],
    ],
    photos: [],
    analysisSummary:
      '(placeholder) 여섯 명이 고르게 참여했으며 다양한 연결이 관찰되었습니다.',
  },
]

/** id로 아카이브 세션을 찾는다. */
export function getArchiveSession(id: string): ArchiveSession | undefined {
  return MOCK_ARCHIVE.find((s) => s.id === id)
}
