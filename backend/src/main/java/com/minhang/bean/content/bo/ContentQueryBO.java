package com.minhang.bean.content.bo;

import com.minhang.bean.content.enums.ContentKind;
import com.minhang.common.exception.BusinessException;
import org.springframework.http.HttpStatus;

public record ContentQueryBO(ContentKind kind, String keyword, String category, int page, int size) {
    public ContentQueryBO {
        if (page < 0 || size < 1 || size > 100) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_PAGE", "Page must be nonnegative and size between 1 and 100");
        }
        keyword = keyword == null ? "" : keyword;
        category = category == null ? "" : category;
    }
}
