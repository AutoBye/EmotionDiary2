package org.ppocharong.emotiondiary2.controller;

import org.ppocharong.emotiondiary2.service.EmotionAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/emotion")
public class EmotionAnalysisController {

    private final EmotionAnalysisService emotionAnalysisService;

    public EmotionAnalysisController(EmotionAnalysisService emotionAnalysisService) {
        this.emotionAnalysisService = emotionAnalysisService;
    }

    /** 분석 시작 */
    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeEmotion(
            @RequestBody Map<String, Object> request) {
        return emotionAnalysisService.analyzeEmotion(request);
    }



}
