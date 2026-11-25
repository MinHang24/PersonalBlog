package com.minhang.mapper.content;

import com.minhang.bean.content.dataobject.ContentDO;
import com.minhang.bean.content.bo.ContentPublicBO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.QueryHint;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

/** Persistence mapper implemented by Spring Data JPA, not a MyBatis mapper. */
public interface ContentMapper extends JpaRepository<ContentDO, String> {
    List<ContentDO> findByKindOrderByUpdatedAtDescIdAsc(String kind);
    @Query("select new com.minhang.bean.content.bo.ContentPublicBO(c.slug, c.title, c.updatedAt, c.body) "
            + "from ContentDO c where c.kind = :kind and c.published = true order by c.updatedAt desc, c.id asc")
    @QueryHints({@QueryHint(name = "org.hibernate.fetchSize", value = "128"),
            @QueryHint(name = "org.hibernate.readOnly", value = "true")})
    Stream<ContentPublicBO> streamPublished(@Param("kind") String kind);
    Optional<ContentDO> findByKindAndSlug(String kind, String slug);
}
