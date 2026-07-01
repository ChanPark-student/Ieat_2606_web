import { useNavigate } from "react-router-dom";
import { logoutUser } from "../api/authApi";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button
          className="brand"
          onClick={() => navigate("/home")}
          type="button"
        >
          <span className="brand-mark">▣</span>
          <span>Compliance AI</span>
        </button>

        <div className="nav-actions">
          <button
            className="icon-btn"
            onClick={() => navigate("/diagnoses/history")}
            type="button"
            title="진단 이력"
          >
            ⌕
          </button>

          <button
            className="icon-btn"
            onClick={() => navigate("/diagnoses/new")}
            type="button"
            title="새 진단"
          >
            ＋
          </button>

          <button
            className="btn-secondary"
            type="button"
            onClick={() => {
              logoutUser();
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