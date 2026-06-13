import { useState } from 'react'
import type { SpeechRecord, Student } from '../types'

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
/** 같은 학생 쌍의 중복 연결을 구분하기 위한 곡률 간격(px) */
const CURVE_STEP = 30

// Tailwind 색상을 SVG fill/stroke에 hex로 직접 적용
const TABLE_STROKE = '#d1d5db' // gray-300 (연한 회색)
const SEAT_FILL = '#dbeafe' // blue-100
const SEAT_STROKE = '#60a5fa' // blue-400
const SEAT_SELECTED_STROKE = '#facc15' // yellow-400 (발언자 강조)
const LABEL_FILL = '#1e3a8a' // blue-900
const ARROW_COLOR = '#93c5fd' // blue-300 (연한 파란색)

interface ArrowPath {
  key: string
  d: string
}

/** 두 좌표를 잇는 화살표 경로(d)를 만든다. offset이 0이 아니면 곡선으로 그린다. */
function buildArrowPath(from: Student, to: Student, offset: number): string {
  const dx = to.position.x - from.position.x
  const dy = to.position.y - from.position.y
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len

  // 시작/끝점을 각 학생 원 테두리로 당겨 화살표가 원에 가려지지 않게 한다.
  const sx = from.position.x + ux * SEAT_RADIUS
  const sy = from.position.y + uy * SEAT_RADIUS
  const ex = to.position.x - ux * (SEAT_RADIUS + 4)
  const ey = to.position.y - uy * (SEAT_RADIUS + 4)

  if (offset === 0) {
    return `M ${sx} ${sy} L ${ex} ${ey}`
  }

  // 선분에 수직인 방향으로 제어점을 밀어 곡선을 만든다.
  const px = -uy
  const py = ux
  const cx = (sx + ex) / 2 + px * offset
  const cy = (sy + ey) / 2 + py * offset
  return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`
}

/** 하크니스 원형 테이블 + 학생 좌석 + 발언 화살표를 그리고 클릭 매핑을 처리한다. */
export function HarknessTable({ students }: HarknessTableProps) {
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string | null>(null)
  const [speechRecords, setSpeechRecords] = useState<SpeechRecord[]>([])

  const findStudent = (id: string): Student | undefined =>
    students.find((student) => student.id === id)

  const handleSeatClick = (studentId: string): void => {
    // 1) 발언자 미선택 → 발언자로 선택
    if (selectedSpeakerId === null) {
      setSelectedSpeakerId(studentId)
      return
    }

    // 2) 같은 학생 재클릭 → 선택 취소
    if (selectedSpeakerId === studentId) {
      setSelectedSpeakerId(null)
      return
    }

    // 3) 다른 학생 클릭 → 발언 기록 추가 후 선택 해제
    const now = Date.now()
    const record: SpeechRecord = {
      id: now.toString(),
      speakerId: selectedSpeakerId,
      targetId: studentId,
      timestamp: now,
    }
    setSpeechRecords((prev) => [...prev, record])
    setSelectedSpeakerId(null)
  }

  const selectedStudent =
    selectedSpeakerId !== null ? findStudent(selectedSpeakerId) : undefined

  // 발언 기록 → 화살표 경로. 같은 무순서 쌍이 반복되면 곡률을 달리해 겹치지 않게 한다.
  const pairSeen = new Map<string, number>()
  const arrows: ArrowPath[] = []
  speechRecords.forEach((record, index) => {
    const from = findStudent(record.speakerId)
    const to = record.targetId !== null ? findStudent(record.targetId) : undefined
    if (!from || !to) return

    const pairKey = [record.speakerId, record.targetId].sort().join('::')
    const seen = pairSeen.get(pairKey) ?? 0
    pairSeen.set(pairKey, seen + 1)

    // seen: 0 → 직선, 1 → +30, 2 → -30, 3 → +60, 4 → -60 ...
    const sign = seen % 2 === 0 ? 1 : -1
    const offset = sign * Math.ceil(seen / 2) * CURVE_STEP

    arrows.push({
      key: `${record.id}-${index}`,
      d: buildArrowPath(from, to, offset),
    })
  })

  const statusText = selectedStudent
    ? `${selectedStudent.name}님이 발언 중입니다. 대화 상대를 클릭하세요.`
    : '발언자를 클릭하세요.'

  return (
    <div className="flex flex-col items-center gap-3">
      <p
        className="text-sm font-medium text-slate-700"
        data-testid="status-text"
      >
        {statusText}
      </p>

      <svg
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
        role="img"
        aria-label="하크니스 토론 좌석 배치도"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill={ARROW_COLOR} />
          </marker>
        </defs>

        {/* 중앙 원형 테이블 (테두리만) */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={TABLE_RADIUS}
          fill="none"
          stroke={TABLE_STROKE}
          strokeWidth={2}
        />

        {/* 발언 화살표 (좌석보다 아래 레이어) */}
        {arrows.map((arrow) => (
          <path
            key={arrow.key}
            d={arrow.d}
            fill="none"
            stroke={ARROW_COLOR}
            strokeWidth={2}
            markerEnd="url(#arrowhead)"
          />
        ))}

        {/* 학생 좌석 */}
        {students.map((student) => {
          const isSelected = student.id === selectedSpeakerId
          return (
            <g
              key={student.id}
              onClick={() => handleSeatClick(student.id)}
              style={{ cursor: 'pointer' }}
              data-testid={`seat-${student.id}`}
            >
              <circle
                cx={student.position.x}
                cy={student.position.y}
                r={SEAT_RADIUS}
                fill={SEAT_FILL}
                stroke={isSelected ? SEAT_SELECTED_STROKE : SEAT_STROKE}
                strokeWidth={isSelected ? 3 : 2}
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
          )
        })}
      </svg>

      <p className="text-sm text-slate-500" data-testid="record-count">
        총 발언 기록: {speechRecords.length}건
      </p>
    </div>
  )
}
