package com.minhang.bootstrap;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.minhang.bean.content.bo.ContentSaveBO;
import com.minhang.bean.content.enums.ContentKind;
import com.minhang.mapper.content.ContentMapper;
import com.minhang.service.content.ContentService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Empty-database bootstrap; existing rows are never overwritten. */
@Component
@ConditionalOnProperty(name = "blog.seed.enabled", havingValue = "true", matchIfMissing = true)
public class ContentSeedRunner implements ApplicationRunner {
    private final ContentMapper mapper;
    private final ContentService service;
    private final ObjectMapper json;

    public ContentSeedRunner(ContentMapper mapper, ContentService service, ObjectMapper json) {
        this.mapper = mapper;
        this.service = service;
        this.json = json;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        if (mapper.count() != 0) { return; }
        try (var stream = getClass().getResourceAsStream("/seed.json")) {
            if (stream == null) { return; }
            for (JsonNode node : json.readTree(stream)) {
                if (!(node.path("data") instanceof ObjectNode data)) {
                    throw new IllegalStateException("Seed data must be an object");
                }
                service.create(new ContentSaveBO(ContentKind.from(node.path("kind").asText()),
                        node.path("slug").asText(), node.path("title").asText(), true, data, null));
            }
        }
    }
}
