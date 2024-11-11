package org.ppocharong.emotiondiary2.service;

import org.ppocharong.emotiondiary2.model.Theme;
import org.ppocharong.emotiondiary2.repository.ThemeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ThemeService {

    ThemeRepository themeRepository;

    ThemeService (ThemeRepository themeRepository) {
        this.themeRepository = themeRepository;
    }

    /** 모든 스티커 조회 메서드 */
    public List<Theme> getAllThemes() {
        return themeRepository.findAll();
    }

}
