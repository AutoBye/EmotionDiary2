package org.ppocharong.emotiondiary2.repository;

import org.ppocharong.emotiondiary2.model.Sticker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StickerRepository extends JpaRepository<Sticker, Long> {
    Optional<Sticker> findByStickerName(String stickerName); // 스티커 이름으로 조회하는 메서드 추가


}
