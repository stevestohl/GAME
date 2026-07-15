import React, { useState } from 'react';
import { Card, Row, Col, Button, Form, Modal, Spinner } from 'react-bootstrap'; 
import { useNavigate } from 'react-router-dom';
import UniversalJoinForm from '../../UniversalJoinForm.jsx';
import { getRandomFunnyName } from '../../funnyNames.js';

// helper functions for creating rooms and socket ID's
import { handleCreateTriviaRoom } from '../Trivia/TriviaCreateButton.jsx';
import { handleCreateTttRoom } from '../TicTacToe/TicTacToeCreateButton.jsx';
import { handleCreatePrompt2Room } from '../Prompt2/Prompt2CreateButton.jsx';

// ROOMCODES ARE GENERATED IN EACH INDIVIDULE Nampsapce socket for each app
export default function Home() {
    const [playerName, setPlayerName] = useState(getRandomFunnyName);
    const navigate = useNavigate();

    //Loading state for TicTacToe Room Creation
    const[isCreatingRoom, setIsCreatingRoom ]= useState(false)
    const[showComingSoon, setShowComingSoon] =useState(false)
    
// Navigate straight to the game board
    //navigate(`/tictactoe?room=${newRoomCode}&role=host&name=${encodeURIComponent(nameToUse)}`);

    return (
        /* Match outer layout and padding of BarHome */
        <div className="d-flex justify-content-center align-items-center p-1">
            {/* Match maxWidth to 450px so cards are identical size */}
            <Card className='text-center shadow-lg border-0' style={{ maxWidth: "450px", width: "100%" }}>
                <Card.Header 
                    as="h5" 
                    className="d-flex align-items-center justify-content-center border-0 py-2 fw-black tracking-widest text-uppercase fs-6"
                    style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }}>
                    GAME-TEMPLE.ORG
                </Card.Header>
                
                <Card.Body className='p-1'>
                    <div className="my-1 bg-white p-2 rounded-3 d-inline-block shadow-lg">
                        <img 
                            src="https://game-temple.org/Game_Temple_Animated.gif"
                            alt="Animated Game-Temple Logo"
                            style={{ maxWidth: "130px", height: "auto" }}
                        />
                    </div>

                    {/* MULTIPLAYER ZONE CARD */}
                    <Card className="border p-1 bg-body-secondary shadow-sm rounded-3">
                        <Card.Title className="text-muted text-center fw-bold small mb-1 tracking-wider">
                            Multi-Player Games
                        </Card.Title>
                        <hr className='my-1 text-muted opacity-25'/>
                        
                        {/* STEP 1: Universal Player Name input */}
                        <Form.Group className="mb-3 text-start" controlId="formPlayerName">
                            <Form.Label className="fw-bold text-muted small mb-1">Player Name</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="" 
                                value={playerName} 
                                onChange={(e) => setPlayerName(e.target.value)}
                                autoComplete="off"
                                className="py-2" 
                            />
                        </Form.Group>

                        {/* STEP 2: Mobile Stacked Layout (Join then Create) */}
                        <Row className="g-2">
                            <Col xs={12} className="text-start">
                                <Form.Label className="fw-bold text-muted small mb-1 ps-1">Join Active Room</Form.Label>
                                <UniversalJoinForm playerName={playerName} />
                            </Col>

                            <Col xs={12} className="d-flex align-items-center mt-1 mb-0">
                                <hr className="flex-grow-1 my-0 opacity-25" />
                                <span className="mx-2 my-2 text-muted small fw-bold text-center">
                                    OR <br />
                                    Create New Room
                                </span>
                                <hr className="flex-grow-1 my-0 opacity-25" />
                            </Col>
                            
                            {/* Create Buttons Section Grid */}
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

                                            // ---------Reset this when in Prod-------
                                            onClick={() => handleCreatePrompt2Room(playerName, navigate, setIsCreatingRoom)}
                                            // onClick={() => setShowComingSoon(true)}
                                            // ----------------
                                            
                                        >
                                            Prompt <br/> 2
                                        </Button>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Card>
                </Card.Body>
            </Card>
            <Modal
                show={isCreatingRoom}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Body className='d-flex flex-column align-items-center justify-content-center p-4'>
                    <Spinner animation='border' variant="primary" className='mb-3'/>
                    <h4 className='fw-bold text-dark'>Creating Room...</h4>
                    <p className='text-muted small mb-0'>
                        Waking up game server...
                    </p>
                </Modal.Body>
            </Modal>

            <Modal
                show={showComingSoon}
                onHide={() => setShowComingSoon(false)} // Allows closing by clicking backdrop
                centered
            >
                <Modal.Body className='d-flex flex-column align-items-center justify-content-center p-4 text-center'>
                    <div className="fs-1 mb-2">🚧</div>
                    <h4 className='fw-bold text-dark'>Prompt 2</h4>
                    <p className='text-muted small mb-4'>
                        This game mode is currently under construction deep within the temple layout. Stay tuned!
                    </p>
                    <Button 
                        variant="primary" 
                        className="fw-bold px-4 shadow-sm"
                        onClick={() => setShowComingSoon(false)}
                    >
                        Got It
                    </Button>
                </Modal.Body>
            </Modal>
        </div>
    );
}