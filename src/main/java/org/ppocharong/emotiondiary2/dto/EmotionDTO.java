package org.ppocharong.emotiondiary2.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmotionDTO {
    private Long id;
    private Long diaryId; // Diary 객체 대신 Diary의 ID만 포함
    private String mainEmotion;
    private String subEmotion;
    private Instant createdAt;
}
