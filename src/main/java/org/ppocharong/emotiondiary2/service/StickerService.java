package org.ppocharong.emotiondiary2.service;

import org.ppocharong.emotiondiary2.model.Sticker;
import org.ppocharong.emotiondiary2.repository.StickerRepository;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class StickerService {

    private final StickerRepository stickerRepository;

    public StickerService(StickerRepository stickerRepository) {
        this.stickerRepository = stickerRepository;
    }

    /** 스티커 업로드 API 호출만 하면 작동해 */
    public void insertStickersFromFolder() {
        // 파일 경로 설정 (이미지 파일이 있는 폴더)
        String folderPath = "C:/Users/kiusw/Desktop/JAVA/KIU_TEAM_WEB/EmotionDiary2/uploads/stickers/";
        File folder = new File(folderPath);

        if (folder.exists() && folder.isDirectory()) {
            // 폴더 내 모든 파일 검색
            for (File file : Objects.requireNonNull(folder.listFiles())) {
                // PNG 파일만 처리
                if (file.isFile() && file.getName().toLowerCase().endsWith(".png")) {
                    // 파일 이름과 경로 설정
                    String fileName = file.getName();
                    String stickerName = fileName.substring(0, fileName.lastIndexOf('.')); // 확장자 제외한 이름

                    // 스티커 이름으로 이미 존재하는지 확인
                    Optional<Sticker> existingSticker = stickerRepository.findByStickerName(stickerName);
                    if (existingSticker.isPresent()) {
                        System.out.println("이미 존재하는 스티커입니다: " + stickerName);
                        continue; // 이미 존재하는 경우 다음 파일로 넘어감
                    }

                    String imageUrl = "/uploads/stickers/" + fileName;  // 클라이언트가 접근할 수 있는 URL 경로

                    // 스티커 엔티티 생성
                    Sticker sticker = new Sticker();
                    sticker.setStickerName(stickerName);
                    sticker.setImageUrl(imageUrl);
                    sticker.setDescription("자동 삽입된 스티커: " + stickerName);

                    // 데이터베이스에 저장
                    stickerRepository.save(sticker);
                    System.out.println("새로운 스티커가 추가되었습니다: " + stickerName);
                }
            }
        } else {
            System.out.println("폴더를 찾을 수 없습니다: " + folderPath);
        }
    }

    /** 모든 스티커 조회 메서드 */
    public List<Sticker> getAllStickers() {
        return stickerRepository.findAll();
    }
}
