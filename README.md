# Accordion - Figma Responsive Plugin 🪗

아코디언처럼 늘어났다 줄어들며 반응형 레이아웃을 보여주는 Figma 플러그인입니다.

## 개요 (Product Overview)

**Accordion**은 디자이너가 여러 개의 프레임(Mobile, Tablet, Desktop)을 하나의 '마스터 프레임'에 연결하여, 너비 조절만으로 레이아웃이 자동 전환되는 인터랙티브한 환경을 제공합니다.

## 핵심 기능 (Key Features)

### 1. 중단점(Breakpoint) 관리
- ✅ 사용자 정의 중단점: 픽셀(px) 단위로 가로/세로 중단점 생성
- ✅ 프레임 매핑: 각 중단점 범위에 미리 제작된 Figma 프레임을 1:1로 매칭
- ✅ 실시간 프레임 연결: 캔버스에서 직접 프레임 선택

### 2. 적응형 레이아웃 엔진 (Adaptive Engine)
- ✅ 실시간 리사이징: 마스터 프레임 크기 조절 시 설정된 중단점에 도달하면 즉시 해당 디자인 프레임으로 교체
- ✅ 자동 감지: Figma의 on('resize') 이벤트로 자동 감지
- ✅ 디바운싱: 빠른 크기 변경 시 불필요한 전환 방지

### 3. 시각적 가이드 및 프리셋
- ✅ 프리셋 제공: iOS(iPhone, iPad), Android, Web Standard 등의 표준 해상도
- ✅ 중단점 인디케이터: 현재 활성화된 중단점 시각적 표시
- ✅ 직관적인 UI: 연결 상태, 테스트 기능 포함

### 4. 고급 기능
- ✅ 에러 핸들링: 구체적인 에러 메시지와 복구 가이드
- ✅ 로딩 상태: 진행 상황 시각적 피드백
- ✅ 데이터 영속성: Figma 파일에 자동 저장
- ✅ 성능 최적화: 깜빡임 방지 및 스마트 캐싱

## 설치 및 설정 (Installation & Setup)

### 1. 의존성 설치
```bash
cd ~/zerone/figma-responsive-engine
npm install
```

### 2. 빌드
```bash
npm run build
```

### 3. Figma에 로드
1. Figma에서 `Plugins > Development > Import plugin from manifest...` 선택
2. `dist/manifest.json` 파일 선택
3. 플러그인 실행: `Plugins > Accordion`

### 4. 개발 모드
```bash
npm run dev
```

## 사용 방법 (Usage)

### 1. 준비 단계
반응형으로 대응할 각 기기별 디자인 프레임(모바일, 태블릿, 데스크탑 등)을 준비합니다.

### 2. 플러그인 실행
- Figma에서 반응형으로 만들 프레임을 선택합니다.
- `Plugins > Accordion`을 실행합니다.

### 3. 중단점 설정

#### 빠른 설정 (프리셋)
1. **iOS** 버튼 클릭 → iPhone/iPad 해상도 자동 설정
2. **Android** 버튼 클릭 → Android 기기 해상도 자동 설정
3. **Web** 버튼 클릭 → 웹 표준 반응형 설정

#### 사용자 정의
1. **+ Add Breakpoint**로 새 중단점 추가
2. 이름, 최소/최대 너비 설정
3. ➕ 버튼으로 캔버스에서 프레임 선택

### 4. 적응형 레이아웃 생성
1. 각 중단점에 해당하는 프레임 연결
2. **Create Adaptive Layout** 버튼 클릭
3. 생성된 마스터 프레임의 크기를 조절하며 레이아웃 변화 테스트

### 5. 테스트 및 사용
- **자동 전환**: 마스터 프레임 크기 조절 시 자동으로 해당 레이아웃 전환
- **수동 테스트**: 특정 중단점의 **Test** 버튼으로 직접 전환 테스트
- **편집**: **Edit Layout** 버튼으로 중단점 설정 수정

## 기술 스택 (Technical Stack)

- **Framework**: React 19 + TypeScript
- **Build**: Webpack 5
- **API**: Figma Plugin API
- **Storage**: Figma Plugin Data (setPluginData/getPluginData)
- **Styling**: CSS Variables + Professional Design System

## 파일 구조 (File Structure)

```
figma-responsive-engine/
├── src/
│   ├── code.ts           # Figma 메인 컨텍스트 코드 (향상됨)
│   ├── main.tsx          # React UI 진입점
│   ├── App.tsx           # 메인 UI 컴포넌트 (개선됨)
│   ├── ui.html           # UI HTML 템플릿
│   ├── ui.css            # 전문 CSS 스타일 (개선됨)
│   └── manifest.json     # 플러그인 매니페스트
├── dist/                 # 빌드 결과물
├── package.json
├── tsconfig.json
└── webpack.config.js
```

## 개선 사항 (Improvements)

### v1.0에서 구현된 고급 기능:

1. **실제 프레임 선택 기능**
   - 캔버스에서 직접 프레임 선택
   - 30초 타임아웃으로 자동 취소
   - 선택 유효성 검증

2. **향상된 리사이즈 감지**
   - 디바운싱으로 불필요한 전환 방지
   - 현재 중단점 추적
   - 자동 중단점 변경 알림

3. **에러 핸들링 강화**
   - 구체적인 에러 메시지
   - 사용자 피드백 시스템
   - 복구 가능한 에러 처리

4. **사용자 경험 개선**
   - 로딩 상태 표시
   - 성공/실패 메시지
   - 직관적인 프리셋 버튼
   - 실시간 상태 업데이트

5. **프레임 교체 최적화**
   - 효율적인 복제 메커니즘
   - 깜빡임 방지
   - 스마트 캐싱

## 사용자 경험 (User Experience)

### 💡 사용자 흐름 (User Flow)

1. **프레임 선택** → 플러그인 실행
2. **프리셋 선택** → iOS/Android/Web 중 하나 선택
3. **프레임 연결** → ➕ 버튼으로 각 중단점에 프레임 매핑
4. **레이아웃 생성** → Create 버튼 클릭
5. **테스트** → 마스터 프레임 크기 조절 또는 Test 버튼 클릭

### 🎯 성공 지표 (Success Metrics)

- **Retention**: 플러그인 설치 후 재사용률
- **Efficiency**: 단일 프레임으로 반응형 검수 시 시간 절감
- **User Satisfaction**: 직관적인 UI로 낮은 학습 곡선

## 문제 해결 (Troubleshooting)

### 프레임이 전환되지 않을 때
1. 중단점에 프레임이 연결되어 있는지 확인
2. 중단점 범위가 올바른지 확인
3. 마스터 프레임이 선택되어 있는지 확인

### 에러 메시지가 나올 때
- **"Frame not found"**: 연결된 프레임이 삭제되었을 수 있습니다. 다시 연결하세요.
- **"Invalid breakpoint range"**: 중단점 범위가 잘못되었습니다. 최소값 < 최대값인지 확인하세요.

## 향후 개선 사항 (Future Enhancements)

- [ ] 여러 마스터 프레임 관리
- [ ] CSS 미디어 쿼리 내보내기
- [ ] 팀 라이브러리 공유 기능
- [ ] 중단점 간 전환 애니메이션
- [ ] 역사 기능 및 되돌리기
- [ ] 플러그인 설정 동기화

## 라이선스 (License)

ISC

## 기여 (Contributing)

이 프로젝트는 GitHub에서 개방되어 있습니다. 버그 리포트나 기능 요청은 Issue로 남겨주세요!

---

**Made with ❤️ for Figma designers who love responsive design**
