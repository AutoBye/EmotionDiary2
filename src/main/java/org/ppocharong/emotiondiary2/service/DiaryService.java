package org.ppocharong.emotiondiary2.service;

import jakarta.servlet.http.HttpSession;
import org.ppocharong.emotiondiary2.dto.DiaryDTO;
import org.ppocharong.emotiondiary2.dto.EmotionDTO;
import org.ppocharong.emotiondiary2.dto.StickerDTO;
import org.ppocharong.emotiondiary2.dto.UserStickerCustomizationDTO;
import org.ppocharong.emotiondiary2.model.*;
import org.ppocharong.emotiondiary2.repository.*;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class DiaryService {

    private static final String DIARY_NOT_FOUND_MESSAGE = "해당 일기를 찾을 수 없습니다.";
    private static final String USER_NOT_FOUND_MESSAGE = "사용자를 찾을 수 없습니다.";
    private static final String LOGIN_REQUIRED_MESSAGE = "로그인이 필요합니다.";
    private static final String DELETE_PERMISSION_DENIED_MESSAGE = "해당 일기를 삭제할 권한이 없습니다.";
    private static final String SELF_LIKE_FORBIDDEN_MESSAGE = "자신의 일기에는 공감을 할 수 없습니다.";
    private static final String ALREADY_LIKED_MESSAGE = "이미 공감한 일기입니다.";
    private static final String DIARY_SAVED_SUCCESS_MESSAGE = "일기가 성공적으로 저장되었습니다.";
    private static final String DIARY_DELETED_SUCCESS_MESSAGE = "일기가 성공적으로 삭제되었습니다.";


    private final DiaryRepository diaryRepository;
    private final UserRepository userRepository;
    private final StickerRepository stickerRepository;
    private final UserStickerCustomizationRepository stickerCustomizationRepository;
    private final DiaryLikeRepository diaryLikeRepository;
    private final MoodAnalysisRepository moodAnalysisRepository;
    private final ThemeRepository themeRepository;

    private final EmotionPredictionService emotionPredictionService;

    public DiaryService(DiaryRepository diaryRepository, UserRepository userRepository,
                        StickerRepository stickerRepository, UserStickerCustomizationRepository stickerCustomizationRepository,
                        DiaryLikeRepository diaryLikeRepository, MoodAnalysisRepository moodAnalysisRepository, ThemeRepository themeRepository,
                        EmotionPredictionService emotionPredictionService) {
        this.diaryRepository = diaryRepository;
        this.userRepository = userRepository;
        this.stickerRepository = stickerRepository;
        this.stickerCustomizationRepository = stickerCustomizationRepository;
        this.diaryLikeRepository = diaryLikeRepository;
        this.moodAnalysisRepository = moodAnalysisRepository;
        this.themeRepository = themeRepository;
        this.emotionPredictionService = emotionPredictionService;
    }

    /** 세션에서 유저 네임 가져오기 */
    private String getSessionUsername(HttpSession session){
        return (String) session.getAttribute("user");
    }

    /** 비동기 분석 메서드 호출 */
    public void predictEmotion(Diary diary, User user) {
        emotionPredictionService.callEmotionPredictionAPI(diary.getId(), diary.getContent(), user.getGender(), user.getAgeGroup());
    }



    /** 일기 쓰기 서비스 계층 */
    @Transactional
    public ResponseEntity<String> createDiary(DiaryDTO diaryDTO, HttpSession session) {
        String username = getSessionUsername(session);

        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(LOGIN_REQUIRED_MESSAGE);
        } else {

            User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException(USER_NOT_FOUND_MESSAGE));

            Diary diary = new Diary();

            diary.setUser(user);
            diary.setTitle(diaryDTO.getTitle());
            diary.setContent(diaryDTO.getContent());
            diary.setMoodScore(diaryDTO.getMoodScore());
            diary.setVisibility(diaryDTO.getVisibility());
            diary.setCreatedAt(Instant.now());
            diary.setUpdatedAt(Instant.now());
            diary.setLikeCount(0);

            Theme theme = diaryDTO.getTheme();
            if (theme == null) {
                theme = themeRepository.findByThemeName("default") // 또는 기본 테마를 조회해 설정
                        .orElseThrow(() -> new RuntimeException("기본 테마를 찾을 수 없습니다."));
            }
            diary.setTheme(theme);

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
                            .orElseThrow(() -> {
                                // 스티커 ID 로그 추가
                                System.err.println("스티커 ID: " + stickerId + "를 찾을 수 없습니다.");
                                return new RuntimeException("스티커를 찾을 수 없습니다. ID: " + stickerId);
                            });

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
            predictEmotion(diary, user);
        }
        return ResponseEntity.ok(DIARY_SAVED_SUCCESS_MESSAGE);
    }


    /** 내 일기 보기 서비스 계층*/
    @Transactional(readOnly = true)
    public ResponseEntity<List<DiaryDTO>> getDiaries(HttpSession session) {

        String username = getSessionUsername(session);

        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException(USER_NOT_FOUND_MESSAGE));

        List<Diary> diaries = diaryRepository.findByUser(user);

        // DTO 로 변환하여 반환
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

        // DiaryDTO 로 변환하여 반환
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


    /** 일기 보기 서비스 계층 */
    @Transactional(readOnly = true)
    public ResponseEntity<DiaryDTO> getDiaryById(Long id, HttpSession session) {

        String username = getSessionUsername(session);

        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        //사용자 조회 실패 시 예외 처리
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, USER_NOT_FOUND_MESSAGE));

        // 사용자 조회 시 사용자 정보가 없으면 null 로 설정할까?

        // 일기 조회 실패 시 예외 처리
        Diary diary = diaryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, DIARY_NOT_FOUND_MESSAGE));

        // 일기가 비공개이며 작성자가 현재 사용자가 아닐 경우 접근 금지  && !diary.getUser().getId().equals(Objects.requireNonNull(user).getId())
        if (Boolean.FALSE.equals(diary.getVisibility()) && !diary.getUser().getId().equals(Objects.requireNonNull(user).getId()) ) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        // 스티커 정보 변환
        List<UserStickerCustomizationDTO> stickers = convertStickerCustomizationsToDTO(diary);

        // 감정 분석 데이터 조회 및 변환
        Map<String, Map<String, Object>> emotionCountMap = groupMoodAnalysis(moodAnalysisRepository.findByDiaryId(diary.getId()));

        // 감정 정보 변환
        List<EmotionDTO> emotions = convertEmotionsToDTO(diary);

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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(LOGIN_REQUIRED_MESSAGE);
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException(USER_NOT_FOUND_MESSAGE));

        Diary diary = diaryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(DIARY_NOT_FOUND_MESSAGE));

        if (!diary.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(DELETE_PERMISSION_DENIED_MESSAGE);
        }

        diaryRepository.delete(diary);
        return ResponseEntity.ok(DIARY_DELETED_SUCCESS_MESSAGE);
    }

    /** 공감하기 서비스 */
    @Transactional
    public ResponseEntity<String> likeDiary(Long id, HttpSession session) {

        String username = getSessionUsername(session);

        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(LOGIN_REQUIRED_MESSAGE);
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException(USER_NOT_FOUND_MESSAGE));

        Diary diary = diaryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(DIARY_NOT_FOUND_MESSAGE));

        if (diary.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(SELF_LIKE_FORBIDDEN_MESSAGE);
        }

        if (diaryLikeRepository.existsByUserIdAndDiary(user.getId(), diary)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ALREADY_LIKED_MESSAGE);
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


    private List<UserStickerCustomizationDTO> convertStickerCustomizationsToDTO(Diary diary) {
        return diary.getUserStickerCustomizations().stream()
                .map(stickerCustomization -> new UserStickerCustomizationDTO(
                        stickerCustomization.getId(),
                        stickerCustomization.getDiary(),
                        new StickerDTO(
                                stickerCustomization.getSticker().getStickerId(),
                                stickerCustomization.getSticker().getStickerName(),
                                stickerCustomization.getSticker().getImageUrl(),
                                stickerCustomization.getSticker().getDescription(),
                                stickerCustomization.getSticker().getCreatedAt()
                        ),
                        stickerCustomization.getPositionX(),
                        stickerCustomization.getPositionY(),
                        stickerCustomization.getScale(),
                        stickerCustomization.getRotation(),
                        stickerCustomization.getCreatedAt()
                )).toList();
    }

    private Map<String, Map<String, Object>> groupMoodAnalysis(List<MoodAnalysis> moodAnalyses) {
        return moodAnalyses.stream()
                .collect(Collectors.groupingBy(
                        MoodAnalysis::getMoodCategory,
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                moodList -> {
                                    List<String> subCategories = moodList.stream()
                                            .map(MoodAnalysis::getMoodSubcategory)
                                            .toList(); // Collectors.toList() 대신 toList() 사용

                                    Map<String, Object> result = new HashMap<>();
                                    result.put("count", (long) moodList.size());
                                    result.put("subCategories", subCategories);
                                    return result;
                                }
                        )
                ));
    }

    private List<EmotionDTO> convertEmotionsToDTO(Diary diary) {
        return diary.getEmotions().stream()
                .map(emotion -> new EmotionDTO(
                        emotion.getId(),
                        diary.getId(),
                        emotion.getMainEmotion(),
                        emotion.getSubEmotion(),
                        emotion.getCreatedAt()
                )).toList();
    }

}
