package com.minhang.bean.content.vo;

import java.time.Instant;

/** Preserves the existing admin JSON contract without exposing the JPA entity. */
public record ContentAdminVO(String id, Long version, String kind, String slug, String title,
                             boolean published, Instant updatedAt, String body) {
}
