# 장소 예약 시스템

공용 공간(회의실, 다목적실 등)을 효율적으로 예약하고 관리할 수 있는 웹 애플리케이션입니다.

## 주요 기능

### 사용자 기능
- **회원가입/로그인**: 사용자 ID 기반 인증
- **캘린더 뷰**: 날짜별 예약 가능 여부 확인
- **예약 관리**: 장소/시간 선택 후 예약 생성, 수정, 삭제
- **내 예약 조회**: 현재 및 과거 예약 내역 확인

### 관리자 기능
- **사용자 관리**: 사용자 생성, 수정, 삭제
- **전체 예약 관리**: 모든 사용자의 예약 수정/삭제 가능
- **모든 날짜 예약 가능**: 소속별 제한 없이 예약 가능

### 소속별 예약 오픈 일정
| 소속 | 다음 달 예약 오픈일 |
|------|---------------------|
| 교역자 | 매월 2번째 일요일 |
| 비전브릿지, CAM, 프뉴마, 가스펠, 카리스 | 매월 3번째 일요일 |
| 기타 | 매월 3번째 수요일 |

## 예약 가능 장소 (11개)
- 월드비전홀
- 순보금자리
- 푸른초장
- 쉴만한 물가
- 넘치는 잔
- Vision Factory 1~5

## 운영 시간
- **예약 가능 시간**: 07:00 ~ 22:00
- **예약 단위**: 30분

## 기술 스택

### Frontend
- React 19.1.1
- Vite 7.1.7
- React Router DOM v7.9.5
- Plain CSS (컴포넌트별 스타일시트)

### 데이터 저장
- localStorage (프론트엔드 전용, 백엔드 미구현)

## 설치 및 실행

### 요구사항
- Node.js 18.x 이상
- npm 9.x 이상

### 설치
```bash
cd frontend
npm install
```

### 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:5173` 접속

### 프로덕션 빌드
```bash
npm run build
npm run preview
```

## 기본 계정

### 관리자 계정
- **사용자 ID**: admin
- **비밀번호**: Admin1234

> 관리자 계정은 앱 최초 실행 시 자동 생성됩니다.

## 프로젝트 구조

```
space_reservation_system/
├── frontend/
│   ├── src/
│   │   ├── pages/           # 페이지 컴포넌트
│   │   │   ├── Login.jsx
│   │   │   ├── SignUp.jsx
│   │   │   ├── Calendar.jsx
│   │   │   ├── Reservation.jsx
│   │   │   ├── MyReservations.jsx
│   │   │   └── Admin.jsx
│   │   ├── components/      # 재사용 컴포넌트
│   │   │   ├── ReservationModal.jsx
│   │   │   └── HelpModal.jsx
│   │   ├── constants.js     # 상수 및 유틸리티 함수
│   │   ├── App.jsx          # 라우트 설정
│   │   └── main.jsx         # 앱 진입점
│   └── package.json
├── docs/                    # 문서
│   ├── PRD.md
│   └── 작업 리스트(25.12.21).md
├── CLAUDE.md               # Claude Code 가이드
└── README.md
```

## 부서별 색상 코드

| 부서 | 색상 |
|------|------|
| 교역자 | #FF6B6B (빨강) |
| 비전브릿지 | #4ECDC4 (청록) |
| CAM | #45B7D1 (파랑) |
| 프뉴마 | #96CEB4 (녹색) |
| 가스펠 | #FFEAA7 (노랑) |
| 카리스 | #DDA15E (주황) |
| 기타 | #B19CD9 (보라) |

## 라이선스

Private - 내부 사용 전용

## 담당자

- **이름**: 차동훈
- **이메일**: joseph.c@kakao.com
