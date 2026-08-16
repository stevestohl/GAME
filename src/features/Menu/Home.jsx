import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Spinner } from 'react-bootstrap'; 
import { useNavigate } from 'react-router-dom';
import { getRandomFunnyName } from '../../funnyNames.js';

import burglarEmpty from '../../assets/logos/Burglar_Alone.png'; 
import burglarWithButton from '../../assets/logos/Burglar_with_Button.png';

// helper functions for creating rooms
import { handleCreateTriviaRoom } from '../Trivia/TriviaCreateButton.jsx';
import { handleCreateTttRoom } from '../TicTacToe/TicTacToeCreateButton.jsx';
import { handleCreatePrompt2Room } from '../Prompt2/Prompt2CreateButton.jsx';
import { handleCreateCouchCast } from '../CouchCast/CouchCastCreate.jsx';

export default function Home() {
    const [playerName, setPlayerName] = useState(getRandomFunnyName);
    const navigate = useNavigate();

    // Loading states
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [isUnderConstruction, setIsUnderConstruction] = useState(false)
    
    // 🥷 Burglar Animation States
    const [burglarActive, setBurglarActive] = useState(false);
    const [isStolen, setIsStolen] = useState(false);

    useEffect(() => {
        // 1. Wait 2 seconds after the page loads, then start the burglar animation
        const initialTimer = setTimeout(() => {
            setBurglarActive(true);

            // 2. The CSS animation takes 3s total. The burglar pauses over the button 
            // at about 1.2 seconds. That's when we hide the button!
            setTimeout(() => {
                setIsStolen(true);
            }, 1200);

        }, 2000); // 2000ms = 2 seconds before he attacks

        return () => clearTimeout(initialTimer);
    }, []);
    
    return (
        <div className="d-flex justify-content-center align-items-center p-1 overflow-hidden" style={{ minHeight: "100vh" }}>
            
            {/* CSS ANIMATION STYLES INJECTED HERE */}
            <style>
                {`
                    .temple-logo {
                        image-rendering: -moz-crisp-edges;
                        image-rendering: -webkit-optimize-contrast;
                        image-rendering: crisp-edges;
                        image-rendering: pixelated;                 
                    }

                    @keyframes burglarHeist {
                        0%   { transform: translate(400px, -50%); opacity: 1; }  /* Starts way off to the right */
                        35%  { transform: translate(0px, -50%); opacity: 1; }    /* Arrives at the button */
                        50%  { transform: translate(0px, -50%); opacity: 1; }    /* Pauses to grab it */
                        85%  { transform: translate(-400px, -50%); opacity: 1; } /* Runs away to the left */
                        100% { transform: translate(-400px, -50%); opacity: 0; } /* Disappears */
                    }
                    .burglar-character {
                        position: absolute;
                        top: 50%;
                        left: 40%;
                        z-index: 999;
                        opacity: 0;
                        pointer-events: none; /* So it doesn't block clicks */
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
                        
                        <Col xs={12}>
                            <Button
                                variant='primary'
                                className='fw-bold w-100 py-2 shadow-sm'
                                disabled={isCreatingRoom}
                                onClick={() => handleCreateCouchCast(playerName, navigate, setIsCreatingRoom)}
                            >
                                Couch Cast<br/>
                                🛋️🛋️
                            </Button>
                        </Col>

                        <Col xs={12}>
                            <Row className="g-2">
                                <Col xs={6}>
                                    <Button 
                                        variant="primary" 
                                        className="fw-bold w-100 h-100 py-2 shadow-sm"
                                        disabled={isCreatingRoom}
                                        onClick={() => handleCreateTttRoom(playerName, navigate, setIsCreatingRoom)}
                                    >
                                        Tic-Tac-Toe<br/>
                                        X O
                                    </Button>
                                </Col>
                                
                                <Col xs={6}>
                                    <Button 
                                        variant="primary" 
                                        className="fw-bold w-100 h-100 py-2 shadow-sm text-white"
                                        disabled={isCreatingRoom}
                                        onClick={() => handleCreateTriviaRoom(playerName, navigate, setIsCreatingRoom)}
                                    >
                                        Trivia <br />
                                        ❔❔
                                    </Button>
                                </Col>

                                <Col xs={6}>
                                    <Button
                                        variant="primary"
                                        className="fw-bold w-100 h-100 py-2 shadow-sm text-white"
                                        disabled={isCreatingRoom}
                                        onClick={() => handleCreatePrompt2Room(playerName, navigate, setIsCreatingRoom)}
                                    >
                                        Prompt <br/> 2
                                    </Button>
                                </Col>

                                {/* 🥷 THE BURGLAR ZONE */}
                                <Col xs={6} className="position-relative overflow-visible">
                                    {/* The Burglar Character */}
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

                                    {/* The Button (Swaps to a dashed outline when stolen) */}
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