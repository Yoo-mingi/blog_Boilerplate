package kr.co.daramu.user.dto;

import kr.co.daramu.user.model.User;
import lombok.Getter;

import java.time.LocalDateTime;import java.util.UUID;


@Getter
public class UserResponse {

    private final UUID id;
    private final String username;
    private final String email;
    private final String nickname;
    private final LocalDateTime createdAt;

    public UserResponse(User user) {
        this.id        = user.getId();
        this.username  = user.getUsername();
        this.email     = user.getEmail();
        this.nickname  = user.getNickname();
        this.createdAt = user.getCreatedAt();
    }
}