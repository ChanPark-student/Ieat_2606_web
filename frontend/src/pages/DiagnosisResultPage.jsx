import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getDiagnosis } from "../api/diagnosisApi";

export default function DiagnosisResultPage() {
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      const selectedCaseId = localStorage.getItem("selected_case_id");

      if (!selectedCaseId) {
        const latest = localStorage.getItem("latest_diagnosis_result");

        if (latest) {
          setResult(JSON.parse(latest));
        } else {
          setError("선택된 진단 결과가 없습니다.");
        }

        setLoading(false);
        return;
      }

      try {
        const detail = await getDiagnosis(selectedCaseId);
        setResult(detail.output);
        localStorage.setItem("latest_diagnosis_result", JSON.stringify(detail.output));
      } catch (err) {
        if (err.message === "Not authenticated" || err.message === "invalid_token") {
          navigate("/login");
          return;
        }

        setError(`진단 결과 조회 실패: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    loadResult();
  }, [navigate]);

  if (loading) {
    return (
      <div className="app-shell">
        <Header />
        <main className="page">
          <section className="card">진단 결과를 불러오는 중...</section>
        </main>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="app-shell">
        <Header />
        <main className="page">
          <section className="hero">
            <h1 className="hero-title">진단 결과가 없습니다.</h1>
            <p className="hero-desc">{error || "먼저 제품 진단을 진행하세요."}</p>
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
  const inputSummary = result.input_summary || {};

  return (
    <div className="app-shell">
      <Header />

      <main className="page">
        <section className="hero" style={{ padding: 36, marginBottom: 24 }}>
          <span className="eyebrow">Backend API Result</span>

          <h1 className="hero-title" style={{ fontSize: 42 }}>
            진단 결과: {result.product_name}
          </h1>

          <p className="hero-desc">
            FastAPI 백엔드의 진단 상세 API에서 불러온 결과입니다.
          </p>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginTop: 18,
            }}
          >
            <span className="badge badge-blue">
              Case ID: {result.case_id || "N/A"}
            </span>

            <span
              className={
                result.status === "success"
                  ? "badge badge-green"
                  : result.status === "failed"
                  ? "badge badge-red"
                  : "badge badge-blue"
              }
            >
              Status: {result.status || "pending"}
            </span>

            <span className="badge badge-blue">
              Model: {result.model_name || inputSummary.model_name || "미입력"}
            </span>
          </div>

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

          <section className="card span-12">
            <p className="card-title">사용자 입력 요약</p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
                color: "var(--muted)",
                lineHeight: 1.6,
              }}
            >
              <SummaryItem
                label="제품명"
                value={inputSummary.product_name || result.product_name}
              />
              <SummaryItem
                label="모델명"
                value={inputSummary.model_name || result.model_name || "미입력"}
              />
              <SummaryItem
                label="대상 연령"
                value={inputSummary.target_age || "미입력"}
              />
              <SummaryItem
                label="주요 소재"
                value={inputSummary.material_text || "미입력"}
              />
              <SummaryItem
                label="전원 유형"
                value={inputSummary.power_type || "미입력"}
              />
              <SummaryItem
                label="배터리 포함"
                value={
                  inputSummary.battery_included === true
                    ? "예"
                    : inputSummary.battery_included === false
                    ? "아니오"
                    : "미입력"
                }
              />
              <SummaryItem
                label="제조/수입 구분"
                value={inputSummary.import_or_manufacture || "미입력"}
              />
            </div>
          </section>

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
            <ul
              style={{
                margin: 0,
                paddingLeft: 0,
                listStyle: "none",
                display: "grid",
                gap: 10,
              }}
            >
              {result.launch_checklist?.map((item) => (
                <li
                  key={item}
                  style={{
                    display: "flex",
                    gap: 10,
                    color: "var(--muted)",
                  }}
                >
                  <strong style={{ color: "var(--primary)" }}>✓</strong>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section
            className="card span-4"
            style={{ background: "rgba(255, 218, 214, 0.28)" }}
          >
            <p className="card-title">국내 리콜 사유 요약</p>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              {recall?.summary}
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 18,
              }}
            >
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

function SummaryItem({ label, value }) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 14,
        background: "rgba(248, 250, 252, 0.9)",
        border: "1px solid rgba(197, 197, 211, 0.75)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "var(--outline-dark)",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "var(--text)",
          wordBreak: "keep-all",
        }}
      >
        {value || "미입력"}
      </div>
    </div>
  );
}