package com.minhang.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class SecurityConfiguration {
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    UserDetailsService users(@Value("${blog.admin.password:}") String password, PasswordEncoder encoder) {
        if (password == null || password.length() < 16) {
            throw new IllegalStateException("Set BLOG_ADMIN_PASSWORD to at least 16 characters");
        }
        return new InMemoryUserDetailsManager(User.withUsername("admin").password(encoder.encode(password)).roles("ADMIN").build());
    }

    @Bean
    SecurityFilterChain chain(HttpSecurity h) throws Exception {
        return h.authorizeHttpRequests(a -> a.requestMatchers("/api/public/**", "/api/health", "/api/csrf").permitAll().anyRequest().hasRole("ADMIN"))
                .httpBasic(org.springframework.security.config.Customizer.withDefaults())
                .build();
    }
}
