# Accordion - Figma Responsive Plugin

## 개요

Accordion은 아코디언처럼 늘어났다 줄어들며 반응형 레이아웃을 보여주는 Figma 플러그인입니다. 디자이너가 여러 개의 프레임(Mobile, Tablet, Desktop)을 하나의 '마스터 프레임'에 연결하여, 너비 조절만으로 레이아웃이 자동 전환되는 인터랙티브한 환경을 제공합니다.

## 핵심 기능

### 1. 중단점(Breakpoint) 관리
- 사용자 정의 중단점: 픽셀(px) 단위로 가로/세로 중단점 생성
- 프레임 매핑: 각 중단점 범위에 미리 제작된 Figma 프레임을 1:1로 매칭

### 2. 적응형 레이아웃 엔진
- 실시간 리사이징: 마스터 프레임 크기 조절 시 설정된 중단점에 도달하면 즉시 해당 디자인 프레임으로 교체
- 플러그인 독립 실행: 플러그인 창이 닫혀 있어도 Figma의 on('resize') 이벤트 감지

### 3. 시각적 가이드 및 프리셋
- iOS(iPhone, iPad), Android, Web Standard 등의 표준 해상도 프리셋
- 중단점 인디케이터: 현재 활성화된 중단점 시각적 표시

## 설치 및 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 빌드
```bash
npm run build
```

### 3. 개발 모드
```bash
npm run dev
```

### 4. Figma에 로드
1. Figma에서 `Plugins > Development > Import plugin from manifest...` 선택
2. `dist/manifest.json` 파일 선택
3. 플러그인 실행: `Plugins > Accordion`

## 사용 방법

### 1. 준비
반응형으로 대응할 각 기기별 디자인 프레임(모바일, 태블릿, 데스크탑 등)을 준비합니다.

### 2. 플러그인 실행
- Figma에서 반응형으로 만들 프레임을 선택합니다.
- 플러그인을 실행합니다.

### 3. 중단점 설정
- 프리셋 선택(iOS, Android, Web) 또는
- 사용자 정의 중단점 추가
- 각 중단점에 해당 프레임 매핑

### 4. 적응형 레이아웃 생성
- "Create Adaptive Layout" 버튼 클릭
- 생성된 마스터 프레임의 크기를 조절하며 레이아웃 변화 테스트

## 기술 스택

- **Framework**: React + TypeScript
- **Build**: Webpack
- **API**: Figma Plugin API
- **Storage**: Figma Plugin Data (setPluginData)

## 파일 구조

```
figma-responsive-engine/
├── src/
│   ├── code.ts           # Figma 메인 컨텍스트 코드
│   ├── main.tsx          # React UI 진입점
│   ├── App.tsx           # 메인 UI 컴포넌트
│   ├── ui.html           # UI HTML 템플릿
│   ├── ui.css            # UI 스타일
│   └── manifest.json     # 플러그인 매니페스트
├── dist/                 # 빌드 결과물
├── package.json
├── tsconfig.json
└── webpack.config.js
```

## 향후 개선 사항

- [ ] 프레임 선택 UI 개선
- [ ] 중단점 간 전환 애니메이션
- [ ] 여러 마스터 프레임 관리
- [ ] 내보내기 기능 (CSS 미디어 쿼리 생성)
- [ ] 팀 라이브러리 공유 기능

## 라이선스

ISC
