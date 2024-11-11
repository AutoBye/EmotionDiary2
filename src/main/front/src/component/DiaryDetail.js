import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../component/Style.css';
import Modal from './diarymodaltest'; // 모달 컴포넌트 가져오기
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';


// 차트 구성 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend);

function DiaryDetail() {
    const { id } = useParams(); // URL에서 다이어리 ID 가져오기
    const [diary, setDiary] = useState(null); // 다이어리 상세 데이터 저장
    const [error, setError] = useState('');
    const [likeCount, setLikeCount] = useState(0); // 공감 수 저장
    const [modalMessage, setModalMessage] = useState(''); // 모달 메시지 상태
    const [feedback, setFeedback] = useState(''); // 피드백 상태 추가
    // 초기 상태를 감정 항목별로 0으로 설정
    const [emotionData, setEmotionData] = useState({
        기쁨: { count: 0, subcategories: [] },
        불안: { count: 0, subcategories: [] },
        분노: { count: 0, subcategories: [] },
        당황: { count: 0, subcategories: [] },
        슬픔: { count: 0, subcategories: [] },
        상처: { count: 0, subcategories: [] }
    });

    // 테마 스타일 정의
    const themeStyles = {
        default: { backgroundColor: 'white', color: 'black' },
        dark: { backgroundColor: '#333', color: 'white' },
        nature: { backgroundColor: '#a8e6cf', color: '#3a3a3a' }
    };

    useEffect(() => {
        axios.get(`http://192.168.123.161:8080/diaries/${id}`, { withCredentials: true })
            .then((response) => {
                setDiary(response.data);
                setLikeCount(response.data.likeCount);
                // console.log("스티커 데이터:", response.data.stickers); // 스티커 데이터 확인
                // 나머지 로직...


                const emotionCounts = response.data.emotionCounts || {};
                const updatedEmotionData = { ...emotionData };
                Object.keys(emotionCounts).forEach(emotion => {
                    updatedEmotionData[emotion].count = emotionCounts[emotion].count;
                    updatedEmotionData[emotion].subcategories = emotionCounts[emotion].subCategories;
                });
                setEmotionData(updatedEmotionData);


                const userEmotions = response.data.emotions;

                const diaryId = id;
                // console.log(diaryId);
                // 감정 분석 피드백 요청
                axios.post('http://192.168.123.161:8080/emotion/analyze', { userEmotions, emotionCounts, diaryId})
                    .then(feedbackResponse => setFeedback(feedbackResponse.data.feedback))
                    .catch(error => console.error("피드백 요청 실패:", error));
            })
            .catch((error) => {
                console.error('일기 상세 데이터를 불러오는 데 실패했습니다:', error);
                setError("일기 상세 데이터를 불러오는 데 실패했습니다.");
            });
    }, [id]);

    const handleLikeClick = () => {
        axios.post(`http://192.168.123.161:8080/diaries/${id}/like`, {}, { withCredentials: true })
            .then(() => {
                setLikeCount((prevCount) => prevCount + 1); // 공감 수 증가
            })
            .catch((error) => {
                const errorMessage = error.response?.data || "공감하는 데 실패했습니다.";
                setModalMessage(errorMessage); // 모달 메시지 설정
            });
    };

    const closeModal = () => setModalMessage(''); // 모달 닫기

    const totalEmotionCount = Object.values(emotionData).reduce((sum, emotion) => sum + emotion.count, 0);

    // 원형 그래프에 맞게 데이터를 준비
    const chartData = {
        labels: Object.keys(emotionData),
        datasets: [
            {
                label: '감정 비율',
                data: Object.values(emotionData).map(emotion => (emotion.count / totalEmotionCount) * 100),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                ],
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const emotionLabel = context.label;
                        const subcategories = emotionData[emotionLabel].subcategories;
                        return `${emotionLabel}: ${context.raw.toFixed(1)}% - ${subcategories.join(", ")}`;
                    }
                }
            },
            title: {
                display: true,
                text: '감정 분석 결과 - 감정 비율',
            }
        }
    };


    if (error) {
        return <p className="error-message">{error}</p>;
    }

    if (!diary) {
        return <p>로딩 중...</p>;
    }

    const headThemeStyles = {
        default: { backgroundColor: 'white' },
        dark: { backgroundColor: '#333', color: 'white' },
        nature: { backgroundColor: '#a8e6cf', color: '#3a3a3a' }
    };

    return (
        <div className="write-wrapper">
            {/* 일기 상세 보기 폼 */}
            <div
                className="write-container"
                style={{
                    position: 'relative',
                    alignContent: "center",
                    ...themeStyles[diary.theme?.themeName] || themeStyles.default
                }}
            >
                <h2 className="write-heading"
                    style={{
                        ...headThemeStyles[diary.theme?.themeName] || themeStyles.default
                    }}
                >{diary.title || '제목 없음'}</h2>
                <div className="write-content"
                     style={{

                     }}>
                    <p className="diary-content">{diary.content}</p>
                    <p>공개 여부: {diary.isPublic ? '공개' : '비공개'}</p>
                    <p>감정: {diary.emotions && diary.emotions.map(emotion => `${emotion.mainEmotion} (${emotion.subEmotion})`).join(', ')}</p>
                    <p>작성 날짜: {new Date(diary.createdAt).toLocaleDateString()}</p>
                    <p>작성자: {diary.author || '익명'}</p>
                    <p>공감: {likeCount}</p> {/* 최신 공감 수 표시 */}
                </div>

                {/* 드롭된 스티커들 렌더링 */}
                {diary.stickers && diary.stickers.length > 0 && (
                    <div className="stickers-container">
                        {diary.stickers.map((sticker, index) => {
                            // console.log("스티커 이미지 URL:", sticker.sticker.imageUrl); // 스티커의 이미지 경로 확인
                            // console.log("공개여부 : ", diary.visibility); // 스티커의 이미지 경로 확인
                            return (
                                <img
                                    key={index}
                                    src={`http://192.168.123.161:8080${sticker.sticker.imageUrl}`}
                                    alt={`스티커 ${sticker.stickerId}`}
                                    className="dropped-sticker"
                                    style={{
                                        position: 'absolute',
                                        top: `${sticker.positionY}px`,
                                        left: `${sticker.positionX}px`,
                                        width: `${sticker.scale * 50}px`,
                                        height: `${sticker.scale * 50}px`,
                                        transform: `rotate(${sticker.rotation}deg)`,
                                        pointerEvents: 'none'
                                    }}
                                />
                            );
                        })}
                    </div>
                )}
                {/* 공감 버튼 (공개된 일기인 경우에만 표시) */}
                {diary.visibility && (
                    <button
                        onClick={handleLikeClick}
                        className="like-button"
                        style={{
                            position: 'absolute',
                            right: '20px',
                            top: '20px',
                            backgroundImage: `url('/Heart.png')`, // 이미지 경로
                            backgroundSize: 'cover',
                            backgroundColor: 'white',
                            width: '50px',
                            height: '50px',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                    </button>
                )}

                {/* 모달 표시 */}
                {modalMessage && <Modal message={modalMessage} onClose={closeModal}/>}
            </div>
            {/* 감정 분석 그래프 */}
            <div style={{flex: 1, padding: '20px', maxWidth: '500px', height: '300px'}}>
                <Doughnut data={chartData} options={chartOptions}/>
                <div className="feedback-section" style={{marginTop: '70px',marginRight: '200px', textAlign: 'center'}}>
                    <h3>감정 분석 피드백</h3>
                    <p>{feedback}</p>
                </div>
            </div>

        </div>
    );
}

export default DiaryDetail;
