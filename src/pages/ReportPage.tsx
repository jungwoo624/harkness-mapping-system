import { useEffect, useState } from 'react'
import { SessionReport } from '../components/SessionReport'
import type { Session } from '../types'
import { generateAIComment } from '../utils/generateAIComment'

interface ReportPageProps {
  session: Session
}

/** 세션 리포트 화면. AI 분석 코멘트 + 참여 통계 리포트를 함께 보여준다. */
export function ReportPage({ session }: ReportPageProps) {
  const [comment, setComment] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)

    generateAIComment(session)
      .then((result) => {
        if (!active) return
        setComment(result)
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setComment('코멘트를 생성하지 못했습니다.')
        setLoading(false)
      })

    // 언마운트/세션 변경 시 이전 결과 반영 방지
    return () => {
      active = false
    }
  }, [session])

  return (
    <div className="space-y-6">
      <section
        className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-left"
        data-testid="ai-comment"
      >
        <h2 className="mb-2 text-lg font-bold text-indigo-900">AI 분석 코멘트</h2>
        {loading ? (
          <p className="text-sm text-indigo-700" data-testid="ai-loading">
            분석 중입니다...
          </p>
        ) : (
          <p
            className="whitespace-pre-line text-sm leading-relaxed text-indigo-900"
            data-testid="ai-comment-text"
          >
            {comment}
          </p>
        )}
      </section>

      <SessionReport session={session} />
    </div>
  )
}
