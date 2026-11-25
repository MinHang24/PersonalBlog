package com.minhang.service.post;

import com.minhang.bean.content.bo.ContentSaveBO;
import com.minhang.bean.content.enums.ContentKind;
import com.minhang.service.content.policy.ContentPolicy;
import org.springframework.stereotype.Component;
import com.minhang.common.exception.BusinessException;
import org.springframework.http.HttpStatus;
import java.util.Set;

@Component
public class PostContentPolicy implements ContentPolicy {
    @Override
    public ContentKind kind() { return ContentKind.POSTS; }

    @Override
    public void validate(ContentSaveBO command) {
        if (!Set.of("go", "rust", "multimedia", "desktop").contains(command.data().path("category").asText())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_CATEGORY", "Invalid post category");
        }
    }
}
