// 작성자 - 김형섭 2024-11-04
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../component/Style.css';
import { useNavigate } from 'react-router-dom';

function MyDiary() {
    const [diaries, setDiaries] = useState([]); // 서버로부터 가져온 일기 데이터 저장
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'asc' }); // 정렬 상태
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const [itemsPerPage] = useState(10); // 페이지당 표시할 항목 수

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
        <div className="public-diary-container">
            <h2>공개된 일기</h2>

            {/* 정렬 버튼 */}
            <div className="sort-buttons" style={{ marginBottom: '20px', textAlign: 'right' }}>
                <button onClick={() => handleSort('title')} style={{ margin: '0 5px' }}>
                    제목 {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </button>
                <button onClick={() => handleSort('createdAt')} style={{ margin: '0 5px' }}>
                    작성일 {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </button>
                <button onClick={() => handleSort('likeCount')} style={{ margin: '0 5px' }}>
                    공감 수 {sortConfig.key === 'likeCount' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </button>
                <button onClick={() => handleSort('author')} style={{ margin: '0 5px' }}>
                    작성자 {sortConfig.key === 'author' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </button>
            </div>

            {/* 다이어리 리스트 */}
            <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '20px'}}>
                <thead>
                <tr style={{backgroundColor: '#f4f4f4', textAlign: 'left'}}>
                    <th style={{padding: '10px'}}>제목</th>
                    <th style={{padding: '10px'}}>작성일</th>
                    <th style={{padding: '10px', textAlign: 'center'}}>공감 수</th>
                    <th style={{padding: '10px'}}>작성자</th>
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
                            <td style={{padding: '10px', color: '#007bff', textDecoration: 'underline'}}>
                                {diary.title || '제목 없음'}
                            </td>
                            <td style={{padding: '10px'}}>{new Date(diary.createdAt).toLocaleDateString()}</td>
                            <td style={{padding: '10px', textAlign: 'center'}}>{diary.likeCount}</td>
                            <td style={{padding: '10px'}}>{diary.author || '익명'}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>
                            공개된 일기가 없습니다.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            {/* 페이지네이션 */}
            <div className="pagination" style={{textAlign: 'center'}}>
                {Array.from({length: totalPages}, (_, index) => index + 1).map((pageNumber) => (
                    <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        style={{
                            padding: '5px 10px',
                            margin: '0 5px',
                            backgroundColor: currentPage === pageNumber ? '#007bff' : '#fff',
                            color: currentPage === pageNumber ? '#fff' : '#007bff',
                            border: '1px solid #007bff',
                            cursor: 'pointer',
                        }}
                    >
                        {pageNumber}
                    </button>
                ))}
            </div>
        </div>
    );
}


export default MyDiary;
