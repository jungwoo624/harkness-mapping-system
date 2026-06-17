import { useState } from 'react'
// 기존 기능을 관리자 화면으로 이동: 수동 매핑(SessionPage) / 영상 분석(VideoUploadPage)
import { SessionPage } from './SessionPage'
import { VideoUploadPage } from './VideoUploadPage'
import { AnalysisResultPage } from './AnalysisResultPage'
import { mockAnalysisResult } from '../data/mockAnalysisResult'
import type { AnalysisResult } from '../data/mockAnalysisResult'

type AdminTab = 'manual' | 'video' | 'result'

const TABS: { id: AdminTab; label: string }[] = [
  { id: 'manual', label: '수동 매핑' },
  { id: 'video', label: '영상 분석' },
  { id: 'result', label: '결과' },
]

/**
 * 관리자 화면. 기존 탭 전환 기능(수동 매핑 / 영상 분석 / 결과)을 이곳에 모았다.
 */
export function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('video')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [resultTitle, setResultTitle] = useState('')

  const handleViewResult = (result: AnalysisResult, title: string): void => {
    setAnalysisResult(result)
    setResultTitle(title)
    setTab('result')
  }

  const handleNewSession = (): void => {
    setAnalysisResult(null)
    setResultTitle('')
    setTab('video')
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 pt-8">
        <h1 className="text-2xl font-bold text-slate-900">관리자 · 토론 분석</h1>
        <nav className="mt-4 flex gap-2 border-b border-gray-200">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`-mb-px border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
                tab === id
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'manual' && <SessionPage />}
      {tab === 'video' && <VideoUploadPage onViewResult={handleViewResult} />}
      {tab === 'result' && (
        <AnalysisResultPage
          analysisResult={analysisResult ?? mockAnalysisResult}
          sessionTitle={
            analysisResult ? resultTitle : '예시 결과 (영상 분석 전 미리보기)'
          }
          onNewSession={handleNewSession}
        />
      )}
    </div>
  )
}
