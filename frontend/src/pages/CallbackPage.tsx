import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

export default function CallbackPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [auth.isLoading, auth.isAuthenticated, navigate]);

  if (auth.error) {
    return (
      <div style={{ textAlign: "center", marginTop: "20vh" }}>
        <p>로그인 처리 중 오류가 발생했습니다: {auth.error.message}</p>
        <button onClick={() => auth.signinRedirect()}>다시 시도</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "20vh" }}>
      <p>로그인 처리 중...</p>
    </div>
  );
}
