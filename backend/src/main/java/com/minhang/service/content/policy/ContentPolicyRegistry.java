package com.minhang.service.content.policy;

import com.minhang.bean.content.enums.ContentKind;
import org.springframework.stereotype.Component;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Component
public class ContentPolicyRegistry {
    private final Map<ContentKind, ContentPolicy> policies = new EnumMap<>(ContentKind.class);

    public ContentPolicyRegistry(List<ContentPolicy> beans) {
        for (ContentPolicy policy : beans) {
            if (policies.putIfAbsent(policy.kind(), policy) != null) {
                throw new IllegalStateException("Duplicate content policy: " + policy.kind());
            }
        }
        for (ContentKind kind : ContentKind.values()) {
            if (!policies.containsKey(kind)) { throw new IllegalStateException("Missing content policy: " + kind); }
        }
    }

    public ContentPolicy get(ContentKind kind) { return policies.get(kind); }
}
