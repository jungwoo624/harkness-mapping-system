const path = require('path');
const fs = require('fs');
const express = require('express');

const { extractAudio } = require('../utils/extractAudio');
const { transcribeWithDiarization } = require('../utils/assemblyai');
const { analyzeHarknessDiscussion, analyzeDiscussion } = require('../utils/claude');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const RESULTS_DIR = path.join(__dirname, '..', 'results');
fs.mkdirSync(RESULTS_DIR, { recursive: true });

/**
 * 분석 작업 상태 저장소 (메모리).
 * jobId → { status, progress, message, result, error }
 * status: 'pending' | 'extracting' | 'transcribing' | 'analyzing' | 'completed' | 'error'
 */
const jobs = new Map();

/** 단계별 한국어 라벨 (로그용) */
const STAGE_LABELS = {
  pending: '대기',
  extracting: '음성추출',
  transcribing: '전사',
  analyzing: '분석',
  completed: '완료',
  error: '오류',
};

/** 작업 상태를 갱신하고 단계 전환 로그를 남긴다. */
function setStatus(jobId, status, progress, message) {
  const prev = jobs.get(jobId) || { result: null, error: null };
  jobs.set(jobId, { ...prev, status, progress, message, error: null });
  console.log(`[${jobId}] → ${STAGE_LABELS[status] || status} 시작`);
}

/** uploads/ 에서 jobId에 해당하는 원본 파일 경로를 찾는다 (.wav 변환본은 후순위). */
function findUploadedFile(jobId) {
  let files;
  try {
    files = fs.readdirSync(UPLOAD_DIR);
  } catch {
    return null;
  }
  const matches = files.filter((f) => path.parse(f).name === jobId);
  if (matches.length === 0) return null;
  // 원본(영상/음성)을 우선, 추출된 .wav는 마지막
  const original = matches.find((f) => path.extname(f).toLowerCase() !== '.wav');
  return path.join(UPLOAD_DIR, original || matches[0]);
}

/** 완료 결과를 디스크에 저장한다. */
function saveResult(jobId, result) {
  try {
    fs.writeFileSync(path.join(RESULTS_DIR, `${jobId}.json`), JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(`[${jobId}] 결과 저장 실패: ${err.message}`);
  }
}

/**
 * 전체 분석 파이프라인 (백그라운드 실행).
 * 음성추출 → 전사 → 분석 → 결과 저장.
 */
async function startAnalysis(jobId, studentNames, title) {
  const names = Array.isArray(studentNames) ? studentNames : [];
  try {
    const inputPath = findUploadedFile(jobId);
    if (!inputPath) {
      throw new Error('업로드된 파일을 찾을 수 없습니다.');
    }

    // ① 음성 추출
    setStatus(jobId, 'extracting', 10, '영상에서 음성을 추출하고 있습니다...');
    const audioPath = await extractAudio(inputPath, jobId);

    // ② 전사 (화자 분리)
    setStatus(jobId, 'transcribing', 30, '음성을 텍스트로 변환하고 있습니다...');
    const transcript = await transcribeWithDiarization(audioPath, names, jobId);

    // ③ 분석 (Claude)
    setStatus(jobId, 'analyzing', 70, 'AI가 토론을 분석하고 있습니다...');
    const analysis = await analyzeHarknessDiscussion({
      utterances: transcript.utterances,
      studentNames: names,
      title,
      jobId,
    });

    // ④ 완료
    const result = {
      jobId,
      title: title || '제목 없는 토론',
      studentNames: names,
      transcript,
      analysis,
      completedAt: Date.now(),
    };
    jobs.set(jobId, {
      status: 'completed',
      progress: 100,
      message: '분석이 완료되었습니다.',
      result,
      error: null,
    });
    console.log(`[${jobId}] → ${STAGE_LABELS.completed} 시작`);
    saveResult(jobId, result);
  } catch (err) {
    jobs.set(jobId, {
      status: 'error',
      progress: 0,
      message: '분석 중 오류가 발생했습니다.',
      result: null,
      error: err.message,
    });
    console.error(`[${jobId}] 분석 실패: ${err.message}`);
  }
}

/**
 * POST /api/analysis/start
 * body: { jobId, studentNames, title }
 * 상태를 pending으로 초기화하고 즉시 응답한 뒤, 백그라운드로 파이프라인 실행.
 */
router.post('/start', (req, res) => {
  const { jobId, studentNames, title } = req.body || {};
  if (!jobId) {
    return res.status(400).json({ error: 'jobId가 필요합니다.' });
  }

  jobs.set(jobId, {
    status: 'pending',
    progress: 0,
    message: '분석을 준비하고 있습니다...',
    result: null,
    error: null,
  });

  res.json({ message: '분석을 시작합니다', jobId });

  // 응답 후 백그라운드 처리
  startAnalysis(jobId, studentNames, title).catch((err) => {
    console.error(`[${jobId}] 파이프라인 예외: ${err.message}`);
  });
});

/**
 * GET /api/analysis/status/:jobId
 * 진행 상황 폴링용 (프론트에서 1.5초마다 호출).
 */
router.get('/status/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: '해당 jobId의 작업을 찾을 수 없습니다.' });
  }
  res.json({
    jobId: req.params.jobId,
    status: job.status,
    progress: job.progress,
    message: job.message,
    error: job.error,
  });
});

/**
 * GET /api/analysis/result/:jobId
 * 완료된 경우에만 결과를 반환한다.
 */
router.get('/result/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: '해당 jobId의 작업을 찾을 수 없습니다.' });
  }
  if (job.status !== 'completed') {
    return res.json({ error: '분석이 완료되지 않았습니다', status: job.status });
  }
  res.json(job.result);
});

/**
 * POST /api/analysis
 * (수동 매핑용) 통계/전사 텍스트로 Claude 분석 코멘트를 반환한다.
 * 영상 파이프라인과 별개로 기존 프론트(generateAIComment)에서 사용.
 */
router.post('/', async (req, res) => {
  const { transcript, stats } = req.body || {};
  if (!transcript && !stats) {
    return res.status(400).json({ error: 'transcript 또는 stats 중 하나는 필요합니다.' });
  }
  try {
    const comment = await analyzeDiscussion({ transcript, stats });
    res.json({ comment });
  } catch (err) {
    console.error('AI 분석 실패:', err.message);
    res.status(500).json({ error: 'AI 분석 중 오류가 발생했습니다.', detail: err.message });
  }
});

module.exports = router;
module.exports.startAnalysis = startAnalysis;
