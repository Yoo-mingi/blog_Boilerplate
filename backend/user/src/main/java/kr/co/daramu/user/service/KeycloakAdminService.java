package kr.co.daramu.user.service;

import kr.co.daramu.user.config.KeycloakProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class KeycloakAdminService {

    private final WebClient keycloakWebClient;
    private final KeycloakProperties props;

    private String getAdminAccessToken() {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");
        form.add("client_id", props.admin().clientId());
        form.add("client_secret", props.admin().clientSecret());

        Map<?, ?> response = keycloakWebClient.post()
                .uri("/realms/{realm}/protocol/openid-connect/token", props.realm())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(form))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        return (String) response.get("access_token");
    }

    public UUID createUser(String username, String email, String password) {
        String adminToken = getAdminAccessToken();

        Map<String, Object> userBody = Map.of(
                "username", username,
                "email", email,
                "enabled", true,
                "credentials", List.of(Map.of(
                        "type", "password",
                        "value", password,
                        "temporary", false
                ))
        );

        String location = keycloakWebClient.post()
                .uri("/admin/realms/{realm}/users", props.realm())
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(userBody)
                .retrieve()
                .toBodilessEntity()
                .map(response -> response.getHeaders().getFirst("Location"))
                .block();

        if (location == null) {
            throw new IllegalStateException("Keycloak 유저 생성 실패: Location 헤더 없음");
        }

        String userId = location.substring(location.lastIndexOf("/") + 1);
        log.debug("Keycloak 유저 생성 완료: {}", userId);
        return UUID.fromString(userId);
    }

    public void deleteUser(UUID keycloakId) {
        String adminToken = getAdminAccessToken();

        keycloakWebClient.delete()
                .uri("/admin/realms/{realm}/users/{id}", props.realm(), keycloakId)
                .header("Authorization", "Bearer " + adminToken)
                .retrieve()
                .toBodilessEntity()
                .block();

        log.debug("Keycloak 유저 삭제 완료: {}", keycloakId);
    }
}
