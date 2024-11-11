package org.ppocharong.emotiondiary2.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "themes")
public class Theme {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID 자동 생성 설정
    @Column(name = "theme_id", nullable = false)
    private Long id;

    @Column(name = "theme_name", nullable = false)
    private String themeName;

    @Column(name = "description")
    private String description;

    @ColumnDefault("now()")
    @Column(name = "created_at")
    private Instant createdAt;
    
}
