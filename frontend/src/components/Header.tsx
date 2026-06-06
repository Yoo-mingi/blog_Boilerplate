import { useAuth } from "react-oidc-context";
import { Link } from "react-router-dom";

/**
 * 공통 헤더
 * - 비로그인: 로그인 / 회원가입 버튼
 * - 로그인: 사용자명 + 로그아웃 버튼
 */
export default function Header() {
  const auth = useAuth();

  const handleLogout = () => {
    auth.signoutRedirect();
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        height: "60px",
        backgroundColor: "#1a1a1a",
        borderBottom: "1px solid #2f2f2f",
      }}
    >
      {/* 로고 */}
      <Link
        to="/"
        style={{
          color: "#fff",
          fontWeight: 700,
          fontSize: "1.125rem",
          textDecoration: "none",
        }}
      >
        MyApp
      </Link>

      {/* 우측 메뉴 */}
      <nav style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {auth.isLoading ? null : auth.isAuthenticated ? (
          <>
            <span style={{ color: "#8e8ea0", fontSize: "0.875rem" }}>
              {auth.user?.profile.preferred_username}
            </span>
            <Link
              to="/dashboard"
              style={{
                color: "#ececec",
                fontSize: "0.875rem",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: "6px",
                border: "1px solid #3f3f3f",
              }}
            >
              대시보드
            </Link>
            <button
              onClick={handleLogout}
              style={{
                color: "#ececec",
                fontSize: "0.875rem",
                background: "none",
                border: "1px solid #3f3f3f",
                borderRadius: "6px",
                padding: "6px 14px",
                cursor: "pointer",
              }}
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                color: "#ececec",
                fontSize: "0.875rem",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: "6px",
                border: "1px solid #3f3f3f",
              }}
            >
              로그인
            </Link>
            <Link
              to="/register"
              style={{
                color: "#1a1a1a",
                fontSize: "0.875rem",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: "6px",
                backgroundColor: "#fff",
                fontWeight: 600,
              }}
            >
              회원가입
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
