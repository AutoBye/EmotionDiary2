package org.ppocharong.emotiondiary2.repository;


import org.ppocharong.emotiondiary2.model.Theme;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ThemeRepository extends JpaRepository<Theme, Long> {
    Optional<Theme> findByThemeName(String themeName);
}
