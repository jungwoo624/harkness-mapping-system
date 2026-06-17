import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { HarknessTable } from '../components/HarknessTable'
import { createStudents } from '../utils/session'
import { getArchiveSession } from '../data/mockArchive'
import type { SpeechRecord, Student } from '../types'

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

/** 세션 상세 (회원 전용) */
export function ArchiveDetailPage() {
  const { id } = useParams<{ id: string }>()
  const session = id ? getArchiveSession(id) : undefined

  // 학생(원형 배치) + 발언 기록 구성 (HarknessTable 재사용)
  const { students, speechRecords } = useMemo(() => {
    if (!session) return { students: [] as Student[], speechRecords: [] as SpeechRecord[] }
    const base = createStudents(session.studentNames.length)
    const studs: Student[] = base.map((s, i) => ({
      ...s,
      id: `n${i}`,
      name: session.studentNames[i] ?? s.name,
    }))
    const recs: SpeechRecord[] = session.speechPairs
      .filter(([f, t]) => studs[f] && studs[t])
      .map(([f, t], i) => ({
        id: `a${i}`,
        speakerId: studs[f].id,
        targetId: studs[t].id,
        timestamp: i,
      }))
    return { students: studs, speechRecords: recs }
  }, [session])

  if (!session) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">세션을 찾을 수 없습니다</h1>
        <Link to="/archive" className="mt-4 inline-block text-sm font-semibold text-teal-600">
          ← 아카이브로 돌아가기
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link to="/archive" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
        ← 아카이브
      </Link>

      {/* 헤더 */}
      <header className="mt-4">
        <h1 className="text-3xl font-bold text-slate-900">{session.title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {formatDate(session.date)} · 참여 {session.participantCount}명
        </p>
        <p className="mt-3 text-slate-600">{session.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {session.studentNames.map((n) => (
            <span
              key={n}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
            >
              {n}
            </span>
          ))}
        </div>
      </header>

      {/* 사진 갤러리 */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">사진 갤러리</h2>
        {session.photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {session.photos.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${session.title} 사진 ${i + 1}`}
                className="aspect-video w-full rounded-lg object-cover"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-100 text-xs text-gray-400"
              >
                사진 없음
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 발언 매핑 결과 */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">발언 매핑 결과</h2>
        <div className="flex justify-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <HarknessTable students={students} speechRecords={speechRecords} readOnly />
        </div>
      </section>

      {/* AI 분석 요약 */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">AI 분석 요약</h2>
        <p className="rounded-xl border border-gray-200 bg-slate-50 p-5 leading-relaxed text-slate-700">
          {session.analysisSummary}
        </p>
      </section>
    </main>
  )
}
