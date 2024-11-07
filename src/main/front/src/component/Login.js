import React, { useState } from 'react';
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // 스타일 임포트

function Login({onLogin: onLogin}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    console.log("Login 컴포넌트에서 받은 onLogin:", typeof onLogin); // 디버깅: onLogin의 타입 확인

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        axios.post('http://192.168.123.161:8080/login', { email, password }, { withCredentials: true })
            .then((response) => {
                if (response.data.username && response.data) {
                    onLogin(response.data.username);
                    navigate("/");
                } else {
                    setError("로그인 실패: 서버에서 username 을 찾을 수 없습니다.");
                }
            })
            .catch((error) => {
                setError(error.response?.data?.error || '로그인에 실패했습니다. 다시 시도해 주세요.');
            });
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>로그인</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="이메일"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">로그인</button>
                </form>
                {error && <p className="error-message">{error}</p>}

                <div className="signup-link">
                    <p>계정이 없으신가요?</p>
                    <Link to="/signup">
                        <button>회원가입</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;


