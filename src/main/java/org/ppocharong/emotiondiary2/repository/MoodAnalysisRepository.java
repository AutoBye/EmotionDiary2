package org.ppocharong.emotiondiary2.repository;

import org.ppocharong.emotiondiary2.model.MoodAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MoodAnalysisRepository extends JpaRepository<MoodAnalysis, Long> {
    List<MoodAnalysis> findByDiaryId(Long diaryId);
}
