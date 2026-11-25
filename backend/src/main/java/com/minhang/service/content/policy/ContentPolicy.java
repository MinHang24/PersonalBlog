package com.minhang.service.content.policy;

import com.minhang.bean.content.bo.ContentSaveBO;
import com.minhang.bean.content.enums.ContentKind;

/** Each module owns its business validation. Implementations are Spring beans. */
public interface ContentPolicy {
    ContentKind kind();
    void validate(ContentSaveBO command);
}
