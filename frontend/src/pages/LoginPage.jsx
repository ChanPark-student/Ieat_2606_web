import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser(form);
      navigate("/home");
    } catch (err) {
      setError("로그인 실패: 이메일 또는 비밀번호를 확인하세요.");
    } finally {
      setLoading(false);
    }
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
              백엔드 FastAPI 인증 서버에 로그인합니다.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="field">
              <label>이메일</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="test123@example.com"
                required
              />
            </div>

            <div className="field">
              <label>비밀번호</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="password1234"
                required
              />
            </div>

            {error && (
              <p style={{ color: "var(--danger)", fontWeight: 700 }}>
                {error}
              </p>
            )}

            <button
              className="btn-primary"
              style={{ width: "100%", marginTop: 8 }}
              disabled={loading}
            >
              {loading ? "로그인 중..." : "로그인 →"}
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
          <span className="eyebrow">FastAPI Connected</span>
          <h2>JWT 로그인 API와 연결된 MVP 화면</h2>
          <p>
            로그인 성공 시 백엔드에서 access token을 발급받고, 이후 진단 생성과
            이력 조회 요청에 Bearer Token을 포함합니다.
          </p>
        </div>
      </section>
    </div>
  );
}