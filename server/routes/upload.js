const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const { startAnalysis } = require('./analysis');

const router = express.Router();

// 업로드 임시 폴더
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/** 허용 확장자 */
const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.webm', '.m4a', '.mp3', '.wav'];
/** 최대 파일 크기 (500MB) */
const MAX_FILE_SIZE = 500 * 1024 * 1024;

// 고유한 파일명(uuid + 원본 확장자)으로 디스크에 저장
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`허용되지 않는 파일 형식입니다: ${ext || '(확장자 없음)'}`));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

/**
 * POST /api/upload
 * 영상/음성 파일(field: "video")을 uploads/ 에 임시 저장하고 jobId를 반환한다.
 * 응답: { jobId, fileName, fileSize }
 */
router.post('/', (req, res) => {
  upload.single('video')(req, res, (err) => {
    if (err) {
      // multer 오류(크기 초과 등) 또는 fileFilter 거부
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? '파일 용량이 너무 큽니다. 최대 500MB까지 업로드할 수 있습니다.'
          : err.message;
      console.error('[upload] 실패:', message);
      return res.status(400).json({ error: message });
    }

    if (!req.file) {
      return res.status(400).json({ error: '영상 파일이 필요합니다. (form-data field: video)' });
    }

    // 저장된 파일명(uuid)을 jobId로 사용
    const jobId = path.parse(req.file.filename).name;

    // 클라이언트가 함께 보낸 메타데이터(JSON) 파싱
    let metadata = {};
    try {
      metadata = JSON.parse(req.body.metadata || '{}');
    } catch {
      metadata = {};
    }

    console.log(
      `[upload] 저장 완료 | jobId=${jobId} | 원본=${req.file.originalname} | ` +
        `저장명=${req.file.filename} | 크기=${req.file.size} bytes`,
    );

    // 응답을 먼저 보낸다
    res.json({
      jobId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });

    // 응답 후 분석 파이프라인을 백그라운드로 자동 시작
    // (파이프라인 첫 단계가 음성 추출이므로 별도 extractAudio 호출은 하지 않는다)
    startAnalysis(jobId, metadata.studentNames || [], metadata.title || '').catch((err) => {
      console.error(`[${jobId}] 분석 시작 실패: ${err.message}`);
    });
  });
});

module.exports = router;
