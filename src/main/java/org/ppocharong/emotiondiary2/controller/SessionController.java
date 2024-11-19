package org.ppocharong.emotiondiary2.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

@RestController
public class SessionController {

    @CrossOrigin(origins = "http://192.168.123.161:3000", allowCredentials = "true")
    @GetMapping("/check-session")
    public ResponseEntity<Map<String, String>> checkSession(HttpSession session) {
        String username = (String) session.getAttribute("user");
        System.out.println(username);
        if (username != null) {
            return ResponseEntity.ok(Collections.singletonMap("username", username));
        } else {
            return ResponseEntity.ok(Collections.singletonMap("username", null));
        }
    }
}
