package kr.co.daramu.notification.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SendEmailDto(
        @NotBlank @Email String to,
        @NotBlank String subject,
        @NotBlank        String body
) {}
