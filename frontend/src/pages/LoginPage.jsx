import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    localStorage.setItem("access_token", "mock_token");
    navigate("/home");
  }

  return (
    <div className="auth-page">
      <section className="auth-panel">
        <div className="auth-card">
          <div style={{ marginBottom: 30 }}>
            <div className="brand" style={{ marginBottom: 16 }}>
              <span className="brand-mark">▣</span>
              <span>Compliance AI</span>
            </div>

            <h1
              style={{
                margin: 0,
                color: "var(--primary)",
                fontSize: 30,
                letterSpacing: "-0.04em",
              }}
            >
              로그인
            </h1>

            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              신제품 출시 전 인증·리콜 리스크 진단을 시작하세요.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="field">
              <label>이메일</label>
              <input
                type="email"
                placeholder="example@company.com"
                required
              />
            </div>

            <div className="field">
              <label>비밀번호</label>
              <input type="password" placeholder="••••••••" required />
            </div>

            <button className="btn-primary" style={{ width: "100%", marginTop: 8 }}>
              로그인 →
            </button>
          </form>

          <p
            style={{
              marginTop: 24,
              textAlign: "center",
              color: "var(--muted)",
              fontSize: 14,
            }}
          >
            계정이 없으신가요?{" "}
            <Link
              to="/register"
              style={{ color: "var(--primary)", fontWeight: 800 }}
            >
              회원가입
            </Link>
          </p>
        </div>
      </section>

      <section className="auth-side">
        <div>
          <span className="eyebrow">AI Compliance Assistant</span>

          <h2>출시 전 리스크를 먼저 확인하는 웹 프로토타입</h2>

          <p>
            제품 정보를 입력하면 예상 인증유형, 적용 안전기준, 유사 KC 인증
            사례, 국내 리콜 사유, 출시 전 확인사항을 카드와 보고서 형태로
            정리합니다.
          </p>

          <div
            style={{
              marginTop: 34,
              padding: 22,
              borderRadius: 22,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.22)",
              backdropFilter: "blur(14px)",
            }}
          >
            <p style={{ margin: "0 0 10px", color: "#dce1ff", fontWeight: 800 }}>
              AI 실시간 진단
            </p>

            <div
              style={{
                height: 10,
                borderRadius: 999,
                background: "rgba(255,255,255,0.18)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "85%",
                  height: "100%",
                  background: "#dce1ff",
                  borderRadius: 999,
                }}
              />
            </div>

            <p style={{ margin: "12px 0 0", color: "#dce1ff" }}>
              MVP 진단 흐름 준비율: 85%
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}