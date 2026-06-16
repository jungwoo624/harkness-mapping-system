/** 백엔드 서버 주소 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

interface UploadMetadata {
  title: string
  studentNames: string[]
}

/**
 * 영상 파일을 백엔드(/api/upload)로 전송하고 jobId를 반환한다.
 * @param file 업로드할 영상/음성 파일
 * @param metadata 토론 주제와 학생 이름 목록
 * @returns 서버가 발급한 jobId
 * @throws 업로드 실패 시 구체적인 에러 메시지
 */
export async function uploadVideo(file: File, metadata: UploadMetadata): Promise<string> {
  const form = new FormData()
  form.append('video', file)
  form.append('metadata', JSON.stringify(metadata))

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: form,
    })
  } catch {
    throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인하세요.')
  }

  if (!response.ok) {
    let message = `업로드에 실패했습니다. (HTTP ${response.status})`
    try {
      const body: unknown = await response.json()
      if (
        typeof body === 'object' &&
        body !== null &&
        'error' in body &&
        typeof (body as { error: unknown }).error === 'string'
      ) {
        message = (body as { error: string }).error
      }
    } catch {
      // 응답 본문 파싱 실패 시 기본 메시지 사용
    }
    throw new Error(message)
  }

  const data: { jobId?: string } = await response.json()
  if (!data.jobId) {
    throw new Error('서버 응답에 jobId가 없습니다.')
  }
  return data.jobId
}
