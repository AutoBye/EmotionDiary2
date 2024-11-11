package org.ppocharong.emotiondiary2.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.ppocharong.emotiondiary2.model.Theme;
import org.ppocharong.emotiondiary2.model.User;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DiaryDTO {
    private Long id;
    private User user;
    private String title;
    private String content;
    private Short moodScore;
    private Boolean visibility;
    private Instant createdAt;
    private Integer likeCount;
    private Theme theme;
    private List<EmotionDTO> emotions; // 감정 목록 추가
    private List<UserStickerCustomizationDTO> stickers; // 스티커 커스터마이징 정보
    private Map<String, Map<String, Object>> emotionCounts; // 감정 분석 데이터 추가
    private String author;

}
