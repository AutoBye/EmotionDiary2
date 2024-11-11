package org.ppocharong.emotiondiary2.service;

import org.ppocharong.emotiondiary2.model.Diary;
import org.ppocharong.emotiondiary2.model.MoodAnalysis;
import org.ppocharong.emotiondiary2.repository.DiaryRepository;
import org.ppocharong.emotiondiary2.repository.MoodAnalysisRepository;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmotionPredictionService {

    private static final Logger logger = LoggerFactory.getLogger(EmotionPredictionService.class);

    private final DiaryRepository diaryRepository;
    private final MoodAnalysisRepository moodAnalysisRepository;

    public EmotionPredictionService(DiaryRepository diaryRepository,MoodAnalysisRepository moodAnalysisRepository) {
        this.diaryRepository = diaryRepository;
        this.moodAnalysisRepository = moodAnalysisRepository;
    }


    /** API 서버에 맞게 변경 */
    private String convertAgeToCategory(String age) {
        return switch (age) {
            case "10대" -> "청소년";
            case "20대", "30대" -> "청년";
            case "40대", "50대" -> "중년";
            default -> "노년";
        };
    }

    /** 분석 API 호출 속도 느려서 비동기 처리 */
    @Async
    public void callEmotionPredictionAPI(Long diaryId, String content, String gender, String age) {
        // 문장 분할
        String[] sentences = content.split("(?<=\\.)|(?<=\\?)|(?<=!)");

        RestTemplate restTemplate = new RestTemplate();

        // 모델에 사용할 변수명 맞추기
        gender = gender.equals("남") ? "남성" : "여성";
        age = convertAgeToCategory(age);

        // API 주소
        String apiUrl = "http://localhost:5000/predict";

        // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");

        // 일기 확인
        Diary diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new RuntimeException("해당 ID의 다이어리를 찾을 수 없습니다."));

        for (String sentence : sentences) {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("text", sentence.trim());
            requestBody.put("age", age);
            requestBody.put("gender", gender);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            try {
                ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                        apiUrl,
                        HttpMethod.POST,
                        request,
                        new ParameterizedTypeReference<>() {
                        }
                );

                Map<String, Object> responseBody = response.getBody();

                if (responseBody != null) {
                    String moodCategory = (String) responseBody.get("category");
                    String moodSubcategory = (String) responseBody.get("subcategory");

                    MoodAnalysis moodAnalysis = new MoodAnalysis();
                    moodAnalysis.setDiary(diary);
                    moodAnalysis.setMoodCategory(moodCategory);
                    moodAnalysis.setMoodSubcategory(moodSubcategory);
                    moodAnalysis.setMoodTemp(BigDecimal.valueOf(0));
                    moodAnalysis.setAnalysisDate(Instant.now());
                    moodAnalysisRepository.save(moodAnalysis);
                }
            } catch (Exception e) {
                // 예외를 로거로 기록
                logger.error("Emotion prediction API 호출 중 오류가 발생했습니다. Diary ID: {}", diaryId, e);
            }
        }
    }



}
