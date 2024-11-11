package org.ppocharong.emotiondiary2.repository;

import org.ppocharong.emotiondiary2.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    /** 이메일로 사용자 이름(username)을 찾는 쿼리 메서드 */
    @Query("SELECT u.username FROM User u WHERE u.email = :email")
    String findUsernameByEmail(@Param("email") String email);

    /** 이메일로 사용자 조회 */
    User findByEmail(String email);

    /** 아이디 중복 확인
     * @Param username
     * */
    boolean existsByUsername(String username);

    /** 아이디 중복 확인
     * @Param email
     * */
    boolean existsByEmail(String email);

    /** 유저 이름으로 조회 */
    Optional<User> findByUsername(String username);
}
