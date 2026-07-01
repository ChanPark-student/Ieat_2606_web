import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { listDiagnoses } from "../api/diagnosisApi";

export default function DiagnosisHistoryPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const result = await listDiagnoses();
        setItems(result.items || []);
      } catch (err) {
        if (err.message === "Not authenticated" || err.message === "invalid_token") {
          navigate("/login");
          return;
        }

        setError(`진단 이력 조회 실패: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [navigate]);

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
            FastAPI 백엔드의 GET /diagnoses API에서 사용자별 진단 이력을
            불러옵니다.
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
            <p className="card-title">완료</p>
            <p className="card-value">
              {items.filter((item) => item.status === "completed").length}
            </p>
          </div>

          <div className="card">
            <p className="card-title">연동 방식</p>
            <p className="card-value">API</p>
          </div>
        </section>

        {loading && <p>진단 이력을 불러오는 중...</p>}

        {error && (
          <p style={{ color: "var(--danger)", fontWeight: 700 }}>{error}</p>
        )}

        {!loading && items.length === 0 && (
          <section className="card">
            <p className="card-title">진단 이력 없음</p>
            <p style={{ color: "var(--muted)" }}>
              아직 백엔드에 저장된 진단 이력이 없습니다. 새 진단을 먼저
              생성하세요.
            </p>
          </section>
        )}

        <section style={{ display: "grid", gap: 16 }}>
          {items.map((item) => (
            <article
              key={item.case_id}
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
                  <span className="badge badge-blue">{item.case_id}</span>
                  <span className="badge badge-green">{item.status}</span>
                </div>

                <h2
                  style={{
                    margin: "16px 0 8px",
                    color: "var(--text)",
                    fontSize: 22,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {item.product_name}
                </h2>

                <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
                  {item.summary}
                </p>

                <p style={{ margin: "12px 0 0", color: "var(--outline-dark)" }}>
                  생성일: {item.created_at}
                </p>
              </div>

              <button
                className="btn-primary"
                onClick={() => {
                  localStorage.setItem("selected_case_id", item.case_id);
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