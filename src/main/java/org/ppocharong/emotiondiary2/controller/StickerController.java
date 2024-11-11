package org.ppocharong.emotiondiary2.controller;

import org.ppocharong.emotiondiary2.model.Sticker;
import org.ppocharong.emotiondiary2.service.StickerService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

//스티커 삽입 api 링크들어가면 바로 작동.
// http://localhost:8080/api/stickers/insert-from-folder
@RestController
@RequestMapping("/api/stickers")
public class StickerController {

    private final StickerService stickerService;

    public StickerController (StickerService stickerService) {
        this.stickerService = stickerService;
    }

    /** 스티커 DB에 넣기 */
    @GetMapping("/insert-from-folder")
    public String insertStickers() {
        stickerService.insertStickersFromFolder();
        return "스티커가 폴더에서 데이터베이스로 삽입되었습니다.";
    }

    /** 스티커 목록 조회 */
    @GetMapping
    public List<Sticker> getAllStickers() {
        return stickerService.getAllStickers();
    }

}
