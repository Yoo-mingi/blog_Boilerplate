package kr.co.daramu.notification.controller;

import jakarta.validation.Valid;
import kr.co.daramu.notification.dto.SendEmailDto;
import kr.co.daramu.notification.dto.VerifyConfirmDto;
import kr.co.daramu.notification.dto.VerifyRequestDto;
import kr.co.daramu.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications/email")
@RequiredArgsConstructor
public class NotificationController {

    private final EmailService emailService;

    @PostMapping("/verify-request")
    public ResponseEntity<Map<String, String>> verifyRequest(
            @Valid @RequestBody VerifyRequestDto dto
    ) {
        emailService.sendVerificationCode(dto.email());
        return ResponseEntity.ok(Map.of("message", "인증코드가 발송되었습니다."));
    }

    @PostMapping("/verify-confirm")
    public ResponseEntity<Map<String, String>> verifyConfirm(
            @Valid @RequestBody VerifyConfirmDto dto
    ) {
        String token = emailService.confirmVerificationCode(dto.email(), dto.code());
        return ResponseEntity.ok(Map.of("token", token));
    }

    @GetMapping("/validate-token")
    public ResponseEntity<Map<String, String>> validateToken(
            @RequestParam String token
    ) {
        emailService.validateToken(token);
        return ResponseEntity.ok(Map.of("message", "유효한 토큰입니다."));
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> send(
            @Valid @RequestBody SendEmailDto dto
    ) {
        emailService.sendEmail(dto);
        return ResponseEntity.ok(Map.of("message", "이메일이 발송되었습니다."));
    }
}
