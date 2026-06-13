import type { Session } from '../types'

/** 개발/미리보기용 임시 토론 세션 데이터 */
export const mockSession: Session = {
  id: 'demo-1',
  title: '정의란 무엇인가',
  date: '2026-06-14T09:00:00.000Z',
  durationMinutes: 45,
  students: [
    { id: 's1', name: '민준', position: { x: 280, y: 40 } },
    { id: 's2', name: '서연', position: { x: 480, y: 280 } },
    { id: 's3', name: '도윤', position: { x: 280, y: 520 } },
    { id: 's4', name: '하은', position: { x: 80, y: 280 } },
  ],
  speechRecords: [
    { id: 'r1', speakerId: 's1', targetId: 's2', timestamp: 1 },
    { id: 'r2', speakerId: 's2', targetId: 's3', timestamp: 2 },
    { id: 'r3', speakerId: 's4', targetId: 's1', timestamp: 3 },
    { id: 'r4', speakerId: 's2', targetId: null, timestamp: 4 },
  ],
}
