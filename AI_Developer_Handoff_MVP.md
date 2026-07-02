# AI Developer Handoff MVP

프로젝트: 신제품 출시 전 인증, 리콜 리스크 진단 어시스턴트  
전달 대상: AI 개발자  
작성 목적: Python 기반 FastAPI AI 모듈 구현을 위한 개발 명세  
작성 기준: PPT 아키텍처, DB 정의서, 스키마 정의서, KC 포함 RAG 통합 파일  
버전: v1.0  
작성일: 2026-06-27

---

## 1. 프로젝트 개요

본 프로젝트는 어린이제품을 우선 대상으로, 사용자가 출시 예정 제품 정보를 입력하면 다음 내용을 사전 검토용으로 안내하는 AI 어시스턴트를 만드는 것이다.

- 입력 제품이 어떤 법정 품목명 후보에 가까운지 확인
- 해당 품목의 예상 인증유형과 적용 안전기준 확인
- 인증 또는 시험검사 관련 기관과 절차 안내
- 유사 국내리콜 사례에서 반복적으로 나타나는 리콜 사유 확인
- KC 인증정보 기반 유사 인증 사례 경향 확인
- 출시 전 확인해야 할 항목을 체크리스트로 정리
- 최종 결과를 JSON과 Markdown 보고서 형태로 반환

중요한 점은 AI가 최종 법적 판단을 내리는 구조가 아니라는 것이다. AI는 DB와 RAG chunk에 저장된 기준과 사례를 검색하고, 그 근거를 사용자에게 이해하기 쉬운 문장으로 조립하는 역할을 한다.

---

## 2. AI 개발자 담당 범위

### 2.1 담당 범위

AI 개발자는 다음 범위만 구현한다.

1. JSON, JSONL 기반 데이터 로딩
2. 사용자 입력 제품 정보 구조화
3. 제품명 기반 법정 품목명 후보 검색
4. 인증유형 및 적용 안전기준 조회
5. 기관 및 절차 안내 조회
6. 국내 리콜 사례 검색 및 주요 리콜 사유 요약
7. KC 인증정보 검색 및 유사 인증 사례 요약
8. Hugging Face 기반 무료 생성형 LLM을 사용한 최종 문장 생성
9. FastAPI 기반 AI 진단 API 구현
10. 결과를 JSON과 Markdown 형태로 반환

### 2.2 비담당 범위

다음은 AI 개발자 1차 범위에서 제외한다.

1. 웹 프론트엔드 개발
2. 정식 PostgreSQL 구축
3. 운영용 로그인, 사용자 관리
4. 복잡한 DB 마이그레이션
5. 자동 평가 및 검증 파이프라인
6. 추가 공공데이터 수집
7. 법적 최종 판단 로직
8. 인증기관 실제 접수 자동화

---

## 3. MVP 구현 전제

최종 서비스의 논리 구조는 `meta`, `master`, `safety`, `service`, `rag`로 구분된 스키마를 기준으로 한다.

다만 현재 MVP 개발 단계에서는 PostgreSQL 또는 별도 DB를 사용하지 않는다. 동일한 역할의 JSON 및 JSONL 파일을 로컬 데이터 소스로 사용한다.

따라서 개발자는 문서에 등장하는 `master`, `safety`, `service`, `rag`를 실제 DB 스키마가 아니라 파일 기반 데이터 레이어의 논리적 구분으로 이해한다.

### 3.1 사용자 서비스 기준 논리 구조

```text
compliance_assistant_db
├─ meta
│  ├─ data_source
│  └─ schema_registry
│
├─ master
│  ├─ certification_annex_rule
│  ├─ safety_standard_document
│  ├─ safety_standard_check_item
│  ├─ test_institution
│  ├─ institution_scope
│  ├─ certification_process_rule
│  ├─ supplier_conformity_scope
│  ├─ product_category_index
│  └─ product_category_dictionary
│
├─ safety
│  ├─ domestic_recall
│  └─ kc_certification
│
├─ service
│  ├─ product_case
│  ├─ product_feature
│  ├─ category_match_result
│  ├─ certification_diagnosis
│  ├─ recall_reason_summary
│  ├─ ai_diagnosis
│  └─ final_report
│
└─ rag
   ├─ rag_chunk
   └─ rag_search_log
```

