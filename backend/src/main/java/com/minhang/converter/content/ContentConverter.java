package com.minhang.converter.content;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.minhang.bean.content.bo.ContentSaveBO;
import com.minhang.bean.content.bo.ContentPublicBO;
import com.minhang.bean.content.dataobject.ContentDO;
import com.minhang.bean.content.dto.ContentSaveDTO;
import com.minhang.bean.content.enums.ContentKind;
import com.minhang.bean.content.vo.ContentAdminVO;
import org.springframework.stereotype.Component;

@Component
public class ContentConverter {
    private final ObjectMapper json;
    public ContentConverter(ObjectMapper json) { this.json = json; }

    public ContentSaveBO toCommand(ContentKind kind, ContentSaveDTO dto) {
        return new ContentSaveBO(kind, dto.slug(), dto.title(), dto.published(), dto.data().deepCopy(), dto.version());
    }

    public ContentAdminVO toAdmin(ContentDO entity) {
        return new ContentAdminVO(entity.getId(), entity.getVersion(), entity.getKind(), entity.getSlug(),
                entity.getTitle(), entity.isPublished(), entity.getUpdatedAt(), entity.getBody());
    }

    public ObjectNode toPublic(ContentDO entity) {
        return toPublic(new ContentPublicBO(entity.getSlug(), entity.getTitle(), entity.getUpdatedAt(), entity.getBody()));
    }

    public ObjectNode toPublic(ContentPublicBO content) {
        try {
            if (!(json.readTree(content.body()) instanceof ObjectNode data)) {
                throw new IllegalStateException("Stored content must be a JSON object");
            }
            data.put("slug", content.slug());
            data.put("title", content.title());
            data.put("updatedAt", content.updatedAt().toString());
            return data;
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Cannot deserialize stored content", ex);
        }
    }
}
