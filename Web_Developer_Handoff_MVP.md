# Web Developer Handoff MVP

## 0. 문서 목적

이 문서는 **신제품 출시 전 인증, 리콜 리스크 진단 어시스턴트**의 웹 개발자 전달용 업무 정의서이다.

웹 개발자는 사용자가 제품 정보를 입력하고, AI 진단 결과를 확인할 수 있는 웹 서비스와 기본 백엔드를 구현한다.

AI 모델 개발, RAG 검색, KC 인증정보 분석, 국내리콜 데이터 분석, 법정 품목명 매칭 로직은 AI 개발자 담당 범위이다. 웹 개발자는 AI 서버 또는 AI 모듈과 통신하고, 사용자 인증, 진단 요청 저장, 결과 조회, 화면 출력을 담당한다.

---

## 1. 전체 역할 분리

### 1.1 AI 개발자 담당

AI 개발자는 다음 작업을 담당한다.

- RAG 검색 구조 구현
- Hugging Face 기반 생성형 LLM 연동
- 제품명 기반 법정 품목 후보 매칭
- 인증유형, 안전기준, 기관 안내 조회
- KC 인증정보 검색 및 요약
- 국내리콜 사유 검색 및 요약
- 최종 진단 결과 JSON 및 Markdown 생성
- `/diagnose` 또는 내부 진단 함수 제공

### 1.2 웹 개발자 담당

웹 개발자는 다음 작업을 담당한다.

- 프론트엔드 화면 구현
- FastAPI 기반 웹 백엔드 구현
- JWT 기반 회원가입, 로그인, 로그아웃 구현
- 사용자별 진단 요청 저장
- AI 진단 API 또는 AI 모듈 호출
- 진단 결과 저장 및 조회
- PostgreSQL 또는 SQLite 기반 DB 연동
- SQLAlchemy 기반 ORM 모델 작성
- 공모전 시연용 웹 프로토타입 제작

---

## 2. MVP 구현 전제

### 2.1 개발 목표

MVP의 목표는 완성형 상용 서비스가 아니라 **공모전 발표와 시연이 가능한 웹 프로토타입**을 만드는 것이다.

따라서 초기 구현에서는 다음을 우선한다.

- 사용자가 제품 정보를 입력할 수 있어야 한다.
- 로그인한 사용자의 진단 이력을 저장할 수 있어야 한다.
- AI 진단 결과를 카드와 Markdown 보고서 형태로 보여줄 수 있어야 한다.
- API 오류 또는 AI 응답 지연 시 사용자에게 안내 메시지를 보여줄 수 있어야 한다.

### 2.2 초기 제외 범위

다음 기능은 MVP 범위에서 제외한다.

- 관리자 페이지
- 결제
- 이메일 인증
- 소셜 로그인
- refresh token
- token blacklist
- 복잡한 권한 관리
- 실시간 알림
- 공공데이터 수집 기능
- AI 모델 직접 구현
- RAG 검색 직접 구현
- 검증 파이프라인

---

## 3. 기술 스택

### 3.1 Frontend

프론트엔드는 React 또는 Vue 중 하나를 선택해 구현한다.

권장안은 다음과 같다.

- React + Vite
- 또는 Vue 3 + Vite

MVP 기준에서는 디자인 시스템보다 빠른 구현과 API 연동 안정성을 우선한다.

### 3.2 Backend

백엔드는 FastAPI로 구현한다.

사용 기술은 다음과 같다.

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT
- passlib 또는 bcrypt 기반 비밀번호 해시
- SQLite 또는 PostgreSQL
- 배포 시 Render PostgreSQL 사용 가능

### 3.3 Database

초기 개발은 SQLite로 시작할 수 있다.

배포 또는 시연 환경에서는 PostgreSQL 사용을 권장한다.

DB 연결은 `DATABASE_URL` 환경변수로 관리하고, SQLite에서 PostgreSQL로 전환할 수 있도록 SQLAlchemy ORM 기준으로 작성한다.

예시:

```env
DATABASE_URL=sqlite:///./app.db
```

또는

```env
DATABASE_URL=postgresql+psycopg2://user:password@host:5432/dbname
```

---

## 4. 권장 프로젝트 구조

### 4.1 Backend 구조