### 3.2 MVP 제작 기준 파일 구조

```text
project_root
├─ data
│  ├─ master_json
│  │  ├─ certification_annex_rule.json
│  │  ├─ safety_standard_document.json
│  │  ├─ safety_standard_check_item.json
│  │  ├─ test_institution.json
│  │  ├─ institution_scope.json
│  │  ├─ certification_process_rule.json
│  │  ├─ supplier_conformity_scope.json
│  │  ├─ product_category_index.json
│  │  └─ product_category_dictionary.json
│  │
│  ├─ safety_json
│  │  ├─ domestic_recall.json
│  │  └─ kc_certification.json
│  │
│  ├─ rag_jsonl
│  │  ├─ product_category_rag_chunk.jsonl
│  │  ├─ certification_annex_rag_chunk.jsonl
│  │  ├─ safety_standard_rag_chunk.jsonl
│  │  ├─ institution_rag_chunk.jsonl
│  │  ├─ domestic_recall_rag_chunk.jsonl
│  │  ├─ kc_certification_rag_chunk.jsonl
│  │  └─ rag_chunk_all.jsonl
│  │
│  └─ docs
│     ├─ schema_definition.md
│     ├─ file_definition.md
│     └─ README.md
│
└─ app
   ├─ main.py
   ├─ core
   │  └─ config.py
   ├─ loaders
   │  ├─ json_loader.py
   │  └─ jsonl_loader.py
   ├─ search
   │  ├─ keyword_search.py
   │  ├─ bm25_search.py
   │  └─ embedding_search.py
   ├─ services
   │  ├─ diagnosis_service.py
   │  ├─ product_normalizer.py
   │  ├─ category_matcher.py
   │  ├─ certification_service.py
   │  ├─ institution_service.py
   │  ├─ recall_service.py
   │  ├─ kc_service.py
   │  └─ report_service.py
   ├─ llm
   │  ├─ hf_generator.py
   │  └─ prompts.py
   └─ schemas
      ├─ request.py
      └─ response.py
```

---

## 4. 핵심 데이터 파일 정의

### 4.1 master_json

`master_json`은 법령 별표, 안전기준, 기관, 제품명 매핑 같은 기준 데이터를 담는다.

| 파일명 | 역할 |
| --- | --- |
| `certification_annex_rule.json` | 어린이제품 법정 품목명을 인증유형과 적용 안전기준에 연결하는 기준 데이터 |
| `safety_standard_document.json` | 품목별 안전기준 원문 문서 메타데이터와 최신본 선별 정보 |
| `safety_standard_check_item.json` | 안전기준에서 추출한 출시 전 확인항목 |
| `test_institution.json` | 안전인증기관과 안전확인 시험검사기관 기본정보 |
| `institution_scope.json` | 기관별 담당 가능한 품목 업무범위 |
| `certification_process_rule.json` | 인증유형별 절차, 필요 서류, 기관 필요 여부 |
| `supplier_conformity_scope.json` | 공급자적합성확인대상 품목과 적용기준 |
| `product_category_index.json` | 사용자 표현을 법정 품목명 후보로 연결하는 매핑 인덱스 |
| `product_category_dictionary.json` | 법정 품목별 별칭, 리콜 표현, 위험 키워드, 기관 후보 요약 |

### 4.2 safety_json

`safety_json`은 국내리콜과 KC 인증정보 같은 원천 사례 데이터를 담는다.

| 파일명 | 역할 |
| --- | --- |
| `domestic_recall.json` | SafetyKorea 국내리콜정보 원천 데이터 |
| `kc_certification.json` | KC 인증정보 원천 데이터 |

### 4.3 rag_jsonl

`rag_jsonl`은 LLM과 검색기가 직접 참조하는 RAG chunk 데이터이다.

