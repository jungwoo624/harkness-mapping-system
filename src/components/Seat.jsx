import { SEAT_SIZE } from '../utils/constants.js';

/**
 * 토론 테이블 둘레에 배치되는 학생 좌석 아이콘(이름표 포함).
 * 클릭 시 발언 매핑 동작을 부모로 위임한다.
 */
export default function Seat({ student, position, isActive, onSelect }) {
  const { x, y } = position;

  return (
    <button
      type="button"
      onClick={() => onSelect(student.id)}
      title={student.name}
      style={{ left: `${x}px`, top: `${y}px`, width: SEAT_SIZE, height: SEAT_SIZE }}
      className={[
        'absolute flex flex-col items-center justify-center gap-0.5 rounded-full border-2 bg-surface text-[#e8ecf4] transition',
        'hover:scale-105 hover:border-accent',
        isActive
          ? 'border-accent ring-4 ring-accent/30 scale-105'
          : 'border-surface-2',
      ].join(' ')}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-base font-bold">
        {student.name.charAt(0)}
      </span>
      <span className="max-w-[58px] truncate text-[10px] leading-none">{student.name}</span>
      <span className="text-[9px] text-muted">{student.contributions ?? 0}</span>
    </button>
  );
}