```text
backend
├─ app
│  ├─ main.py
│  ├─ core
│  │  ├─ config.py
│  │  └─ security.py
│  ├─ db
│  │  ├─ database.py
│  │  └─ models.py
│  ├─ schemas
│  │  ├─ auth.py
│  │  └─ diagnosis.py
│  ├─ routers
│  │  ├─ auth.py
│  │  └─ diagnoses.py
│  ├─ services
│  │  ├─ auth_service.py
│  │  ├─ diagnosis_service.py
│  │  └─ ai_client.py
│  └─ utils
│     └─ id_generator.py
├─ requirements.txt
└─ README.md
```

### 4.2 Frontend 구조

React 기준 예시이다. Vue를 사용해도 동일한 화면 단위로 구성하면 된다.

```text
frontend
├─ src
│  ├─ api
│  │  ├─ client.ts
│  │  ├─ authApi.ts
│  │  └─ diagnosisApi.ts
│  ├─ components
│  │  ├─ DiagnosisForm.tsx
│  │  ├─ ResultCard.tsx
│  │  ├─ MarkdownReport.tsx
│  │  └─ LoadingState.tsx
│  ├─ pages
│  │  ├─ LoginPage.tsx
│  │  ├─ RegisterPage.tsx
│  │  ├─ HomePage.tsx
│  │  ├─ DiagnosisNewPage.tsx
│  │  ├─ DiagnosisResultPage.tsx
│  │  └─ DiagnosisHistoryPage.tsx
│  ├─ store
│  │  └─ authStore.ts
│  ├─ types
│  │  └─ diagnosis.ts
│  └─ App.tsx
├─ package.json
└─ README.md
```

---

## 5. 화면 구성

## 5.1 로그인 화면

사용자가 이메일과 비밀번호로 로그인할 수 있어야 한다.

### 입력값

- email
- password

### 성공 시

- access_token 저장
- 로그인 상태 유지
- 메인 화면으로 이동

### 실패 시

- 아이디 또는 비밀번호 오류 메시지 출력

---

## 5.2 회원가입 화면

사용자가 기본 계정을 생성할 수 있어야 한다.

### 입력값

- email
- password
- name

### 성공 시

- 로그인 화면 또는 메인 화면으로 이동

---

## 5.3 메인 화면

서비스 설명과 진단 시작 버튼을 보여준다.

### 필수 요소

- 서비스명
- 서비스 한 줄 설명
- 진단 시작 버튼
- 최근 진단 이력 일부

### 예시 문구

```text
신제품 출시 전 인증, 리콜 리스크 진단 어시스턴트

제품 정보를 입력하면 예상 인증유형, 적용 안전기준, 시험검사기관 안내, 유사 KC 인증 사례, 국내 리콜 사유, 출시 전 확인사항을 공공데이터 기반으로 정리해드립니다.
```

---

## 5.4 제품 진단 입력 화면

사용자가 제품 정보를 입력하는 화면이다.

### 필수 입력값

- product_name
- user_query
- target_age
- material_text
- power_type
- battery_included
- import_or_manufacture

### 선택 입력값

- model_name
- brand_name
- maker_country
- cert_num
- additional_info

### 입력 UI 권장

- 제품명: text input
- 제품 설명: textarea
- 사용연령: text input 또는 select
- 소재: textarea
- 전원 방식: select 또는 text input
- 배터리 포함 여부: checkbox 또는 radio
- 제조 또는 수입 구분: select
- 모델명, 브랜드명, 제조국, 인증번호: text input
- 추가 설명: textarea

---

## 5.5 진단 결과 화면

AI 진단 결과를 카드 형태로 출력한다.

### 출력 카드

1. 법정 품목명 후보
2. 예상 인증유형
3. 적용 안전기준
4. 시험검사기관 및 절차 안내
5. 유사 KC 인증 사례
6. 국내 리콜 사유 요약
7. 출시 전 확인사항
8. 최종 확인 필요 문구
9. Markdown 보고서

### 표시 원칙

진단 결과는 한 화면에 긴 문장으로만 보여주지 말고 카드 단위로 나누어 출력한다.

Markdown 보고서는 별도 영역에서 렌더링한다.

---

## 5.6 진단 이력 화면

로그인한 사용자가 이전 진단 요청을 확인할 수 있어야 한다.

### 표시 항목

- 진단 ID
- 제품명
- 상태
- 요약
- 생성일
- 상세보기 버튼

---

