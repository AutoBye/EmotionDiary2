// 작성자 - 김형섭 2024-11-04
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../component/Style.css';
import { useNavigate } from 'react-router-dom';

function MyDiary() {
    const [diaries, setDiaries] = useState([]); // 서버로부터 가져온 일기 데이터 저장
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://192.168.123.161:8080/diaries/public-list', { withCredentials: true })
            .then((response) => {
                if (Array.isArray(response.data)) {
                    setDiaries(response.data);
                    console.log("다이어리 데이터:", response.data);
                } else {
                    console.error('응답 데이터가 배열 형식이 아닙니다:', response.data);
                    console.log("응답 데이터 형식:", typeof response.data);
                    setDiaries([]);
                }
            })
            .catch((error) => {
                console.error('일기 데이터를 불러오는 데 실패했습니다:', error);
                setError("일기 데이터를 불러오는 데 실패했습니다.");
            });
    }, []);


    // 상세 페이지로 이동 핸들러 함수
    const handleViewDetail = (diaryId) => {
        navigate(`/diaries/${diaryId}`);
    }

    return (
        <div className="my-diary-container">
            <h2>공개된 일기</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="diary-list">
                {diaries.length > 0 ? (
                    diaries.map((diary) => (
                        <div key={diary.id} className="diary-item"
                             style={{
                                 marginBottom: '30px',
                                 border: '1px solid #ddd',
                                 padding: '20px',
                                 position: 'relative'
                             }}>
                            <h3>{diary.title || '제목 없음'}</h3>
                            <p className="diary-content">{diary.content}</p>
                            <p>공개 여부: {diary.visibility ? '공개' : '비공개'}</p>
                            <p>감정: {diary.emotions && diary.emotions.map(emotion => `${emotion.mainEmotion} (${emotion.subEmotion})`).join(', ')}</p>
                            <p>작성 날짜: {new Date(diary.createdAt).toLocaleDateString()}</p>
                            <p>작성자: {diary.author || '익명'}</p>
                            <p>공감: {diary.likeCount}</p>

                            {/* 수정, 삭제 버튼 추가 */}
                            <div className="diary-actions">
                                <button onClick={() => handleViewDetail(diary.id)}>보기</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>저장된 일기가 없습니다.</p>
                )}
            </div>
        </div>
    );
}


export default MyDiary;
