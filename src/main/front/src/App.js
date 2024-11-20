import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from "./component/Home";
import Signup from './component/Signup';
import Login from './component/Login';
import Write from './component/Write';
import Header from './component/Header';
import MyDiary from './component/MyDiary';
import DiaryDetail  from "./component/DiaryDetail";
import PublicDiary from "./component/PublicDiary";
import axios from "axios";

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // 로딩 상태 추가

    // 페이지 로드 시 서버 세션을 확인하고 사용자 정보를 설정
    //https://3453-203-230-86-251.ngrok-free.app
    //https://3453-203-230-86-251.ngrok-free.app
    useEffect(() => {
        axios.get('/check-session', {
            withCredentials: true,
        })
            .then((response) => {
                if (response.data && response.data.username) {
                    setUser(response.data.username);
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    console.log('사용자가 로그인되어 있지 않습니다.');
                } else {
                    console.error('세션 확인 중 오류 발생:', error);
                }
            })
            .finally(() => {
                setLoading(false); // 로딩이 끝났음을 표시
            });
    }, []);

    const handleLogin = (username) => {
        setUser(username); // 사용자 로그인 시 상태 업데이트
    };

    const handleLogout = () => {
        // 로그아웃 요청
        axios.get('/logout', { withCredentials: true })
            .then(() => {
                setUser(null);
                console.log('로그아웃 성공');
            })
            .catch((error) => {
                console.error('로그아웃 중 오류 발생:', error);
            });
    };

    // 로딩 중일 때 로딩 메시지를 표시
    if (loading) {
        return <div>로딩 중...</div>;
    }

    return (
        <Router>
            {/* Header에 로그인 여부와 사용자 이름 전달 */}
            <Header isLoggedIn={!!user} username={user} onLogout={handleLogout} />

            {/* 각 페이지의 라우트 설정 */}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/write" element={<Write />} />
                <Route path="/my-diary" element={<MyDiary />} />
                <Route path="/diaries/:id" element={<DiaryDetail username={user}/>} />
                <Route path="/public-diary" element={<PublicDiary />} />
            </Routes>
        </Router>
    );
}

export default App;