| 파일명 | 역할 |
| --- | --- |
| `product_category_rag_chunk.jsonl` | 사용자 제품명을 법정 품목명 후보로 매칭하기 위한 chunk |
| `certification_annex_rag_chunk.jsonl` | 법정 품목명에서 인증유형과 적용 안전기준을 검색하기 위한 chunk |
| `safety_standard_rag_chunk.jsonl` | 안전기준 문서와 확인항목 검색용 chunk |
| `institution_rag_chunk.jsonl` | 품목명과 인증유형에 따른 기관 후보와 절차 검색용 chunk |
| `domestic_recall_rag_chunk.jsonl` | 국내리콜 사례, 리콜 사유, 출시 전 확인항목 검색용 chunk |
| `kc_certification_rag_chunk.jsonl` | KC 인증정보 요약 검색용 chunk |
| `rag_chunk_all.jsonl` | 제품분류, 인증유형, 안전기준, 기관, 국내리콜, KC 인증정보를 통합한 최종 검색 파일 |

---

## 5. 현재 제공 데이터 상태

### 5.1 KC 인증정보 원천 데이터

파일: `safety_json/kc_certification.json`

확인된 상태:

```text
데이터 수: 353,861건
압축 해제 기준 크기: 약 237MB
형식: JSON 배열
주요 용도: 유사 KC 인증사례 상세 조회
```

주요 key:

```text
certUid
certOrganName
certNum
certState
certDiv
certDate
certChgDate
certChgReason
firstCertNum
productName
brandName
modelName
categoryName
importDiv
makerName
makerCntryName
importerName
remark
signDate
derivationModels
certificationImageUrls
factories
similarCertifications
```

KC 인증정보 검색 우선순위는 다음과 같이 둔다.

```text
1순위: certNum
2순위: productName
3순위: modelName
4순위: categoryName
5순위: makerName, importerName
```

`brandName`은 비어 있는 경우가 많으므로 핵심 검색 기준으로 사용하지 않는다.

### 5.2 KC 포함 통합 RAG 파일

파일: `rag_jsonl/rag_chunk_all.jsonl`

실제 전달 파일명이 `rag_chunk_all_with_kc.jsonl`인 경우, 개발 환경에서는 `rag_chunk_all.jsonl`로 이름을 통일하는 것을 권장한다.

확인된 상태:

```text
총 chunk 수: 385개
JSONL 파싱 오류: 없음
```

문서 유형별 chunk 수:

| document_type | chunk 수 |
| --- | ---: |
| `SAFETY_STANDARD_CHECK_ITEM` | 241 |
| `CERTIFICATION_RULE` | 36 |
| `SAFETY_STANDARD_DOCUMENT` | 35 |
| `KC_CERTIFICATION_SUMMARY` | 33 |
| `TEST_INSTITUTION_SCOPE` | 22 |
| `SUPPLIER_CONFORMITY_SCOPE` | 15 |
| `CERTIFICATION_PROCESS_RULE` | 3 |

KC chunk는 개별 인증 건 전체를 모두 RAG에 넣은 것이 아니라, 법정 품목명 후보별 KC 인증 사례를 요약한 `KC_CERTIFICATION_SUMMARY` 형태이다.

따라서 AI 모듈은 다음 원칙으로 동작해야 한다.

```text
1. KC 인증 경향 설명은 rag_chunk_all.jsonl의 KC_CERTIFICATION_SUMMARY chunk를 사용한다.
2. 개별 인증번호, 모델명, 제조자, 수입자 등 상세 조회가 필요하면 kc_certification.json을 별도 조회한다.
3. KC 인증정보는 최종 인증 가능 여부 판단이 아니라 유사 인증사례 확인용 보조 근거로만 사용한다.
```

---

## 6. AI 시스템 처리 흐름

전체 흐름은 다음과 같다.

```text
사용자 제품 정보 입력
→ 제품 스펙 구조화
→ 법정 품목명 후보 매칭
→ 인증유형 및 안전기준 조회
→ 기관 및 절차 안내 조회
→ 국내 리콜 사유 검색
→ KC 유사 인증사례 검색
→ AI 진단 생성
→ JSON 및 Markdown 결과 반환
```

### Phase 0. 데이터 로딩

서버 시작 시 다음 데이터를 로드한다.

