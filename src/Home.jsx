import React, { useState } from 'react';
import { Card, Row, Col, Button, Form } from 'react-bootstrap'; 
import { useNavigate } from 'react-router-dom';
import gameLogo from "../src/assets/logos/Logo_Temple_Table.jpg";
import { handleCreateTttRoom } from './TttLobby.jsx';
import UniversalJoinForm from './UniversalJoinForm.jsx';
import TriviaCreateButton from './TriviaCreateButton.jsx'; // 🧠 FIXED: Added missing import

export default function Home() {
    const [playerName, setPlayerName] = useState('');
    const navigate = useNavigate();
    
    return (
        <div className="d-flex justify-content-center align-items-center p-1">
            <Card className='text-center shadow-lg border-0' style={{ maxWidth: "450px", width: "100%" }}>
                <Card.Header as="h5" className="bg-primary text-white py-2 fw-bold tracking-wide">
                    GAME-TEMPLE
                </Card.Header>
                
                <Card.Body className='p-1'>
                    {/* Logo wrapper */}
                    <div className="mb-1 bg-light p-2 rounded-3 d-inline-block shadow-sm">
                        <img 
                            src={gameLogo}
                            alt="Game-Temple Logo"
                            style={{ maxWidth: "140px", height: "auto" }}
                        />
                    </div>

                    {/* MULTIPLAYER ZONE CARD */}
                    <Card className="border p-3 bg-body-secondary shadow-sm">
                        <Card.Title className="text-muted text-center fw-bold small mb-1 tracking-wider">
                            Multiplayer Games
                        </Card.Title>
                        <hr className='my-2 text-muted'/>
                        
                        {/* STEP 1: Universal Player Name */}
                        <Form.Group className="mb-3 text-start" controlId="formPlayerName">
                            <Form.Label className="fw-bold text-muted small mb-1">Player Name</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Anita Break" 
                                value={playerName} 
                                onChange={(e) => setPlayerName(e.target.value)}
                                autoComplete="off"
                            />
                        </Form.Group>

                        {/* STEP 2: The Split Options Row */}
                        <Row className="g-2 alignment-stretch">
                            {/* Left Column: Join Logic */}
                            <Col xs={5} className="border-end pe-2 text-center">
                                <Form.Label className="fw-bold text-muted small mb-1">Join Game</Form.Label>
                                <UniversalJoinForm playerName={playerName} />
                            </Col>

                            {/* Right Column: Create Logic */}
                            <Col xs={7} className="ps-2 text-center d-flex flex-column justify-content-between">
                                <div>
                                    <Form.Label className="fw-bold text-muted small mb-1">Create Room</Form.Label>

                                    <div className="d-flex gap-2 justify-content-center">
                                        <Button 
                                            variant="primary" 
                                            className="fw-bold text-nowrap"
                                            onClick={() => handleCreateTttRoom(playerName, navigate)}
                                        >
                                            Tic-Tac-Toe
                                        </Button>
                                        <TriviaCreateButton playerName={playerName} />
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Card>

                    <hr className='my-3 text-bold'/>

                    <Card.Title className='text-muted text-center fw-bold mb-1 tracking-wider'>🍸Bartending🍸</Card.Title>

                    {/* Single Player / Reference Links */}
                    <Row className='g-2'>
                        <Col xs={6} className='d-grid'>
                            <Button variant='primary' size="lg" href='/FlashcardGame' className="fw-semibold align-items-center justify-content-center">
                                🍹Drink Game
                            </Button>
                        </Col>
                        
                        <Col xs={6} className='d-grid'>
                            <Button variant='primary' size="lg" href='/FlashcardsList' className="fw-semibold align-items-center justify-content-center">
                                Flashcard List
                            </Button>
                        </Col>

                        <Col xs={6} className='d-grid'>
                            <Button variant='primary' size="lg" href='/Flashcards' className="fw-semibold align-items-center justify-content-center">
                                Flashcards
                            </Button>
                        </Col>
                    </Row>

                </Card.Body>
            </Card>
        </div>
    );
}