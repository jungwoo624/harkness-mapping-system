/**
 * Claude 하크니스 분석 단독 테스트 스크립트.
 *
 * 사전 준비: server/.env 에 ANTHROPIC_API_KEY 입력
 * 실행: cd server && node test-claude.js
 */
require('dotenv').config();
const { analyzeHarknessDiscussion } = require('./utils/claude');

const sample = {
  title: 'AI 시대에 인간 고유의 역량은 무엇인가',
  studentNames: ['지민', '서연', '도윤'],
  jobId: 'test-claude',
  utterances: [
    { speaker: '지민', text: 'AI가 창의성도 흉내 낼 수 있다고 생각해요.', start: 1000, end: 5000 },
    { speaker: '서연', text: '하지만 공감 능력은 인간만의 것 아닐까요?', start: 6000, end: 10000 },
    { speaker: '지민', text: '공감도 데이터로 학습할 수 있지 않을까요?', start: 11000, end: 15000 },
    { speaker: '지민', text: '결국 판단의 책임은 인간에게 있다고 봐요.', start: 16000, end: 21000 },
    { speaker: '서연', text: '책임이라는 관점은 좋은 지적이네요.', start: 22000, end: 26000 },
    { speaker: '도윤', text: '저는 윤리적 직관이 핵심이라고 생각합니다.', start: 27000, end: 32000 },
  ],
};

async function main() {
  console.log('Claude 분석 요청 중...');
  const report = await analyzeHarknessDiscussion(sample);

  console.log('\n===== 분석 리포트 =====');
  console.log(JSON.stringify(report, null, 2));

  // 필수 키 검증
  const requiredKeys = [
    'overallAnalysis',
    'speakerMapping',
    'individualReports',
    'discussionFlowAnalysis',
  ];
  const missing = requiredKeys.filter((k) => !(k in report));
  if (missing.length > 0) {
    console.warn('\n⚠ 누락된 키:', missing.join(', '));
  } else {
    console.log('\n✅ 모든 필수 키 존재 — 테스트 성공');
  }
}

main().catch((err) => {
  console.error('\n❌ 테스트 실패:', err.message);
  process.exit(1);
});