```text
master_json/*.json
safety_json/domestic_recall.json
safety_json/kc_certification.json
rag_jsonl/rag_chunk_all.jsonl
```

메모리 부족 시 `kc_certification.json`은 전체 로드하지 않고, 다음 경량 인덱스를 별도로 만들어 로드하는 방식을 허용한다.

```text
certNum index
productName index
modelName index
categoryName index
makerName/importerName index
```

### Phase 1. 제품 정보 구조화

사용자의 자연어 입력을 DB 또는 파일 조회가 가능한 구조로 바꾼다.

입력 예시:

```json
{
  "product_name": "어린이용 책가방",
  "user_query": "초등학생이 사용하는 책가방을 출시하려고 합니다.",
  "target_age": "8세",
  "material_text": "폴리에스터, 코팅 원단, 플라스틱 버클",
  "power_type": "없음",
  "battery_included": false,
  "import_or_manufacture": "수입"
}
```

구조화 결과 예시:

```json
{
  "normalized_product_name": "어린이용 책가방",
  "key_features": {
    "target_age": "8세",
    "material": ["폴리에스터", "코팅 원단", "플라스틱 버클"],
    "power_type": "없음",
    "battery_included": false,
    "import_or_manufacture": "수입"
  },
  "missing_fields": [],
  "confidence": 0.8
}
```

LLM 사용은 가능하지만, 제품 구조화 결과는 반드시 고정 JSON 형식으로 반환해야 한다.

### Phase 2. 법정 품목명 후보 매칭

우선 `master_json/product_category_index.json`을 사용한다.

검색 기준:

```text
user_expression
normalized_expression
legal_product_name
display_product_name
hazard_keywords
aliases
```

매칭 결과는 다음 수준으로 구분한다.

```text
CONFIRMED: 명확하게 매칭됨
CANDIDATE: 후보로 제시 가능함
NEEDS_CONFIRMATION: 사용자 추가 확인 필요
NO_MATCH: 안정적인 후보를 찾지 못함
```

LLM 단독으로 법정 품목명을 새로 만들면 안 된다. 반드시 기준 데이터에 존재하는 품목명만 후보로 반환한다.

### Phase 3. 인증유형 및 안전기준 조회

선택된 법정 품목명 후보를 기준으로 다음 파일을 조회한다.

```text
master_json/certification_annex_rule.json
master_json/safety_standard_document.json
master_json/safety_standard_check_item.json
```

반환해야 할 내용:

```text
법정 품목명 후보
예상 인증유형
공통 안전기준
품목별 안전기준
출시 전 확인항목
근거 파일 또는 source_pk
판단 수준
```

인증유형은 다음 세 가지 중 기준 데이터에 존재하는 값만 반환한다.

```text
안전인증
안전확인
공급자적합성확인
```

### Phase 4. 기관 및 절차 안내

다음 파일을 조회한다.

```text
master_json/test_institution.json
master_json/institution_scope.json
master_json/certification_process_rule.json
master_json/supplier_conformity_scope.json
```

반환해야 할 내용:

```text
인증유형별 절차 요약
지정기관 필요 여부
기관 역할
가능 기관 후보
필요 서류 또는 확보 자료
기관 홈페이지
```

공급자적합성확인의 경우 지정기관 신고 대상이 아닐 수 있으므로, 해당 경우에는 시험성적서 등 적합성 입증 자료 확보 안내를 우선한다.

### Phase 5. 국내리콜 사유 검색

다음 데이터를 사용한다.

```text
safety_json/domestic_recall.json
rag_jsonl/rag_chunk_all.jsonl의 국내리콜 관련 chunk
master_json/safety_standard_check_item.json
```

반환해야 할 내용:

```text
관련 리콜 건수
반복 리콜 사유
대표 리콜 사례
위해 내용
사고 사례
조치 내용
출시 전 예방 확인사항
source_recall_ids 또는 source_refs
```

리콜 사유는 단순 나열하지 않고, 출시 전 확인항목으로 변환해야 한다.

예시:

```text
리콜 원문: 프탈레이트계 가소제 기준치 초과
출시 전 확인항목: 원단, 코팅, 프린팅, 플라스틱 부자재에 대해 프탈레이트계 가소제 시험성적서를 확보한다.
```

