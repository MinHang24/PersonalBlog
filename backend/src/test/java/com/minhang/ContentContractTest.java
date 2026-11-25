package com.minhang;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.minhang.bean.content.dataobject.ContentDO;
import com.minhang.mapper.content.ContentMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class ContentContractTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired ContentMapper mapper;

    private String slug() { return "contract-" + UUID.randomUUID(); }

    private String body(String slug, boolean published, Long version) throws Exception {
        var node = json.createObjectNode().put("slug", slug).put("title", "Contract title")
                .put("published", published);
        if (version != null) { node.put("version", version); }
        node.putObject("data").put("category", "go").put("title", "untrusted title").put("slug", "untrusted-slug");
        return json.writeValueAsString(node);
    }

    private JsonNode create(String kind, String slug) throws Exception {
        String response = mvc.perform(post("/api/admin/" + kind).with(user("admin").roles("ADMIN"))
                        .with(csrf()).contentType("application/json").content(body(slug, true, null)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.body").isString())
                .andExpect(jsonPath("$.version").value(0)).andReturn().getResponse().getContentAsString();
        return json.readTree(response);
    }

    @Test void updateRenameAndStaleDelete() throws Exception {
        String original = slug();
        String renamed = slug();
        create("posts", original);
        mvc.perform(put("/api/admin/posts/" + original).with(user("admin").roles("ADMIN"))
                        .with(csrf()).contentType("application/json").content(body(renamed, true, 0L)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.version").value(1));
        mvc.perform(get("/api/public/posts/" + original)).andExpect(status().isNotFound());
        mvc.perform(get("/api/public/posts/" + renamed)).andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value(renamed)).andExpect(jsonPath("$.title").value("Contract title"))
                .andExpect(jsonPath("$.body").doesNotExist());
        mvc.perform(delete("/api/admin/posts/" + renamed).param("version", "0")
                        .with(user("admin").roles("ADMIN")).with(csrf()))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("VERSION_CONFLICT"));
        mvc.perform(delete("/api/admin/posts/" + renamed).param("version", "1")
                        .with(user("admin").roles("ADMIN")).with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test void modulesAreIsolatedAndPublicFieldsRemainCompatible() throws Exception {
        String slug = slug();
        for (String kind : new String[]{"posts", "projects", "settings"}) {
            create(kind, slug);
            mvc.perform(get("/api/public/" + kind + "/" + slug))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.slug").value(slug));
        }
        mvc.perform(get("/api/public/unknown")).andExpect(status().isNotFound());
        mvc.perform(get("/api/public/posts").param("q", "CONTRACT TITLE").param("category", "go")
                        .param("size", "1"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/api/public/posts").param("category", "missing-category"))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
    }

    @Test void invalidInputAndPrivileges() throws Exception {
        String slug = slug();
        mvc.perform(post("/api/admin/posts").with(user("reader").roles("READER")).with(csrf())
                .contentType("application/json").content(body(slug, true, null))).andExpect(status().isForbidden());
        mvc.perform(post("/api/admin/posts").with(user("admin").roles("ADMIN"))
                .contentType("application/json").content(body(slug, true, null))).andExpect(status().isForbidden());
        for (String input : new String[]{"{}", "{", body("Bad Slug", true, null),
                body(slug, true, null).replace("\"go\"", "\"unsupported\"")}) {
            mvc.perform(post("/api/admin/posts").with(user("admin").roles("ADMIN")).with(csrf())
                    .contentType("application/json").content(input)).andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").exists());
        }
        mvc.perform(get("/api/public/posts").param("page", "-1")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/public/posts").param("size", "abc")).andExpect(status().isBadRequest());
        mvc.perform(delete("/api/admin/posts/" + slug).with(user("admin").roles("ADMIN")).with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test void databaseOptimisticLockRejectsConcurrentWriter() throws Exception {
        String slug = slug();
        create("posts", slug);
        ContentDO first = mapper.findByKindAndSlug("posts", slug).orElseThrow();
        ContentDO second = mapper.findByKindAndSlug("posts", slug).orElseThrow();
        first.setTitle("First writer");
        mapper.saveAndFlush(first);
        second.setTitle("Stale writer");
        assertThrows(OptimisticLockingFailureException.class, () -> mapper.saveAndFlush(second));
    }

    @Test void rejectedUpdateDoesNotChangeExistingContent() throws Exception {
        String slug = slug();
        create("posts", slug);
        String invalid = body(slug, false, 0L).replace("\"go\"", "\"invalid\"");
        mvc.perform(put("/api/admin/posts/" + slug).with(user("admin").roles("ADMIN")).with(csrf())
                .contentType("application/json").content(invalid)).andExpect(status().isBadRequest());
        mvc.perform(get("/api/public/posts/" + slug)).andExpect(status().isOk())
                .andExpect(jsonPath("$.category").value("go"));
        org.junit.jupiter.api.Assertions.assertEquals(0L,
                mapper.findByKindAndSlug("posts", slug).orElseThrow().getVersion());
    }

    @Test void uniqueConflictRollsBackEntireUpdate() throws Exception {
        String original = slug();
        String occupied = slug();
        create("posts", original);
        create("posts", occupied);
        mvc.perform(put("/api/admin/posts/" + original).with(user("admin").roles("ADMIN")).with(csrf())
                        .contentType("application/json").content(body(occupied, false, 0L)))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("DATA_CONFLICT"));
        mvc.perform(get("/api/public/posts/" + original)).andExpect(status().isOk());
        org.junit.jupiter.api.Assertions.assertEquals(0L,
                mapper.findByKindAndSlug("posts", original).orElseThrow().getVersion());
    }
}
