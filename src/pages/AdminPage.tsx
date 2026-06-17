import { useState } from 'react'
// 기존 기능 재사용: 수동 매핑(SessionPage) / 영상 분석(VideoUploadPage)
import { SessionPage } from './SessionPage'
import { VideoUploadPage } from './VideoUploadPage'
import { AnalysisResultPage } from './AnalysisResultPage'
import { MemberManager } from '../components/MemberManager'
import { mockAnalysisResult } from '../data/mockAnalysisResult'
import type { AnalysisResult } from '../data/mockAnalysisResult'

type AdminMenu = 'manual' | 'video' | 'sessions' | 'members'

const MENUS: { id: AdminMenu; label: string }[] = [
  { id: 'manual', label: '수동 매핑' },
  { id: 'video', label: '영상 분석' },
  { id: 'sessions', label: '세션 관리' },
  { id: 'members', label: '회원 관리' },
]

/** 관리자 대시보드 (관리자 전용). 좌측 사이드바 + 우측 메인. */
export function AdminPage() {
  const [menu, setMenu] = useState<AdminMenu>('manual')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [resultTitle, setResultTitle] = useState('')

  const handleViewResult = (result: AnalysisResult, title: string): void => {
    setAnalysisResult(result)
    setResultTitle(title)
  }

  const handleNewSession = (): void => {
    setAnalysisResult(null)
    setResultTitle('')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">관리자 대시보드</h1>

      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        {/* 좌측 사이드바 */}
        <aside className="shrink-0 md:w-48">
          <nav className="flex gap-2 md:flex-col">
            {MENUS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMenu(id)
                  if (id !== 'video') handleNewSession()
                }}
                className={`rounded-lg px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                  menu === id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* 우측 메인 */}
        <main className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white">
          {menu === 'manual' && <SessionPage />}

          {menu === 'video' &&
            (analysisResult ? (
              <AnalysisResultPage
                analysisResult={analysisResult}
                sessionTitle={resultTitle}
                onNewSession={handleNewSession}
              />
            ) : (
              <VideoUploadPage onViewResult={handleViewResult} />
            ))}

          {menu === 'sessions' && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-slate-900">세션 관리</h2>
              <p className="mt-3 text-sm text-slate-500">
                분석한 세션을 아카이브에 발행하는 기능은 다음 단계에서 구현됩니다.
              </p>
            </div>
          )}

          {menu === 'members' && (
            <div className="p-6">
              <h2 className="mb-4 text-xl font-bold text-slate-900">회원 관리</h2>
              <MemberManager />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
