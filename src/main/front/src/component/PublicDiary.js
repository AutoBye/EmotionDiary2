// 작성자 - 김형섭 2024-11-04
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../component/PublicDiary.css';
import '../component/Style.css';
import { useNavigate } from 'react-router-dom';

function MyDiary() {
    const [diaries, setDiaries] = useState([]); // 서버 데이터
    const [sortedDiaries, setSortedDiaries] = useState([]); // 정렬된 데이터
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' }); // 기본 내림차순
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const [itemsPerPage] = useState(10); // 페이지당 항목 수


    // https://3453-203-230-86-251.ngrok-free.app
    //https://3453-203-230-86-251.ngrok-free.app/diaries/public-list
    useEffect(() => {
        axios.get('/diaries/public-list', { withCredentials: true })
            .then((response) => {
                if (Array.isArray(response.data)) {
                    setDiaries(response.data);
                    const sorted = [...response.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setSortedDiaries(sorted); // 정렬된 데이터 상태 저장
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

    // 정렬 적용
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

        setSortedDiaries(sorted); // 정렬된 데이터 저장
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

    // 현재 페이지 데이터 추출
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDiaries = sortedDiaries.slice(indexOfFirstItem, indexOfLastItem);

    // 총 페이지 수 계산
    const totalPages = Math.ceil(sortedDiaries.length / itemsPerPage);

    // 페이지 변경 핸들러
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="public-diary-container">
            {/* 정렬 버튼 */}
            <div className="sort-buttons2" style={{ marginBottom: '20px', textAlign: 'right' }}>
                <button
                    onClick={() => handleSort('createdAt')}
                    className={sortConfig.key === 'createdAt' ? 'active' : ''}
                    style={{ margin: '0 5px' }}
                >
                    작성일 {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </button>
                <button
                    onClick={() => handleSort('likeCount')}
                    className={sortConfig.key === 'likeCount' ? 'active' : ''}
                    style={{ margin: '0 5px' }}
                >
                    공감 수 {sortConfig.key === 'likeCount' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </button>
            </div>

            {/* 다이어리 리스트 */}
            <table className="public-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>제목</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>작성일</th>
                    <th style={{ padding: '10px' }}>작성자</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>공감 수</th>
                </tr>
                </thead>
                <tbody>
                {currentDiaries.length > 0 ? (
                    currentDiaries.map((diary) => (
                        <tr
                            key={diary.id}
                            style={{
                                borderBottom: '1px solid #ddd',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease',
                            }}
                            onClick={() => navigate(`/diaries/${diary.id}`)}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f8ff')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                            <td style={{ padding: '10px' }}>{diary.title || '제목 없음'}</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                                {new Date(diary.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>{diary.author || '익명'}</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>{diary.likeCount}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                            공개된 일기가 없습니다.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            {/* 페이지네이션 */}
            <div className="pagination2" style={{ textAlign: 'center' }}>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
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
    );
}


export default MyDiary;
