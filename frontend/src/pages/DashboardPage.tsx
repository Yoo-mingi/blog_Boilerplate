import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import Header from "../components/Header";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  nickname: string;
  createdAt: string;
}

export default function DashboardPage() {
  const auth = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.user?.access_token) return;

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${auth.user.access_token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setProfile(data))
      .catch((err) => setError(err.message));
  }, [auth.user?.access_token]);

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "#212121", color: "#fff" }}
    >
      <Header />

      <main
        style={{ maxWidth: "960px", margin: "0 auto", padding: "48px 24px" }}
      >
        <h1
          style={{ fontSize: "1.75rem", fontWeight: 600, marginBottom: "8px" }}
        >
          안녕하세요,{" "}
          {profile?.nickname ?? auth.user?.profile.preferred_username}님 👋
        </h1>
        <p style={{ color: "#8e8ea0", marginBottom: "40px" }}>
          ✅ 로그인 성공 — Gateway → User Service → DB 연결이 정상입니다.
        </p>

        {/* DB 기반 유저 정보 */}
        <div
          style={{
            backgroundColor: "#2f2f2f",
            border: "1px solid #3f3f3f",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              marginBottom: "16px",
              color: "#ececec",
            }}
          >
            유저 정보{" "}
            <span
              style={{ fontSize: "0.75rem", color: "#8e8ea0", fontWeight: 400 }}
            >
              (GET /api/users/me — DB 조회)
            </span>
          </h2>

          {error && (
            <p style={{ color: "#f87171", fontSize: "0.875rem" }}>❌ {error}</p>
          )}

          {!profile && !error && (
            <p style={{ color: "#8e8ea0", fontSize: "0.875rem" }}>로딩 중...</p>
          )}

          {profile && (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.875rem",
              }}
            >
              <tbody>
                {(
                  [
                    ["User ID (Keycloak sub)", profile.id],
                    ["Username", profile.username],
                    ["Email", profile.email],
                    ["Nickname", profile.nickname],
                    ["가입일", new Date(profile.createdAt).toLocaleString()],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <tr key={label} style={{ borderBottom: "1px solid #3f3f3f" }}>
                    <td
                      style={{
                        padding: "10px 0",
                        color: "#8e8ea0",
                        width: "200px",
                      }}
                    >
                      {label}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        color: "#ececec",
                        wordBreak: "break-all",
                      }}
                    >
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 흐름 설명 */}
        <div
          style={{
            backgroundColor: "#1a1a2e",
            border: "1px solid #2d2d4e",
            borderRadius: "12px",
            padding: "20px",
            fontSize: "0.8rem",
            color: "#8e8ea0",
            lineHeight: "1.8",
          }}
        >
          <strong style={{ color: "#a78bfa" }}>요청 흐름</strong>
          <br />
          Browser → <code style={{ color: "#60a5fa" }}>
            GET /api/users/me
          </code>{" "}
          (with JWT)
          <br />→ Gateway: JWT 검증 +{" "}
          <code style={{ color: "#34d399" }}>X-User-Id</code> 헤더 주입
          <br />→ User Service:{" "}
          <code style={{ color: "#34d399" }}>
            @RequestHeader("X-User-Id")
          </code>{" "}
          수신
          <br />→ PostgreSQL: UUID로 유저 조회 → 응답
        </div>
      </main>
    </div>
  );
}
