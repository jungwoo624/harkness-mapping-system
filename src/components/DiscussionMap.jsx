import { useState } from 'react';
import Seat from './Seat.jsx';
import { computeSeatPositions } from '../utils/geometry.js';
import { MAP_SIZE } from '../utils/constants.js';

/**
 * 하크니스 매핑 캔버스.
 * - 학생을 원형 테이블 둘레에 배치
 * - 좌석 두 개(학생 A → 학생 B)를 차례로 클릭하면 발언 화살표를 추가
 */
export default function DiscussionMap({ students, links, onAddLink }) {
  const [pendingSpeaker, setPendingSpeaker] = useState(null);
  const positions = computeSeatPositions(students.length, MAP_SIZE);

  const handleSelect = (studentId) => {
    if (pendingSpeaker === null) {
      setPendingSpeaker(studentId);
      return;
    }
    if (pendingSpeaker !== studentId) {
      onAddLink({ from: pendingSpeaker, to: studentId });
    }
    setPendingSpeaker(null);
  };

  const positionOf = (id) => {
    const index = students.findIndex((s) => s.id === id);
    return positions[index];
  };

  return (
    <div
      className="relative rounded-full border border-surface-2 bg-[radial-gradient(circle_at_center,#222a3d_0%,#1a2030_70%)]"
      style={{ width: MAP_SIZE, height: MAP_SIZE }}
    >
      <svg className="pointer-events-none absolute inset-0" width={MAP_SIZE} height={MAP_SIZE}>
        <defs>
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L8,3 L0,6 Z" className="fill-accent" />
          </marker>
        </defs>
        {links.map((link, i) => {
          const a = positionOf(link.from);
          const b = positionOf(link.to);
          if (!a || !b) return null;
          return (
            <line
              key={i}
              x1={a.cx}
              y1={a.cy}
              x2={b.cx}
              y2={b.cy}
              className="stroke-accent opacity-70"
              strokeWidth={2}
              markerEnd="url(#arrow)"
            />
          );
        })}
      </svg>

      {/* 중앙 원형 테이블 */}
      <div className="absolute left-1/2 top-1/2 flex h-2/5 w-2/5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-dashed border-muted bg-surface text-[13px] text-muted">
        토론 테이블
      </div>

      {students.map((student, index) => (
        <Seat
          key={student.id}
          student={student}
          position={positions[index]}
          isActive={pendingSpeaker === student.id}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
