package org.ppocharong.emotiondiary2.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "user_sticker_customizations")
public class UserStickerCustomization {
    @Id
    @ColumnDefault("nextval('user_sticker_customizations_customization_id_seq'::regclass)")
    @Column(name = "customization_id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "diary_id", nullable = false)
    private Diary diary;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "sticker_id", nullable = false)
    private Sticker sticker;

    @Column(name = "position_x", nullable = false)
    private Double positionX;

    @Column(name = "position_y", nullable = false)
    private Double positionY;

    @ColumnDefault("1.0")
    @Column(name = "scale")
    private Double scale;

    @ColumnDefault("0.0")
    @Column(name = "rotation")
    private Double rotation;

    @ColumnDefault("now()")
    @Column(name = "created_at")
    private Instant createdAt;

}
