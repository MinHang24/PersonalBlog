package com.minhang;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.minhang.bootstrap.ContentSeedRunner;
import com.minhang.mapper.content.ContentMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@ActiveProfiles("test")
@SpringBootTest(properties = {"blog.seed.enabled=true",
        "spring.datasource.url=jdbc:h2:mem:seed-test;DB_CLOSE_DELAY=-1"})
class ContentSeedTest {
    @Autowired ContentSeedRunner runner;
    @Autowired ContentMapper mapper;
    @Autowired ObjectMapper json;

    @Test void bootstrapUsesBusinessServiceAndDoesNotOverwriteExistingRows() throws Exception {
        try (var stream = getClass().getResourceAsStream("/seed.json")) {
            assertNotNull(stream);
            assertEquals(json.readTree(stream).size(), mapper.count());
        }
        var entry = mapper.findAll().get(0);
        entry.setTitle("Locally edited title");
        mapper.saveAndFlush(entry);
        long count = mapper.count();
        runner.run(new DefaultApplicationArguments());
        assertEquals(count, mapper.count());
        assertEquals("Locally edited title", mapper.findById(entry.getId()).orElseThrow().getTitle());
    }
}
