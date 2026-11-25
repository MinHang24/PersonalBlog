package com.minhang;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
@org.springframework.test.context.ActiveProfiles("test")
@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:test;DB_CLOSE_DELAY=-1"}) @AutoConfigureMockMvc class ApiTest {
 @Autowired MockMvc mvc;
 @Test void draftAndAccess()throws Exception {
 String body="{\"slug\":\"test-post\",\"title\":\"Test\",\"published\":false,\"data\":{\"category\":\"go\"}}";
 mvc.perform(post("/api/admin/posts").contentType("application/json").content(body)).andExpect(status().isForbidden());
 mvc.perform(post("/api/admin/posts").with(user("admin").roles("ADMIN")).with(csrf()).contentType("application/json").content(body)).andExpect(status().isCreated());
 mvc.perform(get("/api/public/posts/test-post")).andExpect(status().isNotFound());
 mvc.perform(get("/api/admin/posts")).andExpect(status().isUnauthorized());
 mvc.perform(put("/api/admin/posts/test-post").with(user("admin").roles("ADMIN")).with(csrf()).contentType("application/json").content(body)).andExpect(status().isConflict());
 mvc.perform(get("/api/public/posts?size=101")).andExpect(status().isBadRequest());
 }
 @Test void publishAndDelete() throws Exception {
 String body="{\"slug\":\"public-item\",\"title\":\"Published\",\"published\":true,\"data\":{\"category\":\"rust\"}}";
 mvc.perform(post("/api/admin/posts").with(user("admin").roles("ADMIN")).with(csrf()).contentType("application/json").content(body)).andExpect(status().isCreated());
 mvc.perform(get("/api/public/posts/public-item")).andExpect(status().isOk()).andExpect(jsonPath("$.title").value("Published"));
 mvc.perform(post("/api/admin/posts").with(user("admin").roles("ADMIN")).with(csrf()).contentType("application/json").content(body)).andExpect(status().isConflict());
 mvc.perform(delete("/api/admin/posts/public-item?version=0").with(user("admin").roles("ADMIN")).with(csrf())).andExpect(status().isNoContent());
 mvc.perform(get("/api/public/posts/public-item")).andExpect(status().isNotFound());
 }
}
