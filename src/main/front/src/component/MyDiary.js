/// 작성자 20172522 이기보 10월 30일 오후 3:03

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../component/MyDiary.css';
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
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [modalMessage, setModalMessage] = useState(''); // 모달 메시지 상태 추가
    const closeModal = () => setModalMessage(''); // 모달 닫기
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'asc' }); // 정렬 상태
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const [itemsPerPage] = useState(10); // 페이지당 표시할 항목 수

    // https://3453-203-230-86-251.ngrok-free.app
    // https://3453-203-230-86-251.ngrok-free.app
    // 세션 체크 함수
    const checkSession = async () => {
        try {
            const response = await axios.get('/check-session', { withCredentials: true });
            if (!response.data || !response.data.username) {
                throw new Error('로그인이 필요합니다.');
            }
        } catch (error) {
            setModalMessage('로그인이 필요합니다.');
            setTimeout(() => {
                navigate('/login'); // 로그인 페이지로 이동
            }, 1000); // 2초 후에 페이지 이동
        }
    };

    useEffect(() => {
        const initialize = async () => {
            try {
                // 세션 체크
                const response = await axios.get('/check-session', { withCredentials: true });
                if (!response.data || !response.data.username) {
                    setModalMessage('로그인이 필요합니다.');
                    setTimeout(() => navigate('/login'), 2000); // 2초 후 로그인 페이지로 이동
                    return; // 이후 코드 실행 중단
                }
                // 세션이 유효하면 diaries 데이터를 가져옵니다.
                const diariesResponse = await axios.get('/diaries/list', { withCredentials: true });
                if (Array.isArray(diariesResponse.data)) {
                    setDiaries(diariesResponse.data);
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

    // 상세 페이지로 이동 핸들러 함수
    const handleViewDetail = (diaryId) => {
        navigate(`/diaries/${diaryId}`);
    }


    //TODO - 부정점수계산으로 바꾸기
    const graphData = {
        labels: diaries.map(diary => new Date(diary.createdAt).toLocaleDateString()), // X축: 작성 날짜
        datasets: [
            // 분석된 감정만 남김
            {
                label: '분석된 감정',
                data: diaries.map(diary => {
                    if (!diary.emotionCounts) return 0;

                    // emotionCounts에서 가장 높은 count를 가진 감정 선택
                    const mostAnalyzedEmotion = Object.entries(diary.emotionCounts).reduce(
                        (prev, curr) => (curr[1].count > prev[1].count ? curr : prev),
                        ['', { count: 0 }]
                    );

                    return mostAnalyzedEmotion[1].count; // 가장 높은 count 반환
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
            title: { display: true, text: '감정 변화 그래프' },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        const index = tooltipItem.dataIndex;
                        const diary = diaries[index];

                        const mostAnalyzedEmotion = Object.entries(diary.emotionCounts || {}).reduce(
                            (prev, curr) => (curr[1].count > prev[1].count ? curr : prev),
                            ['', { count: 0 }]
                        );

                        const analyzedEmotion = `${mostAnalyzedEmotion[0]} (${mostAnalyzedEmotion[1].count}회)`;

                        return `분석된 감정: ${analyzedEmotion}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
            }
        }
    };

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

    // 정렬 로직
    const sortedDiaries = [...diaries].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const valueA = a[sortConfig.key];
        const valueB = b[sortConfig.key];

        if (sortConfig.direction === 'asc') {
            return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
            return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
    });

    // 현재 페이지의 항목들
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDiaries = sortedDiaries.slice(indexOfFirstItem, indexOfLastItem);

    // 페이지 변경 핸들러
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // 정렬 기준 변경 핸들러
    const handleSort = (key) => {
        setSortConfig((prevConfig) => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    // 총 페이지 수
    const totalPages = Math.ceil(diaries.length / itemsPerPage);

    return (
        <div className="my-diary-container">
            {/* 정렬 버튼을 content-container 내에서 diary-list 위로 이동 */}
            <div className="sort-buttons">
                {/*<button onClick={() => navigate('/write')}>일기 쓰기</button>*/}
                <button onClick={() => handleSort('createdAt')}
                        className={sortConfig.key === 'createdAt' ? 'active' : ''}>
                    작성일 순 {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </button>
                <button onClick={() => handleSort('likeCount')}
                        className={sortConfig.key === 'likeCount' ? 'active' : ''}>
                    공감 수 순 {sortConfig.key === 'likeCount' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
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
                        </tr>
                        </thead>
                        <tbody>
                        {currentDiaries.length > 0 ? (
                            currentDiaries.reverse().map((diary) => (
                                <tr key={diary.id} onClick={() => navigate(`/diaries/${diary.id}`)}
                                    className="diary-row">
                                    <td className="diary-title">{diary.title || '제목 없음'}</td>
                                    <td style={{padding: '10px', textAlign: 'center'}}>{diary.visibility ? '공개' : '비공개'}</td>
                                    <td style={{padding: '10px', textAlign: 'center'}}>{new Date(diary.createdAt).toLocaleDateString()}</td>
                                    <td className="like-count">{diary.likeCount}</td>
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
        </div>
    );
}


export default MyDiary;
