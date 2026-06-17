import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'

interface ArchiveCard {
  id: string
  title: string
  date: string
  participantCount: number
  summary: string
  thumbnailUrl: string | null
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

type SortOrder = 'newest' | 'oldest'

/** 세션 아카이브 목록 (회원 전용) — Firestore에서 발행된 세션 로드 */
export function ArchivePage() {
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState<SortOrder>('newest')
  const [cards, setCards] = useState<ArchiveCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db) {
      setLoading(false)
      return
    }
    ;(async () => {
      try {
        const snap = await getDocs(query(collection(db, 'sessions'), where('published', '==', true)))
        const list: ArchiveCard[] = snap.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            title: (data.title as string) ?? '제목 없음',
            date: (data.date as string) ?? '',
            participantCount: Array.isArray(data.participants) ? data.participants.length : 0,
            summary: (data.summary as string) ?? '',
            thumbnailUrl: (data.thumbnailUrl as string) ?? null,
          }
        })
        setCards(list)
      } catch (err) {
        console.error('[archive] 목록 로드 실패:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const sessions = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return cards
      .filter((s) => (kw ? s.title.toLowerCase().includes(kw) : true))
      .sort((a, b) => {
        const diff = new Date(b.date).getTime() - new Date(a.date).getTime()
        return sort === 'newest' ? diff : -diff
      })
  }, [cards, keyword, sort])

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">세션 아카이브</h1>
        <p className="mt-2 text-slate-600">발행된 토론 세션을 다시 살펴보세요.</p>
      </header>

      {/* 검색 / 정렬 */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="주제 키워드 검색"
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOrder)}
          className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-teal-500"
        >
          <option value="newest">최신순</option>
          <option value="oldest">오래된순</option>
        </select>
      </div>

      {loading ? (
        <p className="py-16 text-center text-slate-400">불러오는 중...</p>
      ) : sessions.length === 0 ? (
        <p className="py-16 text-center text-slate-400">발행된 세션이 없습니다.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => (
            <Link
              key={s.id}
              to={`/archive/${s.id}`}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {s.thumbnailUrl ? (
                <img src={s.thumbnailUrl} alt={s.title} className="aspect-video w-full object-cover" />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-gray-100 text-sm text-gray-400">
                  이미지 없음
                </div>
              )}
              <div className="p-5">
                <h3 className="font-semibold text-slate-900 group-hover:text-teal-600">
                  {s.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(s.date)} · 참여 {s.participantCount}명
                </p>
                <p className="mt-3 line-clamp-2 text-sm text-slate-600">{s.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
