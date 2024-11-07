package org.ppocharong.emotiondiary2.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "diary_likes")
public class DiaryLike {
    @Id
    @ColumnDefault("nextval('diary_likes_like_id_seq'::regclass)")
    @Column(name = "like_id", nullable = false)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "diary_id", nullable = false)
    private Diary diary;

    @ColumnDefault("now()")
    @Column(name = "liked_at")
    private OffsetDateTime likedAt;

}
