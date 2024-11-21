import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../component/Style.css";
import Modal from "./diarymodaltest"; // 모달 컴포넌트 가져오기

function Write() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isPublic, setIsPublic] = useState(false);

    const [selectedMainEmotion, setSelectedMainEmotion] = useState("");
    const [selectedEmotions, setSelectedEmotions] = useState([]);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const defaultTheme = { id: 1, themeName: "기본", description: "기본" };
    const [themes, setThemes] = useState([]); // 테마 목록 상태 추가
    const [selectedTheme, setSelectedTheme] = useState(defaultTheme);

    const [modalMessage, setModalMessage] = useState(""); // 모달 메시지 상태 추가

    const navigate = useNavigate();

    const [stickers, setStickers] = useState([]);
    const [droppedStickers, setDroppedStickers] = useState([]);

    const [User, setUser] = useState(""); // 모달 메시지 상태 추가

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

    // 서버에서 스티커 목록과 테마 목록 가져오기
    useEffect(() => {
        checkSession();

        axios
            .get("/api/stickers", { withCredentials: true })
            .then((response) => {
                setStickers(response.data || []);
                //console.log('스티커 데이터:', response.data); // 스티커 데이터 확인
            })
            .catch((error) => {
                const errorMessage = error.response?.data;
                setModalMessage(errorMessage); // 모달 메시지 설정
            });
        axios
            .get("/api/themes", { withCredentials: true })
            .then((response) => {
                setThemes(response.data || []);
                // console.log('테마 데이터:', response.data); // 테마 데이터 확인
            })
            .catch((error) => {
                const errorMessage = error.response?.data;
                setModalMessage(errorMessage); // 모달 메시지 설정
            });
    }, []);

    const closeModal = () => setModalMessage(""); // 모달 닫기

    const handleStickerDragStart = (sticker, e) => {
        e.dataTransfer.setData("stickerId", sticker.stickerId);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const stickerId = e.dataTransfer.getData("stickerId");
        const sticker = stickers.find(
            (st) => st.stickerId === parseInt(stickerId)
        );

        if (sticker) {
            const dropX =
                e.clientX - e.currentTarget.getBoundingClientRect().left;
            const dropY =
                e.clientY - e.currentTarget.getBoundingClientRect().top;

            setDroppedStickers((prev) => [
                ...prev,
                {
                    ...sticker,
                    x: dropX,
                    y: dropY,
                },
            ]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleStickerDelete = (index) => {
        setDroppedStickers((prev) => prev.filter((_, i) => i !== index));
    };

    const transName = (name) => {};

    const handleThemeSelect = (theme) => {
        setSelectedTheme(theme || defaultTheme); // 선택된 테마가 없으면 기본 테마로 설정
    };

    const themeStyles = {
        기본: { backgroundColor: "white" },
        검정: { backgroundColor: "#333", color: "white" },
        민트: { backgroundColor: "#a8e6cf", color: "#3a3a3a" },
        양피지: {
            backgroundImage: "url(/images/parchment.png)",
            backgroundSize: "cover",
            color: "#fff",
        },
    };

    const headThemeStyles = {
        기본: { backgroundColor: "white" },
        검정: { backgroundColor: "#333", color: "white" },
        민트: { backgroundColor: "#a8e6cf", color: "#3a3a3a" },
        양피지: {},
    };

    const requiredEmotions = ["기쁨란"];

    const mainEmotions = [
        {
            name: "기쁨란",
            image: "/images/1.png",
            className: "joy",
            subEmotions: [
                "감사하는",
                "기쁨",
                "느긋",
                "만족스러운",
                "신뢰하는",
                "신이 난",
                "안도",
                "자신하는",
                "편안한",
                "흥분",
            ],
        },
        {
            name: "당황란",
            image: "/images/2.png",
            className: "embarrassment",
            subEmotions: [
                "고립된",
                "남의 시선을 의식하는",
                "당황",
                "부끄러운",
                "열등감",
                "외로운",
                "죄책감의",
                "한심한",
                "혐오스러운",
                "혼란스러운",
            ],
        },
        {
            name: "분노란",
            image: "/images/3.png",
            className: "anger",
            subEmotions: [
                "구역질 나는",
                "노여워하는",
                "방어적인",
                "분노",
                "성가신",
                "악의적인",
                "안달하는",
                "좌절한",
                "짜증내는",
                "툴툴대는",
            ],
        },
        {
            name: "불안란",
            image: "/images/4.png",
            className: "anxiety",
            subEmotions: [
                "걱정스러운",
                "당혹스러운",
                "두려운",
                "불안",
                "스트레스 받는",
                "조심스러운",
                "초조한",
                "취약한",
                "혼란스러운",
                "회의적인",
            ],
        },
        {
            name: "슬픔란",
            image: "/images/5.png",
            className: "sadness",
            subEmotions: [
                "낙담한",
                "눈물이 나는",
                "마비된",
                "비통한",
                "슬픔",
                "실망한",
                "염세적인",
                "우울한",
                "환멸을 느끼는",
                "후회되는",
            ],
        },
        {
            name: "상처란",
            image: "/images/6.png",
            className: "wounded",
            subEmotions: [
                "불우한",
                "고립된",
                "괴로워하는",
                "배신당한",
                "버려진",
                "상처",
                "억울한",
                "질투하는",
                "충격 받은",
                "희생된",
            ],
        },
    ];

    const handleMainEmotionClick = (emotion) => {
        setSelectedMainEmotion((prevEmotion) =>
            prevEmotion === emotion ? "" : emotion
        );
    };

    const handleSubEmotionClick = (subEmotion) => {
        setSelectedEmotions((prev) => {
            const isAlreadySelected = prev.some(
                (emotion) => emotion.subEmotion === subEmotion
            );

            // 이미 선택된 감정인지 확인
            if (isAlreadySelected) {
                return prev.filter(
                    (emotion) => emotion.subEmotion !== subEmotion
                ); // 이미 선택된 감정을 제거
            } else {
                // 이미 선택된 감정이 5개 이상이면 더 이상 추가되지 않도록 제한
                if (prev.length >= 5) {
                    setError("감정은 최대 5개까지 선택할 수 있습니다.");
                    return prev; // 새로운 감정을 추가하지 않음
                }
                return [
                    ...prev,
                    { mainEmotion: selectedMainEmotion, subEmotion },
                ]; // 새로운 감정을 추가
            }
        });
    };

    const isRequiredEmotionSelected = () => {
        return selectedEmotions.some(({ mainEmotion }) =>
            requiredEmotions.includes(mainEmotion)
        );
    };

    const filteredSubEmotions = selectedMainEmotion
        ? mainEmotions.find((emotion) => emotion.name === selectedMainEmotion)
            .subEmotions
        : [];

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isRequiredEmotionSelected()) {
            setError(
                "기쁨란을 선택해 오늘 하루에 있었던 사소한 긍정적인 일을 생각해보세요"
            );
            setMessage("");
            return;
        }

        console.log("stickers: ");
        droppedStickers.forEach(({ stickerId, x, y }) => {
            console.log({
                stickerId: stickerId,
                positionX: x,
                positionY: y,
            });
        });

        axios
            .post(
                "/diaries/write",
                {
                    title,
                    content,
                    visibility: isPublic,
                    emotions: selectedEmotions,
                    theme: selectedTheme || "기본", // 선택된 테마가 없으면 'default'로 설정
                    stickers: droppedStickers.map(({ stickerId, x, y }) => ({
                        sticker: { id: stickerId },
                        positionX: isNaN(parseFloat(x)) ? 0.0 : parseFloat(x),
                        positionY: isNaN(parseFloat(y)) ? 0.0 : parseFloat(y),
                        scale: 1.0,
                        rotation: 0.0,
                    })),
                },
                {
                    withCredentials: true,
                }
            )
            .then((response) => {
                //setMessage("일기가 성공적으로 저장되었습니다.");
                //setError('');
                navigate("/my-diary");
            })
            .catch((error) => {
                //console.error('일기 저장 중 오류 발생:', error);
                //setError("일기 저장에 실패했습니다.");
                const errorMessage = error.response?.data;
                setModalMessage(errorMessage); // 모달 메시지 설정
                //setMessage('');
            });
    };

    return (
        <div>
            <div className="write-wrapper">
                <div
                    className="write-container"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    style={{
                        position: "relative",
                        ...(themeStyles[selectedTheme?.themeName] ||
                            themeStyles["기본"]), // 선택된 테마 스타일 적용
                    }}
                >
                    <h2
                        className="write-heading"
                        style={{
                            ...(headThemeStyles[selectedTheme?.themeName] ||
                                themeStyles["기본"]), // 선택된 테마 스타일 적용
                        }}
                    >
                        오늘 너의 하루는?
                    </h2>
                    {/* 작성 폼 */}
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
                            <label
                                className={`visibility-option ${
                                    isPublic ? "selected" : ""
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="visibility"
                                    checked={isPublic}
                                    onChange={() => setIsPublic(true)}
                                    id="public"
                                />
                                <span className="radio-button"></span>
                                공개
                            </label>
                            <label
                                className={`visibility-option ${
                                    !isPublic ? "selected" : ""
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="visibility"
                                    checked={!isPublic}
                                    onChange={() => setIsPublic(false)}
                                    id="private"
                                />
                                <span className="radio-button"></span>
                                비공개
                            </label>
                        </div>
                    </form>

                    {message && (
                        <p className="write-message write-success">{message}</p>
                    )}

                    {droppedStickers.map((sticker, index) => (
                        <img
                            key={index}
                            src={`${sticker.imageUrl}`}
                            alt={sticker.stickerName}
                            className="dropped-sticker"
                            style={{
                                position: "absolute",
                                left: sticker.x,
                                top: sticker.y,
                                width: "50px", // 원본 크기의 50%
                                height: "50px", // 원본 크기의 50%
                            }} //width: '50px', height: '50px' 크기 변경
                            onContextMenu={(e) => {
                                e.preventDefault();
                                handleStickerDelete(index); // 우클릭 시 삭제
                            }}
                        />
                    ))}

                    {/* 모달 표시 */}
                    {modalMessage && (
                        <Modal message={modalMessage} onClose={closeModal} />
                    )}
                </div>

                <div className="sticker-selection">
                    <h3>스티커</h3>
                    <div className="stickers-list">
                        {stickers.map((sticker) => (
                            <img
                                key={sticker.stickerId}
                                src={`${sticker.imageUrl}`}
                                alt={sticker.stickerName}
                                className="sticker-item"
                                draggable
                                onDragStart={(e) =>
                                    handleStickerDragStart(sticker, e)
                                }
                            />
                        ))}
                    </div>

                    {/* 테마 선택 섹션 */}
                    <div className="theme-selection">
                        <h3>테마</h3>
                        <div className="themes-list">
                            {themes.map((theme) => (
                                <button
                                    key={theme.id}
                                    className={`theme-button ${
                                        selectedTheme === theme.id
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() => handleThemeSelect(theme)}
                                >
                                    {theme.themeName}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* 감정 선택 */}
            <div className="emotion-selection">
                <h3>오늘의 감정란을 담아보세요</h3>
                <div className="main-emotions">
                    {mainEmotions.map((emotion) => (
                        <div
                            key={emotion.name}
                            className="main-emotion-category"
                        >
                            <button
                                type="button"
                                className={`main-emotion ${
                                    selectedMainEmotion === emotion.name
                                        ? "active"
                                        : ""
                                } ${emotion.className}`}
                                onClick={() =>
                                    handleMainEmotionClick(emotion.name)
                                }
                            >
                                <img
                                    src={emotion.image}
                                    alt={emotion.name}
                                    className="emotion-image"
                                />
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
                            className={`sub-emotion ${
                                selectedEmotions.some(
                                    (emotion) =>
                                        emotion.subEmotion === subEmotion
                                )
                                    ? "selected"
                                    : ""
                            }`}
                            onClick={() => handleSubEmotionClick(subEmotion)}
                        >
                            {subEmotion}
                        </button>
                    ))}
                </div>
                {error && <p className="write-message write-error">{error}</p>}
                {/* 저장 버튼 */}
                <button
                    type="button" // form 제출을 방지하기 위해 type을 button으로 설정
                    className="write-button"
                    onClick={handleSubmit} // handleSubmit 함수 연결
                >
                    저장
                </button>
            </div>
        </div>
    );
}

export default Write;
