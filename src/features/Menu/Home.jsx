import React, { useState } from 'react';
import { Card, Row, Col, Button, Form } from 'react-bootstrap'; 
import { useNavigate } from 'react-router-dom';
import { handleCreateTttRoom } from '../TicTacToe/TttLobby.jsx';
import UniversalJoinForm from '../../UniversalJoinForm.jsx';
import { handleCreateTriviaRoom } from '../Trivia/TriviaCreateButton.jsx';
import { getRandomFunnyName } from '../../funnyNames.js';

export default function Home() {
    const [playerName, setPlayerName] = useState(getRandomFunnyName);
    const navigate = useNavigate();
    
    return (
        /* Match outer layout and padding of BarHome */
        <div className="d-flex justify-content-center align-items-center p-1">
            {/* Match maxWidth to 450px so cards are identical size */}
            <Card className='text-center shadow-lg border-0' style={{ maxWidth: "450px", width: "100%" }}>
                <Card.Header 
                    as="h5" 
                    className="d-flex align-items-center justify-content-center border-0 py-2 fw-black tracking-widest text-uppercase fs-6"
                    style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }}>
                    GAME-TEMPLE
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
                                placeholder="Anita Break" 
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
                                            onClick={() => handleCreateTttRoom(playerName, navigate)}
                                        >
                                            Tic-Tac-Toe<br/>
                                            X O
                                        </Button>
                                    </Col>
                                    
                                    <Col xs={6}>
                                        <Button 
                                            variant="primary" 
                                            className="fw-bold w-100 h-100 py-2 shadow-sm text-white"
                                            onClick={() => handleCreateTriviaRoom(playerName, navigate)}
                                        >
                                            Trivia <br />
                                            ❔❔
                                        </Button>
                                    </Col>

                                    <Col xs={6}>
                                        <Button
                                            variant="primary"
                                            className="fw-bold w-100 h-100 py-2 shadow-sm text-white"
                                        >
                                            Prompt <br/>
                                            2
                                        </Button>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Card>
                </Card.Body>
            </Card>
        </div>
    );
}