import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  function handleRegister(e) {
    e.preventDefault();
    navigate("/login");
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
              회원가입
            </h1>

            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              공모전 시연용 계정을 생성합니다.
            </p>
          </div>

          <form onSubmit={handleRegister}>
            <div className="field">
              <label>이름</label>
              <input placeholder="홍길동" required />
            </div>

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
              회원가입 →
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
            이미 계정이 있으신가요?{" "}
            <Link
              to="/login"
              style={{ color: "var(--primary)", fontWeight: 800 }}
            >
              로그인
            </Link>
          </p>
        </div>
      </section>

      <section className="auth-side">
        <div>
          <span className="eyebrow">Enterprise MVP</span>

          <h2>AI 진단 결과를 사용자별 이력으로 관리</h2>

          <p>
            실제 백엔드 연결 전에는 mock 로그인과 localStorage를 사용해
            진단 요청, 결과 조회, 이력 화면까지 시연 가능한 구조로 만듭니다.
          </p>

          <div
            style={{
              marginTop: 34,
              display: "grid",
              gap: 12,
            }}
          >
            {["회원가입", "제품 정보 입력", "AI 진단 결과", "진단 이력 조회"].map(
              (item, index) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 14,
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.18)",
                  }}
                >
                  <strong
                    style={{
                      width: 28,
                      height: 28,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 999,
                      background: "#dce1ff",
                      color: "#00164e",
                    }}
                  >
                    {index + 1}
                  </strong>
                  <span style={{ color: "#f8fafc", fontWeight: 700 }}>
                    {item}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}