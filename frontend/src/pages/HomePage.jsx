import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function HomePage() {
  const navigate = useNavigate();

  const recent = [
    {
      product: "어린이용 책가방",
      type: "아동용 섬유제품",
      status: "공급자적합성확인 후보",
      badge: "검토 필요",
    },
    {
      product: "무선 코드리스 청소기",
      type: "전기용품",
      status: "안전확인 대상 가능성",
      badge: "리스크 높음",
    },
    {
      product: "세라믹 멀티 쿠커",
      type: "생활용품",
      status: "표시사항 확인 필요",
      badge: "진단 완료",
    },
  ];

  return (
    <div className="app-shell">
      <Header />

      <main className="page">
        <section className="hero">
          <span className="eyebrow">AI Powered Risk Assessment</span>

          <h1 className="hero-title">
            신제품 출시 전 인증 및 리콜 리스크를 AI로 진단하세요.
          </h1>

          <p className="hero-desc">
            제품 정보를 입력하면 예상 인증유형, 적용 안전기준, 시험검사기관 안내,
            유사 KC 인증 사례, 국내 리콜 사유, 출시 전 확인사항을 카드와 보고서
            형태로 정리합니다.
          </p>

          <div className="btn-row">
            <button className="btn-primary" onClick={() => navigate("/diagnoses/new")}>
              진단 시작하기 →
            </button>

            <button className="btn-secondary" onClick={() => navigate("/diagnoses/history")}>
              진단 이력 보기
            </button>
          </div>
        </section>

        <section className="grid-3" style={{ marginTop: 22 }}>
          <div className="card">
            <p className="card-title">누적 진단 건수</p>
            <p className="card-value">1,248</p>
          </div>

          <div className="card">
            <p className="card-title">주의 필요 리스크</p>
            <p className="card-value">12</p>
          </div>

          <div className="card">
            <p className="card-title">규제 업데이트</p>
            <p className="card-value">신규 4건</p>
          </div>
        </section>

        <h2 className="section-title">최근 진단 이력</h2>

        <section className="grid-3">
          {recent.map((item) => (
            <button
              key={item.product}
              className="card"
              style={{ textAlign: "left" }}
              onClick={() => navigate("/diagnoses/result")}
            >
              <span
                className={
                  item.badge === "리스크 높음"
                    ? "badge badge-red"
                    : item.badge === "진단 완료"
                    ? "badge badge-green"
                    : "badge badge-blue"
                }
              >
                {item.badge}
              </span>

              <h3 style={{ margin: "18px 0 6px", fontSize: 21 }}>
                {item.product}
              </h3>

              <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>
                {item.type} · {item.status}
              </p>

              <p style={{ margin: "22px 0 0", color: "var(--primary)", fontWeight: 800 }}>
                상세 보기 →
              </p>
            </button>
          ))}
        </section>
      </main>
    </div>
  );
}