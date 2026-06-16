/** 백엔드 서버 주소 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'
/** 폴링 간격(ms) */
const POLL_INTERVAL_MS = 1500
/** 최대 대기 시간(ms) — 10분 */
const TIMEOUT_MS = 10 * 60 * 1000

export type AnalysisStage =
  | 'pending'
  | 'extracting'
  | 'transcribing'
  | 'analyzing'
  | 'completed'
  | 'error'

export interface AnalysisStatus {
  jobId: string
  status: AnalysisStage
  progress: number
  message: string
  error: string | null
}

/** 완료 시 서버가 반환하는 결과 (느슨하게 정의) */
export interface AnalysisResult {
  jobId: string
  title: string
  studentNames: string[]
  transcript: {
    utterances: Array<{
      speaker: string
      text: string
      start: number
      end: number
      confidence: number
    }>
    fullTranscript: string
    speakerCount: number
  }
  analysis: unknown
  completedAt: number
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/**
 * 분석 진행 상황을 1.5초 간격으로 폴링한다.
 * - 상태가 갱신될 때마다 onProgress 호출
 * - completed → 결과를 받아 반환
 * - error → 에러 throw
 * - 10분 초과 → 타임아웃 에러
 */
export async function pollAnalysisStatus(
  jobId: string,
  onProgress: (status: AnalysisStatus) => void,
): Promise<AnalysisResult> {
  const deadline = Date.now() + TIMEOUT_MS

  while (Date.now() < deadline) {
    let res: Response
    try {
      res = await fetch(`${API_BASE_URL}/api/analysis/status/${jobId}`)
    } catch {
      throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인하세요.')
    }

    // 작업이 아직 등록되지 않았을 수 있음 → 잠시 후 재시도
    if (res.status === 404) {
      await sleep(POLL_INTERVAL_MS)
      continue
    }
    if (!res.ok) {
      throw new Error(`상태 조회 실패 (HTTP ${res.status})`)
    }

    const status: AnalysisStatus = await res.json()
    onProgress(status)

    if (status.status === 'completed') {
      return fetchResult(jobId)
    }
    if (status.status === 'error') {
      throw new Error(status.error || '분석 중 오류가 발생했습니다.')
    }

    await sleep(POLL_INTERVAL_MS)
  }

  throw new Error('분석 시간이 초과되었습니다. (10분) 잠시 후 다시 시도하세요.')
}

/** 완료된 작업의 결과를 가져온다. */
async function fetchResult(jobId: string): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE_URL}/api/analysis/result/${jobId}`)
  if (!res.ok) {
    throw new Error(`결과 조회 실패 (HTTP ${res.status})`)
  }
  const data: unknown = await res.json()
  if (typeof data === 'object' && data !== null && 'error' in data) {
    throw new Error(String((data as { error: unknown }).error))
  }
  return data as AnalysisResult
}
