package org.ppocharong.emotiondiary2.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
@Table(name = "emotions")
public class Emotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID 자동 생성 설정
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "diary_id")
    @JsonBackReference
    private Diary diary;

    @Column(name = "main_emotion", nullable = false)
    private String mainEmotion;

    @Column(name = "sub_emotion", nullable = false)
    private String subEmotion;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

}
