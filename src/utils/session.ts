import type { Student } from '../types'

const CANVAS_CENTER = 250
const SEAT_RING_RADIUS = 180

const round2 = (value: number): number => Math.round(value * 100) / 100

/**
 * 주어진 인원 수만큼 학생을 생성하고 원형(중심 250,250 / 반지름 180)으로
 * 균등 배치한다. 이름은 "학생1", "학생2"... 로 자동 생성하며 추후 수정 가능하다.
 */
export function createStudents(count: number): Student[] {
  return Array.from({ length: count }, (_, index) => {
    // 12시 방향(-90°)에서 시작해 시계 방향으로 균등 분배
    const angle = (index / count) * 2 * Math.PI - Math.PI / 2
    return {
      id: `s${index + 1}`,
      name: `학생${index + 1}`,
      position: {
        x: round2(CANVAS_CENTER + SEAT_RING_RADIUS * Math.cos(angle)),
        y: round2(CANVAS_CENTER + SEAT_RING_RADIUS * Math.sin(angle)),
      },
    }
  })
}

/** 시작/종료 시각(ms)으로 진행 시간을 분 단위로 계산한다. */
export function durationInMinutes(startedAt: number, endedAt: number): number {
  return Math.max(0, Math.round((endedAt - startedAt) / 60000))
}
