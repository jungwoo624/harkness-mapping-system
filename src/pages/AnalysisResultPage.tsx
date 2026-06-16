import { useMemo, useState } from 'react'
import { HarknessTable } from '../components/HarknessTable'
import { createStudents } from '../utils/session'
import { exportToPDF, exportFullReportToPDF } from '../utils/exportPDF'
import type { SpeechRecord, Student } from '../types'
import type { AnalysisResult, Utterance } from '../data/mockAnalysisResult'

interface AnalysisResultPageProps {
  analysisResult: AnalysisResult
  sessionTitle: string
  /** "새 세션 시작" 클릭 시 (영상 분석 초기화) */
  onNewSession?: () => void
}

type SubTab = 'network' | 'transcript' | 'individual' | 'summary'

const TABS: { id: SubTab; label: string }[] = [
  { id: 'network', label: '발언 네트워크 지도' },
  { id: 'transcript', label: '전체 대화 텍스트' },
  { id: 'individual', label: '학생별 개인 리포트' },
  { id: 'summary', label: 'AI 종합 분석' },
]

/** 발언자별 배경색 (화이트 위 은은한 틴트, 최대 12색) */
const SPEAKER_COLORS = [
  'bg-teal-50',
  'bg-violet-50',
  'bg-amber-50',
  'bg-rose-50',
  'bg-sky-50',
  'bg-emerald-50',
  'bg-orange-50',
  'bg-slate-100',
  'bg-cyan-50',
  'bg-fuchsia-50',
  'bg-lime-50',
  'bg-indigo-50',
]

