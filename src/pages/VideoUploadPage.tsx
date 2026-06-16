import { useEffect, useRef, useState } from 'react'

const MIN_STUDENTS = 3
const MAX_STUDENTS = 12
const DEFAULT_STUDENTS = 6
const MAX_SIZE_BYTES = 500 * 1024 * 1024 // 500MB
const ACCEPTED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']

const STUDENT_OPTIONS = Array.from(
  { length: MAX_STUDENTS - MIN_STUDENTS + 1 },
  (_, i) => MIN_STUDENTS + i,
)

/** 백엔드 주소 (영상 업로드/분석) */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

/** 바이트를 사람이 읽기 쉬운 용량 문자열로 변환한다. */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`
}

/**
 * 영상 분석 탭.
 * Step1(기본 정보) → Step2(영상 업로드) → Step3(분석 시작) 흐름을 제공한다.
 */
export function VideoUploadPage() {
  // Step 1
  const [title, setTitle] = useState('')
  const [studentCount, setStudentCount] = useState(DEFAULT_STUDENTS)
  const [names, setNames] = useState<string[]>(() => Array(DEFAULT_STUDENTS).fill(''))

  // Step 2
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step 3 / 공통
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  // 인원 수가 바뀌면 이름 입력 칸 개수를 맞춘다 (기존 입력은 보존)
  useEffect(() => {
    setNames((prev) => {
      const next = prev.slice(0, studentCount)
      while (next.length < studentCount) next.push('')
      return next
    })
  }, [studentCount])

  // 선택한 파일의 로컬 미리보기 URL 관리
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const isStep1Done = title.trim().length > 0
  const isStep2Done = file !== null
  const canAnalyze = isStep1Done && isStep2Done && !isAnalyzing

  // 진행 단계 갱신
  useEffect(() => {
    if (isStep2Done) setStep(3)
    else if (isStep1Done) setStep(2)
    else setStep(1)
  }, [isStep1Done, isStep2Done])

  const updateName = (index: number, value: string): void => {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)))
  }

  const handleFiles = (files: FileList | null): void => {
    const selected = files?.[0]
    if (!selected) return
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError('지원하지 않는 형식입니다. MP4, MOV, WebM 파일만 업로드할 수 있습니다.')
      return
    }
    if (selected.size > MAX_SIZE_BYTES) {
      setError('파일 용량이 너무 큽니다. 최대 500MB까지 업로드할 수 있습니다.')
      return
    }
    setError(null)
    setResult(null)
    setFile(selected)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleAnalyze = async (): Promise<void> => {
    if (!file) return
    setIsAnalyzing(true)
    setError(null)
    setResult(null)
    try {
      const form = new FormData()
      form.append('video', file)
      form.append('title', title)
      form.append('names', JSON.stringify(names))

      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: form,
      })
      if (!res.ok) {
        const body: unknown = await res.json().catch(() => ({}))
        const detail =
          typeof body === 'object' && body !== null && 'detail' in body
            ? String((body as { detail: unknown }).detail)
            : `서버 오류 (${res.status})`
        throw new Error(detail)
      }
      const data: { transcript?: string } = await res.json()
      setResult(data.transcript?.trim() || '(전사 결과가 비어 있습니다)')
    } catch (err) {
      setError(
        err instanceof Error
          ? `분석에 실패했습니다: ${err.message}`
          : '분석 중 오류가 발생했습니다.',
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">영상으로 토론 분석</h1>
        <p className="mt-1 text-sm text-slate-500">
          토론 영상을 업로드하면 자동으로 전사하고 발언을 분석합니다.
        </p>
      </header>

      {/* Step 1: 기본 정보 */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <StepHeader index={1} label="기본 정보 입력" active={step === 1} done={isStep1Done} />

        <div className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            토론 주제 <span className="text-rose-500">*</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="토론 주제를 입력하세요"
              className="rounded-lg border border-slate-300 px-3 py-2 text-base font-normal text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            참여 학생 수
            <select
              value={studentCount}
              onChange={(e) => setStudentCount(Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-base font-normal text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              {STUDENT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}명
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-600">학생 이름 (선택)</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {names.map((name, i) => (
                <input
                  key={i}
                  type="text"
                  value={name}
                  onChange={(e) => updateName(i, e.target.value)}
                  placeholder="학생 이름을 입력하세요"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Step 2: 영상 업로드 */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <StepHeader index={2} label="영상 업로드" active={step === 2} done={isStep2Done} />

        <div className="mt-4 flex flex-col gap-3">
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-slate-100'
            }`}
          >
            <svg
              className="h-10 w-10 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-sm font-medium text-slate-700">
              영상을 여기에 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-xs text-slate-400">지원 형식: MP4, MOV, WebM (최대 500MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {file && (
            <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-sm">
              <span className="truncate font-medium text-slate-700">{file.name}</span>
              <span className="ml-3 shrink-0 text-slate-500">{formatBytes(file.size)}</span>
            </div>
          )}

          {previewUrl && (
            <video
              src={previewUrl}
              controls
              className="w-full rounded-lg border border-slate-200 bg-black"
            />
          )}
        </div>
      </section>

      {/* Step 3: 분석 시작 */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <StepHeader index={3} label="분석 시작" active={step === 3} done={false} />

        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isAnalyzing ? '분석 중입니다…' : 'AI 분석 시작'}
          </button>
          <p className="text-xs text-slate-400">
            영상 길이에 따라 1~3분 소요됩니다. 분석 중 페이지를 닫지 마세요.
          </p>

          {error && (
            <p className="mt-2 w-full rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}
          {result && (
            <div className="mt-2 w-full rounded-lg bg-emerald-50 px-3 py-2 text-left text-sm text-emerald-800">
              <p className="mb-1 font-semibold">전사 결과</p>
              <p className="whitespace-pre-line">{result}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

interface StepHeaderProps {
  index: number
  label: string
  active: boolean
  done: boolean
}

/** 각 Step 영역 상단의 번호 배지 + 제목. */
function StepHeader({ index, label, active, done }: StepHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          done
            ? 'bg-emerald-500 text-white'
            : active
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-200 text-slate-500'
        }`}
      >
        {done ? '✓' : index}
      </span>
      <h2 className="text-lg font-semibold text-slate-800">
        Step {index}. {label}
      </h2>
    </div>
  )
}
