/**
 * AssemblyAI 전사 단독 테스트 스크립트.
 *
 * 사전 준비:
 *   1) server/.env 에 ASSEMBLYAI_API_KEY 입력
 *   2) server/uploads/ 에 전사할 WAV 파일을 둔다 (기본: sample.wav)
 *      (extractAudio 단계에서 만든 파일을 사용하면 됨)
 *
 * 실행:
 *   cd server && node test-assemblyai.js [wav파일명] [학생이름,쉼표구분]
 *   예) node test-assemblyai.js sample.wav 철수,영희,민수
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { transcribeWithDiarization } = require('./utils/assemblyai');

const fileName = process.argv[2] || 'sample.wav';
const studentNames = (process.argv[3] || '철수,영희,민수')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const audioPath = path.join(__dirname, 'uploads', fileName);

async function main() {
  if (!fs.existsSync(audioPath)) {
    console.error(`오디오 파일이 없습니다: ${audioPath}`);
    console.error('server/uploads/ 에 WAV 파일을 두고 다시 실행하세요.');
    process.exit(1);
  }

  console.log(`입력 오디오: ${audioPath}`);
  console.log(`학생 이름: ${studentNames.join(', ')}`);

  const result = await transcribeWithDiarization(audioPath, studentNames, 'test-job');

  console.log('\n===== 전사 결과 =====');
  console.log(`감지된 화자 수: ${result.speakerCount}`);
  console.log(`전체 텍스트:\n${result.fullTranscript}\n`);
  console.log('발언별:');
  for (const u of result.utterances) {
    const sec = (u.start / 1000).toFixed(1);
    console.log(`  [${sec}s] ${u.speaker} (정확도 ${u.confidence?.toFixed(2)}): ${u.text}`);
  }
  console.log('\n✅ 테스트 성공');
}

main().catch((err) => {
  console.error('\n❌ 테스트 실패:', err.message);
  process.exit(1);
});
