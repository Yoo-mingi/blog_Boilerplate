import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/** 회원가입 단계 */
type Step = "form" | "verify";

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  nickname: string;
}

interface ApiError {
  message?: string;
  errors?: Record<string, string>;
}

const API = import.meta.env.VITE_API_BASE_URL;

export default function RegisterPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
    nickname: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState("");
  const [verifyToken, setVerifyToken] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    backgroundColor: "#3f3f3f",
    border: "1px solid #505050",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "#ececec",
    fontSize: "0.875rem",
    fontWeight: 500,
    marginBottom: "6px",
  };
  const fieldErr = (key: string) =>
    fieldErrors[key] ? (
      <p style={{ color: "#f87171", fontSize: "0.75rem", marginTop: "4px" }}>
        {fieldErrors[key]}
      </p>
    ) : null;

  /** Step 1: 폼 입력 완료 → 인증코드 발송 */
  const handleFormNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/notifications/email/verify-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      if (!res.ok) {
        const data: ApiError = await res.json();
        setError(data.message ?? "인증코드 발송에 실패했습니다.");
        return;
      }
      setStep("verify");
    } catch {
      setError("서버와의 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  /** 인증코드 재발송 */
  const handleResend = async () => {
    setCodeError(null);
    setIsLoading(true);
    try {
      await fetch(`${API}/api/notifications/email/verify-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
    } finally {
      setIsLoading(false);
    }
  };

  /** Step 2: 코드 확인 → 인증 토큰 수령 */
  const handleVerifyCode = async () => {
    setCodeError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/notifications/email/verify-confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code }),
      });
      if (!res.ok) {
        const data: ApiError = await res.json();
        setCodeError(data.message ?? "인증코드가 올바르지 않습니다.");
        return;
      }
      const data = await res.json();
      setVerifyToken(data.token);
    } catch {
      setCodeError("서버와의 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  /** 최종 회원가입 */
  const handleRegister = async () => {
    if (!verifyToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, verifyToken }),
      });
      if (res.ok) {
        navigate("/login", { state: { registered: true } });
        return;
      }
      const data: ApiError = await res.json();
      if (data.errors) setFieldErrors(data.errors);
      else setError(data.message ?? "회원가입에 실패했습니다.");
    } catch {
      setError("서버와의 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

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
      <div style={{ width: "100%", maxWidth: "380px", padding: "0 16px" }}>
        {/* 타이틀 */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              color: "#fff",
              fontSize: "1.5rem",
              fontWeight: 600,
              margin: 0,
            }}
          >
            회원가입
          </h1>
          <p
            style={{ color: "#8e8ea0", fontSize: "0.875rem", marginTop: "8px" }}
          >
            {step === "form"
              ? "새 계정을 만드세요"
              : `${form.email}로 발송된 코드를 입력하세요`}
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#2f2f2f",
            border: "1px solid #3f3f3f",
            borderRadius: "16px",
            padding: "32px",
          }}
        >
          {/* ── Step 1: 폼 입력 ── */}
          {step === "form" && (
            <form
              onSubmit={handleFormNext}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <label style={labelStyle}>아이디</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, username: e.target.value }))
                  }
                  placeholder="아이디를 입력하세요"
                  required
                  style={inputStyle}
                />
                {fieldErr("username")}
              </div>
              <div>
                <label style={labelStyle}>이메일</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="이메일을 입력하세요"
                  required
                  style={inputStyle}
                />
                {fieldErr("email")}
              </div>
              <div>
                <label style={labelStyle}>비밀번호</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="8자 이상 입력하세요"
                  required
                  style={inputStyle}
                />
                {fieldErr("password")}
              </div>
              <div>
                <label style={labelStyle}>닉네임 (선택)</label>
                <input
                  name="nickname"
                  value={form.nickname}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, nickname: e.target.value }))
                  }
                  placeholder="닉네임을 입력하세요"
                  style={inputStyle}
                />
              </div>
              {error && (
                <div
                  style={{
                    backgroundColor: "rgba(153,27,27,0.3)",
                    border: "1px solid rgba(185,28,28,0.4)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#f87171",
                    fontSize: "0.875rem",
                  }}
                >
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: isLoading ? "#666" : "#fff",
                  color: "#1a1a1a",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  marginTop: "4px",
                }}
              >
                {isLoading ? "발송 중..." : "인증코드 받기 →"}
              </button>
            </form>
          )}

          {/* ── Step 2: 이메일 인증 ── */}
          {step === "verify" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {/* 코드 입력 (인증 완료 전) */}
              {!verifyToken && (
                <>
                  <div>
                    <label style={labelStyle}>인증코드 6자리</label>
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      maxLength={6}
                      placeholder="000000"
                      style={{
                        ...inputStyle,
                        letterSpacing: "8px",
                        fontSize: "1.25rem",
                        textAlign: "center",
                      }}
                    />
                    {codeError && (
                      <p
                        style={{
                          color: "#f87171",
                          fontSize: "0.75rem",
                          marginTop: "4px",
                        }}
                      >
                        {codeError}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleVerifyCode}
                    disabled={isLoading || code.length !== 6}
                    style={{
                      width: "100%",
                      padding: "10px",
                      backgroundColor: code.length === 6 ? "#fff" : "#505050",
                      color: code.length === 6 ? "#1a1a1a" : "#8e8ea0",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      cursor: code.length === 6 ? "pointer" : "not-allowed",
                    }}
                  >
                    {isLoading ? "확인 중..." : "코드 확인"}
                  </button>
                  <button
                    onClick={handleResend}
                    disabled={isLoading}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#8e8ea0",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    코드를 받지 못하셨나요? 재발송
                  </button>
                </>
              )}

              {/* 인증 완료 → 회원가입 버튼 */}
              {verifyToken && (
                <>
                  <div
                    style={{
                      backgroundColor: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.3)",
                      borderRadius: "8px",
                      padding: "12px",
                      color: "#34d399",
                      fontSize: "0.875rem",
                      textAlign: "center",
                    }}
                  >
                    ✅ 이메일 인증 완료
                  </div>
                  {error && (
                    <div
                      style={{
                        backgroundColor: "rgba(153,27,27,0.3)",
                        border: "1px solid rgba(185,28,28,0.4)",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        color: "#f87171",
                        fontSize: "0.875rem",
                      }}
                    >
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handleRegister}
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "10px",
                      backgroundColor: isLoading ? "#666" : "#fff",
                      color: "#1a1a1a",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      cursor: isLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {isLoading ? "처리 중..." : "회원가입 완료"}
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  setStep("form");
                  setVerifyToken(null);
                  setCode("");
                  setCodeError(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#8e8ea0",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                ← 이전으로
              </button>
            </div>
          )}
        </div>

        {/* 로그인 링크 */}
        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "0.875rem",
            color: "#8e8ea0",
          }}
        >
          이미 계정이 있으신가요?{" "}
          <Link
            to="/login"
            style={{ color: "#fff", fontWeight: 500, textDecoration: "none" }}
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
