const express = require('express');
const cors = require('cors');
require('dotenv').config();

const uploadRouter = require('./routes/upload');
const analysisRouter = require('./routes/analysis');

const app = express();
const PORT = process.env.PORT || 3001;

// 프론트엔드(개발 서버)에서 오는 요청만 허용
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

// 헬스 체크
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// 라우트 연결
app.use('/api/upload', uploadRouter);
app.use('/api/analysis', analysisRouter);

app.listen(PORT, () => {
  console.log(`하크니스 서버 실행 중: http://localhost:${PORT}`);
});
