import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import couchCastImg from '../../assets/logos/Couch_Cast_Button.jpg';
import prompt2Img from '../../assets/logos/Prompt_2_Button.jpeg';
import tttImg from '../../assets/logos/Tic_Tac_Toe_Button.jpeg';
import triviaImg from '../../assets/logos/Trivia_Button.jpeg';
import joinImg from '../../assets/logos/Join_Room_Button.jpeg';
import HeroLogo from './HeroLogo.jsx';

import burglarEmpty from '../../assets/logos/Burglar_Alone.png';
import burglarWithButton from '../../assets/logos/Burglar_with_Button.png';

// Helper functions for existing room creation routines
// import { handleCreateTriviaRoom } from '../Trivia/TriviaCreateButton.jsx';
import Prompt2CreateScreen from '../Prompt2/Prompt2CreateButton.jsx';
import { handleCreateCouchCast } from '../CouchCast/CouchCastCreate.jsx';

/**
 * One game "row": a light card with a description on one side and a square
 * button on the other. `flip` swaps the sides so rows alternate down the page.
 */
function GameRow({ title, players, description, flip, children }) {
    const info = (
        <Col xs={7} className="d-flex flex-column justify-content-center text-start">
            <div className="fw-bold mb-1">
                {title}
                {players && <span className="text-muted fw-normal small ms-2">{players}</span>}
            </div>
            <div className="small text-secondary lh-sm">{description}</div>
        </Col>
    );

    const action = (
        <Col xs={5} className="d-flex position-relative overflow-visible">
            {children}
        </Col>
    );

    return (
        <Col xs={12}>
            <Card className="bg-light border-0 shadow-sm">
                {/* Tighter padding inside each game card */}
                <Card.Body className="p-1">
                    <Row className="g-1 align-items-stretch">
                        {flip ? <>{action}{info}</> : <>{info}{action}</>}
                    </Row>
                </Card.Body>
            </Card>
        </Col>
    );
}

