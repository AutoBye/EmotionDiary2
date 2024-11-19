import React, { useRef } from 'react';
import { Route, Routes } from 'react-router-dom';
import './Home.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

// 화살표 컴포넌트
const CustomArrow = ({ className, style, onClick, direction }) => (
    <div
        className={`${className} custom-arrow ${direction}`}
        style={{
            ...style,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.5)",
            borderRadius: "50%",
            width: 23,
            height: 23,
            zIndex: 1,
            cursor: "pointer",
            position: "absolute", // 위치를 명확히 고정
            [direction === 'left' ? 'left' : 'right']: 10,
        }}
        onClick={onClick}
    />
);


function Login() {
    return <h2 className="fade-in">로그인</h2>;
}

function WriteDiary() {
    return <h2 className="fade-in">일기 쓰기 페이지</h2>;
}

function MyDiary() {
    return <h2 className="fade-in">나의 일기 페이지</h2>;
}

function PublicDiary() {
    return <h2 className="fade-in">공개된 일기 페이지</h2>;
}

const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <CustomArrow direction="right" />, // 화살표 컴포넌트를 함수형 컴포넌트로 호출
    prevArrow: <CustomArrow direction="left" />,
};

// Home 컴포넌트
function Home() {
    const section1Ref = useRef(null);
    const section2Ref = useRef(null);
    const section3Ref = useRef(null);
    const section4Ref = useRef(null);

    // 스크롤 함수 (첫 번째 섹션만 약간의 오프셋 적용)
    const scrollToSection = (ref, offset = 0) => {
        window.scrollTo({
            top: ref.current.offsetTop + offset, // 기본 스크롤 위치에 오프셋 추가
            behavior: 'smooth'
        });
    };

    return (
        <div>
            <main>
                {/* 섹션으로 이동하는 버튼 */}
                <div className="sticky-wrapper">
                    <div className="button-container">
                        <button onClick={() => scrollToSection(section1Ref, -180)}>소개</button>
                        {/* 첫 섹션 오프셋 -80 적용 */}
                        <button onClick={() => scrollToSection(section2Ref)}>기능소개</button>
                        <button onClick={() => scrollToSection(section3Ref)}>좋은점</button>
                        <button onClick={() => scrollToSection(section4Ref)}>꿀팁</button>
                    </div>
                    <div className="small-line"></div>
                    {/* 헤더 아래의 긴 줄 */}
                </div>

                <Routes>
                    <Route path="/" element={
                        <div>
                            <section ref={section1Ref} className="fade-in section-style section-one">
                                <h1>일기를 쓰면 당신의 <span className="subtext">감정을 알려주는 일기장, 감정란</span></h1>
                                <p className="highlight-text">
                                    오늘 하루 자신의 솔직한 감정을 일기장에 기록하고, AI가 분석한 감정과 자신의 감정을 비교해보세요.
                                </p>
                                <div className="image-container">
                                    <img src="/images/Banner1.png" alt="Banner1" className="banner1-image"/>
                                    <div className="text-container">
                                        <div className="highlight2-text">
                                            <span>'감 정 란'을 골라 오늘 느낀 감정에</span>
                                            <span>이름을 붙여보세요</span>
                                        </div>
                                        <p className="highlight3-text">
                                            모호했던 감정들이 좀 더 분명해지고 기분이 한결 개운해질거에요 !
                                        </p>
                                    </div>
                                    <img src="/images/Banner2.png" alt="Banner2" className="banner2-image"/>
                                </div>
                            </section>


                            <section ref={section2Ref} className="fade-in section-style">
                                <Slider {...sliderSettings}>
                                    <div className="card">
                                        <h2>일기 쓰기</h2>
                                        <p className="explain-text">하루의 감정을 기록해보세요. 나만의 감정 일기를 쉽게 작성할 수 있습니다.</p>
                                    </div>
                                    <div className="card">
                                        <h2>나의 일기</h2>
                                        <p className="explain-text">내가 작성한 일기를 모아 보며 감정의 변화를 확인하세요.</p>
                                    </div>
                                    <div className="card">
                                        <h2>공개된 일기</h2>
                                        <p className="explain-text">AI가 당신의 감정을 분석하여 패턴을 시각화해줍니다.</p>
                                    </div>
                                </Slider>
                            </section>

                            <section ref={section3Ref} className="fade-in section-style">
                                <h2>감정 일기를 쓰면 무엇이 좋을까</h2>
                                <ul className="list-style">
                                    <li>언제 어떤 감정을 느끼는지 알 수 있다</li>
                                    <li>솔직한 감정을 털어 놓을 수 있다</li>
                                    <li>자신도 몰랐던 잠재된 감정을 확인할 수 있다</li>
                                    <li>나를 괴롭게 하는 대상이 무엇인지 알 수 있다</li>
                                    <li>비합리적인 생각을 합리적으로 바꿀 수 있다</li>
                                </ul>
                            </section>

                            <section ref={section4Ref} className="fade-in section-style">
                                <h2>감정 일기 쓰는 방법</h2>
                                <p>감정 일기를 작성하는 것은 간단합니다. 하루 중 느낀 주요 감정들을 기록하고, 감정의 원인과 생각을 정리해보세요.</p>
                                <ul className="list-style">
                                    <li>하루를 돌아보며 가장 인상 깊었던 감정을 선택하세요.</li>
                                    <li>그 감정을 느낀 상황이나 이유를 구체적으로 작성해보세요.</li>
                                    <li>그 감정이 나에게 어떤 영향을 주었는지 적어보세요.</li>
                                    <li>앞으로 비슷한 상황에서 어떻게 대처할지 계획을 세워보세요.</li>
                                </ul>
                            </section>
                        </div>
                    }/>
                    <Route path="/write" element={<WriteDiary/>}/>
                    <Route path="/my-diary" element={<MyDiary/>}/>
                    <Route path="/public-diary" element={<PublicDiary/>}/>
                    <Route path="/login" element={<Login/>}/>
                </Routes>
            </main>
        </div>
    );
}

export default Home;
