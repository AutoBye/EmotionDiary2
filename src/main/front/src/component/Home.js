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
            position: "absolute",
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
    autoplay: true, // 자동 재생 활성화
    autoplaySpeed: 3000, // 자동 재생 속도 (ms)
    pauseOnHover: false, // 마우스 오버 시 자동 재생 중단 방지
    nextArrow: <CustomArrow direction="right" />,
    prevArrow: <CustomArrow direction="left" />,
};

function Home() {
    const section1Ref = useRef(null);
    const section2Ref = useRef(null);
    const section3Ref = useRef(null);
    const section4Ref = useRef(null);

    // 스크롤 함수
    const scrollToSection = (ref, offset = 0) => {
        window.scrollTo({
            top: ref.current.offsetTop + offset,
            behavior: 'smooth'
        });
    };

    // 화면 상단으로 가는 함수
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div>
            <main>
                <div className="sticky-wrapper">
                    <div className="button-container">
                        <button onClick={() => scrollToSection(section1Ref, -180)}>소개</button>
                        <button onClick={() => scrollToSection(section2Ref)}>기능소개</button>
                        <button onClick={() => scrollToSection(section3Ref)}>감정란의 장점</button>
                        <button onClick={() => scrollToSection(section4Ref)}>일기 적는 꿀팁</button>
                    </div>
                    <div className="small-line"></div>
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
                                            <span>감 정 란을 골라 오늘 느낀 감정에</span>
                                            <span>이름을 붙여보세요</span>
                                        </div>
                                        <p className="highlight3-text">
                                            모호했던 감정들이 좀 더 분명해지고 기분이 한결 개운해질거에요 !
                                        </p>
                                    </div>
                                    <img src="/images/Banner2.png" alt="Banner2" className="banner2-image"/>
                                </div>
                            </section>
                            <section ref={section2Ref} className="fade-in section-style2">
                                <Slider {...sliderSettings}>
                                    <div className="card">
                                        <div className="card-images">
                                            <img src="/images/inst1.png" alt="일기 쓰기" className="card-image"/>
                                            <img src="/images/inst2.png" alt="일기 쓰기" className="card-image"/>
                                        </div>
                                        <h2 className="slider1">일기 쓰기</h2>
                                        <p className="explain-text">오늘 나의 하루를 기록하고 내가 느꼈던 감정을 골라봐요</p>
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
                            <section ref={section3Ref} className="fade-in section-style3">
                                <h2>감정란을 사용하면 어떤 점이 좋을까</h2>
                                <ul className="list-style">
                                    <li>😲 언제 어떤 감정을 느끼는지 기록할 수 있어요</li>
                                    <li>😀 오늘 하루에 있었던 사소한 긍정적인 일을 생각해 볼 수 있어요</li>
                                    <li>🤖 AI가 나의 일기를 읽고 감정을 분석해줘요</li>
                                    <li>👨‍⚕️ 정신건강 전문가와 상담할 때, 자신의 감정 변화를 시각적으로 보여줄 수 있어 유용해요</li>
                                    <li>😳 나의 이야기를 공감 받을 수 있고, 다른 사람의 이야기를 공감 할 수 있어요</li>
                                </ul>
                            </section>
                            <section ref={section4Ref} className="fade-in section-style4" style={{ backgroundImage: "url('/images/Banner3.jpg')" }}>
                                <h2 className="how-use">감정란 사용 방법</h2>
                                <ul className="list-style2">
                                    <li>하루를 돌아보며 가장 인상 깊었던 감정들을 선택하세요</li>
                                    <li>그 감정을 느낀 상황이나 이유를 구체적으로 작성해보세요</li>
                                    <li>그 감정이 나에게 어떤 영향을 주었는지 적어보세요</li>
                                    <li>앞으로 비슷한 상황에서 어떻게 대처할지 계획을 세워보세요</li>
                                </ul>
                            </section>
                        </div>
                    }/>
                    <Route path="/write" element={<WriteDiary/>}/>
                    <Route path="/my-diary" element={<MyDiary/>}/>
                    <Route path="/public-diary" element={<PublicDiary/>}/>
                    <Route path="/login" element={<Login/>}/>
                </Routes>

                {/* 화면 상단으로 가는 버튼 */}
                <button className="scroll-to-top" onClick={scrollToTop}>
                    ↑
                </button>
            </main>
        </div>
    );
}

export default Home;
