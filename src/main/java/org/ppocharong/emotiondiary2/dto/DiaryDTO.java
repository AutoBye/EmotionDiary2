package org.ppocharong.emotiondiary2.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.ppocharong.emotiondiary2.model.Theme;
import org.ppocharong.emotiondiary2.model.User;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DiaryDTO {
    private Long id;
    private User user;
    private String title;
    private String content;
    private Integer moodScore;
    private Boolean visibility;
    private Instant createdAt;
    private Integer likeCount;
    private Theme theme;
}
