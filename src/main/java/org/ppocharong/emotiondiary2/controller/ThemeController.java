package org.ppocharong.emotiondiary2.controller;

import org.ppocharong.emotiondiary2.model.Theme;
import org.ppocharong.emotiondiary2.service.ThemeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/themes")
public class ThemeController {

    private final ThemeService themeService;

    ThemeController(ThemeService themeService) {
        this.themeService = themeService;
    }

    /** 테마 로딩 */
    @GetMapping
    public List<Theme> getAllStickers() {
        return themeService.getAllThemes();
    }

}
