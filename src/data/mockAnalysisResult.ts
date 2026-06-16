// 영상 분석 결과 화면(AnalysisResultPage)용 타입 + 목 데이터.
// server/utils/claude.js 의 analyzeHarknessDiscussion 반환 구조에
// 네트워크/대화 탭에 필요한 utterances·studentNames를 더한 형태.

export interface Utterance {
  speaker: string
  text: string
  start: number // ms
  end: number // ms
  confidence?: number
}

export interface SpeakerMapping {
  originalLabel: string
  studentName: string
}

export interface IndividualReport {
  studentName: string
  totalSpeeches: number
  totalDurationSeconds: number
  keyQuotes: string[]
  strengths: string[]
  improvements: string[]
  participationScore: number // 1~10
}

export interface DiscussionFlowAnalysis {
  dominantSpeaker: string | null
  isolatedStudents: string[]
  turnTakingQuality: string // "균형" | "일부 독점" | "심한 독점"
  suggestedNextTopics: string[]
}

export interface AnalysisResult {
  overallAnalysis: string
  speakerMapping: SpeakerMapping[]
  individualReports: IndividualReport[]
  discussionFlowAnalysis: DiscussionFlowAnalysis
  /** 네트워크 지도·대화 텍스트 탭에서 사용 */
  utterances: Utterance[]
  /** 참여 학생 이름 목록 */
  studentNames: string[]
}

export const mockAnalysisResult: AnalysisResult = {
  studentNames: ['지민', '서연', '도윤', '하준'],
  overallAnalysis:
    '전반적으로 활발하고 깊이 있는 토론이었습니다. 지민 학생이 논의를 주도하며 ' +
    '핵심 쟁점을 제시했고, 서연 학생은 상대의 주장을 경청하고 되짚는 태도가 돋보였습니다. ' +
    '다만 하준 학생의 참여가 적어, 다음에는 모든 학생이 고르게 발언할 수 있는 ' +
    '진행이 필요해 보입니다.',
  speakerMapping: [
    { originalLabel: 'A', studentName: '지민' },
    { originalLabel: 'B', studentName: '서연' },
    { originalLabel: 'C', studentName: '도윤' },
    { originalLabel: 'D', studentName: '하준' },
  ],
  individualReports: [
    {
      studentName: '지민',
      totalSpeeches: 5,
      totalDurationSeconds: 132,
      keyQuotes: [
        'AI가 창의성을 흉내 낼 수는 있어도, 의도를 가지는 건 다르다고 생각해요.',
        '결국 판단의 책임은 사람에게 있다고 봐요.',
      ],
      strengths: ['논점을 명확히 제시함', '근거를 들어 주장을 전개함'],
      improvements: ['다른 학생의 말을 더 끌어내면 좋을 것 같아요'],
      participationScore: 9,
    },
    {
      studentName: '서연',
      totalSpeeches: 4,
      totalDurationSeconds: 98,
      keyQuotes: ['공감 능력은 인간만의 영역 아닐까요?'],
      strengths: ['상대 주장을 경청하고 되짚음', '질문으로 논의를 확장함'],
      improvements: ['자신의 결론을 더 분명히 말해보면 좋겠어요'],
      participationScore: 7,
    },
    {
      studentName: '도윤',
      totalSpeeches: 3,
      totalDurationSeconds: 64,
      keyQuotes: ['저는 윤리적 직관이 핵심이라고 생각합니다.'],
      strengths: ['새로운 관점을 제시함'],
      improvements: ['발언 빈도를 조금 더 높이면 좋겠어요'],
      participationScore: 6,
    },
    {
      studentName: '하준',
      totalSpeeches: 0,
      totalDurationSeconds: 0,
      keyQuotes: [],
      strengths: [],
      improvements: ['먼저 짧게라도 의견을 내보는 연습을 해보면 좋겠어요'],
      participationScore: 2,
    },
  ],
  discussionFlowAnalysis: {
    dominantSpeaker: '지민',
    isolatedStudents: ['하준'],
    turnTakingQuality: '일부 독점',
    suggestedNextTopics: [
      'AI의 판단에 대한 책임은 누구에게 있는가',
      '공감은 학습될 수 있는 능력인가',
      '인간 고유의 역량은 앞으로도 유지될 수 있는가',
    ],
  },
  utterances: [
    { speaker: '지민', text: 'AI가 창의성도 흉내 낼 수 있다고 생각해요.', start: 1000, end: 6000 },
    { speaker: '서연', text: '하지만 공감 능력은 인간만의 영역 아닐까요?', start: 6500, end: 12000 },
    { speaker: '지민', text: '공감도 데이터로 학습할 수 있지 않을까요?', start: 12500, end: 18000 },
    { speaker: '도윤', text: '저는 윤리적 직관이 핵심이라고 생각합니다.', start: 18500, end: 24000 },
    { speaker: '서연', text: '직관이라는 관점은 흥미롭네요. 예를 들면요?', start: 24500, end: 30000 },
    { speaker: '도윤', text: '위급한 상황에서 빠르게 옳고 그름을 느끼는 거요.', start: 30500, end: 37000 },
    { speaker: '지민', text: '결국 판단의 책임은 사람에게 있다고 봐요.', start: 37500, end: 43000 },
    { speaker: '서연', text: '책임이라는 기준은 좋은 지적이에요.', start: 43500, end: 48000 },
    { speaker: '지민', text: '그래서 저는 인간의 역할이 사라지지 않는다고 생각해요.', start: 48500, end: 55000 },
  ],
}
