import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function DiagnosisResultPage() {
  const navigate = useNavigate();

  const result = useMemo(() => {
    const saved = localStorage.getItem("latest_diagnosis_result");
    if (!saved) return null;

    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }, []);

  if (!result) {
    return (
      <div className="app-shell">
        <Header />
        <main className="page">
          <section className="hero">
            <h1 className="hero-title">진단 결과가 없습니다.</h1>
            <p className="hero-desc">
              먼저 제품 정보를 입력하고 진단 요청을 진행하세요.
            </p>
            <div className="btn-row">
              <button className="btn-primary" onClick={() => navigate("/diagnoses/new")}>
                제품 진단하러 가기
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const candidate = result.legal_product_candidates?.[0];
  const cert = result.certification_diagnosis;
  const recall = result.recall_reason_summary;

  return (
    <div className="app-shell">
      <Header />

      <main className="page">
        <section className="hero" style={{ padding: 36, marginBottom: 24 }}>
          <span className="eyebrow">Risk Level: Candidate</span>

          <h1 className="hero-title" style={{ fontSize: 42 }}>
            진단 결과: {result.product_name}
          </h1>

          <p className="hero-desc">
            입력 제품 정보를 기반으로 생성된 AI mock 진단 결과입니다. 실제 인증
            판단 전 관계 기관 또는 시험검사기관 확인이 필요합니다.
          </p>

          <div className="btn-row">
            <button className="btn-secondary" onClick={() => navigate("/diagnoses/new")}>
              새 진단
            </button>
            <button className="btn-primary" onClick={() => window.print()}>
              PDF 저장/인쇄
            </button>
          </div>
        </section>

        <section className="result-grid">
          <ResultCard
            span="span-4"
            label="법정 품목명 후보"
            title={candidate?.product_name || "확인 필요"}
            desc={`신뢰 수준: ${candidate?.confidence_level || "candidate"}`}
          />

          <ResultCard
            span="span-4"
            label="예상 인증유형"
            title={cert?.certification_type || "확인 필요"}
            desc={`판정 수준: ${cert?.judgement_level || "CANDIDATE"}`}
          />

          <ResultCard
            span="span-4"
            label="적용 안전기준"
            title={cert?.applied_standards?.[0] || "확인 필요"}
            desc={cert?.applied_standards?.slice(1).join(", ")}
          />

          <InfoBlock
            span="span-6"
            title="시험검사기관 및 절차 안내"
            content={result.institution_guidance?.summary}
          />

          <InfoBlock
            span="span-6"
            title="유사 KC 인증 사례"
            content={result.kc_certification_summary?.summary}
          />

          <section className="card span-8">
            <p className="card-title">출시 전 확인사항</p>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: 10 }}>
              {result.launch_checklist?.map((item) => (
                <li key={item} style={{ display: "flex", gap: 10, color: "var(--muted)" }}>
                  <strong style={{ color: "var(--primary)" }}>✓</strong>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card span-4" style={{ background: "rgba(255, 218, 214, 0.28)" }}>
            <p className="card-title">국내 리콜 사유 요약</p>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              {recall?.summary}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
              {recall?.top_recall_reasons?.map((reason) => (
                <span className="badge badge-red" key={reason}>
                  {reason}
                </span>
              ))}
            </div>
          </section>

          <section className="card span-12">
            <p className="card-title">최종 확인 필요 문구</p>
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
              {result.disclaimer}
            </p>
          </section>

          <section className="card span-12">
            <p className="card-title">Markdown 보고서</p>
            <div className="markdown-box">{result.final_report_markdown}</div>
          </section>
        </section>
      </main>
    </div>
  );
}

function ResultCard({ span, label, title, desc }) {
  return (
    <section className={`card ${span}`}>
      <p className="card-title">{label}</p>
      <p className="card-value">{title}</p>
      {desc && (
        <p style={{ margin: "12px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
          {desc}
        </p>
      )}
    </section>
  );
}

function InfoBlock({ span, title, content }) {
  return (
    <section className={`card ${span}`}>
      <p className="card-title">{title}</p>
      <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
        {content || "관련 정보가 없습니다."}
      </p>
    </section>
  );
}