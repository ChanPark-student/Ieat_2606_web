import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerUser(form);
      alert("회원가입 성공. 로그인 화면으로 이동합니다.");
      navigate("/login");
    } catch (err) {
      if (err.message === "email_already_registered") {
        setError("이미 가입된 이메일입니다.");
      } else {
        setError(`회원가입 실패: ${err.message}`);
      }
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
              회원가입
            </h1>

            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              FastAPI 백엔드에 사용자 계정을 생성합니다.
            </p>
          </div>

          <form onSubmit={handleRegister}>
            <div className="field">
              <label>이름</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="김서현"
                required
              />
            </div>

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
              {loading ? "가입 중..." : "회원가입 →"}
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
          <span className="eyebrow">Backend Auth</span>
          <h2>회원가입 정보가 SQLite DB에 저장됩니다</h2>
          <p>
            현재 MVP 백엔드는 FastAPI와 SQLite를 사용하며, 회원가입 후 로그인
            API에서 JWT access token을 발급합니다.
          </p>
        </div>
      </section>
    </div>
  );
}