### Phase 6. KC 인증정보 검색

다음 데이터를 사용한다.

```text
safety_json/kc_certification.json
rag_jsonl/rag_chunk_all.jsonl의 KC_CERTIFICATION_SUMMARY chunk
```

반환해야 할 내용:

```text
유사 KC 인증사례 수
주요 인증기관
주요 인증구분
대표 제품명 또는 모델명
인증상태 분포
개별 인증 상세가 필요한 경우 certNum, modelName, certOrganName
```

KC 인증정보는 다음 문구와 함께 사용한다.

```text
KC 인증정보는 유사 인증사례 확인용 보조 근거이며, 실제 인증 가능 여부나 접수 가능 기관은 현재 지정기관 업무범위와 관계 기관 확인이 필요합니다.
```

### Phase 7. 최종 AI 진단 생성

Rule/Search 결과를 먼저 확정한 뒤, LLM은 그 결과를 사용자용 문장으로 정리한다.

LLM이 할 수 있는 일:

```text
제품 설명 구조화
검색 결과 요약
리콜 사유를 출시 전 체크리스트로 문장화
최종 Markdown 보고서 생성
```

LLM이 하면 안 되는 일:

```text
DB에 없는 인증유형 생성
법적 최종 판단
근거 없는 리콜 위험 생성
없는 KC 인증 사례 생성
안전기준 수치 임의 생성
인증기관 확정 안내
```

---

## 7. RAG 검색 구조

### 7.1 기본 원칙

초기 MVP에서는 복잡한 Vector DB를 사용하지 않는다.

기본 검색은 다음 순서로 구현한다.

```text
1차: keyword search 또는 BM25
2차: sentence-transformers 기반 embedding search
3차: 검색 결과를 Rule 결과와 함께 LLM에 전달
```

검색 대상은 기본적으로 `rag_jsonl/rag_chunk_all.jsonl` 하나로 둔다.

### 7.2 RAG chunk 공통 필드

RAG chunk는 다음 필드를 기준으로 처리한다.

```text
chunk_id 또는 rag_chunk_id
document_type
title
chunk_text
product_name 또는 product_category
certification_type
keywords
metadata
source_table
source_pk
source_file
search_weight
is_active
```

`is_active`가 false인 chunk는 검색 대상에서 제외한다.

### 7.3 검색 가중치 제안

기본 가중치 예시:

```text
제품명 직접 매칭: +5
법정 품목명 매칭: +5
keywords 매칭: +3
certification_type 매칭: +2
document_type 우선순위 매칭: +2
search_weight 필드: 기존 값 반영
```

문서 유형 우선순위:

```text
1. PRODUCT_CATEGORY_MAPPING 또는 제품분류 관련 chunk
2. CERTIFICATION_RULE
3. SAFETY_STANDARD_CHECK_ITEM
4. TEST_INSTITUTION_SCOPE
5. CERTIFICATION_PROCESS_RULE
6. DOMESTIC_RECALL 관련 chunk
7. KC_CERTIFICATION_SUMMARY
```

실제 `document_type` 값은 데이터에 들어 있는 값을 기준으로 처리한다.

---

## 8. 모델 사용 방향

### 8.1 생성형 LLM

생성형 LLM은 Hugging Face에서 무료로 사용 가능한 모델을 기준으로 한다.

1차 추천:

```text
kakaocorp/kanana-1.5-2.1b-instruct-2505
```

백업 후보:

```text
naver-hyperclovax/HyperCLOVAX-SEED-Text-Instruct-1.5B
Qwen/Qwen2.5-1.5B-Instruct
```

선택 기준:

```text
한국어 출력 품질
가벼운 실행 가능성
instruction following 가능 여부
로컬 또는 무료 환경 실행 가능 여부
응답 속도
```

LLM은 판단자가 아니라 문장 조립기로 사용한다.

### 8.2 임베딩 모델

검색 임베딩은 다음 모델을 우선 고려한다.

```text
dragonkue/multilingual-e5-small-ko
```

백업 후보:

