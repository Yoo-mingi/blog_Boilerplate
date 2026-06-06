package kr.co.daramu.notification.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_verifications", indexes = {
        @Index(name = "idx_email_verifications_email", columnList = "email"),
        @Index(name = "idx_email_verifications_token", columnList = "token")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EmailVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(nullable = false, length = 6)
    private String code;

    @Column(nullable = false)
    private boolean verified = false;

    @Column(length = 64)
    private String token;               // 인증 완료 후 발급 → 회원가입 시 검증용

    @Column(nullable = false)
    private LocalDateTime expiresAt;    // now + 5분

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public EmailVerification(String email, String code, LocalDateTime expiresAt) {
        this.email     = email;
        this.code      = code;
        this.expiresAt = expiresAt;
        this.createdAt = LocalDateTime.now();
    }

    /** 코드 인증 성공 시 호출 */
    public void verify(String token) {
        this.verified = true;
        this.token    = token;
    }

    /** 유효기간 초과 여부 */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}
