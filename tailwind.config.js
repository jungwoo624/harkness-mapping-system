/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cyber-Premium 팔레트
        void: '#050505', // Void Black — 배경
        obsidian: '#1A1A1A', // UI 카드 배경
        midnight: '#003333', // Cyan 그림자 / 구분선
        cyan: '#00FFFF', // Neon Cyan — 핵심 액센트
        gold: '#FFD700', // Cyber Gold — 프리미엄
        platinum: '#E5E5E5', // Platinum Silver — 보조 텍스트
        danger: '#FF0033', // Neon Red — 경고/강조
        purple: '#BC13FE', // Cyber Purple — 서브 포인트
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 255, 255, 0.25)',
        'glow-strong': '0 0 28px rgba(0, 255, 255, 0.45)',
        gold: '0 0 20px rgba(255, 215, 0, 0.25)',
      },
    },
  },
  plugins: [],
}
