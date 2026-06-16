/**
 * extractAudio 단독 테스트 스크립트.
 *
 * 사용법:
 *   1) server/uploads/ 에 테스트용 영상 파일을 둔다 (기본: sample.mp4)
 *   2) cd server && node test-extract.js [파일명]
 *   → WAV 파일이 생성되면 성공.
 */
const fs = require('fs');
const path = require('path');
const { extractAudio } = require('./utils/extractAudio');

const fileName = process.argv[2] || 'sample.mp4';
const inputPath = path.join(__dirname, 'uploads', fileName);

async function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`테스트 파일이 없습니다: ${inputPath}`);
    console.error('server/uploads/ 에 영상 파일을 두고 다시 실행하세요.');
    process.exit(1);
  }

  console.log(`입력 파일: ${inputPath}`);
  const outputPath = await extractAudio(inputPath, 'test-job');

  const stat = fs.statSync(outputPath);
  console.log(`결과 파일: ${outputPath}`);
  console.log(`결과 크기: ${stat.size} bytes`);
  console.log('✅ 테스트 성공');
}

main().catch((err) => {
  console.error('❌ 테스트 실패:', err.message);
  process.exit(1);
});
