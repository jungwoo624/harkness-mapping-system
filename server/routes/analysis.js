const express = require('express');

const { analyzeDiscussion } = require('../utils/claude');

const router = express.Router();

/**
 * POST /api/analysis
 * 전사 텍스트(transcript)와/또는 참여 통계(stats)를 받아
 * Claude 분석 코멘트를 반환한다.
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
