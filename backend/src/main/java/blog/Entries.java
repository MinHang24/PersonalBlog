package blog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface Entries extends JpaRepository<Entry,String> {
 List<Entry> findByKindOrderByUpdatedAtDesc(String kind);
 Optional<Entry> findByKindAndSlug(String kind,String slug);
}
