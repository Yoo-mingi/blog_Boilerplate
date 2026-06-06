import { AuthProvider as OidcAuthProvider } from "react-oidc-context";
import type { AuthProviderProps } from "react-oidc-context";

const oidcConfig: AuthProviderProps = {
  authority: `${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}`,
  client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  redirect_uri: `${window.location.origin}/callback`,
  post_logout_redirect_uri: window.location.origin,
  scope: "openid profile email",

  // 토큰 만료 60초 전 자동 갱신 시도
  automaticSilentRenew: true,

  // 로그인 성공 후 URL에서 code/state 파라미터 제거
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <OidcAuthProvider {...oidcConfig}>{children}</OidcAuthProvider>;
}
