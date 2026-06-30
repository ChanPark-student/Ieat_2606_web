# ieat_2606_ai Web MVP

## 1. 프로젝트 개요

본 프로젝트는 신제품 출시 전 인증·리콜 리스크를 사전에 진단하는 AI 컴플라이언스 웹 서비스 MVP입니다.

사용자가 제품명, 제품 설명, 사용연령, 소재, 전원 방식, 배터리 포함 여부, 제조/수입 여부 등을 입력하면 예상 인증유형, 적용 안전기준, 유사 KC 인증 사례, 국내 리콜 사유, 출시 전 확인사항을 카드와 보고서 형태로 확인할 수 있도록 하는 것이 목표입니다.

현재 버전은 실제 AI 서버 연결 전 단계이며, React 프론트엔드와 Mock AI 응답을 사용해 시연 가능한 흐름을 구현했습니다.

---

## 2. 현재 구현 상태

### 구현 완료

- React + Vite 기반 프론트엔드 구성
- Stitch UI 시안을 React 화면으로 재구성
- 로그인 화면
- 회원가입 화면
- 메인 대시보드 화면
- 제품 진단 입력 화면
- 진단 결과 상세 화면
- 진단 이력 화면
- 제품 입력값 기반 Mock AI 진단 결과 생성
- 진단 결과 카드 출력
- Markdown 보고서 출력
- localStorage 기반 임시 로그인 및 결과 저장

### 구현 예정

- FastAPI 백엔드 구현
- 실제 회원가입 / 로그인 API 구현
- JWT 인증 적용
- SQLite 또는 PostgreSQL DB 저장
- 실제 AI 서버 연동
- KC 인증정보 검색 연동
- 국내 리콜 데이터 검색 연동
- 배포 환경 구성

---

## 3. 기술 스택

### Frontend

- React
- Vite
- React Router DOM
- CSS
- localStorage

### Backend 예정

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT
- SQLite 또는 PostgreSQL

### AI 연동 예정

현재는 실제 AI API를 호출하지 않습니다.

AI 서버 연결 전까지는 `frontend/src/data/mockDiagnosis.js` 파일의 Mock AI 응답을 사용합니다.

향후 AI 개발자가 제공하는 AI 진단 API 또는 AI 모듈과 연동할 예정입니다.

---

## 4. 실행 방법

### 4.1 프론트엔드 폴더로 이동

```bash
cd frontend