```text
dragonkue/multilingual-e5-small-ko-v2
Qwen 계열 임베딩 모델 또는 개발자 판단 모델
```

단, MVP 첫 구현에서는 BM25만으로 baseline을 먼저 만든 뒤, 필요할 때 임베딩 검색을 붙여도 된다.

---

## 9. FastAPI API 명세

### 9.1 Health Check

```http
GET /health
```

응답 예시:

```json
{
  "status": "ok",
  "loaded": {
    "master_json": true,
    "safety_json": true,
    "rag_chunk_all": true,
    "llm": true
  }
}
```

### 9.2 AI 진단 API

```http
POST /diagnose
```

요청 예시:

```json
{
  "product_name": "어린이용 책가방",
  "user_query": "초등학생이 사용하는 책가방을 출시하려고 합니다.",
  "target_age": "8세",
  "material_text": "폴리에스터, 코팅 원단, 플라스틱 버클",
  "power_type": "없음",
  "battery_included": false,
  "import_or_manufacture": "수입"
}
```

응답 예시:

```json
{
  "case_id": "case_20260627_0001",
  "status": "success",
  "input_summary": {
    "product_name": "어린이용 책가방",
    "target_age": "8세",
    "material_text": "폴리에스터, 코팅 원단, 플라스틱 버클",
    "power_type": "없음",
    "battery_included": false,
    "import_or_manufacture": "수입"
  },
  "legal_product_candidates": [
    {
      "legal_product_name": "아동용 섬유제품",
      "display_product_name": "아동용 섬유제품",
      "certification_type": "공급자적합성확인",
      "confidence_level": "candidate",
      "confidence_score": 0.72,
      "needs_user_confirmation": true,
      "match_basis": "제품명과 소재 기준 후보 매칭"
    }
  ],
  "certification_diagnosis": {
    "certification_type": "공급자적합성확인",
    "applied_standards": [
      "어린이제품 공통안전기준",
      "아동용 섬유제품 안전기준"
    ],
    "judgement_level": "CANDIDATE",
    "source_refs": []
  },
  "institution_guidance": {
    "institution_required": false,
    "summary": "공급자적합성확인은 지정기관 신고 대상이 아니며, 사업자가 안전기준 적합성을 입증할 수 있는 자료를 확보해야 합니다.",
    "candidate_institutions": []
  },
  "recall_reason_summary": {
    "recall_count": 0,
    "top_recall_reasons": [],
    "representative_cases": [],
    "prevention_points": []
  },
  "kc_certification_summary": {
    "similar_cert_count": 0,
    "top_cert_organ_names": [],
    "representative_models": [],
    "note": "KC 인증정보는 유사 인증사례 확인용 보조 근거입니다."
  },
  "launch_checklist": [
    "법정 품목명 최종 확인",
    "적용 안전기준과 표시사항 확인",
    "원단, 코팅, 프린팅, 부자재 시험성적서 확보"
  ],
  "final_report_markdown": "",
  "used_rag_chunk_ids": [],
  "source_refs": [],
  "model_name": "kakaocorp/kanana-1.5-2.1b-instruct-2505",
  "disclaimer": "공공데이터 기반 사전 검토용 안내이며 최종 확인은 관계 기관에 필요합니다."
}
```

---

## 10. 출력 구조 원칙

최종 응답은 반드시 다음 두 형태를 함께 제공한다.

```text
1. 구조화 JSON
2. 사용자 화면 표시용 Markdown 보고서
```

### 10.1 필수 응답 필드

```text
case_id
status
input_summary
legal_product_candidates
certification_diagnosis
institution_guidance
recall_reason_summary
kc_certification_summary
launch_checklist
final_report_markdown
used_rag_chunk_ids
source_refs
model_name
disclaimer
```

### 10.2 Markdown 보고서 기본 구조

```markdown
# 신제품 출시 전 인증 및 리콜 리스크 사전 검토 결과

## 1. 입력 제품 요약

## 2. 법정 품목명 후보

## 3. 예상 인증유형 및 적용 안전기준

## 4. 기관 및 절차 안내

## 5. 국내 리콜 사유 요약

## 6. KC 유사 인증사례 참고

## 7. 출시 전 확인 체크리스트

## 8. 최종 확인 필요사항

## 9. 안내 문구
```

