package com.minhang.controller.content;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.minhang.bean.content.bo.ContentQueryBO;
import com.minhang.bean.content.enums.ContentKind;
import com.minhang.service.content.ContentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/public/{kind}")
public class PublicContentController {
    private final ContentService service;
    public PublicContentController(ContentService service) { this.service = service; }

    @GetMapping
    public List<ObjectNode> list(@PathVariable String kind,
            @RequestParam(defaultValue = "") String q, @RequestParam(defaultValue = "") String category,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "100") int size) {
        return service.listPublic(new ContentQueryBO(ContentKind.from(kind), q, category, page, size));
    }

    @GetMapping("/{slug}")
    public ObjectNode detail(@PathVariable String kind, @PathVariable String slug) {
        return service.getPublic(ContentKind.from(kind), slug);
    }
}
