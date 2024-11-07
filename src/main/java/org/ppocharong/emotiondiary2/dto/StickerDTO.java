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
public class StickerDTO {
    private long id;
    private String stickerName;
    private String imageUrl;
    private String description;
    private Instant createdAt;
}
