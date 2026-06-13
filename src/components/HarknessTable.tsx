import { useState } from 'react'
import type { SpeechRecord, Student } from '../types'

interface HarknessTableProps {
  /** 원형 테이블 둘레에 배치할 학생 목록 */
  students: Student[]
}

const CANVAS_WIDTH = 500
// 반지름이 커지면 하단 학생 이름표가 500을 넘으므로 세로 여백을 더 둔다.
const CANVAS_HEIGHT = 530
const CENTER = 250
const TABLE_RADIUS = 150
const BASE_SEAT_RADIUS = 30
const MAX_SEAT_RADIUS = 50
/** 발언 1회당 늘어나는 반지름(px) */
const RADIUS_PER_SPEECH = 3
/** 원 아래 이름표까지의 여백(px) */
const LABEL_GAP = 16
/** 같은 학생 쌍의 중복 연결을 구분하기 위한 곡률 간격(px) */
const CURVE_STEP = 30

// Tailwind 색상을 SVG fill/stroke에 hex로 직접 적용
const TABLE_STROKE = '#d1d5db' // gray-300 (연한 회색)
const SEAT_STROKE = '#60a5fa' // blue-400
const SEAT_SELECTED_STROKE = '#facc15' // yellow-400 (발언자 강조)
const LABEL_DARK = '#1e3a8a' // blue-900
const LABEL_WHITE = '#ffffff'
const ARROW_COLOR = '#93c5fd' // blue-300 (연한 파란색)

// 발언 횟수 구간별 좌석 색상
const COLOR_NONE = '#e5e7eb' // 0회: 회색
const COLOR_LOW = '#bfdbfe' // 1-2회: 연한 파랑
const COLOR_MID = '#60a5fa' // 3-5회: 중간 파랑
const COLOR_HIGH = '#2563eb' // 6회+: 진한 파랑

/** 특정 학생이 발언자인 기록 수(= 총 발언 횟수)를 센다. */
function countSpeeches(records: SpeechRecord[], studentId: string): number {
  return records.filter((record) => record.speakerId === studentId).length
}

/** 발언 횟수에 따른 좌석 반지름(기본 30 + 3/회, 최대 50). */
function seatRadius(count: number): number {
  return Math.min(BASE_SEAT_RADIUS + count * RADIUS_PER_SPEECH, MAX_SEAT_RADIUS)
}

/** 발언 횟수 구간별 좌석 채움 색. */
function seatFill(count: number): string {
  if (count >= 6) return COLOR_HIGH
  if (count >= 3) return COLOR_MID
  if (count >= 1) return COLOR_LOW
  return COLOR_NONE
}

/** 6회 이상이면 진한 배경이라 이름표를 흰색으로. */
function isHighCount(count: number): boolean {
  return count >= 6
}

interface ArrowPath {
  key: string
  d: string
}

