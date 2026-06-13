# Harkness Mapping

하크니스(Harkness) 토론에서 참가자들의 발언 흐름을 원형 테이블 위에 시각적으로 매핑하는 React 웹 앱입니다.

## 주요 기능

- 토론 세션 생성 및 목록 관리 (브라우저 localStorage에 저장)
- 참가자를 원형 테이블 둘레에 자동 배치
- 좌석 두 개를 차례로 클릭해 발언 흐름(화살표) 연결
- 참가자별 발언 횟수 집계

## 폴더 구조

```
harkness-mapping/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx              # 진입점 + 라우팅
    ├── App.jsx               # 레이아웃 셸
    ├── components/           # 재사용 UI 컴포넌트
    │   ├── Header.jsx
    │   ├── Seat.jsx
    │   └── DiscussionMap.jsx
    ├── pages/                # 라우트 단위 화면
    │   ├── HomePage.jsx
    │   └── MappingPage.jsx
    ├── utils/                # 순수 로직 / 헬퍼
    │   ├── geometry.js       # 좌석 좌표 계산
    │   └── storage.js        # 세션 영속화
    └── styles/               # 스타일시트
        ├── global.css
        └── discussionMap.css
```

## 시작하기

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```
