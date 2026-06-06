import { useAuth } from "react-oidc-context";
import { Link, Navigate } from "react-router-dom";

export default function LoginPage() {
  const auth = useAuth();

  // 이미 로그인된 상태면 메인으로
  if (!auth.isLoading && auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#212121",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          padding: "0 16px",
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              color: "#fff",
              fontSize: "1.5rem",
              fontWeight: 600,
              margin: 0,
            }}
          >
            로그인
          </h1>
          <p
            style={{ color: "#8e8ea0", fontSize: "0.875rem", marginTop: "8px" }}
          >
            계정에 로그인하세요
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: "#2f2f2f",
            border: "1px solid #3f3f3f",
            borderRadius: "16px",
            padding: "32px",
          }}
        >
          {/* 로그인 버튼 → Keycloak */}
          <button
            onClick={() => auth.signinRedirect()}
            disabled={auth.isLoading}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#fff",
              color: "#1a1a1a",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {auth.isLoading ? "로딩 중..." : "로그인"}
          </button>
        </div>

        {/* 회원가입 링크 */}
        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "0.875rem",
            color: "#8e8ea0",
          }}
        >
          계정이 없으신가요?{" "}
          <Link
            to="/register"
            style={{ color: "#fff", fontWeight: 500, textDecoration: "none" }}
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