## 6. Backend API 정의

## 6.1 Auth API

### POST /auth/register

회원가입 API이다.

#### Request

```json
{
  "email": "user@example.com",
  "password": "password1234",
  "name": "박찬"
}
```

#### Response

```json
{
  "user_id": 1,
  "email": "user@example.com",
  "name": "박찬",
  "created_at": "2026-06-27T12:00:00"
}
```

---

### POST /auth/login

로그인 API이다.

#### Request

```json
{
  "email": "user@example.com",
  "password": "password1234"
}
```

#### Response

```json
{
  "access_token": "jwt_access_token",
  "token_type": "bearer",
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "name": "박찬"
  }
}
```

---

### POST /auth/logout

로그아웃 API이다.

MVP에서는 서버에서 토큰을 강제 폐기하지 않고, 프론트엔드에서 access_token을 삭제하는 방식으로 처리한다.

#### Request Header

```text
Authorization: Bearer {access_token}
```

#### Response

```json
{
  "message": "logout_success"
}
```

---

### GET /auth/me

현재 로그인한 사용자 정보를 반환한다.

#### Request Header

```text
Authorization: Bearer {access_token}
```

#### Response

```json
{
  "user_id": 1,
  "email": "user@example.com",
  "name": "박찬"
}
```

---

## 6.2 Diagnosis API

### POST /diagnoses

사용자가 입력한 제품 정보를 저장하고 AI 진단을 요청한다.

#### Request Header

```text
Authorization: Bearer {access_token}
```

#### Request Body

```json
{
  "product_name": "어린이용 책가방",
  "user_query": "초등학생이 사용하는 책가방을 출시하려고 합니다.",
  "target_age": "8세",
  "material_text": "폴리에스터, 코팅 원단, 플라스틱 버클",
  "power_type": "없음",
  "battery_included": false,
  "import_or_manufacture": "수입",
  "model_name": "BAG-001",
  "brand_name": "",
  "maker_country": "중국",
  "cert_num": "",
  "additional_info": ""
}
```

#### Response Body

```json
{
  "case_id": "case_001",
  "status": "completed",
  "product_name": "어린이용 책가방",
  "legal_product_candidates": [
    {
      "product_name": "아동용 섬유제품",
      "certification_type": "공급자적합성확인",
      "confidence_level": "candidate"
    }
  ],
  "certification_diagnosis": {
    "certification_type": "공급자적합성확인",
    "applied_standards": [
      "어린이제품 공통안전기준",
      "아동용 섬유제품 안전기준"
    ],
    "judgement_level": "CANDIDATE"
  },
  "institution_guidance": {
    "summary": "공급자적합성확인은 지정기관 신고 대상이 아니며, 시험성적서 등 적합성 입증 자료 확보가 필요합니다.",
    "institutions": []
  },
  "kc_certification_summary": {
    "summary": "유사 제품의 KC 인증 사례를 참고할 수 있습니다.",
    "representative_cases": []
  },
  "recall_reason_summary": {
    "summary": "유사 국내 리콜 사례에서 유해물질, 표시사항 관련 사유가 확인될 수 있습니다.",
    "top_recall_reasons": [
      "프탈레이트",
      "납",
      "표시사항"
    ]
  },
  "launch_checklist": [
    "법정 품목명 최종 확인",
    "안전기준 및 표시사항 확인",
    "원단, 코팅, 프린팅, 부자재 시험성적서 확보"
  ],
  "final_report_markdown": "## 진단 결과\n...",
  "disclaimer": "공공데이터 기반 사전 검토용 안내이며 최종 확인은 관계 기관에 필요합니다."
}
```

---

### GET /diagnoses

로그인한 사용자의 진단 이력을 조회한다.

#### Request Header

```text
Authorization: Bearer {access_token}
```

#### Response

```json
{
  "items": [
    {
      "case_id": "case_001",
      "product_name": "어린이용 책가방",
      "status": "completed",
      "summary": "아동용 섬유제품, 공급자적합성확인 후보",
      "created_at": "2026-06-27T12:00:00"
    }
  ]
}
```

---

### GET /diagnoses/{case_id}

진단 상세 결과를 조회한다.

#### Request Header

```text
Authorization: Bearer {access_token}
```

#### Response

