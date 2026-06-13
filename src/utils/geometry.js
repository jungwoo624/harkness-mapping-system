import { SEAT_SIZE } from './constants.js';

/**
 * 학생을 원형으로 배치하기 위한 좌석 좌표를 계산한다.
 * @param {number} count   학생 수
 * @param {number} mapSize 캔버스 한 변의 길이(px)
 * @returns {Array<{x:number,y:number,cx:number,cy:number}>}
 *          x,y = 좌석 버튼 좌상단 / cx,cy = 좌석 중심(선 연결용)
 */
export function computeSeatPositions(count, mapSize) {
  if (count === 0) return [];

  const center = mapSize / 2;
  const radius = mapSize / 2 - SEAT_SIZE;

  return Array.from({ length: count }, (_, i) => {
    // 12시 방향에서 시작해 시계 방향으로 균등 분배
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
    const cx = center + radius * Math.cos(angle);
    const cy = center + radius * Math.sin(angle);
    return {
      cx,
      cy,
      x: cx - SEAT_SIZE / 2,
      y: cy - SEAT_SIZE / 2,
    };
  });
}
