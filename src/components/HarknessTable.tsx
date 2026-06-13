import type { Student } from '../types'

interface HarknessTableProps {
  /** 원형 테이블 둘레에 배치할 학생 목록 */
  students: Student[]
}

const CANVAS_SIZE = 500
const CENTER = 250
const TABLE_RADIUS = 150
const SEAT_RADIUS = 30
/** 학생 원 중심에서 이름표 baseline까지의 수직 거리(px) */
const LABEL_OFFSET = 45

// Tailwind 색상을 SVG fill/stroke에 hex로 직접 적용
const TABLE_STROKE = '#d1d5db' // gray-300 (연한 회색)
const SEAT_FILL = '#dbeafe' // blue-100
const SEAT_STROKE = '#60a5fa' // blue-400
const LABEL_FILL = '#1e3a8a' // blue-900

/** 하크니스 원형 테이블과 학생 좌석을 SVG로 그린다. */
export function HarknessTable({ students }: HarknessTableProps) {
  return (
    <svg
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
      role="img"
      aria-label="하크니스 토론 좌석 배치도"
    >
      {/* 중앙 원형 테이블 (테두리만) */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={TABLE_RADIUS}
        fill="none"
        stroke={TABLE_STROKE}
        strokeWidth={2}
      />

      {/* 학생 좌석 */}
      {students.map((student) => (
        <g key={student.id}>
          <circle
            cx={student.position.x}
            cy={student.position.y}
            r={SEAT_RADIUS}
            fill={SEAT_FILL}
            stroke={SEAT_STROKE}
            strokeWidth={2}
          />
          <text
            x={student.position.x}
            y={student.position.y + LABEL_OFFSET}
            textAnchor="middle"
            fontSize={14}
            fill={LABEL_FILL}
          >
            {student.name}
          </text>
        </g>
      ))}
    </svg>
  )
}
