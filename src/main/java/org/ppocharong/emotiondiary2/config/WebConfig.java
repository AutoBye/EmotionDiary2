package org.ppocharong.emotiondiary2.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // CORS 설정
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")  // 모든 경로에 대해 CORS 적용
                .allowedOrigins("http://192.168.123.161:3000")  // 허용할 프론트엔드 도메인
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTION")  // 허용할 HTTP 메서드
                .allowCredentials(true);  // 쿠키 허용 설정
    }

    // 정적 리소스 핸들링 설정
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/stickers/**")
                .addResourceLocations("file:///C:/Users/kiusw/Desktop/JAVA/KIU_TEAM_WEB/EmotionDiary2/uploads/stickes/");
    }
}
