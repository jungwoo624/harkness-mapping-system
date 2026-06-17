import { useEffect, useState } from 'react'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

interface Member {
  uid: string
  email: string
  role: string
  membershipTier: string
  createdAt: string
}

const TIER_OPTIONS = ['free', 'basic', 'premium']

function formatDate(value: unknown): string {
  // Firestore Timestamp 또는 ISO 문자열 모두 처리
  let date: Date | null = null
  if (value && typeof value === 'object' && 'toDate' in value) {
    date = (value as { toDate: () => Date }).toDate()
  } else if (typeof value === 'string') {
    date = new Date(value)
  }
  if (!date || Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

/** 회원 관리: Firestore users 목록 표시 + 멤버십 등급 변경 */
export function MemberManager() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingUid, setSavingUid] = useState<string | null>(null)

  useEffect(() => {
    if (!db) {
      setError('Firestore가 설정되지 않았습니다.')
      setLoading(false)
      return
    }
    ;(async () => {
      try {
        const snap = await getDocs(collection(db, 'users'))
        const list: Member[] = snap.docs.map((d) => {
          const data = d.data()
          return {
            uid: d.id,
            email: (data.email as string) ?? '-',
            role: (data.role as string) ?? 'member',
            membershipTier: (data.membershipTier as string) ?? 'free',
            createdAt: formatDate(data.createdAt),
          }
        })
        setMembers(list)
      } catch (err) {
        console.error('[admin] 회원 목록 로드 실패:', err)
        setError('회원 목록을 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const changeTier = async (uid: string, tier: string): Promise<void> => {
    if (!db) return
    setSavingUid(uid)
    try {
      await updateDoc(doc(db, 'users', uid), { membershipTier: tier })
      setMembers((prev) =>
        prev.map((m) => (m.uid === uid ? { ...m, membershipTier: tier } : m)),
      )
    } catch (err) {
      console.error('[admin] 등급 변경 실패:', err)
      alert('등급 변경에 실패했습니다.')
    } finally {
      setSavingUid(null)
    }
  }

  if (loading) return <p className="text-sm text-slate-500">회원 목록을 불러오는 중...</p>
  if (error) return <p className="text-sm text-rose-600">{error}</p>

  return (
    <div>
      <p className="mb-4 text-sm text-slate-500">총 {members.length}명</p>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">이메일</th>
              <th className="px-4 py-3 font-medium">역할</th>
              <th className="px-4 py-3 font-medium">멤버십 등급</th>
              <th className="px-4 py-3 font-medium">가입일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((m) => (
              <tr key={m.uid}>
                <td className="max-w-[220px] truncate px-4 py-3 text-slate-800">{m.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      m.role === 'admin'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {m.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={m.membershipTier}
                    disabled={savingUid === m.uid}
                    onChange={(e) => changeTier(m.uid, e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm text-slate-800 outline-none focus:border-teal-500 disabled:opacity-50"
                  >
                    {TIER_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-slate-500">{m.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
