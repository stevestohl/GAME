import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Toast, ToastContainer } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import couchCastImg from '../../assets/logos/Couch_Cast_Button.jpg';
import joinImg from '../../assets/logos/Join_Room_Button.jpeg';
import TriviaCastTile from '../TriviaCast/TriviaCastTile.jsx';
import { ListCastTile } from '../Lists/ListTiles.jsx';
import ReshuffledTile from '../Reshuffled/ReshuffledTile.jsx';
import GameRow from './GameRow.jsx';
import burglarEmpty from '../../assets/logos/Burglar_Alone.png';
import burglarWithButton from '../../assets/logos/Burglar_with_Button.png';

// 📺 Step icons: white line drawings, same style as the game tiles
const STEP_ICONS = {
    // A spare device beaming to a TV
    mirror: (
        <>
            <rect x="34" y="14" width="56" height="40" rx="5" />
            <path d="M62 54 V62 M50 62 H74" />
            <rect x="8" y="38" width="20" height="34" rx="4" />
            <path d="M15 66 H21" />
            <path d="M32 44 a10 10 0 0 1 8 -6" className="gt-wave w1" />
            <path d="M32 34 a20 20 0 0 1 14 -10" className="gt-wave w2" />
        </>
    ),
    // Three game tiles, one picked
    choose: (
        <>
            <rect x="10" y="20" width="22" height="22" rx="5" className="gt-tile t1" />
            <rect x="38" y="20" width="22" height="22" rx="5" className="gt-tile t2" />
            <rect x="66" y="20" width="22" height="22" rx="5" className="gt-tile t3" />
            <path d="M44 50 L49 64 L52 57 L59 60 Z" className="gt-pointer" />
        </>
    ),
    // A TV with cast waves: the game is on, friends join
    cast: (
        <>
            <g className="gt-cast-tv">
                <rect x="14" y="10" width="70" height="48" rx="6" />
                <path d="M49 58 V66 M37 66 H61" />
            </g>
            <circle cx="24" cy="49" r="2.5" className="gt-cast-dot" />
            <path d="M24 40 a9 9 0 0 1 9 9" className="gt-wave w1" />
            <path d="M24 31 a18 18 0 0 1 18 18" className="gt-wave w2" />
            <path d="M24 22 a27 27 0 0 1 27 27" className="gt-wave w3" />
        </>
    ),
};

const STEPS = [
    {
        icon: 'mirror',
        title: 'Mirror your TV',
        text: 'Grab an extra phone, tablet or laptop and screen-mirror it to your TV (AirPlay, Chromecast, Smart View or an HDMI cable). That device becomes the game screen.',
    },
    {
        icon: 'choose',
        title: 'Choose a game',
        text: 'On that same device, pick one of the games below.',
    },
    {
        icon: 'cast',
        title: 'Start & invite friends',
        text: 'Start the game, then everyone scans the QR code on the TV (or taps Join Room and types the code) to play from their own phone.',
    },
];

function HowToCast() {
    return (
        <Card className="border-0 shadow-sm gt-cast-steps">
            <Card.Body className="p-2">
                <div className="gt-cast-steps-title">How to play on your TV</div>
                <ol className="gt-cast-steps-list">
                    {STEPS.map((step, i) => (
                        <li key={step.icon} className="gt-cast-step">
                            <span className="gt-cast-step-icon" aria-hidden="true">
                                <svg viewBox="0 0 98 80">{STEP_ICONS[step.icon]}</svg>
                                <span className="gt-cast-step-num">{i + 1}</span>
                            </span>
                            <span className="text-start">
                                <span className="d-block fw-bold text-dark">Step {i + 1}: {step.title}</span>
                                <span className="d-block small text-secondary lh-sm">{step.text}</span>
                            </span>
                        </li>
                    ))}
                </ol>
            </Card.Body>
        </Card>
    );
}

/**
 * 📺 Game-Cast: the landing page. Games that put a shared screen on the TV,
 * with a quick "how to cast" guide at the top.
 */
