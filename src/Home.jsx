import React, { useState } from 'react';
import { Card, Row, Col, Button, Form } from 'react-bootstrap'; 
import gameLogo from "../src/assets/logos/Logo_Temple_Table.jpg";

import UniversalJoinForm from './UniversalJoinForm.jsx';
import TttCreateButton from './TttCreateButton.jsx';
import TriviaCreateButton from './TriviaCreateButton.jsx';

export default function Home() {
    const [playerName, setPlayerName] = useState('');
    
    return (
        <div className="d-flex justify-content-center align-items-center p-1">
            <Card className='text-center shadow-lg border-0' style={{ maxWidth: "450px", width: "100%" }}>
                <Card.Header as="h5" className="bg-primary text-white py-2 fw-bold tracking-wide">
                    GAME-TEMPLE
                </Card.Header>
                
                <Card.Body className='p-2'>
                    {/* Logo wrapper */}
                    <div className="mb-2 bg-light p-2 rounded-3 d-inline-block shadow-sm">
                        <img 
                            src={gameLogo}
                            alt="Game-Temple Logo"
                            style={{ maxWidth: "140px", height: "auto" }}
                        />
                    </div>

                    {/* MULTIPLAYER ZONE CARD */}
                    <Card className="border p-2 bg-light-subtle shadow-sm">
                        <Card.Title className="text-muted text-center fw-bold small text-start mb-1 tracking-wider">
                            Multiplayer Games
                        </Card.Title>
                        <hr className='my-2 text-muted'/>
                        
                        {/* STEP 1: Universal Player Name */}
                        <Form.Group className="mb-3 text-start" controlId="formPlayerName">
                            <Form.Label className="fw-bold text-muted small mb-1">Player Name</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Mike Hawk" 
                                value={playerName} 
                                onChange={(e) => setPlayerName(e.target.value)}
                                autoComplete="off"
                            />
                        </Form.Group>

                        {/* STEP 2: The Split Options Row */}
                        <Row className="g-3 alignment-stretch">
                            {/* Left Column: Join Logic */}
                            <Col xs={6} className="border-end pe-2 text-center">
                                <Form.Label className="fw-bold text-muted small mb-1">Join Game</Form.Label>
                                <UniversalJoinForm playerName={playerName} />
                            </Col>

                            {/* Right Column: Create Logic */}
                            <Col xs={6} className="ps-2 text-center d-flex flex-column justify-content-between">
                                <div>
                                    <Form.Label className="fw-bold text-muted small mb-1">Create Room</Form.Label>
                                    
                                    {/* FIXED: Changed from d-grid to d-flex for horizontal button alignment */}
                                    <div className="d-flex gap-2">
                                        <TttCreateButton />
                                        <TriviaCreateButton playerName={playerName} />
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Card>

                    <hr className='my-3 text-muted'/>

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