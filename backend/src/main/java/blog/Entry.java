package blog;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "entry", uniqueConstraints = @UniqueConstraint(
    name = "uq_entry_kind_slug", columnNames = {"kind", "slug"}))
public class Entry {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36) public String id;
    @Version @Column(nullable = false) public Long version;
    @Column(nullable = false, length = 16) public String kind;
    @Column(nullable = false, length = 150) public String slug;
    @Column(nullable = false, length = 300) public String title;
    @Column(nullable = false) public boolean published;
    @Column(name = "updated_at", nullable = false) public java.time.Instant updatedAt;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false) public String body;
}
