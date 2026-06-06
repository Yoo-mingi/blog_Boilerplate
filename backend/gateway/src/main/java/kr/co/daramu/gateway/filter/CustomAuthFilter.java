package kr.co.daramu.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class CustomAuthFilter implements WebFilter {

    private static final Logger log = LoggerFactory.getLogger(CustomAuthFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // 1. 요청 추적 ID
        String requestId = UUID.randomUUID().toString();

        // 2. SecurityContext에서 JWT 꺼내 헤더 주입 (인증된 요청만 존재)
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> ctx.getAuthentication())
                .filter(auth -> auth != null && auth.getPrincipal() instanceof Jwt)
                .map(auth -> (Jwt) auth.getPrincipal())
                .defaultIfEmpty(createEmptyJwt())
                .flatMap(jwt -> {
                    ServerHttpRequest.Builder builder = request.mutate()
                            .header("X-Request-Id", requestId);

                    if (jwt != createEmptyJwt() && jwt.getSubject() != null) {
                        builder.header("X-User-Id", jwt.getSubject());

                        String email = jwt.getClaimAsString("email");
                        if (email != null) builder.header("X-User-Email", email);

                        String preferredUsername = jwt.getClaimAsString("preferred_username");
                        if (preferredUsername != null) builder.header("X-User-Name", preferredUsername);
                    }

                    ServerHttpRequest mutatedRequest = builder.build();
                    log.info("[{}] {} {} userId={}",
                            requestId,
                            request.getMethod(),
                            request.getURI().getPath(),
                            jwt.getSubject() != null ? jwt.getSubject() : "anonymous"
                    );

                    return chain.filter(exchange.mutate().request(mutatedRequest).build());
                });
    }

    // defaultIfEmpty용 빈 JWT 마커 (null 대신 사용)
    private static final Jwt EMPTY_JWT = Jwt.withTokenValue("empty")
            .header("alg", "none")
            .claim("sub", null)
            .build();

    private Jwt createEmptyJwt() {
        return EMPTY_JWT;
    }
}


