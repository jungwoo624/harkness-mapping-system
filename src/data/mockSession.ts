import type { Session } from '../types'

/**
 * 테스트용 더미 토론 세션.
 *
 * 학생 6명을 중심 (250, 250), 반지름 200px 원 위에 60°씩 균등 배치한다.
 * 좌표는 x = 250 + 200·cosθ, y = 250 + 200·sinθ 로 직접 계산한 값이며
 * 12시 방향(-90°)에서 시작해 시계 방향으로 배치했다. (200·cos30° ≈ 173.21)
 */
const mockSession: Session = {
  id: 'mock-session-1',
  title: 'AI 시대의 직업 윤리',
  date: '2026-06-14T00:00:00.000Z',
  durationMinutes: 45,
  students: [
    { id: 's1', name: '학생A', position: { x: 250, y: 50 } },
    { id: 's2', name: '학생B', position: { x: 423.21, y: 150 } },
    { id: 's3', name: '학생C', position: { x: 423.21, y: 350 } },
    { id: 's4', name: '학생D', position: { x: 250, y: 450 } },
    { id: 's5', name: '학생E', position: { x: 76.79, y: 350 } },
    { id: 's6', name: '학생F', position: { x: 76.79, y: 150 } },
  ],
  speechRecords: [],
}

export default mockSession
