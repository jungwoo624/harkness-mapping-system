import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { publishSession } from '../utils/publishSession'
import type { AnalysisResult } from '../data/mockAnalysisResult'

interface PublishModalProps {
  result: AnalysisResult
  sessionTitle: string
  onClose: () => void
}

/** 분석 세션을 아카이브에 발행하는 폼 모달 */
export function PublishModal({ result, sessionTitle, onClose }: PublishModalProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState(sessionTitle)
  const [summary, setSummary] = useState('')
  const [visibility, setVisibility] = useState<'all' | 'participants'>('all')
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [gallery, setGallery] = useState<File[]>([])
  const [emails, setEmails] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500'

  const handlePublish = async (): Promise<void> => {
    if (!title.trim()) {
      setError('공개용 제목을 입력하세요.')
      return
    }
    if (!user) {
      setError('관리자 로그인이 필요합니다.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await publishSession({
        result,
        title: title.trim(),
        summary: summary.trim(),
        visibility,
        studentEmails: emails,
        thumbnailFile: thumbnail,
        galleryFiles: gallery,
        createdBy: user.uid,
      })
      setDone(true)
    } catch (err) {
      console.error('[publish] 실패:', err)
      setError(err instanceof Error ? err.message : '발행에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        {done ? (
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900">발행 완료!</h2>
            <p className="mt-3 text-sm text-slate-600">
              세션이 회원 아카이브에 발행되었습니다.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
            >
              닫기
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">아카이브에 발행</h2>
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                공개용 세션 제목
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                  placeholder="아카이브에 표시될 제목"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                한 줄 요약
                <input
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className={inputClass}
                  placeholder="카드에 표시될 한 줄 소개"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                대표 사진 (선택)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
                  className="text-sm text-slate-600"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                사진 갤러리 (여러 장, 선택)
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setGallery(Array.from(e.target.files ?? []))}
                  className="text-sm text-slate-600"
                />
              </label>

              <div className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                공개 범위
                <div className="flex gap-4 text-sm font-normal text-slate-700">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      checked={visibility === 'all'}
                      onChange={() => setVisibility('all')}
                    />
                    전체 회원
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      checked={visibility === 'participants'}
                      onChange={() => setVisibility('participants')}
                    />
                    참여자만
                  </label>
                </div>
              </div>

              {/* 학생-회원 매칭 (선택) */}
              <div className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                참여 학생 계정 매칭 (선택)
                <p className="text-xs font-normal text-slate-400">
                  이메일을 입력하면 해당 회원의 개인 리포트로 연결됩니다.
                </p>
                {result.studentNames.map((name) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="w-16 shrink-0 text-sm font-normal text-slate-700">{name}</span>
                    <input
                      type="email"
                      value={emails[name] ?? ''}
                      onChange={(e) =>
                        setEmails((prev) => ({ ...prev, [name]: e.target.value }))
                      }
                      placeholder="회원 이메일 (선택)"
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>

              {error && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
              )}

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-gray-400"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={submitting}
                  className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
                >
                  {submitting ? '발행 중...' : '발행하기'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
