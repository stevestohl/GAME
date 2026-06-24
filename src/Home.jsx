import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import gameLogo from "../src/assets/logos/Logo_Temple_Table.jpg";

// Import your newly created subcomponents
import UniversalJoinForm from './UniversalJoinForm.jsx';
import TttCreateButton from './TttCreateButton.jsx';

export default function Home() {
    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark p-3">
            <Card className='text-center shadow-lg border-0' style={{ maxWidth: 
                "450px", width: "100%" }}>
                <Card.Header as="h5" className="bg-primary text-white py-3 fw-bold tracking-wide">
                    GAME-TEMPLE DASHBOARD
                </Card.Header>
                
                <Card.Body className='p-4'>
                    {/* Logo wrapper */}
                    <div className="mb-4 bg-light p-3 rounded-3 d-inline-block shadow-sm">
                        <img 
                            src={gameLogo}
                            alt="Game-Temple Logo"
                            style={{ maxWidth: "140px", height: "auto" }}
                        />
                    </div>
                    
                    {/* Universal Room Entry Component */}
                    {/* <Card.Title className="fw-bold fs-4 mb-3 text-secondary">Enter Room</Card.Title> */}
                    <UniversalJoinForm />

                    <hr className="my-4 text-muted" />

                    {/* Navigation Menu Grid */}
                    {/* <Card.Title className="fw-bold text-muted fs-6 uppercase mb-3">Single Player and Tools</Card.Title> */}
                    <Row className="g-2">
                        <Col xs={6} className='d-grid'>
                            <Button variant='primary' size="lg" href='/FlashcardGame' className="fw-semibold align-items-center justify-content-center">
                                🍹Drink Game🍹
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

                        {/* Modularized Tic-Tac-Toe Host Button Component */}
                        <TttCreateButton />

                        <Col xs={6} className='d-grid'>
                            <Button variant='primary' size="lg" href='/report' className="fw-semibold align-items-center justify-content-center">
                                PlaceHolder
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
}