```json
{
  "case_id": "case_001",
  "input": {
    "product_name": "어린이용 책가방",
    "target_age": "8세",
    "material_text": "폴리에스터, 코팅 원단, 플라스틱 버클"
  },
  "output": {
    "legal_product_candidates": [],
    "certification_diagnosis": {},
    "institution_guidance": {},
    "kc_certification_summary": {},
    "recall_reason_summary": {},
    "launch_checklist": [],
    "final_report_markdown": "",
    "disclaimer": ""
  },
  "created_at": "2026-06-27T12:00:00"
}
```

---

## 7. AI 서버 연동 방식

웹 백엔드는 사용자의 입력값을 받은 뒤 AI 개발자가 구현한 AI 진단 함수 또는 AI API를 호출한다.

권장 구조는 다음과 같다.

```text
Frontend
→ Web Backend FastAPI
→ AI Diagnosis Module 또는 AI FastAPI
→ Web Backend
→ Frontend
```

프론트엔드가 AI 서버를 직접 호출하지 않고, 웹 백엔드가 중간에서 호출하는 구조를 권장한다.

### 이유

- JWT 사용자 인증을 백엔드에서 처리할 수 있다.
- 사용자별 진단 이력을 DB에 저장할 수 있다.
- AI 서버 주소나 내부 구현을 프론트엔드에 노출하지 않을 수 있다.
- 추후 AI 서버가 분리되어도 웹 API 구조를 유지할 수 있다.

---

## 8. AI 모듈 호출 규격

웹 개발자는 AI 모듈 내부 로직을 구현하지 않는다.

다만 웹 백엔드에서 AI 모듈 또는 AI 서버로 넘길 입력값과 받을 출력값은 아래 형식을 기준으로 맞춘다.

### 8.1 AI 진단 요청 Payload

```json
{
  "product_name": "어린이용 책가방",
  "user_query": "초등학생이 사용하는 책가방을 출시하려고 합니다.",
  "target_age": "8세",
  "material_text": "폴리에스터, 코팅 원단, 플라스틱 버클",
  "power_type": "없음",
  "battery_included": false,
  "import_or_manufacture": "수입",
  "model_name": "BAG-001",
  "brand_name": "",
  "maker_country": "중국",
  "cert_num": "",
  "additional_info": ""
}
```

### 8.2 AI 진단 응답 Payload

```json
{
  "case_id": "case_001",
  "legal_product_candidates": [],
  "certification_diagnosis": {},
  "institution_guidance": {},
  "kc_certification_summary": {},
  "recall_reason_summary": {},
  "launch_checklist": [],
  "final_report_markdown": "",
  "disclaimer": ""
}
```

---

## 9. DB 테이블 설계

## 9.1 users

사용자 계정 테이블이다.

| 컬럼명 | 타입 | 설명 |
| --- | --- | --- |
| id | Integer, PK | 사용자 ID |
| email | String, Unique | 로그인 이메일 |
| password_hash | String | 해시된 비밀번호 |
| name | String | 사용자명 |
| created_at | DateTime | 생성일 |
| updated_at | DateTime | 수정일 |

---

## 9.2 diagnosis_cases

사용자의 진단 요청과 결과를 저장하는 테이블이다.

| 컬럼명 | 타입 | 설명 |
| --- | --- | --- |
| id | String, PK | 진단 케이스 ID |
| user_id | Integer, FK | 사용자 ID |
| product_name | String | 제품명 |
| user_query | Text | 사용자 원문 질문 |
| target_age | String | 사용연령 |
| material_text | Text | 소재 |
| power_type | String | 전원 방식 |
| battery_included | Boolean | 배터리 포함 여부 |
| import_or_manufacture | String | 제조 또는 수입 구분 |
| model_name | String | 모델명 |
| brand_name | String | 브랜드명 |
| maker_country | String | 제조국 |
| cert_num | String | 인증번호 |
| additional_info | Text | 추가 설명 |
| status | String | pending, completed, failed |
| ai_output_json | JSON | AI 진단 전체 결과 |
| final_report_markdown | Text | 최종 보고서 Markdown |
| error_message | Text | 실패 시 오류 메시지 |
| created_at | DateTime | 생성일 |
| updated_at | DateTime | 수정일 |

---

## 10. SQLAlchemy 모델 예시

아래 코드는 구현 방향을 보여주기 위한 예시이다. 실제 파일 분리는 개발자가 프로젝트 구조에 맞게 진행한다.