export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();

    // Loading states
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [isUnderConstruction, setIsUnderConstruction] = useState(false);

    // 🍞 Read directly from location.state on initial load
    const [toastMsg, setToastMsg] = useState(location.state?.toastMessage || '');

    // 🥷 Burglar Animation States
    const [burglarActive, setBurglarActive] = useState(false);
    const [isStolen, setIsStolen] = useState(false);

    // 1. Sync toast state & clear browser history state silently (prevents re-triggering on F5)
    useEffect(() => {
        if (location.state?.toastMessage) {
            setToastMsg(location.state.toastMessage);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // 2. Burglar Animation Timer
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

    // 3. Global Scroll Unlock Safety Net
    useEffect(() => {
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
    }, []);

    // Shared button styling: fills the full height of its card row
    const gameBtnClass = 'glass-btn fw-bold w-100 h-100 py-3 shadow-sm text-white d-flex flex-column align-items-center justify-content-center';

    // Join button: the picture fills the whole button edge to edge
    const imgBtnClass = 'glass-btn w-100 h-100 p-0 overflow-hidden shadow-sm border-0';

    // Game buttons: sized by their own width so they stay square (no h-100)
    const gameImgBtnClass = 'glass-btn w-100 p-0 overflow-hidden shadow-sm border-0 align-self-start';
    const squareStyle = { aspectRatio: '1 / 1' };

    const imgStyle = { objectFit: 'cover', display: 'block' };

    return (
        <div className="page-container">
            {/* 🍞 Floating Toast Notification */}
            <ToastContainer
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 99999
                }}
            >
                <Toast
                    show={!!toastMsg}
                    onClose={() => setToastMsg('')}
                    delay={4000}
                    autohide
                    bg="dark"
                >
                    <Toast.Body className="fw-bold text-white text-center px-4 py-2">
                        👋 {toastMsg}
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <Card className='main-card'>
                <Card.Header className="main-card-header">
                    GAME-TEMPLE.ORG
                </Card.Header>

                {/* Tighter padding between the main white card and the inner content */}
                <Card.Body className='p-2'>
                    <div className="my-1">
                        <HeroLogo size={260} />
                    </div>

                    <Row className="g-2 mt-2">
                        {/* Join Room Portal Route */}
                        <Col xs={12}>
                            <Button
                                variant='primary'
                                className={imgBtnClass}
                                disabled={isCreatingRoom}
                                onClick={() => navigate('/join')}
                                aria-label="Join a room"
                                style={{ '--shimmer-delay': '0s' }}
                            >
                                <img src={joinImg} alt="Join a Room" className="w-100 h-100" style={imgStyle} />
                            </Button>
                        </Col>

                        <Col xs={12} className="d-flex align-items-center mb-1">
                            <hr className="flex-grow-1 my-0 opacity-25" />
                            <span className="mx-2 text-muted small fw-bold text-center">
                                OR <br />
                                Create New Room
                            </span>
                            <hr className="flex-grow-1 my-0 opacity-25" />
                        </Col>

                        {/* 🎮 Game cards — tighter spacing between rows */}
                        <Col xs={12}>
                            <Row className="g-1">
                                {/* 🛋️ Couch Cast — text left, button right */}
                                <GameRow
                                    title="Couch Cast"
                                    players="3+ players"
                                    description="An Apples to Apples–style party game. A rotating judge reads a prompt and everyone secretly plays their best card from their phone. Cast one extra device to the TV as the main screen."
                                >
                                    <Button
                                        variant="primary"
                                        className={gameImgBtnClass}
                                        disabled={isCreatingRoom}
                                        onClick={() => handleCreateCouchCast(null, navigate, setIsCreatingRoom)}
                                        aria-label="Create a Couch Cast room"
                                        style={{ '--shimmer-delay': '0.4s', ...squareStyle }}
                                    >
                                        <img src={couchCastImg} alt="Couch Cast" className="w-100 h-100" style={imgStyle} />
                                    </Button>
                                </GameRow>

                                {/* ❔ Trivia — button left, text right */}
                                <GameRow
                                    flip
                                    title="Trivia"
                                    players="2+ players"
                                    description="Put your knowledge to the test. Everyone answers the same questions on their own device, and the best scores rise to the top of the leaderboard."
                                >
                                    <Button
                                        variant="primary"
                                        className={gameImgBtnClass}
                                        disabled={isCreatingRoom}
                                        onClick={() => navigate('/trivia-create')}
                                        aria-label="Create a Trivia room"
                                        style={{ '--shimmer-delay': '0.8s', ...squareStyle }}
                                    >
                                        <img src={triviaImg} alt="Trivia" className="w-100 h-100" style={imgStyle} />
                                    </Button>
                                </GameRow>

                                {/* Prompt 2 — text left, button right */}
                                <GameRow
                                    title="Prompt 2"
                                    players="3+ players"
                                    description="All the fun of Couch Cast, no TV required. A rotating judge reads a prompt, everyone plays their best card, and the whole game runs right on your phones."
                                >
                                    <Button
                                        variant="primary"
                                        className={gameImgBtnClass}
                                        disabled={isCreatingRoom}
                                        onClick={() => navigate('/prompt2-create')}
                                        aria-label="Create a Prompt 2 room"
                                        style={{ '--shimmer-delay': '1.2s', ...squareStyle }}
                                    >
                                        <img src={prompt2Img} alt="Prompt 2" className="w-100 h-100" style={imgStyle} />
                                    </Button>
                                </GameRow>

                                {/* ❌⭕ Tic-Tac-Toe — button left, text right */}
                                <GameRow
                                    flip
                                    title="Tic-Tac-Toe"
                                    players="2 players"
                                    description="The timeless classic, head to head. Take turns on your own devices — first to get three in a row wins."
                                >
                                    <Button
                                        variant="primary"
                                        className={gameImgBtnClass}
                                        disabled={isCreatingRoom}
                                        onClick={() => navigate('/tictactoe-create')}
                                        aria-label="Create a Tic-Tac-Toe room"
                                        style={{ '--shimmer-delay': '1.6s', ...squareStyle }}
                                    >
                                        <img src={tttImg} alt="Tic-Tac-Toe" className="w-100 h-100" style={imgStyle} />
                                    </Button>
                                </GameRow>

                                {/* 🥷 THE BURGLAR ZONE — temporarily disabled */}
                                {/*
                                <GameRow
                                    title="???"
                                    description="A brand-new game is waiting right here... if you can grab it fast enough."
                                >
                                    <div className={`burglar-ltr ${burglarActive ? 'active' : ''}`}>
                                        <img
                                            src={isStolen ? burglarWithButton : burglarEmpty}
                                            alt="Button Burglar"
                                            style={{ width: '60px', height: 'auto', mixBlendMode: 'multiply' }}
                                        />
                                    </div>

                                    {!isStolen ? (
                                        <Button variant="primary" className={gameBtnClass} style={{ '--shimmer-delay': '1.6s' }}>
                                            Button
                                            <span>🔘🔘</span>
                                        </Button>
                                    ) : (
                                        <div className="w-100 h-100 py-3 rounded d-flex flex-column justify-content-center align-items-center stolen-slot fw-bold small">
                                            <span>Stolen!</span>
                                            <span className="fs-5">💨</span>
                                        </div>
                                    )}
                                </GameRow>
                                */}
                            </Row>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Modals */}
            <Modal show={isCreatingRoom} backdrop="static" keyboard={false} centered>
                <Modal.Body className='d-flex flex-column align-items-center justify-content-center p-4'>
                    <Spinner animation='border' variant="primary" className='mb-3' />
                    <h4 className='fw-bold text-dark'>Creating Room...</h4>
                    <p className='text-muted small mb-0'>
                        Waking up game server...
                    </p>
                </Modal.Body>
            </Modal>

            <Modal show={isUnderConstruction} onHide={() => setIsUnderConstruction(false)} centered>
                <Modal.Body className='d-flex flex-column align-items-center justify-content-center p-4 text-center'>
                    <h5 className="fw-bold mb-3">🚧 Under Construction 🚧</h5>
                    <p className='text-muted medium mb-4'>
                        This game is currently being built. Check back soon!
                    </p>
                    <Button variant="primary" onClick={() => setIsUnderConstruction(false)}>
                        Close
                    </Button>
                </Modal.Body>
            </Modal>
        </div>
    );
}