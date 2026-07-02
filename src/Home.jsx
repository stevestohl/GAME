import React, { useState } from 'react';
import { Card, Row, Col, Button, Form } from 'react-bootstrap'; 
import { useNavigate } from 'react-router-dom';
import gameLogo from "../src/assets/logos/Logo_Temple_Table.jpg";
import { handleCreateTttRoom } from './TttLobby.jsx';
import UniversalJoinForm from './UniversalJoinForm.jsx';
import { handleCreateTriviaRoom } from './TriviaCreateButton.jsx'; // 🧠 CHANGED: Importing logic handler instead of component

export default function Home() {
    const [playerName, setPlayerName] = useState('');
    const navigate = useNavigate();
    
    return (
        <div 
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: 'calc(100vh - 56px)' }}
            >
            <Card className='text-center shadow-lg border-0' style={{ maxWidth: "430px", width: "100%" }}>
                <Card.Header 
                    as="h5" 
                    className="d-flex align-items-center justify-content-center border-0 py-2 fw-black tracking-widest text-uppercase fs-6"
                    style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }}>
                    GAME-TEMPLE
                </Card.Header>
                
                <Card.Body className='p-1'>
                    <div className="my-1 bg-light p-2 rounded-3 d-inline-block shadow-sm">
                        <img 
                            src={gameLogo}
                            alt="Game-Temple Logo"
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
                                className="py-2" // Thicker input for better mobile tap targets
                            />
                        </Form.Group>

                        {/* STEP 2: Mobile Stacked Layout (Join then Create) */}
                        <Row className="g-2">
                            {/* Top Block: Join Logic takes full width */}
                            <Col xs={12} className="text-start">
                                <Form.Label className="fw-bold text-muted small mb-1 ps-1">Join Active Room</Form.Label>
                                <UniversalJoinForm playerName={playerName} />
                            </Col>

                            <Col xs={12} className="d-flex align-items-center mt-1 mb-0">
                                <hr className="flex-grow-1 my-0 opacity-25" />
                                <span className="mx-2 my-2 text-muted small fw-bold">
                                    OR <br />
                                    Create New Room
                                    </span>
                                <hr className="flex-grow-1 my-0 opacity-25" />
                            </Col>

                            {/* Bottom Block: Create Logic takes full width */}
                            <Col xs={12} className="text-start">
                                <div className="d-flex gap-2 w-100">
                                    <Button 
                                        variant="primary" 
                                        className="fw-bold w-50 py-1 shadow-sm"
                                        onClick={() => handleCreateTttRoom(playerName, navigate)}
                                    >
                                        Tic-Tac-Toe<br/>
                                        ❌⭕ 
                                    </Button>
                                    

                                    <Button 
                                        variant="primary" 
                                        className="fw-bold w-50 py-1 shadow-sm text-white"
                                        onClick={() => handleCreateTriviaRoom(playerName, navigate)}
                                    >
                                        Trivia <br />
                                        ❔❔
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Card>


                    {/* <Card.Title className='text-muted text-center fw-bold mb-2 tracking-wider text-uppercase small'>🍸 Bartending Single Player</Card.Title> */}

                    {/* Single Player / Reference Links Stacked cleanly for mobile screens */}
                    {/* <div className="d-flex flex-column gap-2">
                        <Button variant='primary' size="lg" href='/FlashcardGame' className="fw-semibold py-2 fs-6 text-start ps-3">
                            🍹 Drink Game
                        </Button>
                        <Button variant='primary' size="lg" href='/FlashcardsList' className="fw-semibold py-2 fs-6 text-start ps-3">
                            📋 Flashcard List
                        </Button>
                        <Button variant='primary' size="lg" href='/Flashcards' className="fw-semibold py-2 fs-6 text-start ps-3">
                            🗂️ Flashcards Deck
                        </Button>
                    </div> */}

                </Card.Body>
            </Card>
        </div>
    );
}