```python
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    diagnosis_cases = relationship("DiagnosisCase", back_populates="user")


class DiagnosisCase(Base):
    __tablename__ = "diagnosis_cases"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    product_name = Column(String, nullable=False)
    user_query = Column(Text, nullable=False)
    target_age = Column(String, nullable=True)
    material_text = Column(Text, nullable=True)
    power_type = Column(String, nullable=True)
    battery_included = Column(Boolean, nullable=True)
    import_or_manufacture = Column(String, nullable=True)

    model_name = Column(String, nullable=True)
    brand_name = Column(String, nullable=True)
    maker_country = Column(String, nullable=True)
    cert_num = Column(String, nullable=True)
    additional_info = Column(Text, nullable=True)

    status = Column(String, default="pending")
    ai_output_json = Column(JSON, nullable=True)
    final_report_markdown = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="diagnosis_cases")
```

---

## 11. JWT 인증 처리

MVP 기준에서는 다음 수준까지만 구현한다.

- 비밀번호는 반드시 해시 처리한다.
- 로그인 성공 시 JWT access_token을 발급한다.
- 인증이 필요한 API는 Authorization Bearer 토큰을 확인한다.
- 로그아웃은 프론트엔드에서 토큰을 삭제하는 방식으로 처리한다.
- refresh token, token blacklist, 이메일 인증은 후속 작업으로 둔다.

### JWT Payload 예시

```json
{
  "sub": "1",
  "email": "user@example.com",
  "exp": 1790000000
}
```

---

## 12. 진단 요청 상태 처리

진단 요청 상태는 다음 값으로 관리한다.

```text
pending
completed
failed
```

### 처리 흐름

1. 사용자가 진단 요청
2. `diagnosis_cases`에 `status=pending` 저장
3. AI 모듈 또는 AI 서버 호출
4. 성공 시 `ai_output_json` 저장, `status=completed` 변경
5. 실패 시 `error_message` 저장, `status=failed` 변경

---

## 13. 프론트엔드 API 연동 규칙

프론트엔드는 인증이 필요한 API 요청 시 반드시 Authorization header를 포함한다.

```text
Authorization: Bearer {access_token}
```

권장 방식:

- access_token은 localStorage 또는 sessionStorage에 저장
- 로그아웃 시 저장된 access_token 삭제
- 401 응답 발생 시 로그인 화면으로 이동
- API 요청 중에는 로딩 상태 표시
- API 실패 시 사용자에게 오류 메시지 표시

---

## 14. 프론트엔드 타입 예시

TypeScript 사용 시 아래 타입을 기준으로 작성한다.

```typescript
export type DiagnosisRequest = {
  product_name: string;
  user_query: string;
  target_age?: string;
  material_text?: string;
  power_type?: string;
  battery_included?: boolean;
  import_or_manufacture?: string;
  model_name?: string;
  brand_name?: string;
  maker_country?: string;
  cert_num?: string;
  additional_info?: string;
};

export type LegalProductCandidate = {
  product_name: string;
  certification_type?: string;
  confidence_level?: string;
};

export type DiagnosisResponse = {
  case_id: string;
  status?: "pending" | "completed" | "failed";
  product_name?: string;
  legal_product_candidates: LegalProductCandidate[];
  certification_diagnosis: Record<string, unknown>;
  institution_guidance: Record<string, unknown>;
  kc_certification_summary: Record<string, unknown>;
  recall_reason_summary: Record<string, unknown>;
  launch_checklist: string[];
  final_report_markdown: string;
  disclaimer: string;
};
```

---

## 15. 구현 순서

권장 구현 순서는 다음과 같다.

1. FastAPI 프로젝트 생성
2. SQLAlchemy DB 연결
3. `users`, `diagnosis_cases` 모델 작성
4. 회원가입 API 구현
5. 로그인 API 및 JWT 발급 구현
6. 인증 dependency 구현
7. 진단 요청 저장 API 구현
8. AI 모듈 또는 AI 서버 호출부 mock 구현
9. 진단 결과 저장 및 조회 API 구현
10. 프론트엔드 로그인, 회원가입 화면 구현
11. 제품 진단 입력 화면 구현
12. 진단 결과 화면 구현
13. 진단 이력 화면 구현
14. 실제 AI API 연결
15. 배포 환경 변수 정리

---

## 16. Mock AI 응답

