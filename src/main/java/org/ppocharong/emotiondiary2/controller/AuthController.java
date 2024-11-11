package org.ppocharong.emotiondiary2.controller;

import jakarta.servlet.http.HttpSession;
import org.ppocharong.emotiondiary2.dto.UserDTO;
import org.ppocharong.emotiondiary2.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

     /** 로그인
      * @Param username, password
      * */
    @PostMapping(value = "/login")
    public ResponseEntity<Map<String, String>> getLogin(@RequestBody UserDTO userDTO, HttpSession session) {
        return userService.login(userDTO, session);
    }

    /** 회원가입
     * @Param username, email, password, gender, ageGroup
     * */
    @PostMapping(value = "/register")
    public ResponseEntity<Map<String, String>> getRegister(@RequestBody UserDTO userDTO) {
        return userService.register(userDTO);
    }

    /** 로그아웃 */
    @GetMapping("/logout")
    public String getLogout(HttpSession session) {
        return userService.logout(session);
    }

}
