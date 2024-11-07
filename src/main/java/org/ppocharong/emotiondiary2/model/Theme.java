package org.ppocharong.emotiondiary2.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
    @ColumnDefault("nextval('themes_theme_id_seq'::regclass)")
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
