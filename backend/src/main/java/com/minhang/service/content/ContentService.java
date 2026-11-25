package com.minhang.service.content;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.minhang.bean.content.bo.ContentQueryBO;
import com.minhang.bean.content.bo.ContentSaveBO;
import com.minhang.bean.content.enums.ContentKind;
import com.minhang.bean.content.vo.ContentAdminVO;
import java.util.List;

public interface ContentService {
    List<ObjectNode> listPublic(ContentQueryBO query);
    ObjectNode getPublic(ContentKind kind, String slug);
    List<ContentAdminVO> listAdmin(ContentKind kind);
    ContentAdminVO create(ContentSaveBO command);
    ContentAdminVO update(String slug, ContentSaveBO command);
    void delete(ContentKind kind, String slug, Long version);
}
