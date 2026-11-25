package com.minhang.controller.content;

import com.minhang.bean.content.dto.ContentSaveDTO;
import com.minhang.bean.content.enums.ContentKind;
import com.minhang.bean.content.vo.ContentAdminVO;
import com.minhang.converter.content.ContentConverter;
import com.minhang.service.content.ContentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/admin/{kind}")
public class AdminContentController {
    private final ContentService service;
    private final ContentConverter converter;
    public AdminContentController(ContentService service, ContentConverter converter) {
        this.service = service;
        this.converter = converter;
    }

    @GetMapping
    public List<ContentAdminVO> list(@PathVariable String kind) {
        return service.listAdmin(ContentKind.from(kind));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContentAdminVO create(@PathVariable String kind, @Valid @RequestBody ContentSaveDTO input) {
        return service.create(converter.toCommand(ContentKind.from(kind), input));
    }

    @PutMapping("/{slug}")
    public ContentAdminVO update(@PathVariable String kind, @PathVariable String slug,
                                 @Valid @RequestBody ContentSaveDTO input) {
        return service.update(slug, converter.toCommand(ContentKind.from(kind), input));
    }

    @DeleteMapping("/{slug}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String kind, @PathVariable String slug, @RequestParam Long version) {
        service.delete(ContentKind.from(kind), slug, version);
    }
}