---

## 11. 프롬프트 설계 원칙

### 11.1 시스템 프롬프트 핵심

```text
너는 신제품 출시 전 인증, 리콜 리스크 사전 검토를 돕는 AI 어시스턴트다.
반드시 제공된 rule, search result, RAG chunk, source_refs에 근거해서만 답변한다.
법적 최종 판단처럼 말하지 않는다.
DB나 RAG에 없는 인증유형, 안전기준, 리콜 사례, KC 인증사례를 생성하지 않는다.
답변은 사전 검토용 안내로 표현한다.
최종 확인은 관계 기관에 필요하다는 disclaimer를 포함한다.
```

### 11.2 사용자 보고서 생성 프롬프트 입력

LLM에는 다음 구조화 결과만 전달한다.

```json
{
  "product_feature": {},
  "category_match_result": [],
  "certification_diagnosis": {},
  "institution_guidance": {},
  "recall_reason_summary": {},
  "kc_certification_summary": {},
  "retrieved_chunks": [],
  "missing_fields": []
}
```

LLM이 원천 데이터 전체를 직접 읽도록 하지 않는다.

---

## 12. 예외 처리

### 12.1 제품명 후보를 찾지 못한 경우

```json
{
  "status": "needs_more_input",
  "message": "입력 제품명만으로 안정적인 법정 품목명 후보를 찾지 못했습니다.",
  "missing_fields": ["사용연령", "용도", "소재", "전원 또는 배터리 유무"]
}
```

### 12.2 후보가 여러 개인 경우

```json
{
  "status": "candidate_multiple",
  "message": "여러 법정 품목명 후보가 확인되었습니다. 제품의 사용연령, 용도, 소재를 추가 확인해야 합니다.",
  "legal_product_candidates": []
}
```

### 12.3 RAG 검색 결과가 부족한 경우

```json
{
  "status": "partial_result",
  "message": "기준 데이터에서는 일부 정보만 확인되었습니다. 관계 기관 확인이 필요합니다.",
  "source_refs": []
}
```

### 12.4 LLM 생성 실패 시

LLM 생성이 실패하면 템플릿 기반 보고서를 반환한다.

```text
Rule/Search 결과가 있으면 서비스는 실패하지 않아야 한다.
LLM은 보조 생성기이며, 핵심 결과는 Rule/Search에서 나온다.
```

---

## 13. 구현 우선순위

### Step 1. 데이터 로더

```text
JSON loader
JSONL loader
rag_chunk_all loader
KC certification loader
```

### Step 2. 검색 baseline

```text
제품명 정규화
keyword search
BM25 search
chunk score 계산
상위 chunk 반환
```

### Step 3. Rule 기반 조회

```text
product_category_index 검색
certification_annex_rule 조회
safety_standard_check_item 조회
institution_scope 조회
certification_process_rule 조회
```

### Step 4. KC 및 리콜 조회

```text
domestic_recall 검색
KC_CERTIFICATION_SUMMARY 검색
kc_certification.json 상세 조회
```

### Step 5. LLM 보고서 생성

```text
Hugging Face 모델 로드
보고서 생성 프롬프트 작성
Markdown 생성
JSON 응답 조립
```

### Step 6. FastAPI 연결

```text
GET /health
POST /diagnose
```

---

## 14. 개발 시 주의사항

1. 법적 확정 표현을 사용하지 않는다.
2. 기준 데이터에 없는 품목명은 새로 만들지 않는다.
3. KC 인증정보는 유사 사례 참고용이지 인증 가능 여부 판단용이 아니다.
4. 국내리콜정보는 과거 사례 기반이므로 현재 제품의 리콜 확정 판단으로 표현하지 않는다.
5. LLM이 생성한 문장보다 Rule/Search 결과를 우선한다.
6. 모든 최종 응답에는 `used_rag_chunk_ids`, `source_refs`, `model_name`, `disclaimer`를 포함한다.
7. 검증 구조는 후속이지만, 추후 검증을 위해 중간 결과를 JSON으로 남긴다.
8. 메모리 부족 시 KC 원천 데이터는 경량 인덱스로 분리한다.
9. `rag_chunk_all.jsonl`은 KC 포함 최종본을 사용한다.
10. MVP에서는 PostgreSQL을 사용하지 않지만, 필드명은 향후 DB 전환을 고려해 스키마 정의서 기준을 따른다.

