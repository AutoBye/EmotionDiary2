package org.ppocharong.emotiondiary2.service;

import jakarta.servlet.http.HttpSession;
import org.ppocharong.emotiondiary2.dto.DiaryDTO;
import org.ppocharong.emotiondiary2.dto.EmotionDTO;
import org.ppocharong.emotiondiary2.dto.StickerDTO;
import org.ppocharong.emotiondiary2.dto.UserStickerCustomizationDTO;
import org.ppocharong.emotiondiary2.model.*;
import org.ppocharong.emotiondiary2.repository.*;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DiaryService {

    private final DiaryRepository diaryRepository;
    private final UserRepository userRepository;
    private final StickerRepository stickerRepository;
    private final UserStickerCustomizationRepository stickerCustomizationRepository;
    private final DiaryLikeRepository diaryLikeRepository;
    private final MoodAnalysisRepository moodAnalysisRepository;

    public DiaryService(DiaryRepository diaryRepository, UserRepository userRepository,
                        StickerRepository stickerRepository, UserStickerCustomizationRepository stickerCustomizationRepository,
                        DiaryLikeRepository diaryLikeRepository, MoodAnalysisRepository moodAnalysisRepository) {
        this.diaryRepository = diaryRepository;
        this.userRepository = userRepository;
        this.stickerRepository = stickerRepository;
        this.stickerCustomizationRepository = stickerCustomizationRepository;
        this.diaryLikeRepository = diaryLikeRepository;
        this.moodAnalysisRepository = moodAnalysisRepository;
    }

    /** 세션에서 유저 네임 가져오기 */
    private String getSessionUsername(HttpSession session){
        return (String) session.getAttribute("user");
    }

    /** 분석 API 호출 속도 느려서 비동기 처리 */
    @Async
    public void callEmotionPredictionAPI(Long diaryId, String content, String gender, String age) {
        //문장 분할
        String[] sentences = content.split("(?<=\\.)|(?<=\\?)|(?<=!)");

        RestTemplate restTemplate = new RestTemplate();

        //모델에 사용할 변수명 맞추기
        gender = gender.equals("남") ? "남성" : "여성";
        age = convertAgeToCategory(age);

        //api 주소
        String apiUrl = "http://localhost:5000/predict";

        //헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");

        //일기 확인
        Diary diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new RuntimeException("해당 ID의 다이어리를 찾을 수 없습니다."));

        for (String sentence : sentences) {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("text", sentence.trim());
            requestBody.put("age", age);
            requestBody.put("gender", gender);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            try {
                ResponseEntity<Map> response = restTemplate.exchange(apiUrl, HttpMethod.POST, request, Map.class);
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
                e.printStackTrace();
            }
        }
    }

    /** API서버에 맞게 변경 */
    private String convertAgeToCategory(String age) {
        switch (age) {
            case "10대":
                return "청소년";
            case "20대":
            case "30대":
                return "청년";
            case "40대":
            case "50대":
                return "중년";
            default:
                return "노년";
        }
    }

    /** 일기 쓰기 서비스 계층 */
    @Transactional
    public ResponseEntity<String> createDiary(DiaryDTO diaryDTO, HttpSession session) {
        String username = getSessionUsername(session);

        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        } else {

            User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));// 다이어리 엔티티 생성

            Diary diary = new Diary();

            diary.setUser(user);
            diary.setTitle(diaryDTO.getTitle());
            diary.setContent(diaryDTO.getContent());
            diary.setMoodScore(diaryDTO.getMoodScore());
            diary.setVisibility(diaryDTO.getVisibility());
            diary.setCreatedAt(Instant.from(LocalDateTime.now()));
            diary.setUpdatedAt(Instant.from(LocalDateTime.now()));
            diary.setLikeCount(0);
            //TODO - 테마 설정 저장하자.
            diary.setTheme(null);
            // 일기 기본정보 저장중


            // EmotionDTO 리스트를 통해 감정 추가
            List<EmotionDTO> emotions = diaryDTO.getEmotions();
            if (emotions != null) {
                for (EmotionDTO emotionDTO : emotions) {
                    Emotion emotion = new Emotion();
                    emotion.setDiary(diary);
                    emotion.setMainEmotion(emotionDTO.getMainEmotion());
                    emotion.setSubEmotion(emotionDTO.getSubEmotion());
                    emotion.setCreatedAt(Instant.now());
                    diary.addEmotion(emotion); // 감정을 다이어리에 추가
                }
            }

            diaryRepository.save(diary);

            // Sticker 커스터마이징 추가
            List<UserStickerCustomizationDTO> stickers = diaryDTO.getStickers();
            if (stickers != null) {
                for (UserStickerCustomizationDTO stickerData : stickers) {
                    Long stickerId = stickerData.getSticker().getId();
                    Sticker sticker = stickerRepository.findById(stickerId)
                            .orElseThrow(() -> new RuntimeException("스티커를 찾을 수 없습니다."));

                    UserStickerCustomization customization = new UserStickerCustomization();
                    customization.setDiary(diary);
                    customization.setSticker(sticker);
                    customization.setPositionX(stickerData.getPositionX());
                    customization.setPositionY(stickerData.getPositionY());
                    customization.setScale(stickerData.getScale());
                    customization.setRotation(stickerData.getRotation());
                    customization.setCreatedAt(Instant.now());

                    stickerCustomizationRepository.save(customization); // 스티커 커스터마이징 정보 저장
                }
            }

            // 비동기 메서드 호출
            callEmotionPredictionAPI(diary.getId(), diary.getContent(), user.getGender(), user.getAgeGroup());
        }
        return ResponseEntity.ok("일기가 성공적으로 저장되었습니다.");
    }


    /** 내 일기 보기 서비스 계층*/
    @Transactional(readOnly = true)
    public ResponseEntity<List<DiaryDTO>> getDiaries(HttpSession session) {

        String username = getSessionUsername(session);

        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        List<Diary> diaries = diaryRepository.findByUser(user);

        // DTO로 변환하여 반환
        List<DiaryDTO> diaryDTOList = diaries.stream()
                .map(diary -> {
                    DiaryDTO dto = new DiaryDTO();
                    dto.setId(diary.getId());
                    dto.setAuthor(diary.getUser().getUsername());
                    dto.setTitle(diary.getTitle());
                    dto.setContent(diary.getContent());
                    dto.setVisibility(diary.getVisibility());
                    dto.setCreatedAt(diary.getCreatedAt());
                    dto.setLikeCount(diary.getLikeCount());
                    dto.setEmotions(diary.getEmotions().stream()
                            .map(emotion -> new EmotionDTO(
                                    emotion.getId(),
                                    null,
                                    emotion.getMainEmotion(),
                                    emotion.getSubEmotion(),
                                    emotion.getCreatedAt()
                            ))
                            .toList());
                    return dto;
                })
                .toList();

        return ResponseEntity.ok(diaryDTOList);
    }

    /** 공개 일기 보기 서비스 계층 */
    @Transactional(readOnly = true)
    public ResponseEntity<List<DiaryDTO>> getPublicDiaries() {

        // 모든 공개 일기 조회
        List<Diary> diaries = diaryRepository.findAllVisibleDiaries();

        // DiaryDTO로 변환하여 반환
        List<DiaryDTO> diaryDTOList = diaries.stream()
                .map(diary -> {
                    DiaryDTO dto = new DiaryDTO();
                    dto.setId(diary.getId());
                    dto.setTitle(diary.getTitle());
                    dto.setContent(diary.getContent());
                    dto.setVisibility(diary.getVisibility());
                    dto.setCreatedAt(diary.getCreatedAt());
                    dto.setAuthor(diary.getUser().getUsername());
                    dto.setLikeCount(diary.getLikeCount());
                    dto.setEmotions(diary.getEmotions().stream()
                            .map(emotion -> new EmotionDTO(
                                    emotion.getId(),
                                    diary.getId(), // Diary 객체 대신 ID만 전달
                                    emotion.getMainEmotion(),
                                    emotion.getSubEmotion(),
                                    emotion.getCreatedAt()
                            ))
                            .toList());
                    return dto;
                })
                .toList();

        return ResponseEntity.ok(diaryDTOList);
    }


    /** 일기 보기 서비스 계층*/
    @Transactional(readOnly = true)
    public ResponseEntity<DiaryDTO> getDiaryById(Long id, HttpSession session) {

        String username = getSessionUsername(session);

        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        // 사용자 조회 실패 시 예외 처리
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        // 일기 조회 실패 시 예외 처리
        Diary diary = diaryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "해당 일기를 찾을 수 없습니다."));


        if (Boolean.TRUE.equals(!diary.getVisibility()) || !diary.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        // 스티커 정보 변환
        List<UserStickerCustomizationDTO> stickers = diary.getUserStickerCustomizations().stream()
                .map(stickerCustomization -> new UserStickerCustomizationDTO(
                        stickerCustomization.getId(),
                        stickerCustomization.getDiary(),
                        new StickerDTO(
                                stickerCustomization.getSticker().getId(),
                                stickerCustomization.getSticker().getStickerName(),
                                stickerCustomization.getSticker().getImageUrl(),
                                stickerCustomization.getSticker().getDescription(),
                                stickerCustomization.getSticker().getCreatedAt()),
                        stickerCustomization.getPositionX(),
                        stickerCustomization.getPositionY(),
                        stickerCustomization.getScale(),
                        stickerCustomization.getRotation(),
                        stickerCustomization.getCreatedAt()
                )).collect(Collectors.toList());


        // 감정 분석 데이터 조회 및 변환
        List<MoodAnalysis> moodAnalyses = moodAnalysisRepository.findByDiaryId(diary.getId());

        // TODO - 코드 너무 복잡함. 나중에 수정해서 간단하게 바꾸자.
        Map<String, Map<String, Object>> emotionCountMap = moodAnalyses.stream()
                .collect(Collectors.groupingBy(
                        MoodAnalysis::getMoodCategory,
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                moodList -> {
                                    List<String> subCategories = moodList.stream()
                                            .map(MoodAnalysis::getMoodSubcategory)
                                            .collect(Collectors.toList());

                                    Map<String, Object> result = new HashMap<>();
                                    result.put("count", (long) moodList.size());
                                    result.put("subCategories", subCategories);
                                    return result;
                                }
                        )
                ));

        // 감정 정보 변환
        List<EmotionDTO> emotions = diary.getEmotions().stream()
                .map(emotion -> new EmotionDTO(
                        emotion.getId(),
                        diary.getId(), // Diary 객체 대신 ID만 전달
                        emotion.getMainEmotion(),
                        emotion.getSubEmotion(),
                        emotion.getCreatedAt()
                )).collect(Collectors.toList());

        DiaryDTO diaryDetails = new DiaryDTO(
                diary.getId(),
                diary.getUser(),
                diary.getTitle(),
                diary.getContent(),
                diary.getMoodScore(),
                diary.getVisibility(),
                diary.getCreatedAt(),
                diary.getLikeCount(),
                diary.getTheme(),
                emotions,
                stickers,
                emotionCountMap,
                diary.getUser().getUsername()
        );

        return ResponseEntity.ok(diaryDetails);
    }

    /** 일기 삭제 서비스 */
    @Transactional
    public ResponseEntity<String> deleteDiaryById(Long id, HttpSession session) {
        String username = getSessionUsername(session);

        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Diary diary = diaryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 일기를 찾을 수 없습니다."));

        if (!diary.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("해당 일기를 삭제할 권한이 없습니다.");
        }

        diaryRepository.delete(diary);
        return ResponseEntity.ok("일기가 성공적으로 삭제되었습니다.");
    }

    /** 공감하기 서비스 */
    @Transactional
    public ResponseEntity<String> likeDiary(Long id, HttpSession session) {

        String username = getSessionUsername(session);

        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Diary diary = diaryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 일기를 찾을 수 없습니다."));

        if (diary.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("자신의 일기에는 공감을 할 수 없습니다.");
        }

        if (diaryLikeRepository.existsByUserAndDiary(user, diary)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("이미 공감한 일기입니다.");
        }

        diary.setLikeCount(diary.getLikeCount() + 1);
        diaryRepository.save(diary);

        // DiaryLike 엔티티에 공감 기록 추가
        DiaryLike diaryLike = new DiaryLike();

        diaryLike.setUserId(user.getId());
        diaryLike.setDiary(diary);
        diaryLike.setLikedAt(OffsetDateTime.now());
        diaryLikeRepository.save(diaryLike);

        return ResponseEntity.ok(String.valueOf(diary.getLikeCount()));
    }

}
