package org.ppocharong.emotiondiary2.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "mood_analysis")
public class MoodAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID 자동 생성 설정
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "diary_id")
    private Diary diary;

    @Column(name = "mood_category", nullable = false)
    private String moodCategory;

    @Column(name = "mood_subcategory")
    private String moodSubcategory;

    @Column(name = "mood_temp", nullable = false, precision = 5, scale = 2)
    private BigDecimal moodTemp;

    @ColumnDefault("now()")
    @Column(name = "analysis_date")
    private Instant analysisDate;

}
