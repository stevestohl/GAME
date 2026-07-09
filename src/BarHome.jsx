import React, { useState } from 'react';
import { Card, Row, Col, Button, Form } from 'react-bootstrap'; 
import { useNavigate } from 'react-router-dom';
// import gameLogo from "../src/assets/logos/Logo_Temple_Table.jpg";
//import martini from '../src/assets/logos/MartiniLogo.jpg'


export default function BarHome() {

    
    return (
        <div className="d-flex justify-content-center align-items-center p-1">
            <Card className='text-center shadow-lg border-0' style={{ maxWidth: "450px", width: "100%" }}>
                <Card.Header 
                as="h5" 
                className="d-flex align-items-center justify-content-center border-0 py-2 fw-black tracking-widest text-uppercase fs-6"
                style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }}>
                    BAR-TEMPLE
                </Card.Header>
                
                <Card.Body className='p-1'>
                    {/* Logo wrapper */}
                    <div className="my-1 bg-white p-2 rounded-3 d-inline-block shadow-lg">
                        <img 
                            src="https://game-temple.org/MartiniLogo.gif"
                            alt="Animated Game-Temple Logo"
                            style={{ maxWidth: "130px", height: "auto" }}
                        />
                    </div>


                    <Card className = "border p-1 bg-body-secondary shadow-sm rounded-3">
                        <Card.Title className='text-muted text-center fw-bold small mb-1 tracking-wider'>
                            Bartending
                        </Card.Title>

                        {/* Single Player / Reference Links */}
                        <Row className='g-2'>
                            <Col xs={6} className='d-grid'>
                                <Button variant='primary' size="lg" href='/FlashcardGame' className="fw-semibold align-items-center justify-content-center">
                                    Drink Quiz <br/>🍹🍹
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
                    </Card>
                </Card.Body>
            </Card>
        </div>
    );
}