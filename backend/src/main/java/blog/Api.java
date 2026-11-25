package blog;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@RestController @RequestMapping("/api") public class Api {
 private final Entries repo; private final ObjectMapper json;
 Api(Entries repo,ObjectMapper json){this.repo=repo;this.json=json;}
 record Input(@NotBlank @Pattern(regexp="[a-z0-9]+(?:-[a-z0-9]+)*") @Size(max=150) String slug,@NotBlank @Size(max=300) String title,boolean published,@NotNull ObjectNode data,Long version){}
 private void kind(String k){if(!Set.of("posts","projects","settings").contains(k))throw new ResponseStatusException(HttpStatus.NOT_FOUND);}
 private ObjectNode data(Entry e){try{ObjectNode d=(ObjectNode)json.readTree(e.body);d.put("slug",e.slug);d.put("title",e.title);d.put("updatedAt",e.updatedAt.toString());return d;}catch(Exception ex){throw new IllegalStateException(ex);}}
 private Entry get(String k,String slug,boolean publicOnly){kind(k);return repo.findByKindAndSlug(k,slug).filter(e->!publicOnly||e.published).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));}
 @GetMapping("/health") Map<String,String> health(){return Map.of("status","ok");}
 @GetMapping("/csrf") Map<String,String> csrf(CsrfToken t){return Map.of("headerName",t.getHeaderName(),"token",t.getToken());}
 @GetMapping("/public/{kind}") List<ObjectNode> list(@PathVariable String kind,@RequestParam(defaultValue="") String q,@RequestParam(defaultValue="") String category,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="100") int size){kind(kind);if(page<0||size<1||size>100)throw new ResponseStatusException(HttpStatus.BAD_REQUEST);return repo.findByKindOrderByUpdatedAtDesc(kind).stream().filter(e->e.published).map(this::data).filter(d->q.isBlank()||d.path("title").asText().toLowerCase().contains(q.toLowerCase())).filter(d->category.isBlank()||category.equals(d.path("category").asText())).skip((long)page*size).limit(size).toList();}
 @GetMapping("/public/{kind}/{slug}") ObjectNode detail(@PathVariable String kind,@PathVariable String slug){return data(get(kind,slug,true));}
 @GetMapping("/admin/{kind}") List<Entry> admin(@PathVariable String kind){kind(kind);return repo.findByKindOrderByUpdatedAtDesc(kind);}
 @PostMapping("/admin/{kind}") @ResponseStatus(HttpStatus.CREATED) @Transactional Entry create(@PathVariable String kind,@Valid @RequestBody Input in){kind(kind);Entry e=new Entry();e.kind=kind;return save(e,in);}
 @PutMapping("/admin/{kind}/{slug}") @Transactional Entry update(@PathVariable String kind,@PathVariable String slug,@Valid @RequestBody Input in){Entry e=get(kind,slug,false);if(in.version()==null||!in.version().equals(e.version))throw new ResponseStatusException(HttpStatus.CONFLICT,"Version mismatch");return save(e,in);}
 private Entry save(Entry e,Input in){if(in.data().toString().length()>2000000)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Content too large");if(e.kind.equals("posts")&&!Set.of("go","rust","multimedia","desktop").contains(in.data().path("category").asText()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid category");e.slug=in.slug();e.title=in.title();e.published=in.published();e.updatedAt=java.time.Instant.now();e.body=in.data().toString();return repo.saveAndFlush(e);}
 @DeleteMapping("/admin/{kind}/{slug}") @ResponseStatus(HttpStatus.NO_CONTENT) @Transactional void delete(@PathVariable String kind,@PathVariable String slug,@RequestParam Long version){Entry e=get(kind,slug,false);if(!version.equals(e.version))throw new ResponseStatusException(HttpStatus.CONFLICT);repo.delete(e);}
}
