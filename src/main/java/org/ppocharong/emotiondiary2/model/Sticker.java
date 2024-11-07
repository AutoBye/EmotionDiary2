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
@Table(name = "stickers")
public class Sticker {
    @Id
    @ColumnDefault("nextval('stickers_sticker_id_seq'::regclass)")
    @Column(name = "sticker_id", nullable = false)
    private Long id;

    @Column(name = "sticker_name", nullable = false)
    private String stickerName;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "description")
    private String description;

    @ColumnDefault("now()")
    @Column(name = "created_at")
    private Instant createdAt;

}
