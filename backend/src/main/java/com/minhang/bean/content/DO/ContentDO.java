package com.minhang.bean.content.dataobject;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "entry", uniqueConstraints = @UniqueConstraint(
        name = "uq_entry_kind_slug", columnNames = {"kind", "slug"}))
public class ContentDO {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    private String id;
    @Version
    @Column(nullable = false)
    private Long version;
    @Column(nullable = false, length = 16)
    private String kind;
    @Column(nullable = false, length = 150)
    private String slug;
    @Column(nullable = false, length = 300)
    private String title;
    @Column(nullable = false)
    private boolean published;
    @Column(name = "updated_at", nullable = false)
    private java.time.Instant updatedAt;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    private String body;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public String getKind() { return kind; }
    public void setKind(String kind) { this.kind = kind; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public boolean isPublished() { return published; }
    public void setPublished(boolean published) { this.published = published; }

    public java.time.Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(java.time.Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
}
