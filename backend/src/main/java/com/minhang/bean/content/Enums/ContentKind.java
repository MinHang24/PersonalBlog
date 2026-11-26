package com.minhang.bean.content.enums;

import com.minhang.common.exception.BusinessException;
import org.springframework.http.HttpStatus;

public enum ContentKind {
    POSTS("posts"), PROJECTS("projects"), SETTINGS("settings");

    private final String value;
    ContentKind(String value) { this.value = value; }
    public String value() { return value; }

    public static ContentKind from(String value) {
        for (ContentKind kind : values()) {
            if (kind.value.equals(value)) { return kind; }
        }
        throw new BusinessException(HttpStatus.NOT_FOUND, "CONTENT_KIND_NOT_FOUND", "Unknown content kind");
    }
}
