import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Spinner, Toast, ToastContainer } from 'react-bootstrap'; 
import { useNavigate, useLocation } from 'react-router-dom';

import burglarEmpty from '../../assets/logos/Burglar_Alone.png'; 
import burglarWithButton from '../../assets/logos/Burglar_with_Button.png';

// Helper functions for existing room creation routines
// import { handleCreateTriviaRoom } from '../Trivia/TriviaCreateButton.jsx';
import Prompt2CreateScreen from '../Prompt2/Prompt2CreateButton.jsx';
import { handleCreateCouchCast } from '../CouchCast/CouchCastCreate.jsx';

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
        const initialTimer = setTimeout(() => {
            setBurglarActive(true);

            setTimeout(() => {
                setIsStolen(true);
            }, 1200);

        }, 2000);

        return () => clearTimeout(initialTimer);
    }, []);

    // 3. Global Scroll Unlock Safety Net
    useEffect(() => {
        // Strip away any leftover Bootstrap modal locks if we navigated backward or unmounted too fast
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = ''; // Bootstrap sometimes adds padding to replace the scrollbar
    }, []);
    
    return (
        <div className="page-container">
            {/* 🍞 Floating Toast Notification (Explicit Viewport Positioning) */}
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
                
                <Card.Body className='p-3'>
                    <div className="my-1 bg-white p-2 rounded-3 d-inline-block shadow-lg">
                        <img 
                            className='temple-logo'
                            src="https://game-temple.org/Game_Temple_Animated.gif?v=2"
                            alt="Animated Game-Temple Logo"
                        />
                    </div>

                    <Row className="g-2 mt-2">
                        {/* Join Room Portal Route */}
                        <Col xs={12}>
                            <Button
                                variant='primary'
                                className='fw-bold w-100 py-2 shadow-sm'
                                disabled={isCreatingRoom}
                                onClick={() => navigate('/join')}
                            >
                                Join a Room
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
                        
                        {/* Couch Cast */}
                        <Col xs={12}>
                            <Button
                                variant='primary'
                                className='fw-bold w-100 py-2 shadow-sm'
                                disabled={isCreatingRoom}
                                onClick={() => handleCreateCouchCast(null, navigate, setIsCreatingRoom)}
                                // onClick={() => setIsUnderConstruction(true)}
                            >
                                Couch Cast<br/>
                                🛋️🛋️
                            </Button>
                        </Col>

                        <Col xs={12}>
                            <Row className="g-2">
                                {/* Tic-Tac-Toe Setup Route */}
                                <Col xs={6}>
                                    <Button 
                                        variant="primary" 
                                        className="fw-bold w-100 h-100 py-2 shadow-sm"
                                        disabled={isCreatingRoom}
                                        onClick={() => navigate('/tictactoe-create')}
                                    >
                                        Tic-Tac-Toe<br/>
                                        X O
                                    </Button>
                                </Col>
                                
                                {/* Trivia */}
                                <Col xs={6}>
                                    <Button 
                                        variant="primary" 
                                        className="fw-bold w-100 h-100 py-2 shadow-sm text-white"
                                        disabled={isCreatingRoom}
                                        onClick={() => navigate('/trivia-create')}
                                    >
                                        Trivia <br />
                                        ❔❔
                                    </Button>
                                </Col>

                                {/* Prompt 2 */}
                                <Col xs={6}>
                                    <Button
                                        variant="primary"
                                        className="fw-bold w-100 h-100 py-2 shadow-sm text-white"
                                        disabled={isCreatingRoom}
                                        onClick={() => navigate('/prompt2-create')}
                                    >
                                        Prompt <br/> 2
                                    </Button>
                                </Col>

                                {/* 🥷 THE BURGLAR ZONE */}
                                <Col xs={6} className="position-relative overflow-visible">
                                    <div className={`burglar-ltr ${burglarActive ? 'active' : ''}`}>
                                        <img 
                                            src={isStolen ? burglarWithButton : burglarEmpty} 
                                            alt="Button Burglar"
                                            style={{ width: '60px', height: 'auto', mixBlendMode: 'multiply' }} 
                                        />
                                    </div>

                                    {!isStolen ? (
                                        <Button 
                                            variant="primary" 
                                            className="fw-bold w-100 h-100 py-2 shadow-sm"
                                        >
                                            Button<br/>
                                            🔘🔘
                                        </Button>
                                    ) : (
                                        <div className="w-100 h-100 py-2 rounded d-flex flex-column justify-content-center align-items-center stolen-slot fw-bold small">
                                            <span>Stolen!</span>
                                            <span className="fs-5">💨</span>
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Modals */}
            <Modal show={isCreatingRoom} backdrop="static" keyboard={false} centered>
                <Modal.Body className='d-flex flex-column align-items-center justify-content-center p-4'>
                    <Spinner animation='border' variant="primary" className='mb-3'/>
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