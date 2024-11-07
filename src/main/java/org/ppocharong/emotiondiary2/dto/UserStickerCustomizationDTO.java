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
public class UserStickerCustomizationDTO {
    private Long id;
    private Diary diary;
    private StickerDTO sticker;
    private Double positionX;
    private Double positionY;
    private Double scale;
    private Double rotation;
    private Instant createdAt;
}
