export function createMockDiagnosis(input) {
  const productName = input.product_name || "어린이용 책가방";

  return {
    case_id: "mock_case_001",
    status: "completed",
    product_name: productName,

    legal_product_candidates: [
      {
        product_name: "아동용 섬유제품",
        certification_type: "공급자적합성확인",
        confidence_level: "candidate",
      },
    ],

    certification_diagnosis: {
      certification_type: "공급자적합성확인",
      applied_standards: [
        "어린이제품 공통안전기준",
        "아동용 섬유제품 안전기준",
      ],
      judgement_level: "CANDIDATE",
    },

    institution_guidance: {
      summary:
        "공급자적합성확인은 지정기관 신고 대상이 아니며, 시험성적서 등 적합성 입증 자료 확보가 필요합니다.",
      institutions: [],
    },

    kc_certification_summary: {
      summary: "유사 제품의 KC 인증 사례를 참고할 수 있습니다.",
      representative_cases: [],
    },

    recall_reason_summary: {
      summary:
        "유사 국내 리콜 사례에서는 유해물질, 표시사항, 부자재 안전성 관련 사유가 자주 확인됩니다.",
      top_recall_reasons: ["프탈레이트", "납", "표시사항"],
    },

    launch_checklist: [
      "법정 품목명 최종 확인",
      "안전기준 및 표시사항 확인",
      "원단, 코팅, 프린팅, 부자재 시험성적서 확보",
      "배터리 또는 전기 부품 포함 여부 재확인",
      "수입 제품의 경우 제조국 및 수입자 표시사항 확인",
    ],

    final_report_markdown: `## 진단 결과

### 1. 법정 품목명 후보
- ${productName}
- 아동용 섬유제품 후보

### 2. 예상 인증유형
- 공급자적합성확인 후보

### 3. 적용 가능 안전기준
- 어린이제품 공통안전기준
- 아동용 섬유제품 안전기준

### 4. 국내 리콜 주요 사유
- 프탈레이트계 가소제 초과
- 납 등 유해물질 기준 초과
- 표시사항 누락

### 5. 출시 전 확인사항
- 법정 품목명 최종 확인
- 원단, 코팅, 프린팅, 부자재 시험성적서 확보
- KC 표시 및 주의사항 문구 검토
`,

    disclaimer:
      "본 결과는 공공데이터 기반 사전 검토용 안내이며, 최종 확인은 관계 기관 또는 시험검사기관을 통해 진행해야 합니다.",
  };
}