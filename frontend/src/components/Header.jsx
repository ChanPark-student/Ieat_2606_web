import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button className="brand" onClick={() => navigate("/home")}>
          <span className="brand-mark">▣</span>
          <span>Compliance AI</span>
        </button>

        <div className="nav-actions">
          <button className="icon-btn" onClick={() => navigate("/diagnoses/history")}>
            ⌕
          </button>
          <button className="icon-btn" onClick={() => navigate("/diagnoses/new")}>
            ＋
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              localStorage.removeItem("access_token");
              navigate("/login");
            }}
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}