package kr.co.daramu.user.controller;

import jakarta.validation.Valid;
import kr.co.daramu.user.dto.RegisterRequest;
import kr.co.daramu.user.dto.UserResponse;
import kr.co.daramu.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        userService.register(request);
        return ResponseEntity.ok(Map.of("message", "회원가입이 완료되었습니다."));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(
            @RequestHeader("X-User-Id") String userId
    ) {
        return ResponseEntity.ok(userService.getMe(userId));
    }
}