import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../lib/firebase'
import type { AnalysisResult, IndividualReport, Utterance } from '../data/mockAnalysisResult'

/** Firestore "sessions" 문서에 저장되는 발행 세션 구조 */
export interface PublishedSession {
  id: string
  title: string
  summary: string
  date: string
  participants: string[]
  thumbnailUrl: string | null
  galleryUrls: string[]
  mappingData: { utterances: Utterance[] }
  analysisData: {
    overallAnalysis: string
    discussionFlowAnalysis: AnalysisResult['discussionFlowAnalysis']
  }
  published: boolean
  visibility: 'all' | 'participants'
  createdBy: string
}

export interface PublishInput {
  result: AnalysisResult
  title: string
  summary: string
  visibility: 'all' | 'participants'
  /** 학생 이름 → 회원 이메일 (선택 매칭) */
  studentEmails: Record<string, string>
  thumbnailFile?: File | null
  galleryFiles?: File[]
  createdBy: string
}

/** 파일을 Storage에 올리고 다운로드 URL 반환 */
async function uploadFile(path: string, file: File): Promise<string> {
  if (!storage) throw new Error('Storage가 설정되지 않았습니다.')
  const r = ref(storage, path)
  await uploadBytes(r, file)
  return getDownloadURL(r)
}

/** 이메일로 회원 uid 조회 (없으면 null) */
async function findUidByEmail(email: string): Promise<string | null> {
  if (!db || !email.trim()) return null
  const snap = await getDocs(query(collection(db, 'users'), where('email', '==', email.trim())))
  return snap.empty ? null : snap.docs[0].id
}

/**
 * 분석 완료 세션을 아카이브에 발행한다.
 * - 사진(선택)을 Storage 업로드 → URL
 * - sessions 컬렉션에 세션 문서 생성
 * - 참여 학생별 reports 문서 생성(이메일 매칭 시 uid 연결)
 * @returns 생성된 세션 id
 */
export async function publishSession(input: PublishInput): Promise<string> {
  if (!db) throw new Error('Firestore가 설정되지 않았습니다.')

  const { result } = input
  const sessionRef = doc(collection(db, 'sessions'))
  const sessionId = sessionRef.id

  // 1) 사진 업로드 (선택)
  let thumbnailUrl: string | null = null
  if (input.thumbnailFile) {
    thumbnailUrl = await uploadFile(`sessions/${sessionId}/thumb_${input.thumbnailFile.name}`, input.thumbnailFile)
  }
  const galleryUrls: string[] = []
  for (const [i, file] of (input.galleryFiles ?? []).entries()) {
    const url = await uploadFile(`sessions/${sessionId}/gallery_${i}_${file.name}`, file)
    galleryUrls.push(url)
  }

  // 2) 세션 문서
  const sessionDoc: Omit<PublishedSession, 'id'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    title: input.title,
    summary: input.summary,
    date: new Date().toISOString(),
    participants: result.studentNames,
    thumbnailUrl,
    galleryUrls,
    mappingData: { utterances: result.utterances },
    analysisData: {
      overallAnalysis: result.overallAnalysis,
      discussionFlowAnalysis: result.discussionFlowAnalysis,
    },
    published: true,
    visibility: input.visibility,
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
  }
  await setDoc(sessionRef, sessionDoc)

  // 3) 학생별 개인 리포트
  for (const report of result.individualReports as IndividualReport[]) {
    const email = input.studentEmails[report.studentName] ?? ''
    const uid = await findUidByEmail(email)
    await addDoc(collection(db, 'reports'), {
      uid, // 매칭 안 되면 null
      studentName: report.studentName,
      sessionId,
      sessionTitle: input.title,
      date: sessionDoc.date,
      participationScore: report.participationScore,
      report,
      createdAt: serverTimestamp(),
    })
  }

  return sessionId
}