export default function GameCastHome() {
    const navigate = useNavigate();
    const location = useLocation();

    // 🍞 "That game has ended" and friends land here
    const [toastMsg, setToastMsg] = useState(location.state?.toastMessage || '');
    useEffect(() => {
        if (location.state?.toastMessage) {
            setToastMsg(location.state.toastMessage);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // 🥷 The button burglar sneaks in and steals the divider (same as Game-Temple)
    const [burglarActive, setBurglarActive] = useState(false);
    const [isStolen, setIsStolen] = useState(false);
    useEffect(() => {
        let stealTimer;
        const initialTimer = setTimeout(() => {
            setBurglarActive(true);
            stealTimer = setTimeout(() => setIsStolen(true), 1200);
        }, 2000);
        return () => {
            clearTimeout(initialTimer);
            clearTimeout(stealTimer);
        };
    }, []);

    // Global Scroll Unlock Safety Net (same as Game-Temple)
    useEffect(() => {
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
    }, []);

    const imgBtnClass = 'glass-btn w-100 h-100 p-0 overflow-hidden shadow-sm border-0';
    const gameImgBtnClass = 'glass-btn w-100 p-0 overflow-hidden shadow-sm border-0 align-self-center';
    const squareStyle = { aspectRatio: '1 / 1' };
    const imgStyle = { objectFit: 'cover', display: 'block' };

    return (
        <div className="page-container">
            <ToastContainer style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 99999 }}>
                <Toast show={!!toastMsg} onClose={() => setToastMsg('')} delay={4000} autohide bg="dark">
                    <Toast.Body className="fw-bold text-white text-center px-4 py-2">👋 {toastMsg}</Toast.Body>
                </Toast>
            </ToastContainer>

            <Card className="main-card">
                <Card.Header className="main-card-header">GAME-CAST</Card.Header>

                <Card.Body className="p-2">
                    <HowToCast />

                    <Row className="g-2 mt-2">
                        <Col xs={12}>
                            <Button
                                variant="primary"
                                className={imgBtnClass}
                                onClick={() => navigate('/join')}
                                aria-label="Join a room"
                                style={{ '--shimmer-delay': '0s' }}
                            >
                                <img src={joinImg} alt="Join a Room" className="w-100 h-100" style={imgStyle} />
                            </Button>
                        </Col>

                        {/* OR / Cast a New Game — 🥷 the burglar steals the tile behind this text */}
                        <Col xs={12} className="d-flex align-items-center mb-1 position-relative">
                            <hr className="flex-grow-1 my-0 opacity-25" />
                            <span className={`gt-loot mx-2 small fw-bold text-center ${isStolen ? 'stolen' : ''}`}>
                                OR <br />
                                Cast a New Game
                            </span>
                            <hr className="flex-grow-1 my-0 opacity-25" />

                            <div className={`burglar-divider ${burglarActive ? 'active' : ''}`}>
                                <img
                                    src={isStolen ? burglarWithButton : burglarEmpty}
                                    alt=""
                                    aria-hidden="true"
                                    style={{ width: '60px', height: 'auto', mixBlendMode: 'multiply' }}
                                />
                            </div>
                        </Col>

                        <Col xs={12}>
                            <Row className="g-1">
                                {/* 🛋️ Couch Cast — text left, button right */}
                                <GameRow
                                    title="Couch Cast"
                                    players="3+ players"
                                    description="An Apples to Apples–style party game. A rotating judge reads a prompt and everyone secretly plays their best card from their phone."
                                >
                                    <Button
                                        variant="primary"
                                        className={gameImgBtnClass}
                                        onClick={() => navigate('/couchcast-decks')}
                                        aria-label="Choose a Couch Cast deck"
                                        style={{ '--shimmer-delay': '0.4s', ...squareStyle }}
                                    >
                                        <img src={couchCastImg} alt="Couch Cast" className="w-100 h-100" style={imgStyle} />
                                    </Button>
                                </GameRow>

                                {/* 📺❔ Trivia Cast — button left, text right */}
                                <GameRow
                                    flip
                                    title="Trivia Cast"
                                    players="2+ players"
                                    description="Trivia night on the big screen. Questions show on the TV and everyone answers on their phone."
                                >
                                    <Button
                                        variant="primary"
                                        className={gameImgBtnClass}
                                        onClick={() => navigate('/triviacast-decks')}
                                        aria-label="Set up a Trivia Cast game"
                                        style={{ '--shimmer-delay': '0.8s', ...squareStyle }}
                                    >
                                        <TriviaCastTile />
                                    </Button>
                                </GameRow>

                                {/* 📺📝 List Cast — text left, button right */}
                                <GameRow
                                    title="List Cast"
                                    players="3+ players"
                                    description="Write a list on your phone and try not to match anyone. Matching answers get crossed out on the TV, then everyone votes on the rest."
                                >
                                    <Button
                                        variant="primary"
                                        className={gameImgBtnClass}
                                        onClick={() => navigate('/listcast-setup')}
                                        aria-label="Set up a List Cast game"
                                        style={{ '--shimmer-delay': '1.2s', ...squareStyle }}
                                    >
                                        <ListCastTile />
                                    </Button>
                                </GameRow>

                                {/* 🔀 Couch Cast Re-Shuffled (experimental) — button left, text right */}
                                <GameRow
                                    flip
                                    title="Couch Cast Re-Shuffled"
                                    players="3+ players"
                                    description="Our new take on Couch Cast, still in testing. Your hand always has cards that fit the prompt, and each card rewords itself to read right in the blank."
                                >
                                    <Button
                                        variant="primary"
                                        className={gameImgBtnClass}
                                        onClick={() => navigate('/reshuffled-decks')}
                                        aria-label="Choose a Couch Cast Re-Shuffled deck"
                                        style={{ '--shimmer-delay': '1.6s', ...squareStyle }}
                                    >
                                        <ReshuffledTile />
                                    </Button>
                                </GameRow>
                            </Row>
                        </Col>

                        <Col xs={12} className="text-center mt-2 mb-1">
                            <span className="small text-muted">No TV? </span>
                            <Button variant="link" size="sm" className="p-0 fw-bold align-baseline" onClick={() => navigate('/temple')}>
                                Play phone-only games on Game-Temple →
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
}
