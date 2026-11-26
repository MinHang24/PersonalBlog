package com.minhang.bean.content.bo;

import java.time.Instant;

/** Read projection: avoids retaining managed entities during large public scans. */
public record ContentPublicBO(String slug, String title, Instant updatedAt, String body) {
}
