import { useAuth } from "react-oidc-context";
import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function LandingPage() {
  const auth = useAuth();

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "#212121", color: "#fff" }}
    >
      <Header />

      {/* Hero Section */}
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 60px)",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: 700,
            margin: "0 0 16px",
            lineHeight: 1.2,
          }}
        >
          서비스 이름
        </h1>
        <p
          style={{
            fontSize: "1.125rem",
            color: "#8e8ea0",
            maxWidth: "480px",
            margin: "0 0 40px",
            lineHeight: 1.6,
          }}
        >
          서비스 한 줄 소개를 여기에 작성하세요.
          <br />
          보일러플레이트를 기반으로 빠르게 시작하세요.
        </p>

        {/* CTA 버튼 */}
        {!auth.isLoading &&
          (auth.isAuthenticated ? (
            <Link
              to="/dashboard"
              style={{
                padding: "12px 32px",
                backgroundColor: "#fff",
                color: "#1a1a1a",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              대시보드로 이동 →
            </Link>
          ) : (
            <div style={{ display: "flex", gap: "12px" }}>
              <Link
                to="/register"
                style={{
                  padding: "12px 32px",
                  backgroundColor: "#fff",
                  color: "#1a1a1a",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              >
                무료로 시작하기
              </Link>
              <Link
                to="/login"
                style={{
                  padding: "12px 32px",
                  backgroundColor: "transparent",
                  color: "#ececec",
                  border: "1px solid #3f3f3f",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: 500,
                  fontSize: "1rem",
                }}
              >
                로그인
              </Link>
            </div>
          ))}
      </main>
    </div>
  );
}
