import { Link } from 'react-router-dom'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { MOCK_REPORTS } from '../data/mockReports'

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

/** 멤버십 등급 코드 → 한국어 라벨 */
function tierLabel(tier: string | null): string {
  switch (tier) {
    case 'free':
      return '체험 (무료)'
    case 'basic':
      return '기본'
    case 'premium':
      return '프리미엄'
    default:
      return '-'
  }
}

/** 마이페이지 (회원 전용) */
export function MyPage() {
  const { user, membershipTier } = useAuth()

  // 본인 리포트 (실제로는 Firestore reports 컬렉션에서 uid로 조회)
  const reports = [...MOCK_REPORTS].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  // 성장 곡선 데이터
  const chartData = reports.map((r, i) => ({
    name: `${i + 1}회`,
    score: r.participationScore,
  }))

  const joinedAt = user?.metadata?.creationTime
    ? formatDate(new Date(user.metadata.creationTime).toISOString())
    : '-'

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900">마이페이지</h1>

      {/* 1. 사용자 정보 */}
      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-slate-500">이메일</dt>
            <dd className="mt-1 truncate font-medium text-slate-900">{user?.email ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">멤버십 등급</dt>
            <dd className="mt-1 font-medium text-teal-600">{tierLabel(membershipTier)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">가입일</dt>
            <dd className="mt-1 font-medium text-slate-900">{joinedAt}</dd>
          </div>
        </dl>
      </section>

      {/* 2. 내 토론 리포트 */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">내 토론 리포트</h2>
        {reports.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">아직 참여한 세션이 없습니다.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div>
                  <h3 className="font-semibold text-slate-900">{r.sessionTitle}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(r.date)} · 참여도 {r.participationScore}/10
                  </p>
                </div>
                <Link
                  to="/archive"
                  className="shrink-0 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-gray-400"
                >
                  리포트 보기
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. 나의 성장 곡선 */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">나의 성장 곡선</h2>
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {chartData.length <= 1 ? (
            <p className="py-12 text-center text-sm text-slate-400">
              세션을 더 진행하면 성장 곡선이 표시됩니다.
            </p>
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="참여도"
                    stroke="#0d9488"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#0d9488' }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {/* 4. 멤버십 관리 */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">멤버십 관리</h2>
        <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-medium text-slate-500">현재 등급</p>
            <p className="mt-1 text-lg font-bold text-teal-600">{tierLabel(membershipTier)}</p>
          </div>
          <Link
            to="/pricing"
            className="shrink-0 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            등급 변경
          </Link>
        </div>
      </section>
    </main>
  )
}
