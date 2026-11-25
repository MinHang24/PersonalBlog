package com.minhang.service.project;

import com.minhang.bean.content.bo.ContentSaveBO;
import com.minhang.bean.content.enums.ContentKind;
import com.minhang.service.content.policy.ContentPolicy;
import org.springframework.stereotype.Component;

@Component
public class ProjectContentPolicy implements ContentPolicy {
    @Override
    public ContentKind kind() { return ContentKind.PROJECTS; }

    @Override
    public void validate(ContentSaveBO command) {
        // No additional restrictions: retain the existing module content contract.
    }
}