AI 서버가 아직 완전히 붙기 전에는 아래 mock 응답으로 프론트엔드를 먼저 구현한다.

```json
{
  "case_id": "mock_case_001",
  "status": "completed",
  "product_name": "어린이용 책가방",
  "legal_product_candidates": [
    {
      "product_name": "아동용 섬유제품",
      "certification_type": "공급자적합성확인",
      "confidence_level": "candidate"
    }
  ],
  "certification_diagnosis": {
    "certification_type": "공급자적합성확인",
    "applied_standards": [
      "어린이제품 공통안전기준",
      "아동용 섬유제품 안전기준"
    ],
    "judgement_level": "CANDIDATE"
  },
  "institution_guidance": {
    "summary": "공급자적합성확인은 지정기관 신고 대상이 아니며, 시험성적서 등 적합성 입증 자료 확보가 필요합니다.",
    "institutions": []
  },
  "kc_certification_summary": {
    "summary": "유사 제품의 KC 인증 사례를 참고할 수 있습니다.",
    "representative_cases": []
  },
  "recall_reason_summary": {
    "summary": "유사 국내 리콜 사례에서 유해물질, 표시사항 관련 사유가 확인될 수 있습니다.",
    "top_recall_reasons": [
      "프탈레이트",
      "납",
      "표시사항"
    ]
  },
  "launch_checklist": [
    "법정 품목명 최종 확인",
    "안전기준 및 표시사항 확인",
    "원단, 코팅, 프린팅, 부자재 시험성적서 확보"
  ],
  "final_report_markdown": "## 진단 결과\n\n### 1. 법정 품목명 후보\n- 아동용 섬유제품\n\n### 2. 예상 인증유형\n- 공급자적합성확인 후보\n\n### 3. 출시 전 확인사항\n- 법정 품목명 최종 확인\n- 안전기준 및 표시사항 확인",
  "disclaimer": "공공데이터 기반 사전 검토용 안내이며 최종 확인은 관계 기관에 필요합니다."
}
```

---

## 17. 환경변수

백엔드에서 사용할 환경변수 예시는 다음과 같다.

```env
APP_ENV=development
DATABASE_URL=sqlite:///./app.db
JWT_SECRET_KEY=change_this_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120
AI_API_BASE_URL=http://localhost:8001
```

배포 환경에서는 `JWT_SECRET_KEY`를 반드시 변경한다.

---

## 18. 배포 참고

배포는 Render를 사용할 수 있다.

권장 구성:

- Frontend: Render Static Site 또는 Vercel
- Backend: Render Web Service
- Database: Render PostgreSQL

SQLite는 로컬 개발에는 적합하지만, Render 배포 환경에서는 파일 영속성 문제가 생길 수 있으므로 PostgreSQL 사용을 권장한다.

---

## 19. 완료 조건

웹 개발자의 MVP 완료 조건은 다음과 같다.

- 회원가입이 가능하다.
- 로그인이 가능하다.
- 로그아웃이 가능하다.
- JWT 인증이 필요한 API를 보호한다.
- 사용자가 제품 정보를 입력할 수 있다.
- 진단 요청을 FastAPI 백엔드로 보낼 수 있다.
- 백엔드는 AI 모듈 또는 AI 서버에 진단 요청을 전달할 수 있다.
- 진단 결과를 DB에 저장할 수 있다.
- 사용자가 진단 결과와 진단 이력을 조회할 수 있다.
- 프론트엔드는 진단 결과를 카드와 Markdown 보고서 형태로 출력할 수 있다.
- AI 서버 장애 또는 응답 실패 시 오류 메시지를 보여줄 수 있다.

---

## 20. 개발자 유의사항

- 웹 개발자는 AI 로직을 직접 구현하지 않는다.
- AI 응답 구조가 일부 바뀔 수 있으므로 결과 출력 컴포넌트는 빈 값에 안전하게 작성한다.
- `final_report_markdown`은 Markdown 렌더러를 통해 출력한다.
- API 통신 실패, 401 인증 실패, AI 처리 실패를 구분해서 처리한다.
- DB는 SQLAlchemy ORM 기준으로 작성해 SQLite와 PostgreSQL 모두 대응 가능하게 한다.
- MVP에서는 빠른 구현을 우선하되, 코드 구조는 후속 확장이 가능하게 나눈다.
