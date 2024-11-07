package org.ppocharong.emotiondiary2.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;

@RestController
public class SessionController {

    @CrossOrigin(origins = "http://192.168.123.161:3000", allowCredentials = "true")
    @GetMapping("/check-session")
    public ResponseEntity<?> checkSession(HttpSession session) {
        String username = (String) session.getAttribute("user");

        if (username != null) {
            // 세션이 유효할 경우 사용자 이름을 반환
            return ResponseEntity.ok(Collections.singletonMap("username", username));
        } else {
            // 세션이 없으면 인증 오류 반환
            return ResponseEntity.ok(Collections.singletonMap("username", null));
        }
    }
}
