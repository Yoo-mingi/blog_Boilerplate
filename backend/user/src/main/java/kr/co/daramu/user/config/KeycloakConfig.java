package kr.co.daramu.user.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
@EnableConfigurationProperties(KeycloakProperties.class)
public class KeycloakConfig {

    @Bean
    public WebClient keycloakWebClient(KeycloakProperties props) {
        return WebClient.builder()
                .baseUrl(props.baseUrl())
                .build();
    }
}