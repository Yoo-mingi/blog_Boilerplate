import { useAuth } from "react-oidc-context";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

/**
 * 인증된 사용자만 children을 렌더링
 * 미인증 상태면 /login 페이지로 이동
 */
export function ProtectedRoute({ children }: Props) {
  const auth = useAuth();

  // 로딩 중 (토큰 복원, 갱신 시도 등)
  if (auth.isLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20vh" }}>
        <p>Loading...</p>
      </div>
    );
  }

  // 에러 처리 (Keycloak 연결 실패 등)
  if (auth.error) {
    return (
      <div style={{ textAlign: "center", marginTop: "20vh" }}>
        <p>인증 오류: {auth.error.message}</p>
        <button onClick={() => auth.signinRedirect()}>다시 로그인</button>
      </div>
    );
  }

  // 미인증시 로그인 페이지로 이동
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
