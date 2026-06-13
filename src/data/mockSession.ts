import type { Session } from '../types'

/** 개발/미리보기용 임시 토론 세션 데이터 */
export const mockSession: Session = {
  id: 'demo-1',
  title: '정의란 무엇인가',
  createdAt: '2026-06-14T09:00:00.000Z',
  students: [
    { id: 's1', name: '민준', contributions: 3 },
    { id: 's2', name: '서연', contributions: 5 },
    { id: 's3', name: '도윤', contributions: 2 },
    { id: 's4', name: '하은', contributions: 4 },
  ],
  links: [
    { from: 's1', to: 's2', at: 1 },
    { from: 's2', to: 's3', at: 2 },
    { from: 's4', to: 's1', at: 3 },
  ],
}
