// Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ isLoggedIn, username, onLogout }) {
    return (
        <header className="header">
            <nav className="nav">
                {/* 홈 링크를 별도의 div로 감싸 왼쪽에 고정 */}
                <div className="nav-left">
                    <Link to="/" className="link home-link">홈(사진)</Link>
                </div>

                {/* 나머지 링크들을 중앙 정렬 */}
                <div className="nav-center">
                    <Link to="/write" className="link">일기 쓰기</Link>
                    <Link to="/my-diary" className="link">나의 일기</Link>
                    <Link to="/public-diary" className="link">공개된 일기</Link>
                </div>

                {/* 로그인 상태에 따라 오른쪽에 유저 정보 또는 로그인 링크 표시 */}
                <div className="nav-right">
                    {isLoggedIn ? (
                        <div className="user-info">
                            <span className="username">{username}</span>
                            <button onClick={onLogout} className="logout-button">로그아웃</button>
                        </div>
                    ) : (
                        <Link to="/login" className="link small-link">로그인</Link>
                    )}
                </div>
            </nav>
            <div className="divider"></div> {/* 헤더 아래의 긴 줄 */}
        </header>
    );
}

export default Header;
