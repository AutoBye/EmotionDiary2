package org.ppocharong.emotiondiary2.repository;

import org.ppocharong.emotiondiary2.model.Diary;
import org.ppocharong.emotiondiary2.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DiaryRepository extends JpaRepository<Diary, Long> {

    @Query("SELECT DISTINCT d FROM Diary d WHERE d.user = :user")
    List<Diary> findByUser(@Param("user") User user);

    /** 공개 일기 가져오기 */
    @Query("SELECT DISTINCT d FROM Diary d WHERE d.visibility = true")
    List<Diary> findAllVisibleDiaries();
}