---

## 15. 테스트 케이스 초안

### Case 1. 어린이용 책가방

입력:

```json
{
  "product_name": "어린이용 책가방",
  "target_age": "8세",
  "material_text": "폴리에스터, 코팅 원단, 플라스틱 버클",
  "power_type": "없음",
  "battery_included": false,
  "import_or_manufacture": "수입"
}
```

기대 방향:

```text
법정 품목명 후보: 아동용 섬유제품 또는 관련 후보
인증유형: 공급자적합성확인 후보
확인사항: 유해물질, 표시사항, 부자재, 시험성적서
```

### Case 2. 장난감 자동차

입력:

```json
{
  "product_name": "장난감 자동차",
  "target_age": "5세",
  "material_text": "플라스틱, 금속 나사",
  "power_type": "건전지",
  "battery_included": true,
  "import_or_manufacture": "수입"
}
```

기대 방향:

```text
법정 품목명 후보: 완구
인증유형: 안전확인 후보
확인사항: 작은 부품, 날카로운 가장자리, 유해물질, 배터리 관련 확인
KC 인증정보: 완구 관련 유사 인증사례 요약
```

### Case 3. 유아용 섬유제품

입력:

```json
{
  "product_name": "유아용 내의",
  "target_age": "12개월",
  "material_text": "면 100%",
  "power_type": "없음",
  "battery_included": false,
  "import_or_manufacture": "제조"
}
```

기대 방향:

```text
법정 품목명 후보: 유아용 섬유제품
인증유형: 기준 데이터 기준 후보 반환
확인사항: 섬유 유해물질, 표시사항, 사용연령, 제조자 정보
```

---

## 16. 후속 작업

검증 구조는 후속으로 둔다.

후속에서 추가할 수 있는 작업:

```text
schema_registry 기반 output JSON 검증
검색 품질 평가셋 구축
정답 후보 30건 기반 수동 평가
Hallucination 방지 테스트
KC 인증정보 경량 index 생성
FastAPI와 웹 프론트 연동 문서 작성
PostgreSQL 전환 스크립트 작성
pgvector 또는 다른 Vector DB 도입 검토
```

---

## 17. 개발 완료 기준

MVP 완료 기준은 다음과 같다.

```text
1. POST /diagnose로 제품 정보를 입력할 수 있다.
2. 법정 품목명 후보가 최소 1개 이상 반환된다.
3. 인증유형과 적용 안전기준이 기준 데이터 기반으로 반환된다.
4. 기관 및 절차 안내가 반환된다.
5. 국내리콜 사유 요약 또는 관련 사례 없음 안내가 반환된다.
6. KC 유사 인증사례 요약 또는 관련 사례 없음 안내가 반환된다.
7. 출시 전 확인 체크리스트가 반환된다.
8. final_report_markdown이 생성된다.
9. used_rag_chunk_ids와 source_refs가 포함된다.
10. disclaimer가 포함된다.
11. LLM 실패 시에도 템플릿 기반 결과가 반환된다.
```

---

## 18. 최종 요약

이 MVP는 DB 없이 JSON, JSONL 파일만으로 구현한다.

핵심 구조는 다음과 같다.

```text
Rule/Search가 근거를 찾고,
LLM은 그 근거를 사용자용 문장으로 조립한다.
```

AI 개발자는 웹 UI를 만들 필요가 없다. Python 기반 FastAPI 모듈로 `/diagnose` API를 만들고, JSON과 Markdown 결과를 반환하면 된다.

KC 인증정보는 이제 MVP 포함 데이터로 본다. `kc_certification.json`은 상세 조회용 원천 데이터이고, `rag_chunk_all.jsonl` 안의 `KC_CERTIFICATION_SUMMARY`는 유사 인증사례 요약 검색용 데이터이다.
