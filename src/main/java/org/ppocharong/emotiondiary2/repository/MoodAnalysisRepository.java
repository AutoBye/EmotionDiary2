package org.ppocharong.emotiondiary2.repository;

import org.ppocharong.emotiondiary2.model.MoodAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MoodAnalysisRepository extends JpaRepository<MoodAnalysis, Long> {
    // 다이어리 ID를 통해 단일 검색 (Spring Data JPA 자동 처리)
    List<MoodAnalysis> findByDiary_Id(Long diaryId);

    // 여러 다이어리 ID를 기반으로 검색
    @Query("SELECT m FROM MoodAnalysis m WHERE m.diary.id IN :diaryIds")
    List<MoodAnalysis> findAllByDiaryIds(@Param("diaryIds") List<Long> diaryIds);
}