/** ms → "m:ss" */
function msToClock(ms: number): string {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** 초 → "분:초" (예: 132 → "2:12") */
function secondsToText(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * 네트워크 노드 이름 목록을 구성한다.
 * 실제 발언한 화자(utterances) + 명단(studentNames)을 합쳐 누락이 없도록 한다.
 * (명단을 앞에 두어 좌석 순서를 유지하고, 발언만 한 화자도 노드로 포함)
 */
function buildNodeNames(utterances: Utterance[], studentNames: string[]): string[] {
  const roster = studentNames.filter((n) => n && n.trim())
  const spoke = utterances.map((u) => u.speaker)
  return [...new Set([...roster, ...spoke])]
}

/** 이름 목록으로 원형 배치된 Student[] 생성 (name을 id로도 사용) */
function buildStudents(nodeNames: string[]): Student[] {
  const base = createStudents(nodeNames.length)
  return base.map((s, i) => ({ ...s, id: `n${i}`, name: nodeNames[i] }))
}

/**
 * 연속된 utterances에서 화자가 바뀔 때마다
 * 이전 화자 → 다음 화자로 SpeechRecord를 생성한다.
 * (화자 문자열을 노드 id에 직접 매핑하므로 이름 미입력/라벨 불일치에도 동작)
 */
function buildSpeechRecords(utterances: Utterance[], students: Student[]): SpeechRecord[] {
  const idByName = new Map(students.map((s) => [s.name, s.id]))
  const records: SpeechRecord[] = []
  for (let i = 1; i < utterances.length; i += 1) {
    const prev = utterances[i - 1].speaker
    const curr = utterances[i].speaker
    if (prev === curr) continue
    const speakerId = idByName.get(prev)
    const targetId = idByName.get(curr)
    if (!speakerId || !targetId) continue
    records.push({
      id: `u${i}`,
      speakerId,
      targetId,
      timestamp: utterances[i].start,
    })
  }
  return records
}

export function AnalysisResultPage({
  analysisResult,
  sessionTitle,
  onNewSession,
}: AnalysisResultPageProps) {
  const [tab, setTab] = useState<SubTab>('network')
  const [copied, setCopied] = useState(false)
  // PDF 저장 상태: key별 'saving' | 'done'
  const [pdfStatus, setPdfStatus] = useState<Record<string, 'saving' | 'done'>>({})

  const runExport = async (key: string, fn: () => Promise<void>): Promise<void> => {
    setPdfStatus((s) => ({ ...s, [key]: 'saving' }))
    try {
      await fn()
      setPdfStatus((s) => ({ ...s, [key]: 'done' }))
      setTimeout(() => {
        setPdfStatus((s) => {
          const next = { ...s }
          delete next[key]
          return next
        })
      }, 2000)
    } catch (err) {
      console.error('PDF 저장 실패:', err)
      setPdfStatus((s) => {
        const next = { ...s }
        delete next[key]
        return next
      })
      alert('PDF 저장에 실패했습니다.')
    }
  }

  const pdfLabel = (key: string, base: string): string =>
    pdfStatus[key] === 'saving' ? '저장 중...' : pdfStatus[key] === 'done' ? '저장 완료!' : base

  const { utterances, studentNames, individualReports, discussionFlowAnalysis } =
    analysisResult

  const nodeNames = useMemo(
    () => buildNodeNames(utterances, studentNames),
    [utterances, studentNames],
  )
  const students = useMemo(() => buildStudents(nodeNames), [nodeNames])
  const speechRecords = useMemo(
    () => buildSpeechRecords(utterances, students),
    [utterances, students],
  )

  // 화자별 색상 매핑 (실제 등장 화자 기준)
  const colorBySpeaker = useMemo(() => {
    const map = new Map<string, string>()
    nodeNames.forEach((name, i) => {
      map.set(name, SPEAKER_COLORS[i % SPEAKER_COLORS.length])
    })
    return map
  }, [nodeNames])

  // 소외 학생: Claude 결과가 있으면 우선, 없으면 전사에서 직접 도출(명단 중 미발언)
  const spokeSet = useMemo(() => new Set(utterances.map((u) => u.speaker)), [utterances])
  const isolated = useMemo(() => {
    if (discussionFlowAnalysis.isolatedStudents.length > 0) {
      return discussionFlowAnalysis.isolatedStudents
    }
    return studentNames.filter((n) => n && n.trim() && !spokeSet.has(n))
  }, [discussionFlowAnalysis.isolatedStudents, studentNames, spokeSet])

  const handleCopy = async (): Promise<void> => {
    const text = utterances
      .map((u) => `${u.speaker} (${msToClock(u.start)}): ${u.text}`)
      .join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-8">
      <header>
        <p className="text-sm font-medium text-teal-600">분석 결과</p>
        <h1 className="text-2xl font-bold text-slate-900">{sessionTitle}</h1>
      </header>

      {/* 서브 탭 */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
              tab === id
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 탭 1: 발언 네트워크 지도 */}
      {tab === 'network' && (
        <section className="flex flex-col items-center gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <HarknessTable students={students} speechRecords={speechRecords} readOnly />
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700">
              총 발언 수: <b>{utterances.length}</b>회
            </span>
            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700">
              참여 학생 수: <b>{nodeNames.length}</b>명
            </span>
            {isolated.length === 0 ? (
              <span className="rounded-lg bg-teal-50 px-3 py-1.5 font-medium text-teal-600">
                ✓ 소외 학생 없음
              </span>
            ) : (
              <span className="rounded-lg bg-danger/10 px-3 py-1.5 font-medium text-danger">
                ⚠ 소외 학생: {isolated.join(', ')}
              </span>
            )}
          </div>
        </section>
      )}

      {/* 탭 2: 전체 대화 텍스트 */}
      {tab === 'transcript' && (
        <section className="flex flex-col gap-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-200"
            >
              {copied ? '복사됨!' : '전체 텍스트 복사'}
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {utterances.map((u, i) => (
              <li
                key={i}
                className={`rounded-lg px-3 py-2 ${colorBySpeaker.get(u.speaker) ?? 'bg-slate-100'}`}
              >
                <div className="mb-0.5 flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{u.speaker}</span>
                  <span>{msToClock(u.start)}</span>
                </div>
                <p className="text-sm text-slate-900">{u.text}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 탭 3: 학생별 개인 리포트 */}
      {tab === 'individual' && (
        <section className="flex flex-col gap-4">
          {individualReports.map((report) => (
            <article
              key={report.studentName}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-slate-900">{report.studentName}</h3>
                <div className="flex items-center gap-3">
                  <StarRating score={report.participationScore} />
                  <button
                    type="button"
                    disabled={pdfStatus[`s-${report.studentName}`] === 'saving'}
                    onClick={() =>
                      runExport(`s-${report.studentName}`, () =>
                        exportToPDF(report.studentName, report, sessionTitle),
                      )
                    }
                    className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-60"
                  >
                    {pdfLabel(`s-${report.studentName}`, 'PDF 저장')}
                  </button>
                </div>
              </div>

              <div className="mt-2 flex gap-4 text-sm text-slate-600">
                <span>
                  총 발언 <b>{report.totalSpeeches}</b>회
                </span>
                <span>
                  발언 시간 <b>{secondsToText(report.totalDurationSeconds)}</b>
                </span>
              </div>

              {report.keyQuotes.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1 text-xs font-semibold text-slate-500">대표 발언</p>
                  <div className="flex flex-col gap-1">
                    {report.keyQuotes.map((q, i) => (
                      <blockquote
                        key={i}
                        className="border-l-4 border-gray-300 bg-teal-50 px-3 py-1.5 text-sm italic text-slate-700"
                      >
                        “{q}”
                      </blockquote>
                    ))}
                  </div>
                </div>
              )}

              {report.strengths.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1 text-xs font-semibold text-slate-500">잘한 점</p>
                  <div className="flex flex-wrap gap-1.5">
                    {report.strengths.map((s, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-600"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {report.improvements.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1 text-xs font-semibold text-slate-500">성장 포인트</p>
                  <div className="flex flex-wrap gap-1.5">
                    {report.improvements.map((s, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-500"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </section>
      )}

      {/* 탭 4: AI 종합 분석 */}
      {tab === 'summary' && (
        <section className="flex flex-col gap-4">
          <blockquote className="rounded-xl border-l-4 border-gray-400 bg-teal-50 p-5 text-lg font-medium leading-relaxed text-slate-900">
            {analysisResult.overallAnalysis}
          </blockquote>

          <div className="grid gap-3 sm:grid-cols-3">
            <FlowCard label="발언 분포" value={discussionFlowAnalysis.turnTakingQuality || '-'} />
            <FlowCard
              label="주도적 발언자"
              value={discussionFlowAnalysis.dominantSpeaker ?? '없음'}
            />
            <FlowCard
              label="소외 학생"
              value={isolated.length > 0 ? isolated.join(', ') : '없음'}
              tone={isolated.length > 0 ? 'warn' : 'ok'}
            />
          </div>

          {discussionFlowAnalysis.suggestedNextTopics.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-2 text-base font-semibold text-slate-900">
                다음 토론 추천 주제
              </h3>
              <ol className="flex list-inside list-decimal flex-col gap-1.5 text-sm text-slate-700">
                {discussionFlowAnalysis.suggestedNextTopics.map((topic, i) => (
                  <li key={i}>{topic}</li>
                ))}
              </ol>
            </div>
          )}

          <button
            type="button"
            disabled={pdfStatus['full'] === 'saving'}
            onClick={() =>
              runExport('full', () => exportFullReportToPDF(analysisResult, sessionTitle))
            }
            className="self-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 disabled:opacity-60"
          >
            {pdfLabel('full', '전체 리포트 PDF 저장')}
          </button>
        </section>
      )}

      {/* 하단 공통 영역 */}
      <div className="mt-2 flex justify-between gap-3 border-t border-gray-200 pt-5">
        <button
          type="button"
          disabled={pdfStatus['full'] === 'saving'}
          onClick={() =>
            runExport('full', () => exportFullReportToPDF(analysisResult, sessionTitle))
          }
          className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200 disabled:opacity-60"
        >
          {pdfLabel('full', 'PDF로 저장')}
        </button>
        <button
          type="button"
          onClick={onNewSession}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700"
        >
          새 세션 시작
        </button>
      </div>
    </div>
  )
}

/** 10점 만점 점수를 별 5개로 시각화 */
function StarRating({ score }: { score: number }) {
  const filled = Math.round(score / 2)
  return (
    <div className="flex items-center gap-1" title={`참여도 ${score}/10`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < filled ? 'text-amber-500' : 'text-slate-400'}>
          ★
        </span>
      ))}
      <span className="ml-1 text-xs text-slate-400">{score}/10</span>
    </div>
  )
}

interface FlowCardProps {
  label: string
  value: string
  tone?: 'ok' | 'warn'
}

function FlowCard({ label, value, tone }: FlowCardProps) {
  const valueColor =
    tone === 'warn' ? 'text-danger' : tone === 'ok' ? 'text-teal-600' : 'text-slate-900'
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${valueColor}`}>{value}</p>
    </div>
  )
}
