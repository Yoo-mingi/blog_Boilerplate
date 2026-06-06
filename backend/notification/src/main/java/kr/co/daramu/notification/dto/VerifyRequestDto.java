package kr.co.daramu.notification.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record VerifyRequestDto(
        @NotBlank @Email String email
) {}
