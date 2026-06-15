const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

const { transcribeAudio } = require('../utils/assemblyai');

// 번들된 정적 FFmpeg 바이너리 경로 지정
ffmpeg.setFfmpegPath(ffmpegStatic);

const router = express.Router();

// 업로드 임시 폴더
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: 500 * 1024 * 1024 }, // 최대 500MB
});

/** 영상에서 오디오만 추출해 mp3로 저장한다. */
function extractAudio(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .noVideo()
      .audioChannels(1)
      .audioFrequency(16000)
      .format('mp3')
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .save(outputPath);
  });
}

/**
 * POST /api/upload
 * 영상 파일(field: "video")을 받아 오디오를 추출하고 전사 결과를 반환한다.
 */
router.post('/', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '영상 파일이 필요합니다. (form-data field: video)' });
  }

  const videoPath = req.file.path;
  const audioPath = `${videoPath}.mp3`;

  try {
    await extractAudio(videoPath, audioPath);
    const { text, utterances } = await transcribeAudio(audioPath);
    res.json({ transcript: text, utterances });
  } catch (err) {
    console.error('업로드 처리 실패:', err.message);
    res.status(500).json({ error: '영상 처리 중 오류가 발생했습니다.', detail: err.message });
  } finally {
    // 임시 파일 정리
    fs.promises.unlink(videoPath).catch(() => {});
    fs.promises.unlink(audioPath).catch(() => {});
  }
});

module.exports = router;
