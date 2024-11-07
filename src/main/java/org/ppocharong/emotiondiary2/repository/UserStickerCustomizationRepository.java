package org.ppocharong.emotiondiary2.repository;

import org.ppocharong.emotiondiary2.model.UserStickerCustomization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserStickerCustomizationRepository extends JpaRepository<UserStickerCustomization, Long> {

}
