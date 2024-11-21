/// 작성자 20172522 이기보 10월 30일 오후 3:03

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../component/MyDiary.css';
import '../component/delete.css';
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    Title,
    CategoryScale,
    Legend,
    Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Modal from "./diarymodaltest";
// Chart.js 구성 요소 등록
ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    Title,
    CategoryScale,
    Legend,
    Tooltip
);

function MyDiary() {
    const [diaries, setDiaries] = useState([]); // 서버로부터 가져온 일기 데이터 저장
    const [sortedDiaries, setSortedDiaries] = useState([]); // 정렬된 데이터
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [modalMessage, setModalMessage] = useState(''); // 모달 메시지 상태 추가
    const closeModal = () => setModalMessage(''); // 모달 닫기
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' }); // 정렬 상태
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const [itemsPerPage] = useState(10); // 페이지당 표시할 항목 수

    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 표시 여부
    const [deleteTargetId, setDeleteTargetId] = useState(null); // 삭제 대상 ID


    // https://3453-203-230-86-251.ngrok-free.app
    // https://3453-203-230-86-251.ngrok-free.app
    // 세션 체크 함수
    const checkSession = async () => {
        try {
            const response = await axios.get("/check-session", {
                withCredentials: true,
            });
            if (!response.data || !response.data.username) {
                throw new Error("로그인이 필요합니다.");
            }
        } catch (error) {
            //setModalMessage('로그인이 필요합니다.');
            navigate("/login"); // 로그인 페이지로 이동
            setTimeout(() => {
                //navigate('/login'); // 로그인 페이지로 이동
            }, 0); // 2초 후에 페이지 이동
        }
    };

    useEffect(() => {
        const initialize = async () => {
            try {
                // 세션 체크
                checkSession();

                // 세션이 유효하면 diaries 데이터를 가져옵니다.
                const diariesResponse = await axios.get('/diaries/list', { withCredentials: true });
                if (Array.isArray(diariesResponse.data)) {
                    setDiaries(diariesResponse.data);
                    // 초기 정렬: createdAt 내림차순
                    const sorted = [...diariesResponse.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setSortedDiaries(sorted); // 정렬된 데이터 상태 저장
                    console.log('다이어리 데이터:', diariesResponse.data);
                } else {
                    console.error('응답 데이터가 배열 형식이 아닙니다:', diariesResponse.data);
                    setDiaries([]);
                }
            } catch (error) {
                console.error('데이터 초기화 중 오류 발생:', error);
                setError('데이터 초기화 중 오류가 발생했습니다.');
            }
        };

        initialize();
    }, []);

    // 삭제 핸들러 함수
    const handleDelete = (diaryId) => {
        axios.delete(`/diaries/${diaryId}`, { withCredentials: true })
            .then(() => {
                alert('일기가 성공적으로 삭제되었습니다.');
                setDiaries(prevDiaries => prevDiaries.filter(diary => diary.id !== diaryId));
            })
            .catch((error) => {
                console.error('일기 삭제 중 오류 발생:', error);
                alert('일기 삭제에 실패했습니다.');
            });
    }

    const openDeleteModal = (diaryId) => {
        setDeleteTargetId(diaryId); // 삭제 대상 ID 설정
        setIsModalOpen(true); // 모달 표시
    };

    const closeDeleteModal = () => {
        setIsModalOpen(false); // 모달 닫기
        setDeleteTargetId(null); // 삭제 대상 ID 초기화
    };

    const confirmDelete = () => {
        if (deleteTargetId) {
            handleDelete(deleteTargetId);
            closeDeleteModal(); // 모달 닫기
        }
    };

    // 상세 페이지로 이동 핸들러 함수
    const handleViewDetail = (diaryId) => {
        navigate(`/diaries/${diaryId}`);
    }



    // 피드백 안쓸듯
    const generateFeedback = () => {
        return diaries.map(diary => {
            if (!diary.emotions || !diary.emotionCounts) return '데이터가 충분하지 않습니다.';

            // 내가 선택한 감정 계산
            const emotionCounts = diary.emotions.reduce((acc, emotion) => {
                acc[emotion.mainEmotion] = (acc[emotion.mainEmotion] || 0) + 1;
                return acc;
            }, {});

            const selectedEmotion = Object.entries(emotionCounts).reduce(
                (prev, curr) => (curr[1] > prev[1] ? curr : prev),
                ['', 0]
            )[0];

            // 분석된 감정 계산
            const analyzedEmotion = Object.entries(diary.emotionCounts).reduce(
                (prev, curr) => (curr[1].count > prev[1].count ? curr : prev),
                ['', { count: 0 }]
            )[0];

            // 피드백 생성
            if (selectedEmotion === analyzedEmotion + "란") {
                return `일기 "${diary.title || '제목 없음'}"에서 선택한 감정(${selectedEmotion})과 분석된 감정이 일치합니다.`;
            } else {
                return `일기 "${diary.title || '제목 없음'}"에서 선택한 감정(${selectedEmotion})과 분석된 감정(${analyzedEmotion}란)이 일치하지 않습니다.`;
            }
        });
    };

    const feedbackList = generateFeedback();



    // 정렬 함수
    const applySorting = (data) => {
        const sorted = [...data].sort((a, b) => {
            let valueA = a[sortConfig.key];
            let valueB = b[sortConfig.key];

            if (sortConfig.key === 'createdAt') {
                valueA = new Date(valueA);
                valueB = new Date(valueB);
            }

            if (sortConfig.direction === 'asc') {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            } else {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            }
        });

        setSortedDiaries(sorted);
    };

// 정렬 기준 변경 핸들러
    const handleSort = (key) => {
        const newDirection = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        const updatedConfig = { key, direction: newDirection };
        setSortConfig(updatedConfig);

        // 정렬 즉시 적용
        const sorted = [...diaries].sort((a, b) => {
            let valueA = a[key];
            let valueB = b[key];

            if (key === 'createdAt') {
                valueA = new Date(valueA);
                valueB = new Date(valueB);
            }

            if (newDirection === 'asc') {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            } else {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            }
        });

        setSortedDiaries(sorted);
        setCurrentPage(1); // 정렬 변경 시 첫 페이지로 이동
    };

// 페이징 처리된 데이터
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDiaries = sortedDiaries.slice(indexOfFirstItem, indexOfLastItem);

// 총 페이지 수
    const totalPages = Math.ceil(sortedDiaries.length / itemsPerPage);

// 페이지 변경 핸들러
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };




    // 현재 페이지 데이터 추출
    //const indexOfLastItem = currentPage * itemsPerPage;
    //const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    // const currentDiaries = sortedDiaries.slice(indexOfFirstItem, indexOfLastItem);
    // 총 페이지 수
    //const totalPages = Math.ceil(sortedDiaries.length / itemsPerPage);

    //TODO - 부정점수계산으로 바꾸기
    // 날짜 기준으로 diaries 정렬
    const sortedDiaries2 = diaries.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const graphData = {
        labels: sortedDiaries2.map(diary => new Date(diary.createdAt).toLocaleDateString()), // X축: 정렬된 작성 날짜
        datasets: [
            {
                label: '부정 점수 (100점 만점)',
                data: sortedDiaries2.map(diary => {
                    if (!diary.emotionCounts || Object.keys(diary.emotionCounts).length === 0) {
                        return 0; // 감정 데이터가 없으면 0점 반환
                    }

                    // 점수 체계
                    const emotionWeights = {
                        당황: 1,
                        불안: 2,
                        슬픔: 3,
                        상처: 4,
                        분노: 5,
                        기쁨: -1.5, // 기쁨의 가중치 조정
                    };

                    // 전체 감정 검출 수 계산
                    const totalEmotionCount = Object.values(diary.emotionCounts).reduce(
                        (sum, emotion) => sum + (emotion.count || 0),
                        0
                    );

                    if (totalEmotionCount === 0) {
                        return 0; // 전체 감정 수가 0이면 0점 반환
                    }

                    // 감정 점수 계산 (비율 기반)
                    const rawScore = Object.entries(diary.emotionCounts).reduce((score, [emotion, emotionData]) => {
                        const weight = emotionWeights[emotion] || 0; // 감정 가중치
                        const proportion = emotionData.count / totalEmotionCount; // 비율 계산
                        return score + proportion * weight; // 비율 * 가중치
                    }, 0);

                    // 점수 스케일링 (100점 만점)
                    const maxPossibleScore = 5; // 최대 가중치 기준
                    let scaledScore = (rawScore / maxPossibleScore) * 100;

                    // 최소 점수 하한선 설정 (기쁨이 있어도 최소 10점)
                    scaledScore = Math.max(10, scaledScore);

                    // 소수점 제거 및 음수 0점 처리
                    return Math.max(0, Math.floor(scaledScore));
                }),
                borderColor: 'red',
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                fill: true,
            }
        ]
    };
    const graphOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: '부정 점수 변화 그래프 (100점 만점)' },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        const index = tooltipItem.dataIndex;
                        const diary = sortedDiaries2[index]; // 정렬된 데이터 사용

                        if (!diary || !diary.emotionCounts) return '감정 데이터 없음';

                        const emotionWeights = {
                            당황: 1,
                            불안: 2,
                            슬픔: 3,
                            상처: 4,
                            분노: 5,
                            기쁨: -1.5,
                        };

                        const totalEmotionCount = Object.values(diary.emotionCounts).reduce(
                            (sum, emotion) => sum + (emotion.count || 0),
                            0
                        );

                        if (totalEmotionCount === 0) return '점수: 0점';

                        const rawScore = Object.entries(diary.emotionCounts).reduce((score, [emotion, emotionData]) => {
                            const weight = emotionWeights[emotion] || 0;
                            const proportion = emotionData.count / totalEmotionCount;
                            return score + proportion * weight;
                        }, 0);

                        const maxPossibleScore = 5;
                        let scaledScore = (rawScore / maxPossibleScore) * 100;

                        // 최소 점수 하한선 설정
                        scaledScore = Math.max(10, scaledScore);

                        const finalScore = Math.max(0, Math.floor(scaledScore));

                        return `점수: ${finalScore}점`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
            }
        }
    };



    return (
        <div className="my-diary-container">
            {/* 정렬 버튼을 content-container 내에서 diary-list 위로 이동 */}
            <div className="sort-buttons">
                <button
                    onClick={() => handleSort('createdAt')}
                    className={sortConfig.key === 'createdAt' ? 'active' : ''}
                >
                    작성일 {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </button>
                <button
                    onClick={() => handleSort('likeCount')}
                    className={sortConfig.key === 'likeCount' ? 'active' : ''}
                >
                    공감 수 {sortConfig.key === 'likeCount' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </button>
            </div>

            {/* 다이어리 목록과 그래프 */}
            <div className="content-container">
                {/* 다이어리 리스트 */}
                <div className="diary-list">
                    <table className="diary-table">
                        <thead>
                        <tr>
                            <th>제목</th>
                            <th>공개 여부</th>
                            <th>작성일</th>
                            <th>공감</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentDiaries.length > 0 ? (
                            currentDiaries.map((diary) => (
                                <tr key={diary.id} onClick={() => navigate(`/diaries/${diary.id}`)}
                                    className="diary-row">
                                    <td className="diary-title">{diary.title || '제목 없음'}</td>
                                    <td style={{padding: '10px', textAlign: 'center'}}>{diary.visibility ? '공개' : '비공개'}</td>
                                    <td style={{padding: '10px', textAlign: 'center'}}>{new Date(diary.createdAt).toLocaleDateString()}</td>
                                    <td className="like-count">{diary.likeCount}</td>
                                    <td style={{textAlign: 'center'}}>
                                        <img
                                            src="/images/delete.png"
                                            alt="삭제"
                                            className="delete-button"
                                            onClick={(e) => {
                                                e.stopPropagation(); // 부모 요소 클릭 방지
                                                openDeleteModal(diary.id); // 삭제 모달 열기
                                            }}
                                            style={{
                                                width: '25px',
                                                height: '25px',
                                                cursor: 'pointer', /* 마우스 포인터 변경 */
                                                transition: 'transform 0.2s ease', /* 클릭 효과 */
                                                border: '1px solid black',
                                                borderRadius: '4px',
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="empty-message">저장된 일기가 없습니다.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                    {/* 페이지네이션 */}
                    <div className="pagination">
                        {Array.from({length: totalPages}, (_, index) => index + 1).map((pageNumber) => (
                            <button
                                key={pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                                className={currentPage === pageNumber ? 'active-page' : ''}
                            >
                                {pageNumber}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 그래프 */}
                <div className="graph-container">
                    <Line data={graphData} options={graphOptions}/>
                    <p>나의 감정 변화</p>
                    <ul>
                        {/*{feedbackList.map((feedback, index) => (*/}
                        {/*    <li key={index}>{feedback}</li>*/}
                        {/*))}*/}
                    </ul>
                </div>


            </div>

            {/* 모달 표시 */}
            {modalMessage && <Modal message={modalMessage} onClose={closeModal}/>}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <p>정말로 이 일기를 삭제하시겠습니까?</p>
                        <div className="modal-actions">
                            <button onClick={confirmDelete} className="modal-confirm">삭제</button>
                            <button onClick={closeDeleteModal} className="modal-cancel">취소</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


export default MyDiary;
