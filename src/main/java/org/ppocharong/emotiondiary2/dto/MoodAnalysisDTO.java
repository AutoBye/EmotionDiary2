package org.ppocharong.emotiondiary2.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.ppocharong.emotiondiary2.model.Diary;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MoodAnalysisDTO {
    private Long id;
    private Diary diary;
    private String moodCategory;
    private String moodSubcategory;
    private Double moodTemp;
    private Instant analysisDate;
}
