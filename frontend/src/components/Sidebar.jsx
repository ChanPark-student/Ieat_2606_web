import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div
      style={{
        width: "240px",
        minHeight: "100vh",
        background: "#1e40af",
        color: "white",
        padding: "20px",
      }}
    >
      <h2>KC AI</h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "30px" }}>
        <Link to="/" style={{ color: "white", textDecoration: "none" }}>🏠 Dashboard</Link>

        <Link to="/new" style={{ color: "white", textDecoration: "none" }}>📝 새 진단</Link>

        <Link to="/document" style={{ color: "white", textDecoration: "none" }}>📄 AI 문서 분석</Link>

        <Link to="/recall" style={{ color: "white", textDecoration: "none" }}>🚨 리콜 사례</Link>

        <Link to="/guide" style={{ color: "white", textDecoration: "none" }}>📚 인증 기준</Link>

        <Link to="/history" style={{ color: "white", textDecoration: "none" }}>📂 분석 이력</Link>

        <Link to="/settings" style={{ color: "white", textDecoration: "none" }}>⚙ 설정</Link>
      </nav>
    </div>
  );
}

export default Sidebar;