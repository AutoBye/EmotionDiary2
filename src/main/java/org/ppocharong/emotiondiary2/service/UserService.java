package org.ppocharong.emotiondiary2.service;

import jakarta.servlet.http.HttpSession;
import org.ppocharong.emotiondiary2.dto.UserDTO;
import org.ppocharong.emotiondiary2.exception.PasswordHashingException;
import org.ppocharong.emotiondiary2.model.User;
import org.ppocharong.emotiondiary2.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Collections;
import java.util.Map;

@Service
public class UserService {

    private static final String SUCCESS_KEY = "message";
    private static final String ERROR_KEY = "error";  // 에러


    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** 비밀번호 검증 메서드 */
    public boolean validatePassword(String email, String password) {
        User user = userRepository.findByEmail(email);

        if (user == null) {
            return false;
        }

        try {
            String hashedPassword = hashPassword(password);
            return user.getPassword().equals(hashedPassword);
        } catch (PasswordHashingException e) {
            return false;
        }
    }

    /** SHA-256 해시 메서드 */
    private String hashPassword(String password) throws PasswordHashingException {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hashedBytes = md.digest(password.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hashedBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new PasswordHashingException("SHA-256 암호화 실패", e);
        }
    }

    /** 로그인 처리 메서드 */
    public ResponseEntity<Map<String, String>> login(UserDTO userDTO, HttpSession session) {
        String email = userDTO.getEmail();
        String password = userDTO.getPassword();

        //유저 이름 반환 준비
        String username = userRepository.findUsernameByEmail(email);

        //비밀번호 검증
        boolean isValidPassword = validatePassword(email, password);

        if (username != null && isValidPassword) {
            session.setAttribute("user", username);
            return ResponseEntity.ok(Collections.singletonMap("username", username));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap(ERROR_KEY, "로그인 실패: 이메일 또는 비밀번호가 잘못되었습니다."));
        }
    }


    /** 회원가입 처리 메서드 */
    public ResponseEntity<Map<String, String>> register(UserDTO userDTO) {
        String username = userDTO.getUsername();
        String password = userDTO.getPassword();
        String email = userDTO.getEmail();
        String gender = userDTO.getGender();
        String ageGroup = userDTO.getAgeGroup();

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Collections.singletonMap(ERROR_KEY, "이미 존재하는 사용자 이름입니다."));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Collections.singletonMap(ERROR_KEY, "이미 존재하는 이메일입니다."));
        }

        try {

            String hashedPassword = hashPassword(password);

            User user = new User();

            user.setUsername(username);
            user.setPassword(hashedPassword);
            user.setEmail(email);
            user.setGender(gender);
            user.setAgeGroup(ageGroup);
            user.setLanguage("kr");

            userRepository.save(user);

            return ResponseEntity.ok(Collections.singletonMap(SUCCESS_KEY, "회원가입 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap(ERROR_KEY, "회원가입에 실패했습니다."));
        } catch (PasswordHashingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap(ERROR_KEY, "회원가입에 실패했습니다: 암호화 오류"));
        }
    }

    /** 로그아웃 처리 메서드 */
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }




}
