package com.minhang.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.Clock;

@Configuration(proxyBeanMethods = false)
public class BeanConfiguration {
    @Bean
    public Clock clock() { return Clock.systemUTC(); }
}
