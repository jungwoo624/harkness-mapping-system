import type { Session } from '../types';

/**
 * 테스트용 더미 토론 세션 데이터
 *
 * 학생 6명을 중심점 (250, 250) 기준, 반지름 200px 원 위에
 * 60°씩 균등하게 배치했다. (학생A가 맨 위, 시계 방향 순서)
 */
const mockSession: Session = {
  id: 'session-001',
  title: 'AI 시대의 직업 윤리',
  date: '2026-06-15T00:00:00.000Z',
  durationMinutes: 45,
  speechRecords: [],
  students: [
    // -90° (맨 위)
    { id: 'student-a', name: '학생A', position: { x: 250, y: 50 } },
    // -30°
    { id: 'student-b', name: '학생B', position: { x: 423.21, y: 150 } },
    // 30°
    { id: 'student-c', name: '학생C', position: { x: 423.21, y: 350 } },
    // 90° (맨 아래)
    { id: 'student-d', name: '학생D', position: { x: 250, y: 450 } },
    // 150°
    { id: 'student-e', name: '학생E', position: { x: 76.79, y: 350 } },
    // 210°
    { id: 'student-f', name: '학생F', position: { x: 76.79, y: 150 } },
  ],
};

export default mockSession;
