import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import '../component/Style.css';

function Write() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [selectedMainEmotion, setSelectedMainEmotion] = useState('');
    const [selectedSubEmotions, setSelectedSubEmotions] = useState([]);
    const [selectedEmotions, setSelectedEmotions] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [stickers, setStickers] = useState([]);
    const [droppedStickers, setDroppedStickers] = useState([]);

    // 서버에서 스티커 목록 가져오기
    useEffect(() => {
        axios.get('http://192.168.123.161:8080/api/stickers', { withCredentials: true })
            .then(response => {
                if (response.data) {
                    setStickers(response.data);
                }
            })
            .catch(error => {
                console.error('스티커 목록을 가져오는 중 오류가 발생했습니다.', error);
            });
    }, []);

    const handleStickerDragStart = (sticker, e) => {
        e.dataTransfer.setData('stickerId', sticker.stickerId);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const stickerId = e.dataTransfer.getData('stickerId');
        const sticker = stickers.find(st => st.stickerId === parseInt(stickerId));

        if (sticker) {
            const dropX = e.clientX - e.currentTarget.getBoundingClientRect().left;
            const dropY = e.clientY - e.currentTarget.getBoundingClientRect().top;

            setDroppedStickers(prev => [
                ...prev,
                {
                    ...sticker,
                    x: dropX,
                    y: dropY
                }
            ]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const requiredEmotions = ['기쁨란'];

    const mainEmotions = [
        { name: '기쁨란', subEmotions: ["감사하는", "기쁨", "느긋", "만족스러운", "신뢰하는", "신이 난", "안도", "자신하는", "편안한", "흥분"] },
        { name: '당황란', subEmotions: ["고립된", "남의 시선을 의식하는", "당황", "부끄러운", "열등감", "외로운", "죄책감의", "한심한", "혐오스러운", "혼란스러운"] },
        { name: '분노란', subEmotions: ["구역질 나는", "노여워하는", "방어적인", "분노", "성가신", "악의적인", "안달하는", "좌절한", "짜증내는", "툴툴대는"] },
        { name: '불안란', subEmotions: ["걱정스러운", "당혹스러운", "두려운", "불안", "스트레스 받는", "조심스러운", "초조한", "취약한", "혼란스러운", "회의적인"] },
        { name: '슬픔란', subEmotions: ["낙담한", "눈물이 나는", "마비된", "비통한", "슬픔", "실망한", "염세적인", "우울한", "환멸을 느끼는", "후회되는"] },
        { name: '상처란', subEmotions: ["불우한", "고립된", "괴로워하는", "배신당한", "버려진", "상처", "억울한", "질투하는", "충격 받은", "희생된"] }
    ];

    const isCategorySelected = (emotionName) => {
        return mainEmotions
            .find(emotion => emotion.name === emotionName)
            .subEmotions.some(subEmotion => selectedSubEmotions.includes(subEmotion));
    };

    const handleMainEmotionClick = (emotion) => {
        setSelectedMainEmotion(prevEmotion => prevEmotion === emotion ? '' : emotion);
    };

    const handleSubEmotionClick = (subEmotion) => {
        setSelectedEmotions((prev) => {
            const isAlreadySelected = prev.some(emotion => emotion.subEmotion === subEmotion);

            if (isAlreadySelected) {
                return prev.filter((emotion) => emotion.subEmotion !== subEmotion);
            } else {
                return [...prev, { mainEmotion: selectedMainEmotion, subEmotion }];
            }
        });
    };

    const isRequiredEmotionSelected = () => {
        return selectedEmotions.some(({ mainEmotion }) => requiredEmotions.includes(mainEmotion));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isRequiredEmotionSelected()) {
            setError("기쁨란을 선택해 오늘 하루에 있었던 사소한 긍정적인 일을 생각해보세요");
            setMessage('');
            return;
        }

        console.log("stickers: ");
        droppedStickers.forEach(({ stickerId, x, y }) => {
            console.log({
                stickerId: stickerId,
                x: x,
                y: y
            });
        });

        axios.post('http://192.168.123.161:8080/diaries/write', {
            title,
            content,
            isPublic,
            emotions: selectedEmotions,
            stickers: droppedStickers.map(({ stickerId, x, y }) => ({
                stickerId,
                x: isNaN(parseFloat(x)) ? 0.0 : parseFloat(x),
                y: isNaN(parseFloat(y)) ? 0.0 : parseFloat(y)
            }))
        }, {
            withCredentials: true
        })
            .then((response) => {
                setMessage("일기가 성공적으로 저장되었습니다.");
                setError('');
                navigate("/my-diary");
            })
            .catch((error) => {
                console.error('일기 저장 중 오류 발생:', error);
                setError("일기 저장에 실패했습니다.");
                setMessage('');
            });
    };

    const filteredSubEmotions = selectedMainEmotion
        ? mainEmotions.find(emotion => emotion.name === selectedMainEmotion).subEmotions
        : [];

    return (
        <div className="write-wrapper">
            <div
                className="write-container"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{position: 'relative'}}
            >
                <h2 className="write-heading">오늘 나의 하루</h2>
                <form onSubmit={handleSubmit} className="write-form">
                    <input
                        type="text"
                        placeholder="제목"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="write-input"
                        required
                    />
                    <textarea
                        placeholder="오늘의 일기를 작성하세요..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="write-textarea"
                        required
                    />

                    <div className="visibility-options">
                        <label>
                            <input
                                type="radio"
                                name="visibility"
                                checked={isPublic}
                                onChange={() => setIsPublic(true)}
                            />
                            공개
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="visibility"
                                checked={!isPublic}
                                onChange={() => setIsPublic(false)}
                            />
                            비공개
                        </label>
                    </div>

                    <div className="emotion-selection">
                        <h3>오늘의 감정을 선택하세요:</h3>
                        <div className="main-emotions">
                            {mainEmotions.map((emotion) => (
                                <div key={emotion.name} className="main-emotion-category">
                                    <button
                                        type="button"
                                        className={`main-emotion ${selectedMainEmotion === emotion.name ? 'active' : ''}`}
                                        onClick={() => handleMainEmotionClick(emotion.name)}
                                    >
                                        {emotion.name}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="sub-emotions">
                            {filteredSubEmotions.map((subEmotion) => (
                                <button
                                    type="button"
                                    key={subEmotion}
                                    className={`sub-emotion ${selectedEmotions.some(emotion => emotion.subEmotion === subEmotion) ? 'selected' : ''}`}
                                    onClick={() => handleSubEmotionClick(subEmotion)}
                                >
                                    {subEmotion}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="write-button">저장</button>
                </form>

                {error && <p className="write-message write-error">{error}</p>}
                {message && <p className="write-message write-success">{message}</p>}

                {droppedStickers.map((sticker, index) => (
                    <img
                        key={index}
                        src={`http://192.168.123.161:8080${sticker.imageUrl}`}
                        alt={sticker.stickerName}
                        className="dropped-sticker"
                        style={{position: 'absolute', left: sticker.x, top: sticker.y, width: '50px', height: '50px'}}
                    />
                ))}
            </div>

            <div className="sticker-selection">
                <h3>스티커 선택하기:</h3>
                <div className="stickers-list">
                    {stickers.map((sticker) => (
                        <img
                            key={sticker.stickerId}
                            src={`http://192.168.123.161:8080${sticker.imageUrl}`}
                            alt={sticker.stickerName}
                            className="sticker-item"
                            draggable
                            onDragStart={(e) => handleStickerDragStart(sticker, e)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Write;
