const axios = require('axios');

const API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
/** 분석에 사용할 Claude 모델 */
const MODEL = 'claude-sonnet-4-6';
/** 하크니스 분석 응답 토큰 상한 (학생 다수 + 한국어 피드백이 잘리지 않도록 충분히) */
const ANALYSIS_MAX_TOKENS = 8000;
/** JSON 파싱 실패 시 재호출 최대 횟수 */
const MAX_PARSE_RETRIES = 2;

const HARKNESS_SYSTEM_PROMPT =
  '당신은 미국 명문대 입시를 준비하는 한국 청소년들의 하크니스 토론을 분석하는 전문 교육 컨설턴트입니다.\n' +
  '분석 시 다음 원칙을 따르세요:\n' +
  '- 모든 피드백은 한국어로, 학생을 존중하고 성장을 격려하는 톤으로 작성\n' +
  '- 강점은 구체적인 발언 내용을 근거로 제시\n' +
  "- 개선점은 비판이 아니라 코칭 형식으로 ('~하면 더 좋을 것 같아요')\n" +
  '- 아이비리그 인터뷰와 세미나 수업에서 필요한 역량과 연결해서 피드백\n' +
  '반드시 JSON 형식으로만 응답하세요. 마크다운 코드블록 없이 순수 JSON만 출력하세요.';

/** API 키를 읽어 검증한다. */
function getApiKey() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY가 .env에 없습니다.');
  }
  return apiKey;
}

/** Claude messages API를 호출하고 텍스트를 반환한다. */
async function callClaude(apiKey, system, userMessage, maxTokens) {
  try {
    const { data } = await axios.post(
      API_URL,
      {
        model: MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: userMessage }],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
          'content-type': 'application/json',
        },
      },
    );
    return data.content?.[0]?.text ?? '';
  } catch (err) {
    const detail = err.response?.data?.error?.message || err.message;
    throw new Error(`Claude API 호출 실패: ${detail}`);
  }
}

/** 발언 기록을 "화자: 발언내용 (시각)" 형식 문자열로 변환한다. */
function formatUtterances(utterances) {
  return (utterances || [])
    .map((u) => {
      const sec = typeof u.start === 'number' ? `${(u.start / 1000).toFixed(1)}s` : '';
      return `${u.speaker}: ${u.text}${sec ? ` (${sec})` : ''}`;
    })
    .join('\n');
}

/** 출력 JSON 스키마(필드명 고정) — Claude가 정확히 이 구조로만 응답하도록 명시한다. */
const OUTPUT_SCHEMA = `{
  "overallAnalysis": "전체 토론 분석 (3~5문장, 한국어)",
  "speakerMapping": [{ "originalLabel": "A", "studentName": "실제 학생 이름" }],
  "individualReports": [
    {
      "studentName": "학생 이름",
      "totalSpeeches": 0,
      "totalDurationSeconds": 0,
      "keyQuotes": ["대표 발언 2~3개"],
      "strengths": ["잘한 점 2~3가지"],
      "improvements": ["개선점 2~3가지 (코칭 톤)"],
      "participationScore": 0
    }
  ],
  "discussionFlowAnalysis": {
    "dominantSpeaker": "발언 독점 학생 이름 또는 null",
    "isolatedStudents": ["발언/연결이 없는 학생 이름"],
    "turnTakingQuality": "균형 | 일부 독점 | 심한 독점 중 하나",
    "suggestedNextTopics": ["다음 토론 추천 주제"]
  }
}`;

/** 분석용 user 메시지를 구성한다. */
function buildHarknessUserMessage({ title, studentNames, utterances }) {
  return (
    '다음은 하크니스 토론 전사본입니다.\n\n' +
    `토론 주제: ${title || '제목 없음'}\n` +
    `참여 학생: ${(studentNames || []).join(', ')}\n\n` +
    '발언 기록:\n' +
    formatUtterances(utterances) +
    '\n\n위 내용을 분석해 아래 JSON 스키마를 "정확히" 따라 응답하세요. ' +
    '다른 키를 추가하거나 키 이름을 바꾸지 마세요. ' +
    'individualReports에는 "참여 학생" 목록의 모든 학생에 대한 항목을 각각 포함하세요.\n' +
    '응답이 잘리지 않도록 간결하게 작성하세요: ' +
    'keyQuotes/strengths/improvements는 각각 최대 2개, 각 항목은 한 문장(40자 내외), ' +
    'overallAnalysis는 3~4문장, suggestedNextTopics는 최대 3개로 제한합니다.\n\n' +
    OUTPUT_SCHEMA
  );
}

