package org.ppocharong.emotiondiary2.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String password;
    private String gender;
    private String ageGroup;
    private Instant createdAt;
    private Boolean notification;
    private String language;
    private String theme;
    private Instant lastUpdated;
}
