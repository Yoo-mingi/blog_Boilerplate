package kr.co.daramu.notification.service;

import jakarta.mail.internet.MimeMessage;
import kr.co.daramu.notification.dto.SendEmailDto;
import kr.co.daramu.notification.model.EmailVerification;
import kr.co.daramu.notification.repository.EmailVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final EmailVerificationRepository verificationRepository;

    @Value("${notification.mail.from}")
    private String from;

    @Value("${notification.mail.from-name}")
    private String fromName;

    @Value("${notification.verification.expire-minutes:5}")
    private int expireMinutes;

    @Value("${notification.verification.cleanup-minutes:30}")
    private int cleanupMinutes;

    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional
    public void sendVerificationCode(String email) {
        String code = generateCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(expireMinutes);

        EmailVerification verification = EmailVerification.builder()
                .email(email)
                .code(code)
                .expiresAt(expiresAt)
                .build();
        verificationRepository.save(verification);

        sendHtmlMail(email, "[damamu] 이메일 인증 코드", buildVerificationHtml(code));
        log.info("인증코드 발송: {} (만료: {})", email, expiresAt);
    }

    @Transactional
    public String confirmVerificationCode(String email, String code) {
        EmailVerification verification = verificationRepository
                .findValidCode(email, code, LocalDateTime.now())
                .orElseThrow(() -> new IllegalArgumentException("인증코드가 올바르지 않거나 만료되었습니다."));

        String token = UUID.randomUUID().toString().replace("-", "");
        verification.verify(token);

        log.info("인증 완료: {} → token={}", email, token);
        return token;
    }

    @Transactional(readOnly = true)
    public void validateToken(String token) {
        verificationRepository.findByTokenAndVerifiedTrue(token)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 인증 토큰입니다."));
    }

    // 알림 이메일 발송

    public void sendEmail(SendEmailDto dto) {
        sendHtmlMail(dto.to(), dto.subject(), dto.body());
        log.info("알림 이메일 발송: {} subject={}", dto.to(), dto.subject());
    }

    // 오래된 인증코드 정리
    @Scheduled(fixedRateString = "${notification.verification.cleanup-minutes:30}000")
    @Transactional
    public void cleanupExpiredVerifications() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(cleanupMinutes);
        int deleted = verificationRepository.deleteExpired(threshold);
        if (deleted > 0) {
            log.info("만료 인증 레코드 {}건 삭제", deleted);
        }
    }

    //내부용
    private String generateCode() {
        return String.format("%06d", RANDOM.nextInt(1_000_000));
    }

    private String buildVerificationHtml(String code) {
        Context ctx = new Context();
        ctx.setVariable("code",          code);
        ctx.setVariable("expireMinutes", expireMinutes);
        ctx.setVariable("appName",       fromName);
        return templateEngine.process("email/verification", ctx);
    }

    private void sendHtmlMail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML
            mailSender.send(message);
        } catch (Exception e) {
            log.error("이메일 발송 실패: to={}, subject={}", to, subject, e);
            throw new RuntimeException("이메일 발송에 실패했습니다.", e);
        }
    }
}
