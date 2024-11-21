import React, { useEffect, useState } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import '../component/Style.css';
import Modal from './diarymodaltest'; // 모달 컴포넌트 가져오기
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';


// 차트 구성 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend);

function DiaryDetail({ username }) {
    const { id } = useParams(); // URL에서 다이어리 ID 가져오기
    const [diary, setDiary] = useState(null); // 다이어리 상세 데이터 저장
    const [error, setError] = useState('');
    const [likeCount, setLikeCount] = useState(0); // 공감 수 저장
    const [modalMessage, setModalMessage] = useState(''); // 모달 메시지 상태
    const [feedback, setFeedback] = useState(''); // 피드백 상태 추가
    const navigate = useNavigate();


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
        "기본": { backgroundColor: 'white', color: 'black' },
        "검정": { backgroundColor: '#333', color: 'white' },
        "민트": { backgroundColor: '#a8e6cf', color: '#3a3a3a' },
        "양피지" : {
            backgroundImage: 'url(/images/parchment.png)',
            // backgroundSize: 'contain', // 이미지 비율 유지
            // backgroundRepeat: 'no-repeat',
            // backgroundPosition: 'center' // div 가운데 정렬 }
        }
    };

    const headThemeStyles = {
        "기본": {backgroundColor: 'white'},
        "검정": {backgroundColor: '#333', color: 'white'},
        "민트": {backgroundColor: '#a8e6cf', color: '#3a3a3a'},
        "양피지" : {
            background: "none"
        }
    };

    useEffect(() => {
        // 세션 체크 후 나머지 코드 실행
        const initialize = async () => {
            const isSessionValid = await checkSession();
            if (!isSessionValid) return; // 세션이 유효하지 않으면 나머지 코드 실행 중단

            axios.get(`/diaries/${id}`, { withCredentials: true })
                .then((response) => {
                    setDiary(response.data);
                    setLikeCount(response.data.likeCount);

                    const emotionCounts = response.data.emotionCounts || {};
                    const updatedEmotionData = { ...emotionData };
                    Object.keys(emotionCounts).forEach(emotion => {
                        updatedEmotionData[emotion].count = emotionCounts[emotion].count;
                        updatedEmotionData[emotion].subcategories = emotionCounts[emotion].subCategories;
                    });
                    setEmotionData(updatedEmotionData);

                    const userEmotions = response.data.emotions;
                    const diaryId = id;

                    axios.post('/emotion/analyze', { userEmotions, emotionCounts, diaryId })
                        .then(feedbackResponse => setFeedback(feedbackResponse.data.feedback))
                        .catch(error => console.error("피드백 요청 실패:", error));
                })
                .catch((error) => {
                    console.error('일기 상세 데이터를 불러오는 데 실패했습니다:', error);
                    const errorMessage = getErrorMessage(error);
                    console.error("일기 상세 데이터를 불러오는 데 실패했습니다:", errorMessage);
                    setError(errorMessage);
                    setModalMessage(errorMessage);
                });
        };

        initialize();
    }, [id]);

// 수정된 checkSession 함수
    const checkSession = async () => {
        try {
            const response = await axios.get('/check-session', { withCredentials: true });
            if (!response.data || !response.data.username) {
                setModalMessage('로그인이 필요합니다.'); // 모달 메시지 설정
                throw new Error('로그인이 필요합니다.');
            }
            return true;
        } catch (error) {
            setModalMessage('로그인이 필요합니다.'); // 모달 메시지 설정
            setTimeout(() => {
                navigate('/login'); // 로그인 페이지로 이동
            }, 2000);
            return false;
        }
    };

    const handleLikeClick = () => {
        axios.post(`/diaries/${id}/like`, {}, { withCredentials: true })
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
                        const subcategories = [...new Set(emotionData[emotionLabel].subcategories)]; // 중복 제거
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




    // 오류 메시지 추출 함수
    const getErrorMessage = (error) => {
        if (error.response && error.response.data) {
            return error.response.data;
        }
        return "일기 데이터를 불러오는 중 오류가 발생했습니다.";
    };


    if (error) {
        return <p className="error-message">{modalMessage}</p>;
    }

    if (!diary) {
        return <p>로딩 중...</p>;
    }



    return (
        <div className="write-wrapper">
            {/* 일기 상세 보기 폼 */}
            <div
                className="write-container"
                style={{
                    position: 'relative',
                    alignContent: "center",
                    ...themeStyles[diary.theme?.themeName] || themeStyles["기본"]
                }}
            >
                <h2 className="write-heading"
                    style={{
                        ...headThemeStyles[diary.theme?.themeName] || themeStyles["기본"]
                    }}
                >{diary.title || '제목 없음'}</h2>
                <div className="write-content"
                     style={{}}>
                    <p className="diary-content">{diary.content}</p>
                    <p>공개 여부: {diary.visibility ? '공개' : '비공개'}</p>
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
                                    src={`${sticker.sticker.imageUrl}`}
                                    alt={`스티커 ${sticker.stickerId}`}
                                    className="dropped-sticker"
                                    style={{
                                        position: 'absolute',
                                        top: `${sticker.positionY}px`,
                                        left: `${sticker.positionX}px`,
                                        width: '50px',   // 원본 크기의 50%
                                        height: '50px',   // 원본 크기의 50%
                                        transform: `rotate(${sticker.rotation}deg)`,
                                        pointerEvents: 'none'
                                    }}
                                    // width: `${sticker.scale * 50}px`,
                                    //height: `${sticker.scale * 50}px`,
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

            </div>
            {/* 감정 분석 그래프 */}
            {diary.author === username && (
                <div style={{
                    flexDirection: 'column',  // 세로 방향으로 정렬
                    alignItems: 'center',     // 가로 중앙 정렬
                    justifyContent: 'center', // 세로 중앙 정렬
                    padding: '20px',
                    maxWidth: '700px',
                    height: '300px',
                    margin: '0 auto',         // 부모 요소 기준 중앙 배치
                }}>
                    <Doughnut data={chartData} options={chartOptions}/>
                    <div className="feedback-section" style={{marginTop: '70px', marginRight: '200px', textAlign: 'center'}}>
                        <h3>감정 분석 피드백</h3>
                        <p style = {{}} dangerouslySetInnerHTML={{__html: feedback}}></p>
                    </div>
                </div>
            )}
            {/* 모달 표시 */}
            {modalMessage && <Modal message={modalMessage} onClose={closeModal}/>}
        </div>
    );
}

export default DiaryDetail;
