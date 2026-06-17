import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { HarknessTable } from '../components/HarknessTable'
import { createStudents } from '../utils/session'
import { db } from '../lib/firebase'
import type { SpeechRecord, Student } from '../types'
import type { Utterance } from '../data/mockAnalysisResult'

interface SessionData {
  title: string
  date: string
  summary: string
  participants: string[]
  galleryUrls: string[]
  mappingData?: { utterances: Utterance[] }
  analysisData?: { overallAnalysis?: string }
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

/** 발행된 세션의 화자/발언 기록을 utterances로부터 구성 (HarknessTable 재사용) */
function buildMapping(participants: string[], utterances: Utterance[]) {
  const spoke = utterances.map((u) => u.speaker)
  const names = [...new Set([...participants, ...spoke])]
  const base = createStudents(names.length)
  const students: Student[] = base.map((s, i) => ({ ...s, id: `n${i}`, name: names[i] }))
  const idByName = new Map(students.map((s) => [s.name, s.id]))
  const records: SpeechRecord[] = []
  for (let i = 1; i < utterances.length; i += 1) {
    const a = idByName.get(utterances[i - 1].speaker)
    const b = idByName.get(utterances[i].speaker)
    if (!a || !b || utterances[i - 1].speaker === utterances[i].speaker) continue
    records.push({ id: `u${i}`, speakerId: a, targetId: b, timestamp: utterances[i].start })
  }
  return { students, records }
}

/** 세션 상세 (회원 전용) — Firestore에서 로드 */
export function ArchiveDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db || !id) {
      setLoading(false)
      return
    }
    ;(async () => {
      try {
        const snap = await getDoc(doc(db, 'sessions', id))
        if (snap.exists()) setSession(snap.data() as SessionData)
      } catch (err) {
        console.error('[archive] 상세 로드 실패:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const { students, records } = useMemo(() => {
    if (!session) return { students: [] as Student[], records: [] as SpeechRecord[] }
    return buildMapping(session.participants ?? [], session.mappingData?.utterances ?? [])
  }, [session])

  if (loading) {
    return <main className="mx-auto max-w-3xl px-6 py-24 text-center text-slate-400">불러오는 중...</main>
  }

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

      <header className="mt-4">
        <h1 className="text-3xl font-bold text-slate-900">{session.title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {formatDate(session.date)} · 참여 {session.participants?.length ?? 0}명
        </p>
        {session.summary && <p className="mt-3 text-slate-600">{session.summary}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {(session.participants ?? []).map((n) => (
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
        {session.galleryUrls && session.galleryUrls.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {session.galleryUrls.map((src, i) => (
              <img key={i} src={src} alt={`사진 ${i + 1}`} className="aspect-video w-full rounded-lg object-cover" />
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
          <HarknessTable students={students} speechRecords={records} readOnly />
        </div>
      </section>

      {/* AI 분석 요약 */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">AI 분석 요약</h2>
        <p className="rounded-xl border border-gray-200 bg-slate-50 p-5 leading-relaxed text-slate-700">
          {session.analysisData?.overallAnalysis || '분석 요약이 없습니다.'}
        </p>
      </section>
    </main>
  )
}
