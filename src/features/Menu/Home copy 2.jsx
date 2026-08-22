import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Spinner } from 'react-bootstrap'; 
import { useNavigate } from 'react-router-dom';

import burglarEmpty from '../../assets/logos/Burglar_Alone.png'; 
import burglarWithButton from '../../assets/logos/Burglar_with_Button.png';

// Helper functions for existing room creation routines
import { handleCreateTriviaRoom } from '../Trivia/TriviaCreateButton.jsx';
import { handleCreatePrompt2Room } from '../Prompt2/Prompt2CreateButton.jsx';
import { handleCreateCouchCast } from '../CouchCast/CouchCastCreate.jsx';

export default function Home() {
    const navigate = useNavigate();

    // Loading states
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [isUnderConstruction, setIsUnderConstruction] = useState(false);
    
    // 🥷 Burglar Animation States
    const [burglarActive, setBurglarActive] = useState(false);
    const [isStolen, setIsStolen] = useState(false);

    useEffect(() => {
        // 1. Wait 2 seconds after the page loads, then start the burglar animation
        const initialTimer = setTimeout(() => {
            setBurglarActive(true);

            // 2. The burglar pauses over the button at ~1.2s to steal it
            setTimeout(() => {
                setIsStolen(true);
            }, 1200);

        }, 2000);

        return () => clearTimeout(initialTimer);
    }, []);
    
    return (
        <div className="d-flex justify-content-center align-items-start p-1 overflow-hidden" style={{ minHeight: "100vh" }}>
            
            {/* CSS ANIMATION STYLES */}
            <style>
                {`
                    .temple-logo {
                        image-rendering: -moz-crisp-edges;
                        image-rendering: -webkit-optimize-contrast;
                        image-rendering: crisp-edges;
                        image-rendering: pixelated;                 
                    }

                    @keyframes burglarHeist {
                        0%   { transform: translate(400px, -50%); opacity: 1; }
                        35%  { transform: translate(0px, -50%); opacity: 1; }
                        50%  { transform: translate(0px, -50%); opacity: 1; }
                        85%  { transform: translate(-400px, -50%); opacity: 1; }
                        100% { transform: translate(-400px, -50%); opacity: 0; }
                    }
                    .burglar-character {
                        position: absolute;
                        top: 50%;
                        left: 40%;
                        z-index: 999;
                        opacity: 0;
                        pointer-events: none;
                    }
                    .burglar-running {
                        animation: burglarHeist 3s ease-in-out forwards;
                    }
                    .stolen-slot {
                        border: 2px dashed #ccc;
                        background-color: transparent;
                        color: #aaa;
                    }
                `}
            </style>

            <Card className='text-center shadow-lg border-0 position-relative' style={{ maxWidth: "450px", width: "100%" }}>
                <Card.Header 
                    as="h5" 
                    className="d-flex align-items-center justify-content-center border-0 py-2 fw-black tracking-widest text-uppercase fs-6"
                    style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }}>
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
                                        onClick={() => handleCreateTriviaRoom(null, navigate, setIsCreatingRoom)}
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
                                        onClick={() => handleCreatePrompt2Room(null, navigate, setIsCreatingRoom)}
                                    >
                                        Prompt <br/> 2
                                    </Button>
                                </Col>

                                {/* 🥷 THE BURGLAR ZONE */}
                                <Col xs={6} className="position-relative overflow-visible">
                                    <div className={`burglar-character ${burglarActive ? 'burglar-running' : ''}`}>
                                        <img 
                                            src={isStolen ? burglarWithButton : burglarEmpty} 
                                            alt="Button Burglar"
                                            style={{ 
                                                width: '60px', 
                                                height: 'auto',
                                                mixBlendMode: 'multiply' 
                                            }} 
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