/** 두 좌표를 잇는 화살표 경로(d)를 만든다. offset이 0이 아니면 곡선으로 그린다. */
function buildArrowPath(
  from: Student,
  to: Student,
  offset: number,
  fromRadius: number,
  toRadius: number,
): string {
  const dx = to.position.x - from.position.x
  const dy = to.position.y - from.position.y
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len

  // 시작/끝점을 각 학생 원 테두리(가변 반지름)로 당겨 화살표가 원에 가려지지 않게 한다.
  const sx = from.position.x + ux * fromRadius
  const sy = from.position.y + uy * fromRadius
  const ex = to.position.x - ux * (toRadius + 4)
  const ey = to.position.y - uy * (toRadius + 4)

  if (offset === 0) {
    return `M ${sx} ${sy} L ${ex} ${ey}`
  }

  const px = -uy
  const py = ux
  const cx = (sx + ex) / 2 + px * offset
  const cy = (sy + ey) / 2 + py * offset
  return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`
}

/** 하크니스 원형 테이블 + 학생 좌석 + 발언 화살표. 발언 횟수에 따라 좌석 크기/색이 변한다. */
export function HarknessTable({ students }: HarknessTableProps) {
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string | null>(null)
  const [speechRecords, setSpeechRecords] = useState<SpeechRecord[]>([])

  const findStudent = (id: string): Student | undefined =>
    students.find((student) => student.id === id)

  const handleSeatClick = (studentId: string): void => {
    if (selectedSpeakerId === null) {
      setSelectedSpeakerId(studentId)
      return
    }
    if (selectedSpeakerId === studentId) {
      setSelectedSpeakerId(null)
      return
    }
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

  // ⚠️ 임시(TEMP): 다음 단계에서 제거할 테스트용 버튼 핸들러.
  // 랜덤한 서로 다른 두 학생 사이의 발언 기록을 추가한다.
  const addRandomSpeech = (): void => {
    if (students.length < 2) return
    const speakerIndex = Math.floor(Math.random() * students.length)
    let targetIndex = Math.floor(Math.random() * students.length)
    while (targetIndex === speakerIndex) {
      targetIndex = Math.floor(Math.random() * students.length)
    }
    const now = Date.now()
    setSpeechRecords((prev) => [
      ...prev,
      {
        id: `${now}-${prev.length}`,
        speakerId: students[speakerIndex].id,
        targetId: students[targetIndex].id,
        timestamp: now,
      },
    ])
  }

  const selectedStudent =
    selectedSpeakerId !== null ? findStudent(selectedSpeakerId) : undefined

  // 발언 기록 → 화살표 경로 (가변 반지름 반영, 같은 쌍은 곡률로 구분)
  const pairSeen = new Map<string, number>()
  const arrows: ArrowPath[] = []
  speechRecords.forEach((record, index) => {
    const from = findStudent(record.speakerId)
    const to = record.targetId !== null ? findStudent(record.targetId) : undefined
    if (!from || !to) return

    const pairKey = [record.speakerId, record.targetId].sort().join('::')
    const seen = pairSeen.get(pairKey) ?? 0
    pairSeen.set(pairKey, seen + 1)

    const sign = seen % 2 === 0 ? 1 : -1
    const offset = sign * Math.ceil(seen / 2) * CURVE_STEP

    arrows.push({
      key: `${record.id}-${index}`,
      d: buildArrowPath(
        from,
        to,
        offset,
        seatRadius(countSpeeches(speechRecords, from.id)),
        seatRadius(countSpeeches(speechRecords, to.id)),
      ),
    })
  })

  const statusText = selectedStudent
    ? `${selectedStudent.name}님이 발언 중입니다. 대화 상대를 클릭하세요.`
    : '발언자를 클릭하세요.'

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-medium text-slate-700" data-testid="status-text">
        {statusText}
      </p>

      {/* ⚠️ 임시(TEMP) 버튼: 발언 횟수에 따른 크기/색 변화 확인용. 다음 단계에서 제거 예정. */}
      <button
        type="button"
        onClick={addRandomSpeech}
        data-testid="add-random-speech"
        className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-amber-600"
      >
        🧪 테스트용 발언 추가
      </button>

      <svg
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
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
          const count = countSpeeches(speechRecords, student.id)
          const radius = seatRadius(count)
          const isSelected = student.id === selectedSpeakerId
          const high = isHighCount(count)
          // 원 크기가 변해도 이름표가 겹치지 않도록 반지름 기준으로 아래에 배치
          const labelY = student.position.y + radius + LABEL_GAP
          // 흰 글씨는 밝은 캔버스에서 안 보이므로 진한 배경 알약을 깐다.
          const pillWidth = student.name.length * 13 + 14

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
                r={radius}
                fill={seatFill(count)}
                stroke={isSelected ? SEAT_SELECTED_STROKE : SEAT_STROKE}
                strokeWidth={isSelected ? 3 : 2}
              />
              {high && (
                <rect
                  x={student.position.x - pillWidth / 2}
                  y={labelY - 14}
                  width={pillWidth}
                  height={19}
                  rx={5}
                  fill={LABEL_DARK}
                />
              )}
              <text
                x={student.position.x}
                y={labelY}
                textAnchor="middle"
                fontSize={14}
                fill={high ? LABEL_WHITE : LABEL_DARK}
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
