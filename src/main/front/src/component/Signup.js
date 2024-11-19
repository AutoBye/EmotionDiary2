import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css';

function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [gender, setGender] = useState('');
    const [ageGroup, setAgeGroup] = useState('');
    const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false); // 성별 드롭다운 상태
    const [isAgeDropdownOpen, setIsAgeDropdownOpen] = useState(false); // 나이 드롭다운 상태
    const [error, setError] = useState('');
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    const handleSubmit = (e) => {
        console.log(password);
        e.preventDefault();
        const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

        if (!passwordRegex.test(password)) {
            setError("비밀번호는 8자 이상이며, 특수문자를 포함해야 합니다.");
            console.log("비밀번호는 8자 이상이며, 특수문자를 포함해야 합니다.");
            return;
        }

        if (password !== confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.");
            console.log("비밀번호가 일치하지 않습니다.");
            return;
        }

        axios.post('/register', { username, email, password, gender, ageGroup })
            .then((response) => setIsSuccessModalOpen(true))
            .catch((error) => setError(error.response?.data?.error || "회원가입에 실패했습니다."));
    };

    const closeSuccessModal = () => {
        setIsSuccessModalOpen(false);
        window.location.href = "/login";
    };

    return (
        <div className="signup-container">
            {error && <p className="error-message">{error}</p>}
            <form className="signup-form" onSubmit={handleSubmit}>
                <img src="/images/signup.png" alt="회원가입" className="signup-title-image" />

                {/* 나이대 선택 드롭다운 */}
                <div className="age-group">
                    <div className="dropdown" onClick={() => setIsAgeDropdownOpen(!isAgeDropdownOpen)}>
                        <div className="dropdown-selected">
                            {ageGroup || "나이"}
                        </div>
                        {isAgeDropdownOpen && (
                            <div className="dropdown-menu">
                                {['10대', '20대', '30대', '40대', '50대'].map((group) => (
                                    <div
                                        key={group}
                                        className="dropdown-item"
                                        onClick={() => {
                                            setAgeGroup(group);
                                            setIsAgeDropdownOpen(false);
                                        }}
                                    >
                                        {group}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 성별 선택 드롭다운 */}
                <div className="gender-group">
                    <div className="dropdown" onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}>
                        <div className="dropdown-selected">
                            {gender || "성별"}
                        </div>
                        {isGenderDropdownOpen && (
                            <div className="dropdown-menu">
                                {['남', '여'].map((gen) => (
                                    <div
                                        key={gen}
                                        className="dropdown-item"
                                        onClick={() => {
                                            setGender(gen);
                                            setIsGenderDropdownOpen(false);
                                        }}
                                    >
                                        {gen}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <input
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="닉네임"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="비밀번호 확인"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {error && <p className="error-message">{error}</p>}
                <button type="submit">회원가입</button>
            </form>

            {isSuccessModalOpen && (
                <div className="success-modal">
                    <h3>회원가입이 완료되었습니다.</h3>
                    <p>로그인 페이지로 이동합니다</p>
                    <button onClick={closeSuccessModal}>확인</button>
                </div>
            )}
        </div>
    );
}

export default Signup;