/** Claude 응답에서 순수 JSON 문자열만 추출한다. */
function extractJson(text) {
  let t = (text || '').trim();

  // ```json ... ``` 또는 ``` ... ``` 코드블록 제거
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    t = fence[1].trim();
  }

  // 첫 '{' ~ 마지막 '}' 구간만 취함
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    t = t.slice(first, last + 1);
  }
  return t;
}

/** 파싱 완전 실패 시 반환할 기본 구조. */
function buildEmptyReport(studentNames) {
  return {
    overallAnalysis: '분석 결과를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.',
    speakerMapping: [],
    individualReports: (studentNames || []).map((name) => ({
      studentName: name,
      totalSpeeches: 0,
      totalDurationSeconds: 0,
      keyQuotes: [],
      strengths: [],
      improvements: [],
      participationScore: 0,
    })),
    discussionFlowAnalysis: {
      dominantSpeaker: null,
      isolatedStudents: [],
      turnTakingQuality: '',
      suggestedNextTopics: [],
    },
  };
}

/**
 * AssemblyAI 전사 결과를 받아 Claude로 하크니스 토론을 분석한다.
 * @param {{
 *   utterances: Array<{ speaker: string, text: string, start: number, end: number }>,
 *   studentNames: string[],
 *   title: string,
 *   jobId: string
 * }} params
 * @returns {Promise<object>} 구조화된 분석 리포트
 */
async function analyzeHarknessDiscussion({ utterances, studentNames, title, jobId }) {
  const apiKey = getApiKey();
  const userMessage = buildHarknessUserMessage({ title, studentNames, utterances });

  let lastError;
  for (let attempt = 1; attempt <= MAX_PARSE_RETRIES + 1; attempt += 1) {
    const raw = await callClaude(apiKey, HARKNESS_SYSTEM_PROMPT, userMessage, ANALYSIS_MAX_TOKENS);
    try {
      const parsed = JSON.parse(extractJson(raw));
      console.log(`[${jobId}] Claude 분석 파싱 성공 (시도 ${attempt})`);
      return parsed;
    } catch (err) {
      lastError = err;
      console.warn(`[${jobId}] Claude 분석 JSON 파싱 실패 (시도 ${attempt}/${MAX_PARSE_RETRIES + 1})`);
    }
  }

  console.error(`[${jobId}] Claude 분석 최종 실패 — 빈 리포트 반환: ${lastError?.message}`);
  return buildEmptyReport(studentNames);
}

/**
 * (수동 매핑용) 통계/전사 텍스트로 한국어 분석 코멘트를 반환한다.
 * @param {{ transcript?: string, stats?: unknown }} input
 * @returns {Promise<string>}
 */
async function analyzeDiscussion({ transcript, stats }) {
  const apiKey = getApiKey();
  const prompt = buildSimplePrompt(transcript, stats);
  return callClaude(apiKey, undefined, prompt, 1024);
}

/** 수동 매핑용 간단 프롬프트. */
function buildSimplePrompt(transcript, stats) {
  const parts = [
    '당신은 하크니스(Harkness) 토론을 분석하는 교육 보조 AI입니다.',
    '아래 정보를 바탕으로 교사에게 도움이 되는 한국어 분석 코멘트를 작성하세요.',
    '전체 토론 분위기, 발언을 독점한 학생, 소외된 학생, 개선 제안을 포함하세요.',
  ];
  if (stats) parts.push('\n[참여 통계]\n' + JSON.stringify(stats, null, 2));
  if (transcript) parts.push('\n[토론 전사 내용]\n' + transcript);
  return parts.join('\n');
}

module.exports = { analyzeHarknessDiscussion, analyzeDiscussion };
