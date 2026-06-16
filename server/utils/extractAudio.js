const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

// 번들된 정적 FFmpeg 바이너리 경로 지정
ffmpeg.setFfmpegPath(ffmpegStatic);

/** 변환 없이 그대로 사용할 수 있는 오디오 확장자 */
const READY_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a'];

/**
 * 영상/음성 파일에서 AssemblyAI 권장 형식(WAV, 16kHz, 모노)으로 오디오를 추출한다.
 * 이미 지원 오디오 형식(mp3/wav/m4a)이면 변환을 건너뛰고 원본 경로를 반환한다.
 *
 * @param {string} inputFilePath 입력 파일 경로 (예: server/uploads/xxx.mp4)
 * @param {string} jobId 로그 식별용 jobId
 * @returns {Promise<string>} 추출된(또는 그대로인) 오디오 파일 경로
 */
function extractAudio(inputFilePath, jobId) {
  const ext = path.extname(inputFilePath).toLowerCase();

  // 5) 이미 지원 오디오 형식이면 변환 생략
  if (READY_AUDIO_EXTENSIONS.includes(ext)) {
    console.log(`[${jobId}] 이미 오디오 형식이라 변환을 건너뜁니다: ${path.basename(inputFilePath)}`);
    return Promise.resolve(inputFilePath);
  }

  const outputPath = inputFilePath.replace(/\.[^.]+$/, '.wav');

  return new Promise((resolve, reject) => {
    console.log(`[${jobId}] 음성 추출 시작...`);

    ffmpeg(inputFilePath)
      .noVideo()
      .audioChannels(1) // 모노
      .audioFrequency(16000) // 16kHz
      .audioCodec('pcm_s16le') // WAV PCM
      .format('wav')
      .on('end', () => {
        console.log(`[${jobId}] 음성 추출 완료: ${path.basename(outputPath)}`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        reject(new Error(`[${jobId}] 음성 추출 실패: ${err.message}`));
      })
      .save(outputPath);
  });
}

module.exports = { extractAudio };
