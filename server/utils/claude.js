const axios = require('axios');

const API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
/** 분석에 사용할 Claude 모델 (필요시 교체) */
const MODEL = 'claude-sonnet-4-6';

/**
 * 토론 전사 텍스트와 참여 통계를 바탕으로 Claude에게 분석 코멘트를 요청한다.
 * @param {{ transcript?: string, stats?: unknown }} input
 * @returns {Promise<string>} 한국어 분석 코멘트
 */
async function analyzeDiscussion({ transcript, stats }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY 가 설정되지 않았습니다. server/.env 를 확인하세요.');
  }

  const prompt = buildPrompt(transcript, stats);

  const { data } = await axios.post(
    API_URL,
    {
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
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
}

/** Claude에 보낼 한국어 분석 프롬프트를 구성한다. */
function buildPrompt(transcript, stats) {
  const parts = [
    '당신은 하크니스(Harkness) 토론을 분석하는 교육 보조 AI입니다.',
    '아래 정보를 바탕으로 교사에게 도움이 되는 한국어 분석 코멘트를 작성하세요.',
    '전체 토론 분위기, 발언을 독점한 학생, 소외된 학생, 개선 제안을 포함하세요.',
  ];

  if (stats) {
    parts.push('\n[참여 통계]\n' + JSON.stringify(stats, null, 2));
  }
  if (transcript) {
    parts.push('\n[토론 전사 내용]\n' + transcript);
  }

  return parts.join('\n');
}

module.exports = { analyzeDiscussion };
