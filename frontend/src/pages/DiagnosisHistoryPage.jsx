import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function DiagnosisHistoryPage() {
  const navigate = useNavigate();

  const latest = useMemo(() => {
    const saved = localStorage.getItem("latest_diagnosis_result");

    if (!saved) return null;

    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }, []);

  const items = [
    latest && {
      id: latest.case_id,
      product: latest.product_name,
      status: "completed",
      summary:
        latest.legal_product_candidates?.[0]?.product_name +
        ", " +
        latest.certification_diagnosis?.certification_type +
        " 후보",
      date: "방금 전",
      risk: "검토 필요",
      isLatest: true,
    },
    {
      id: "case_002",
      product: "무선 코드리스 청소기",
      status: "completed",
      summary: "전기용품 안전확인 대상 가능성, 배터리 안전성 확인 필요",
      date: "2026.06.26",
      risk: "리스크 높음",
    },
    {
      id: "case_003",
      product: "세라믹 멀티 쿠커",
      status: "completed",
      summary: "생활용품 표시사항 및 전기 부품 인증 여부 확인 필요",
      date: "2026.06.25",
      risk: "진단 완료",
    },
    {
      id: "case_004",
      product: "어린이용 물놀이기구",
      status: "completed",
      summary: "어린이제품 공통안전기준 및 물놀이기구 안전기준 확인 필요",
      date: "2026.06.24",
      risk: "검토 필요",
    },
  ].filter(Boolean);

  return (
    <div className="app-shell">
      <Header />

      <main className="page">
        <section className="hero" style={{ padding: 36, marginBottom: 24 }}>
          <span className="eyebrow">Diagnosis History</span>

          <h1 className="hero-title" style={{ fontSize: 42 }}>
            진단 이력
          </h1>

          <p className="hero-desc">
            로그인한 사용자가 이전에 요청한 제품 진단 결과를 확인하는 화면입니다.
            현재 MVP에서는 localStorage와 mock 데이터를 사용합니다.
          </p>

          <div className="btn-row">
            <button className="btn-primary" onClick={() => navigate("/diagnoses/new")}>
              새 진단 만들기 →
            </button>
          </div>
        </section>

        <section className="grid-3" style={{ marginBottom: 24 }}>
          <div className="card">
            <p className="card-title">전체 진단</p>
            <p className="card-value">{items.length}</p>
          </div>

          <div className="card">
            <p className="card-title">검토 필요</p>
            <p className="card-value">
              {items.filter((item) => item.risk !== "진단 완료").length}
            </p>
          </div>

          <div className="card">
            <p className="card-title">최근 결과</p>
            <p className="card-value">{latest ? "있음" : "없음"}</p>
          </div>
        </section>

        <section style={{ display: "grid", gap: 16 }}>
          {items.map((item) => (
            <article
              key={item.id}
              className="card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: 260, flex: 1 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="badge badge-blue">{item.id}</span>

                  <span
                    className={
                      item.risk === "리스크 높음"
                        ? "badge badge-red"
                        : item.risk === "진단 완료"
                        ? "badge badge-green"
                        : "badge badge-blue"
                    }
                  >
                    {item.risk}
                  </span>

                  {item.isLatest && <span className="badge badge-green">최신</span>}
                </div>

                <h2
                  style={{
                    margin: "16px 0 8px",
                    color: "var(--text)",
                    fontSize: 22,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {item.product}
                </h2>

                <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
                  {item.summary}
                </p>

                <p style={{ margin: "12px 0 0", color: "var(--outline-dark)" }}>
                  생성일: {item.date} · 상태: {item.status}
                </p>
              </div>

              <button
                className="btn-primary"
                onClick={() => {
                  if (!item.isLatest) {
                    localStorage.setItem(
                      "latest_diagnosis_result",
                      JSON.stringify(createStaticResult(item.product))
                    );
                  }

                  navigate("/diagnoses/result");
                }}
              >
                상세 보기 →
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

function createStaticResult(productName) {
  return {
    case_id: "static_case",
    status: "completed",
    product_name: productName,
    legal_product_candidates: [
      {
        product_name: "법정 품목명 후보",
        certification_type: "확인 필요",
        confidence_level: "candidate",
      },
    ],
    certification_diagnosis: {
      certification_type: "확인 필요",
      applied_standards: ["제품별 안전기준 확인 필요"],
      judgement_level: "CANDIDATE",
    },
    institution_guidance: {
      summary:
        "제품 세부 사양에 따라 시험검사기관 또는 관계 기관의 최종 확인이 필요합니다.",
    },
    kc_certification_summary: {
      summary: "유사 KC 인증 사례를 기준으로 품목 분류 후보를 검토할 수 있습니다.",
    },
    recall_reason_summary: {
      summary:
        "유사 제품 리콜 사례에서는 유해물질, 표시사항, 전기적 안전성 관련 사유가 확인될 수 있습니다.",
      top_recall_reasons: ["표시사항", "유해물질", "전기적 안전성"],
    },
    launch_checklist: [
      "법정 품목명 최종 확인",
      "적용 안전기준 확인",
      "시험성적서 확보",
      "표시사항 검토",
    ],
    final_report_markdown: `## 진단 결과

### 제품명
- ${productName}

### 요약
- 본 결과는 mock 이력 데이터 기반의 시연용 결과입니다.
- 실제 인증 판단은 관계 기관 확인이 필요합니다.
`,
    disclaimer:
      "본 결과는 공공데이터 기반 사전 검토용 안내이며, 최종 확인은 관계 기관 또는 시험검사기관을 통해 진행해야 합니다.",
  };
}