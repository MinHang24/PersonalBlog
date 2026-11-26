package com.minhang.bean.content.bo;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.minhang.bean.content.enums.ContentKind;

/** Business command independent of HTTP binding and persistence annotations. */
public record ContentSaveBO(ContentKind kind, String slug, String title,
                            boolean published, ObjectNode data, Long version) {
}
