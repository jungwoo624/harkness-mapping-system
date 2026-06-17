// 마이페이지용 더미 개인 리포트 데이터.
// 실제로는 Firestore "reports" 컬렉션에서 본인 uid의 문서를 불러올 예정.

export interface MyReport {
  id: string
  /** 세션 주제 */
  sessionTitle: string
  /** ISO 날짜 */
  date: string
  /** 참여도 점수 (1~10) */
  participationScore: number
}

export const MOCK_REPORTS: MyReport[] = [
  {
    id: 'rep-001',
    sessionTitle: 'AI 시대의 직업 윤리',
    date: '2026-05-12T10:00:00.000Z',
    participationScore: 6,
  },
  {
    id: 'rep-002',
    sessionTitle: '정의란 무엇인가',
    date: '2026-05-20T10:00:00.000Z',
    participationScore: 7,
  },
  {
    id: 'rep-003',
    sessionTitle: '기후 위기와 세대 간 책임',
    date: '2026-06-03T10:00:00.000Z',
    participationScore: 9,
  },
]
