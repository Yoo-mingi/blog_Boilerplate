package kr.co.daramu.user.service;

import kr.co.daramu.user.dto.RegisterRequest;
import kr.co.daramu.user.dto.UserResponse;
import kr.co.daramu.user.model.User;
import kr.co.daramu.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final KeycloakAdminService keycloakAdminService;
    private final NotificationClient notificationClient;

    @Transactional
    public void register(RegisterRequest request) {
        // 1. 이메일 인증 토큰 검증 (Notification Service 호출)
        notificationClient.validateVerifyToken(request.verifyToken());

        // 2. 중복 검사 (내 DB 기준)
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 3. Keycloak에 인증 정보 등록
        UUID keycloakId = keycloakAdminService.createUser(
                request.username(),
                request.email(),
                request.password()
        );

        // 4. 내 DB에 프로필 저장
        try {
            User user = User.builder()
                    .id(keycloakId)
                    .username(request.username())
                    .email(request.email())
                    .nickname(request.nickname() != null ? request.nickname() : request.username())
                    .build();

            userRepository.save(user);
            log.info("회원가입 완료: {} ({})", request.username(), keycloakId);

        } catch (Exception e) {
            // DB 저장 실패 시 Keycloak 유저 롤백
            log.error("DB 저장 실패, Keycloak 유저 롤백: {}", keycloakId);
            keycloakAdminService.deleteUser(keycloakId);
            throw new RuntimeException("회원가입 처리 중 오류가 발생했습니다.", e);
        }
    }

    @Transactional(readOnly = true)
    public UserResponse getMe(String userId) {
        UUID uuid = UUID.fromString(userId);
        User user = userRepository.findById(uuid)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        return new UserResponse(user);
    }
}
