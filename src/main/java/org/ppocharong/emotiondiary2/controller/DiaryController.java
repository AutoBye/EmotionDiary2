package org.ppocharong.emotiondiary2.controller;

import jakarta.servlet.http.HttpSession;
import org.ppocharong.emotiondiary2.dto.DiaryDTO;
import org.ppocharong.emotiondiary2.service.DiaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/diaries")
public class DiaryController {

    private final DiaryService diaryService;

    public DiaryController(DiaryService diaryService) {
        this.diaryService = diaryService;
    }

    /** 일기 쓰기 컨트롤러 */
    @PostMapping("/write")
    public ResponseEntity<String> createDiary(@RequestBody DiaryDTO diaryDTO, HttpSession session) {
        return diaryService.createDiary(diaryDTO, session);
    }

    /** 내 일기 보기 컨트롤러 */
    @GetMapping("/list")
    public ResponseEntity<List<DiaryDTO>> getDiaries(HttpSession session) {
        return diaryService.getDiaries(session);
    }

    /** 공개 일기 보기 컨트롤러 */
    @GetMapping("/public-list")
    public ResponseEntity<List<DiaryDTO>> getPublicDiaries() {
        return diaryService.getPublicDiaries();
    }

    /** 일기 보기 컨트롤러 */
    @GetMapping("/{id}")
    public ResponseEntity<DiaryDTO> getDiaryById(@PathVariable Long id, HttpSession session) {
        return diaryService.getDiaryById(id, session);
    }

    /** 일기 삭제 컨트롤러 */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDiaryById(@PathVariable Long id, HttpSession session) {
        return diaryService.deleteDiaryById(id, session);
    }

    /** 공감하기 컨트롤러 */
    @PostMapping("/{id}/like")
    public ResponseEntity<String> likeDiary(@PathVariable Long id, HttpSession session) {
        return diaryService.likeDiary(id, session);
    }

}
