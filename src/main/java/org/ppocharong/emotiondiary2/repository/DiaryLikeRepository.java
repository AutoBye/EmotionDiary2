package org.ppocharong.emotiondiary2.repository;

import org.ppocharong.emotiondiary2.model.Diary;
import org.ppocharong.emotiondiary2.model.DiaryLike;
import org.ppocharong.emotiondiary2.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiaryLikeRepository extends JpaRepository<DiaryLike, Long> {
    boolean existsByUserAndDiary(User user, Diary diary);
}