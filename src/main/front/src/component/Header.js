// Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ isLoggedIn, username, onLogout }) {
    return (
        <header className="header">
            <nav className="nav">
                {/* 홈 링크를 이미지로 변경하여 왼쪽에 고정 */}
                <div className="nav-left">
                    <Link to="/" className="link home-link">
                        <img src="/images/headerlogo.png" alt="홈" className="home-logo" style={{ width: '100px', height: 'auto' }} />
                    </Link>
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
                            <button onClick={onLogout} className="logout-butㅁton">로그아웃</button>
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
