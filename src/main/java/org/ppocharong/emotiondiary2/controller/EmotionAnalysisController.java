package org.ppocharong.emotiondiary2.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/emotion")
public class EmotionAnalysisController {

    // 감정 유사도 매핑
    private static final Map<String, List<String>> similarEmotions = Map.of(
            "기쁨", List.of("감사하는", "기쁨", "느긋", "만족스러운", "신뢰하는", "신이 난", "안도", "자신하는", "편안한", "흥분"),
            "당황", List.of("고립된", "남의 시선을 의식하는", "당황", "부끄러운", "열등감", "외로운", "죄책감의", "한심한", "혐오스러운", "혼란스러운"),
            "분노", List.of("구역질 나는", "노여워하는", "방어적인", "분노", "성가신", "악의적인", "안달하는", "좌절한", "짜증내는", "툴툴대는"),
            "불안", List.of("걱정스러운", "당혹스러운", "두려운", "불안", "스트레스 받는", "조심스러운", "초조한", "취약한", "혼란스러운", "회의적인"),
            "슬픔", List.of("낙담한", "눈물이 나는", "마비된", "비통한", "슬픔", "실망한", "염세적인", "우울한", "환멸을 느끼는", "후회되는"),
            "상처", List.of("가난한", "불우한", "고립된", "괴로워하는", "배신당한", "버려진", "상처", "억울한", "질투하는", "충격 받은", "희생된")
    );

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeEmotion(
            @RequestBody Map<String, Object> request) {

        List<Map<String, String>> userEmotions = (List<Map<String, String>>) request.get("userEmotions");
        Map<String, Map<String, Object>> aiEmotions = (Map<String, Map<String, Object>>) request.get("emotionCounts");

        // 모든 결과의 일치도를 확인하고, 각각의 점수를 합산
        int totalScore = 0;
        List<Map<String, Object>> detailedScores = new ArrayList<>();

        for (Map<String, String> userEmotion : userEmotions) {
            String userMainEmotion = userEmotion.get("mainEmotion").replace("란", "");
            String userSubEmotion = userEmotion.get("subEmotion");

            for (String aiEmotion : aiEmotions.keySet()) {
                Map<String, Object> aiEmotionDetails = aiEmotions.get(aiEmotion);
                List<String> aiSubEmotions = (List<String>) aiEmotionDetails.get("subCategories"); // AI 서브 감정 리스트

                int score = calculateMatchScore(userMainEmotion, userSubEmotion, aiEmotion, aiSubEmotions);
                int count = ((Number) aiEmotionDetails.get("count")).intValue();

                int weightedScore = score * count;
                totalScore += weightedScore;

                // 점수 세부 내역 기록
                Map<String, Object> scoreDetail = new HashMap<>();
                scoreDetail.put("userEmotion", userMainEmotion);
                scoreDetail.put("aiEmotion", aiEmotion);
                scoreDetail.put("score", weightedScore);
                scoreDetail.put("count", count);
                detailedScores.add(scoreDetail);
            }
        }

        // 최종 일치도 점수 계산 (비교 횟수로 나눠 평균 점수 산출)
        int averageScore = totalScore / 6;

        Map<String, Object> result = new HashMap<>();
        result.put("totalScore", averageScore);
        result.put("detailedScores", detailedScores);
        result.put("feedback", generateFeedback(averageScore));

        return ResponseEntity.ok(result);
    }

    // 점수 계산 메소드 (메인 감정과 서브 감정을 모두 고려)
    private int calculateMatchScore(String userEmotion, String userSubEmotion, String aiEmotion, List<String> aiSubEmotions) {
        int score = 0;

        // 메인 감정 일치 점수
        if (userEmotion.equals(aiEmotion)) {
            score += 10;  // 정확히 일치 시 100점
        } else if (similarEmotions.getOrDefault(userEmotion, Collections.emptyList()).contains(aiEmotion)) {
            score += 5;   // 유사 감정 75점
        }

        // 서브 감정 일치 점수
        if (aiSubEmotions != null) {
            for (String aiSubEmotion : aiSubEmotions) {
                if (userSubEmotion.equals(aiSubEmotion)) {
                    score += 5; // 서브 감정이 정확히 일치하면 5점
                } else if (similarEmotions.getOrDefault(userEmotion, Collections.emptyList()).contains(aiSubEmotion)) {
                    score += 3; // 서브 감정이 유사하면 3점
                }
            }
        }
        return score;
    }

    // 피드백 생성 메소드
    private String generateFeedback(int averageScore) {
        if (averageScore > 50) {
            return String.format("선택하신 감정과 AI 분석이 높은 일치도를 보입니다. 감정 상태를 잘 표현하셨네요! 점수 : %d", averageScore);
        } else if (averageScore > 30) {
            return String.format("선택하신 감정과 AI 분석에 일부 일치가 있습니다. 미묘한 감정의 차이를 이해해 보세요. 점수 : %d", averageScore);
        } else {
            return String.format("선택하신 감정과 AI 분석이 다를 수 있습니다. 상황에 따라 감정이 다르게 느껴질 수 있습니다. 점수 : %d", averageScore);
        }
    }
}
