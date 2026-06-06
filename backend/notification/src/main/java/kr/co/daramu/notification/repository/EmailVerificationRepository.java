package kr.co.daramu.notification.repository;

import kr.co.daramu.notification.model.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, UUID> {

    @Query("""
        SELECT ev FROM EmailVerification ev
        WHERE ev.email = :email
          AND ev.code = :code
          AND ev.verified = false
          AND ev.expiresAt > :now
        ORDER BY ev.createdAt DESC
        LIMIT 1
    """)
    Optional<EmailVerification> findValidCode(
            @Param("email") String email,
            @Param("code")  String code,
            @Param("now") LocalDateTime now
    );

    /** 인증 토큰으로 검증 (회원가입 시 사용) */
    Optional<EmailVerification> findByTokenAndVerifiedTrue(String token);

    /** 만료된 레코드 일괄 삭제 (스케줄러용) */
    @Modifying
    @Query("DELETE FROM EmailVerification ev WHERE ev.expiresAt < :threshold")
    int deleteExpired(@Param("threshold") LocalDateTime threshold);
}
