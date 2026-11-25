package com.minhang.service.content.impl;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.minhang.bean.content.bo.ContentQueryBO;
import com.minhang.bean.content.bo.ContentSaveBO;
import com.minhang.bean.content.dataobject.ContentDO;
import com.minhang.bean.content.enums.ContentKind;
import com.minhang.bean.content.vo.ContentAdminVO;
import com.minhang.common.exception.BusinessException;
import com.minhang.converter.content.ContentConverter;
import com.minhang.mapper.content.ContentMapper;
import com.minhang.service.content.ContentService;
import com.minhang.service.content.policy.ContentPolicyRegistry;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class ContentServiceImpl implements ContentService {
    private static final int MAX_CONTENT_LENGTH = 2_000_000;
    private final ContentMapper mapper;
    private final ContentConverter converter;
    private final ContentPolicyRegistry policies;
    private final Clock clock;

    public ContentServiceImpl(ContentMapper mapper, ContentConverter converter,
                              ContentPolicyRegistry policies, Clock clock) {
        this.mapper = mapper;
        this.converter = converter;
        this.policies = policies;
        this.clock = clock;
    }

    @Override
    public List<ObjectNode> listPublic(ContentQueryBO query) {
        try (var entries = mapper.streamPublished(query.kind().value())) {
            return entries
                .filter(e -> query.keyword().isBlank() || e.title().toLowerCase(Locale.ROOT)
                        .contains(query.keyword().toLowerCase(Locale.ROOT)))
                .map(converter::toPublic)
                .filter(d -> query.category().isBlank() || query.category().equals(d.path("category").asText()))
                .skip((long) query.page() * query.size()).limit(query.size()).toList();
        }
    }

    @Override
    public ObjectNode getPublic(ContentKind kind, String slug) {
        ContentDO entity = find(kind, slug);
        if (!entity.isPublished()) { throw notFound(); }
        return converter.toPublic(entity);
    }

    @Override
    public List<ContentAdminVO> listAdmin(ContentKind kind) {
        return mapper.findByKindOrderByUpdatedAtDescIdAsc(kind.value()).stream().map(converter::toAdmin).toList();
    }

    @Override
    @Transactional
    public ContentAdminVO create(ContentSaveBO command) {
        ContentDO entity = new ContentDO();
        entity.setKind(command.kind().value());
        return save(entity, command);
    }

    @Override
    @Transactional
    public ContentAdminVO update(String slug, ContentSaveBO command) {
        ContentDO entity = find(command.kind(), slug);
        checkVersion(entity, command.version());
        return save(entity, command);
    }

    @Override
    @Transactional
    public void delete(ContentKind kind, String slug, Long version) {
        ContentDO entity = find(kind, slug);
        checkVersion(entity, version);
        mapper.delete(entity);
        mapper.flush();
    }

    private ContentAdminVO save(ContentDO entity, ContentSaveBO command) {
        if (command.slug() == null || !command.slug().matches("[a-z0-9]+(?:-[a-z0-9]+)*")
                || command.slug().length() > 150 || command.title() == null || command.title().isBlank()
                || command.title().length() > 300 || command.data() == null) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_CONTENT", "Invalid content fields");
        }
        String body = command.data().toString();
        if (body.length() > MAX_CONTENT_LENGTH) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "CONTENT_TOO_LARGE", "Content too large");
        }
        policies.get(command.kind()).validate(command);
        entity.setSlug(command.slug());
        entity.setTitle(command.title());
        entity.setPublished(command.published());
        entity.setUpdatedAt(Instant.now(clock));
        entity.setBody(body);
        return converter.toAdmin(mapper.saveAndFlush(entity));
    }

    private ContentDO find(ContentKind kind, String slug) {
        return mapper.findByKindAndSlug(kind.value(), slug).orElseThrow(this::notFound);
    }

    private BusinessException notFound() {
        return new BusinessException(HttpStatus.NOT_FOUND, "CONTENT_NOT_FOUND", "Content not found");
    }

    private void checkVersion(ContentDO entity, Long version) {
        if (version == null || !version.equals(entity.getVersion())) {
            throw new BusinessException(HttpStatus.CONFLICT, "VERSION_CONFLICT", "Content changed; reload before saving");
        }
    }
}
