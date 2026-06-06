package kr.co.daramu.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "아이디를 입력해주세요")
        @Size(min = 3, max = 50, message = "아이디는 3~50자 사이여야 합니다")
        String username,

        @NotBlank(message = "이메일을 입력해주세요")
        @Email(message = "올바른 이메일 형식이 아닙니다")
        String email,

        @NotBlank(message = "비밀번호를 입력해주세요")
        @Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다")
        String password,

        @Size(max = 50, message = "닉네임은 50자 이하여야 합니다")
        String nickname,

        @NotBlank(message = "이메일 인증을 완료해주세요")
        String verifyToken   // Notification Service가 발급한 인증 완료 토큰
) {}
