package kr.co.daramu.user.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Slf4j
@Service
public class NotificationClient {

    private final WebClient webClient;

    public NotificationClient(
            @Value("${notification.base-url}") String baseUrl
    ) {
        this.webClient = WebClient.builder().baseUrl(baseUrl).build();
    }

    public void validateVerifyToken(String token) {
        try {
            webClient.get()
                    .uri("/api/notifications/email/validate-token?token={token}", token)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block(); // 회원가입은 결과를 기다려야 하므로 동기 호출

            log.debug("인증 토큰 검증 성공: {}", token);

        } catch (WebClientResponseException.BadRequest e) {
            throw new IllegalArgumentException("이메일 인증이 완료되지 않았습니다.");
        } catch (Exception e) {
            log.error("Notification Service 호출 실패", e);
            throw new RuntimeException("인증 서비스와 통신 중 오류가 발생했습니다.");
        }
    }
}
