package blog;
import org.springframework.boot.*;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.*;
@Component public class Seed implements ApplicationRunner {
 private final Entries repo;private final ObjectMapper json;
 Seed(Entries repo,ObjectMapper json){this.repo=repo;this.json=json;}
 @Transactional public void run(ApplicationArguments args)throws Exception {
 if(repo.count()!=0)return;
 try(var stream=getClass().getResourceAsStream("/seed.json")){
 if(stream==null)return;
 for(JsonNode n:json.readTree(stream)){Entry e=new Entry();e.kind=n.path("kind").asText();e.slug=n.path("slug").asText();e.title=n.path("title").asText();e.published=true;e.updatedAt=java.time.Instant.now();e.body=n.path("data").toString();repo.save(e);}
 }
 }
}
